import { schema, OutputType } from "./flag_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    if (session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    await db
      .updateTable("activityFeedback")
      .set({
        aiFlagged: input.flagged,
        aiReason: input.reason ?? null,
      })
      .where("id", "=", input.feedbackId)
      .execute();

    // Log audit
    await logAudit(
      session.user.id,
      "feedback_flagged",
      "activity_feedback",
      input.feedbackId,
      `Flagged: ${input.flagged}, Reason: ${input.reason}`
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