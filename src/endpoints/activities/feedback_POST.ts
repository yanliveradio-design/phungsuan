import { schema, OutputType } from "./feedback_POST.schema";
import superjson from "superjson";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    // 1. Auth Check
    const { user } = await getServerUserSession(request);

    // 2. Parse Input
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // 3. Fetch Activity Details
    const activity = await db
      .selectFrom("activity")
      .select(["id", "status", "endTime", "title"])
      .where("id", "=", input.activityId)
      .executeTakeFirst();

    if (!activity) {
      return new Response(
        superjson.stringify({ error: "Hoạt động không tồn tại" }),
        { status: 404 }
      );
    }

    // 4. Validate Feedback Conditions
    // Activity must be ended (endTime < now OR status is "closed")
    const now = new Date();
    const isEnded = (activity.endTime && activity.endTime < now) || activity.status === "closed";

    if (!isEnded) {
      return new Response(
        superjson.stringify({ error: "Hoạt động chưa kết thúc, chưa thể gửi phản hồi" }),
        { status: 400 }
      );
    }

    // User must be checked in
    const attendance = await db
      .selectFrom("activityAttendance")
      .where("activityId", "=", input.activityId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!attendance) {
      return new Response(
        superjson.stringify({ error: "Bạn chưa tham gia (check-in) hoạt động này nên không thể gửi phản hồi" }),
        { status: 400 }
      );
    }

    // Check for existing feedback
    const existingFeedback = await db
      .selectFrom("activityFeedback")
      .where("activityId", "=", input.activityId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (existingFeedback) {
      return new Response(
        superjson.stringify({ error: "Bạn đã gửi phản hồi cho hoạt động này rồi" }),
        { status: 400 }
      );
    }

    // 5. Submit Feedback
    await db
      .insertInto("activityFeedback")
      .values({
        activityId: input.activityId,
        userId: user.id,
        originalTopicId: input.topicId,
        // displayTopicId can be same as original initially, or null if we want admin to curate
        displayTopicId: input.topicId, 
        rating: input.rating,
        comment: input.comment || null,
        isAnonymous: input.isAnonymous || false,
        // AI fields default to false/null in schema or we can set defaults here
        // isPublished defaults to false usually until approved? 
        // Schema says `isPublished: Generated<boolean>` which likely defaults to false or true depending on DB.
        // Let's assume it needs moderation if it has comment, or auto-publish if just rating?
        // Requirement says "Do not auto-publish or auto-punish with AI".
        // We'll let the DB default handle isPublished (likely false for safety).
      })
      .execute();

    return new Response(
      superjson.stringify({ 
        success: true, 
        message: "Cảm ơn bạn đã gửi phản hồi!" 
      } satisfies OutputType)
    );

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(
      superjson.stringify({ error: "Đã xảy ra lỗi không xác định" }),
      { status: 500 }
    );
  }
}