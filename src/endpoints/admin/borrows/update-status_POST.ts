import { schema, OutputType } from "./update-status_POST.schema";
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
    const { borrowId, status, completionNote } = schema.parse(json);

    // Get current status
    const currentRecord = await db
      .selectFrom("borrowRecord")
      .select(["status", "bookId"])
      .where("id", "=", borrowId)
      .executeTakeFirst();

    if (!currentRecord) {
      throw new Error("Borrow record not found");
    }

    // Validate transitions (simplified for admin override power, but basic logic applies)
    // E.g. can't complete if cancelled.
    // But admins might need to fix mistakes, so we allow most transitions but log them.
    
    if (status === "completed" && !completionNote) {
      throw new Error("Completion note is required when marking as completed");
    }

    await db.transaction().execute(async (trx) => {
      // Update borrow record
      await trx
        .updateTable("borrowRecord")
        .set({
          status,
          completedAt: status === "completed" ? new Date() : undefined,
          completionNote: status === "completed" ? completionNote : undefined,
        })
        .where("id", "=", borrowId)
        .execute();

      // Update book status based on borrow status
      if (status === "borrowed") {
        await trx
          .updateTable("book")
          .set({ status: "borrowed" })
          .where("id", "=", currentRecord.bookId)
          .execute();
      } else if (status === "completed" || status === "cancelled") {
        await trx
          .updateTable("book")
          .set({ status: "available" })
          .where("id", "=", currentRecord.bookId)
          .execute();
      }
      // 'approved', 'pending', 'return_requested' usually imply book is reserved or still out, 
      // but strictly 'borrowed' status on book table usually matches 'borrowed' on record.
      // If status goes back to 'approved' (e.g. mistake), book might still be 'available' or 'unavailable' depending on logic.
      // For simplicity, we mainly handle the key state changes: borrowed -> book borrowed, completed/cancelled -> book available.
    });

    await logAudit(
      user.id,
      "borrow_status_changed",
      "borrowRecord",
      borrowId,
      `Changed status from ${currentRecord.status} to ${status}`
    );

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
}