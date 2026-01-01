import { schema, OutputType } from "./list_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
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

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    const input = schema.parse(searchParams);

    let query = db
      .selectFrom("activityFeedback")
      .innerJoin("users", "activityFeedback.userId", "users.id")
      .innerJoin("activity", "activityFeedback.activityId", "activity.id")
      .innerJoin(
        "feedbackTopic as originalTopic",
        "activityFeedback.originalTopicId",
        "originalTopic.id"
      )
      .leftJoin(
        "feedbackTopic as displayTopic",
        "activityFeedback.displayTopicId",
        "displayTopic.id"
      )
      .select([
        "activityFeedback.id",
        "activityFeedback.rating",
        "activityFeedback.comment",
        "activityFeedback.isAnonymous",
        "activityFeedback.aiSuggested",
        "activityFeedback.aiFlagged",
        "activityFeedback.aiReason",
        "activityFeedback.isPublished",
        "activityFeedback.publishedAt",
        "activityFeedback.createdAt",
        "activityFeedback.activityId",
        // User info
        "users.fullName as userFullName",
        "users.email as userEmail",
        "users.avatarUrl as userAvatarUrl",
        // Activity info
        "activity.title as activityTitle",
        // Topic info
        "originalTopic.id as originalTopicId",
        "originalTopic.name as originalTopicName",
        "displayTopic.id as displayTopicId",
        "displayTopic.name as displayTopicName",
      ]);

    if (input.activityId) {
      query = query.where("activityFeedback.activityId", "=", input.activityId);
    }

    if (input.tab === "ai_suggested") {
      query = query
        .where("activityFeedback.aiSuggested", "=", true)
        .where("activityFeedback.isPublished", "=", false);
    } else if (input.tab === "ai_flagged") {
      query = query.where("activityFeedback.aiFlagged", "=", true);
    }
    // 'all' tab doesn't need extra filters

    const feedbackList = await query
      .orderBy("activityFeedback.createdAt", "desc")
      .execute();

    return new Response(superjson.stringify({ feedback: feedbackList } satisfies OutputType));
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}