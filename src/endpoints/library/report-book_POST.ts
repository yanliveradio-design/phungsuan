import { schema, OutputType } from "./report-book_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { logAudit } from "../../helpers/AuditLogger";
import { AuditAction } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const json = superjson.parse(await request.text());
    const { bookId, reason, details } = schema.parse(json);

    // Verify book exists
    const book = await db
      .selectFrom('book')
      .select('id')
      .where('id', '=', bookId)
      .executeTakeFirst();

    if (!book) {
      throw new Error("Book not found");
    }

    // Log to audit log
    // We use 'feedback_flagged' as the closest action type for reporting content
    // since 'book_reported' is not in the enum.
    await logAudit(
      user.id,
      'feedback_flagged' as AuditAction, 
      'book',
      bookId,
      `BOOK REPORT: ${reason}. Details: ${details || 'None'}`
    );

    return new Response(superjson.stringify({ success: true } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}