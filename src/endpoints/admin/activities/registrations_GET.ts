import { schema, OutputType, ActivityRegistrationItem } from "./registrations_GET.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

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

    // 2. Parse Query Params
    const url = new URL(request.url);
    const activityIdParam = url.searchParams.get("activityId");

    const input = schema.parse({
      activityId: activityIdParam,
    });

    // 3. Get Activity Title
    const activity = await db
      .selectFrom("activity")
      .select("title")
      .where("id", "=", input.activityId)
      .executeTakeFirst();

    if (!activity) {
      return new Response(
        superjson.stringify({ error: "Hoạt động không tồn tại" }),
        { status: 404 }
      );
    }

    // 4. Get Registrations with User info, Status and Attendance status
    const registrations = await db
      .selectFrom("activityRegistration")
      .innerJoin("users", "activityRegistration.userId", "users.id")
      .leftJoin("activityAttendance", (join) =>
        join
          .onRef("activityAttendance.activityId", "=", "activityRegistration.activityId")
          .onRef("activityAttendance.userId", "=", "activityRegistration.userId")
      )
      .select([
        "activityRegistration.id",
        "activityRegistration.userId",
        "activityRegistration.registeredAt",
        "activityRegistration.status",
        "users.fullName",
        "users.email",
        "activityAttendance.id as attendanceId",
      ])
      .where("activityRegistration.activityId", "=", input.activityId)
      .orderBy("activityRegistration.registeredAt", "desc")
      .execute();

    // 5. Transform results
    const formattedRegistrations: ActivityRegistrationItem[] = registrations.map(
      (reg) => ({
        id: reg.id,
        userId: reg.userId,
        fullName: reg.fullName,
        email: reg.email,
        registeredAt: reg.registeredAt,
        status: reg.status,
        // isConfirmed is kept for backward compatibility and specifically refers to attendance check-in
        isConfirmed: !!reg.attendanceId,
      })
    );

    return new Response(
      superjson.stringify({
        registrations: formattedRegistrations,
        activityTitle: activity.title,
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