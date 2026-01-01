import { schema, OutputType } from "./retag_POST.schema";
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

    // Check if feedback exists and is not published
    const feedback = await db
      .selectFrom("activityFeedback")
      .select(["id", "isPublished"])
      .where("id", "=", input.feedbackId)
      .executeTakeFirst();

    if (!feedback) {
      return new Response(
        superjson.stringify({ error: "Không tìm thấy phản hồi." }),
        { status: 404 }
      );
    }

    if (feedback.isPublished) {
      return new Response(
        superjson.stringify({
          error: "Không thể thay đổi chủ đề của phản hồi đã được xuất bản.",
        }),
        { status: 400 }
      );
    }

    // Update display topic
    await db
      .updateTable("activityFeedback")
      .set({ displayTopicId: input.newTopicId })
      .where("id", "=", input.feedbackId)
      .execute();

    // Log audit
    await logAudit(
      session.user.id,
      "feedback_retagged",
      "activity_feedback",
      input.feedbackId,
      `Changed topic to ${input.newTopicId}`
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