import { schema, OutputType } from "./send-feedback_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { logAudit } from "../../helpers/AuditLogger";
import { AuditAction } from "../../helpers/schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Log feedback to audit log
    // We cast the action string to AuditAction to satisfy TS, assuming the DB allows it or it will be added to enum
    await logAudit(
      session.user.id,
      "user_feedback" as AuditAction,
      "feedback",
      session.user.id, // Using user ID as target ID since there's no feedback entity yet
      JSON.stringify({
        subject: input.subject,
        message: input.message,
      })
    );

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}