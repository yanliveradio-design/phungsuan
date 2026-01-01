import { schema, OutputType } from "./register_POST.schema";
import superjson from "superjson";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { triggerActivityNotification } from "../../helpers/NotificationService";

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
      .select(["id", "status", "maxParticipants", "title", "startTime"])
      .where("id", "=", input.activityId)
      .executeTakeFirst();

    if (!activity) {
      return new Response(
        superjson.stringify({ error: "Hoạt động không tồn tại" }),
        { status: 404 }
      );
    }

    // 4. Handle Registration Logic
    if (input.action === "register") {
      // Check if activity is open
      if (activity.status !== "open") {
        return new Response(
          superjson.stringify({ error: "Hoạt động này không mở đăng ký" }),
          { status: 400 }
        );
      }

      // Check if already registered
      const existing = await db
        .selectFrom("activityRegistration")
        .where("activityId", "=", input.activityId)
        .where("userId", "=", user.id)
        .executeTakeFirst();

      if (existing) {
        return new Response(
          superjson.stringify({ error: "Bạn đã đăng ký tham gia hoạt động này rồi" }),
          { status: 400 }
        );
      }

      // Check capacity
      if (activity.maxParticipants) {
        const currentCount = await db
          .selectFrom("activityRegistration")
          .select((eb) => eb.fn.countAll().as("count"))
          .where("activityId", "=", input.activityId)
          .executeTakeFirst();
        
        const count = Number(currentCount?.count || 0);
        if (count >= activity.maxParticipants) {
          return new Response(
            superjson.stringify({ error: "Hoạt động đã đủ số lượng người tham gia" }),
            { status: 400 }
          );
        }
      }

      // Register
      await db
        .insertInto("activityRegistration")
        .values({
          activityId: input.activityId,
          userId: user.id,
          // registeredAt is generated
        })
        .execute();

      // Log audit
      await db
        .insertInto("auditLog")
        .values({
          actorId: user.id,
          action: "activity_updated", // Using generic update or create specific action if available? 'activity_updated' fits loosely as state change
          targetType: "activity_registration",
          targetId: input.activityId,
          note: `User ${user.email} registered for activity ${input.activityId}`,
        })
        .execute();

      return new Response(
        superjson.stringify({ 
          success: true, 
          message: "Đăng ký tham gia thành công" 
        } satisfies OutputType)
      );

    } else {
      // Unregister
      const existing = await db
        .selectFrom("activityRegistration")
        .select(["status"])
        .where("activityId", "=", input.activityId)
        .where("userId", "=", user.id)
        .executeTakeFirst();

      if (!existing) {
        return new Response(
          superjson.stringify({ error: "Bạn chưa đăng ký tham gia hoạt động này" }),
          { status: 400 }
        );
      }

      if (existing.status === "confirmed") {
        return new Response(
          superjson.stringify({
            error: "Đăng ký đã được xác nhận. Nếu cần thay đổi, vui lòng liên hệ admin.",
          }),
          { status: 400 }
        );
      }

      // Check if activity is already closed/completed? Usually allow unregister unless it's past start time?
      // Requirement says: "For unregister: must be registered". Doesn't specify time constraints, but usually can't unregister after start.
      const now = new Date();
      if (activity.startTime < now) {
         return new Response(
          superjson.stringify({ error: "Không thể hủy đăng ký khi hoạt động đã bắt đầu hoặc kết thúc" }),
          { status: 400 }
        );
      }

      await db
        .deleteFrom("activityRegistration")
        .where("activityId", "=", input.activityId)
        .where("userId", "=", user.id)
        .execute();

      return new Response(
        superjson.stringify({ 
          success: true, 
          message: "Hủy đăng ký thành công" 
        } satisfies OutputType)
      );
    }

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