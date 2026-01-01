import { schema, OutputType } from "./update-cover_POST.schema";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";
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
    const { bookId, coverUrl } = schema.parse(json);

    // Check if book exists first to get the title for audit log
    const existingBook = await db
      .selectFrom("book")
      .select(["title"])
      .where("id", "=", bookId)
      .executeTakeFirst();

    if (!existingBook) {
      return new Response(
        superjson.stringify({ error: "Book not found" }),
        { status: 404 }
      );
    }

    const result = await db
      .updateTable("book")
      .set({
        coverUrl: coverUrl,
      })
      .where("id", "=", bookId)
      .returning(["id", "title", "coverUrl"])
      .executeTakeFirst();

    if (!result) {
      // Should not happen given the check above, but for safety
      return new Response(
        superjson.stringify({ error: "Failed to update book cover" }),
        { status: 500 }
      );
    }

    // Log audit action
    await logAudit(
      user.id,
      "book_imported",
      "book",
      bookId,
      `Updated cover URL: ${coverUrl ? "set" : "removed"}`
    );

    return new Response(
      superjson.stringify({ 
        success: true, 
        book: {
            id: result.id,
            title: result.title,
            coverUrl: result.coverUrl
        } 
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
}