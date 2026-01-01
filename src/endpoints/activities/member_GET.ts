import { schema, OutputType, MemberActivityItem } from "./member_GET.schema";
import superjson from "superjson";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    // 1. Auth Check (Optional for viewing, but required for user-specific status)
    let userId: number | null = null;
    try {
      const { user } = await getServerUserSession(request);
      userId = user.id;
    } catch (e) {
      // User is not logged in, proceed with userId = null
    }

    // 2. Parse Query Params
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    
    // Validate input (though currently schema has no required inputs, good for future proofing)
    schema.parse({
      status: statusParam || undefined,
    });

    // 3. Build Query
    // Always select all columns to avoid TypeScript inference issues
    // The subqueries will naturally return null if userId is null
    const query = db
      .selectFrom("activity")
      .select([
        "activity.id",
        "activity.title",
        "activity.description",
        "activity.startTime",
        "activity.endTime",
        "activity.location",
        "activity.maxParticipants",
        "activity.status",
        "activity.checkinEnabled",
        "activity.imageUrl",
        // Count total registrations
        (eb) =>
          eb
            .selectFrom("activityRegistration")
            .select(eb.fn.countAll().as("count"))
            .whereRef("activityRegistration.activityId", "=", "activity.id")
            .as("registrationCount"),
        // User-specific fields - use CASE to handle null userId
        (eb) =>
          userId
            ? eb
                .selectFrom("activityRegistration")
                .select(sql<boolean>`true`.as("isRegistered"))
                .where("activityRegistration.userId", "=", userId)
                .whereRef("activityRegistration.activityId", "=", "activity.id")
                .as("isRegistered")
            : sql<null>`null`.as("isRegistered"),
        (eb) =>
          userId
            ? eb
                .selectFrom("activityAttendance")
                .select(sql<boolean>`true`.as("isCheckedIn"))
                .where("activityAttendance.userId", "=", userId)
                .whereRef("activityAttendance.activityId", "=", "activity.id")
                .as("isCheckedIn")
            : sql<null>`null`.as("isCheckedIn"),
        (eb) =>
          userId
            ? eb
                .selectFrom("activityFeedback")
                .select(sql<boolean>`true`.as("hasFeedback"))
                .where("activityFeedback.userId", "=", userId)
                .whereRef("activityFeedback.activityId", "=", "activity.id")
                .as("hasFeedback")
            : sql<null>`null`.as("hasFeedback"),
        (eb) =>
          userId
            ? eb
                .selectFrom("activityRegistration")
                .select("activityRegistration.status")
                .where("activityRegistration.userId", "=", userId)
                .whereRef("activityRegistration.activityId", "=", "activity.id")
                .as("registrationStatus")
            : sql<null>`null`.as("registrationStatus"),
      ])
      .orderBy("activity.startTime", "desc");

        // Filter by status if provided
    let finalQuery = query;
    if (statusParam) {
      finalQuery = finalQuery.where("activity.status", "=", statusParam as any);
    }

    const results = await finalQuery.execute();

    // 4. Transform results - cast to avoid complex inference issues
    const activities: MemberActivityItem[] = (results as any[]).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      startTime: r.startTime,
      endTime: r.endTime,
      location: r.location,
      maxParticipants: r.maxParticipants,
      status: r.status,
      checkinEnabled: r.checkinEnabled,
      imageUrl: r.imageUrl,
      registrationCount: Number(r.registrationCount),
      isRegistered: r.isRegistered ? true : (userId ? false : null),
      isCheckedIn: r.isCheckedIn ? true : (userId ? false : null),
      hasFeedback: r.hasFeedback ? true : (userId ? false : null),
      registrationStatus: r.registrationStatus || null,
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