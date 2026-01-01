import { schema, OutputType } from "./published_GET.schema";
import superjson from "superjson";
import { db } from "../../helpers/db";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Parse query params using zod schema (coercion is handled in schema)
    const input = schema.parse(queryParams);

    const limit = input.limit || 5;

    // Build the query
    // We use two separate left joins for displayTopicId and originalTopicId
    // Then COALESCE the names in the select
    let query = db
      .selectFrom("activityFeedback")
      .leftJoin("users", "users.id", "activityFeedback.userId")
      .leftJoin("feedbackTopic as displayTopic", "displayTopic.id", "activityFeedback.displayTopicId")
      .leftJoin("feedbackTopic as originalTopic", "originalTopic.id", "activityFeedback.originalTopicId")
      .select([
        "activityFeedback.id",
        "activityFeedback.rating",
        "activityFeedback.comment",
        "activityFeedback.createdAt",
        "activityFeedback.isAnonymous",
        "users.fullName as userFullName",
        // Prioritize displayTopic name over originalTopic name
        sql<string>`COALESCE("display_topic"."name", "original_topic"."name")`.as("topicName"),
        // Select the effective topic ID for filtering
        sql<number>`COALESCE("activity_feedback"."display_topic_id", "activity_feedback"."original_topic_id")`.as("effectiveTopicId")
      ])
      .where("activityFeedback.isPublished", "=", true);

    if (input.activityId) {
      query = query.where("activityFeedback.activityId", "=", input.activityId);
    }

    if (input.topicId) {
      // Filter by the effective topic
      query = query.where((eb) =>
        eb(
          sql`COALESCE("activity_feedback"."display_topic_id", "activity_feedback"."original_topic_id")`,
          "=",
          input.topicId!
        )
      );
    }

    // Random order and limit
    const feedbacks = await query
      .orderBy(sql`RANDOM()`)
      .limit(limit)
      .execute();

    // Transform data for response
    const formattedFeedbacks: OutputType["feedbacks"] = feedbacks.map((f) => {
      // Truncate comment if needed (e.g., > 200 chars)
      let comment = f.comment;
      if (comment && comment.length > 200) {
        comment = comment.substring(0, 200) + "...";
      }

      return {
        id: f.id,
        rating: f.rating,
        comment: comment,
        topicName: f.topicName || "General", // Fallback if topic join fails or is null
        createdAt: f.createdAt instanceof Date ? f.createdAt : new Date(f.createdAt),
        user: f.isAnonymous
          ? null
          : {
              fullName: f.userFullName || "Unknown User",
            },
      };
    });

    return new Response(
      superjson.stringify({ feedbacks: formattedFeedbacks } satisfies OutputType),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}