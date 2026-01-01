import { schema, OutputType, AdminActivityListItem } from "./list_GET.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    // 1. Auth Check
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập (Admin only)" }),
        { status: 403 }
      );
    }

    // 2. Parse Query Params manually since GET requests don't have body
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    // Validate with Zod schema (constructing an object from params)
    const input = schema.parse({
      status: statusParam || undefined,
      startDate: startDateParam ? new Date(startDateParam) : undefined,
      endDate: endDateParam ? new Date(endDateParam) : undefined,
    });

    // 3. Build Query
    let query = db
      .selectFrom("activity")
      .select([
        "activity.id",
        "activity.title",
        "activity.description",
        "activity.imageUrl",
        "activity.startTime",
        "activity.endTime",
        "activity.location",
        "activity.maxParticipants",
        "activity.status",
        "activity.checkinEnabled",
        "activity.createdByAdmin",
        "activity.createdAt",
        // Subqueries for counts
        (eb) =>
          eb
            .selectFrom("activityRegistration")
            .select(eb.fn.countAll().as("count"))
            .whereRef("activityRegistration.activityId", "=", "activity.id")
            .as("registrationCount"),
        (eb) =>
          eb
            .selectFrom("activityAttendance")
            .select(eb.fn.countAll().as("count"))
            .whereRef("activityAttendance.activityId", "=", "activity.id")
            .as("checkinCount"),
        (eb) =>
          eb
            .selectFrom("activityFeedback")
            .select(eb.fn.countAll().as("count"))
            .whereRef("activityFeedback.activityId", "=", "activity.id")
            .as("feedbackCount"),
      ])
      .orderBy("activity.startTime", "desc");

    if (input.status) {
      query = query.where("activity.status", "=", input.status);
    }

    if (input.startDate) {
      query = query.where("activity.startTime", ">=", input.startDate);
    }

    if (input.endDate) {
      query = query.where("activity.startTime", "<=", input.endDate);
    }

    const results = await query.execute();

    // 4. Transform results (casting counts to number)
    const activities: AdminActivityListItem[] = results.map((r) => ({
      ...r,
      registrationCount: Number(r.registrationCount),
      checkinCount: Number(r.checkinCount),
      feedbackCount: Number(r.feedbackCount),
    }));

    return new Response(
      superjson.stringify({ activities } satisfies OutputType)
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