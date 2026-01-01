import { schema, OutputType } from "./publish_POST.schema";
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

    const feedback = await db
      .selectFrom("activityFeedback")
      .select(["id", "activityId", "displayTopicId", "originalTopicId", "isPublished"])
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
        superjson.stringify({ error: "Phản hồi này đã được xuất bản." }),
        { status: 400 }
      );
    }

    const topicIdToCheck = feedback.displayTopicId ?? feedback.originalTopicId;

    // Check publish limit
    const limitSetting = await db
      .selectFrom("publishSettings")
      .select("settingValue")
      .where("settingKey", "=", "feedback_publish_limit_per_topic")
      .executeTakeFirst();

    if (limitSetting) {
      const currentPublishedCount = await db
        .selectFrom("activityFeedback")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("activityId", "=", feedback.activityId)
        .where("isPublished", "=", true)
        .where((eb) =>
          eb.or([
            eb("displayTopicId", "=", topicIdToCheck),
            eb.and([
              eb("displayTopicId", "is", null),
              eb("originalTopicId", "=", topicIdToCheck),
            ]),
          ])
        )
        .executeTakeFirst();

      const count = Number(currentPublishedCount?.count ?? 0);
      if (count >= limitSetting.settingValue) {
        return new Response(
          superjson.stringify({
            error: `Đã đạt giới hạn xuất bản (${limitSetting.settingValue}) cho chủ đề này trong hoạt động này.`,
          }),
          { status: 400 }
        );
      }
    }

    // Publish
    await db
      .updateTable("activityFeedback")
      .set({
        isPublished: true,
        publishedAt: new Date(),
      })
      .where("id", "=", input.feedbackId)
      .execute();

    // Log audit
    await logAudit(
      session.user.id,
      "feedback_published",
      "activity_feedback",
      input.feedbackId
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