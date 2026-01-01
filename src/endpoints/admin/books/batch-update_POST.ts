import { schema, OutputType } from "./batch-update_POST.schema";
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
    const { bookIds, action } = schema.parse(json);

    if (bookIds.length === 0) {
      return new Response(
        superjson.stringify({ success: true, updatedCount: 0 } satisfies OutputType)
      );
    }

    let updatedCount = 0;

    if (action === "approve") {
      const result = await db
        .updateTable("book")
        .set({
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: user.id,
        })
        .where("id", "in", bookIds)
        .execute();
      
      updatedCount = Number(result[0].numUpdatedRows);
      
      // Log audit for batch
      await logAudit(
        user.id,
        "book_approved",
        "book",
        0, // 0 or -1 to indicate batch? Or log individually? 
           // For batch operations, logging individually might spam. 
           // But audit log schema requires targetId. 
           // Let's log a generic batch entry or loop. 
           // Looping is safer for traceability.
        `Batch approved ${updatedCount} books`
      );
      
      // Ideally we should log for each ID, but for performance on large batches we might skip or do it in background.
      // Given the scale, let's just log the first one or a summary if possible.
      // But to be strict with audit requirements, let's try to log individually if count is small (<50), else summary.
      if (bookIds.length <= 20) {
         for (const id of bookIds) {
             await logAudit(user.id, "book_approved", "book", id, "Batch approval");
         }
      }

    } else if (action === "hide") {
      const result = await db
        .updateTable("book")
        .set({ isHidden: true })
        .where("id", "in", bookIds)
        .execute();
      updatedCount = Number(result[0].numUpdatedRows);
      
      if (bookIds.length <= 20) {
         for (const id of bookIds) {
             await logAudit(user.id, "book_hidden", "book", id, "Batch hide");
         }
      } else {
          await logAudit(user.id, "book_hidden", "book", 0, `Batch hid ${updatedCount} books`);
      }

    } else if (action === "unhide") {
      const result = await db
        .updateTable("book")
        .set({ isHidden: false })
        .where("id", "in", bookIds)
        .execute();
      updatedCount = Number(result[0].numUpdatedRows);
      
      // Audit log logic similar to above...
       if (bookIds.length <= 20) {
         for (const id of bookIds) {
             await logAudit(user.id, "book_hidden", "book", id, "Batch unhide (set visible)");
         }
      } else {
          await logAudit(user.id, "book_hidden", "book", 0, `Batch unhid ${updatedCount} books`);
      }

    } else if (action === "delete") {
      // Hard delete - permanently remove from database
      // First delete related borrow records to handle foreign key constraints
      await db
        .deleteFrom("borrowRecord")
        .where("bookId", "in", bookIds)
        .execute();
      
      // Then delete the books themselves
      const result = await db
        .deleteFrom("book")
        .where("id", "in", bookIds)
        .execute();
      updatedCount = Number(result[0].numDeletedRows);
      
       if (bookIds.length <= 20) {
         for (const id of bookIds) {
             await logAudit(user.id, "book_hidden", "book", id, "Permanent delete (hard delete)");
         }
      } else {
          await logAudit(user.id, "book_hidden", "book", 0, `Permanently deleted ${updatedCount} books (hard delete)`);
      }
    }

    return new Response(
      superjson.stringify({ success: true, updatedCount } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
}