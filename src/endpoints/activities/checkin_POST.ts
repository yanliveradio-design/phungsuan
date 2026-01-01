import { schema, OutputType } from "./checkin_POST.schema";
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
      .select(["id", "status", "checkinEnabled", "title", "startTime", "endTime"])
      .where("id", "=", input.activityId)
      .executeTakeFirst();

    if (!activity) {
      return new Response(
        superjson.stringify({ error: "Hoạt động không tồn tại" }),
        { status: 404 }
      );
    }

    // 4. Validate Check-in Conditions
    if (activity.status !== "open") {
      return new Response(
        superjson.stringify({ error: "Hoạt động không ở trạng thái mở" }),
        { status: 400 }
      );
    }

    // Validate activity is ongoing
    const now = new Date();
    if (now < activity.startTime) {
      return new Response(
        superjson.stringify({ error: "Hoạt động chưa bắt đầu" }),
        { status: 400 }
      );
    }

    if (activity.endTime && now >= activity.endTime) {
      return new Response(
        superjson.stringify({ error: "Hoạt động đã kết thúc" }),
        { status: 400 }
      );
    }

    if (!activity.checkinEnabled) {
      return new Response(
        superjson.stringify({ error: "Chức năng điểm danh chưa được mở cho hoạt động này" }),
        { status: 400 }
      );
    }

    // Check if user is registered
    const registration = await db
      .selectFrom("activityRegistration")
      .where("activityId", "=", input.activityId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!registration) {
      return new Response(
        superjson.stringify({ error: "Bạn chưa đăng ký tham gia hoạt động này" }),
        { status: 400 }
      );
    }

    // Check for duplicate check-in
    const existingCheckin = await db
      .selectFrom("activityAttendance")
      .where("activityId", "=", input.activityId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (existingCheckin) {
      return new Response(
        superjson.stringify({ error: "Bạn đã điểm danh rồi" }),
        { status: 400 }
      );
    }

        // 5. Perform Check-in
    await db
      .insertInto("activityAttendance")
      .values({
        activityId: input.activityId,
        userId: user.id,
        checkinMethod: "manual", // As per requirement
        // checkinAt is generated or we can set it explicitly if needed, but schema says generated.
        // However, generated usually means default now().
      })
      .execute();

    return new Response(
      superjson.stringify({ 
        success: true, 
        checkinAt: now 
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