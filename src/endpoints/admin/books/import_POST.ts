import { schema, OutputType } from "./import_POST.schema";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";
import { maskPhoneNumber } from "../../../helpers/maskPhoneNumber";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user.adminRole) {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const { books } = schema.parse(json);

    const errors: { row: number; message: string }[] = [];
    let importedCount = 0;

    // Process each book
    // We process sequentially to maintain order and handle errors individually
    // For very large imports, this might need optimization (batching), but for typical CSV imports it's fine.
    for (let i = 0; i < books.length; i++) {
      const bookData = books[i];
      const rowNumber = i + 1;

      try {
        // Basic validation is done by Zod, but we might have business logic checks here
        // e.g. check if owner exists if we were linking by ID, but here we just store phone strings
        
        const result = await db
          .insertInto("book")
          .values({
            title: bookData.title,
            author: bookData.author,
            category: bookData.category,
            coverUrl: bookData.coverUrl,
            province: bookData.province,
            district: bookData.district,
            ownerName: bookData.ownerName,
            ownerPhoneMasked: maskPhoneNumber(bookData.ownerPhoneFull),
            ownerPhoneFull: bookData.ownerPhoneFull,
            status: "available",
            isApproved: false, // Default to not approved
            isHidden: false,
            // ownerId is null for imported books until claimed or if we don't match users
          })
          .returning("id")
          .executeTakeFirst();

        if (result) {
          importedCount++;
          await logAudit(
            user.id,
            "book_imported",
            "book",
            result.id,
            `Imported via CSV. Title: ${bookData.title}`
          );
        }
      } catch (err) {
        console.error(`Error importing row ${rowNumber}:`, err);
        errors.push({
          row: rowNumber,
          message: err instanceof Error ? err.message : "Unknown database error",
        });
      }
    }

    return new Response(
      superjson.stringify({
        imported: importedCount,
        errors,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
}