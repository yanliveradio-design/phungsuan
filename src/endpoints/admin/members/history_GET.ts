import { schema, OutputType } from "./history_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userId = Number(url.searchParams.get("userId"));

    if (!userId || isNaN(userId)) {
      return new Response(
        superjson.stringify({ error: "User ID không hợp lệ." }),
        { status: 400 }
      );
    }

    const input = schema.parse({ userId });

    // Fetch recent audit logs targeting this user
    const auditLogs = await db
      .selectFrom("auditLog")
      .leftJoin("users as actor", "auditLog.actorId", "actor.id")
      .select([
        "auditLog.id",
        "auditLog.action",
        "auditLog.note",
        "auditLog.createdAt",
        "actor.fullName as actorName",
      ])
      .where("auditLog.targetType", "=", "users")
      .where("auditLog.targetId", "=", input.userId)
      .orderBy("auditLog.createdAt", "desc")
      .limit(20)
      .execute();

    // Fetch recent activities joined
    const activities = await db
      .selectFrom("activityAttendance")
      .innerJoin("activity", "activityAttendance.activityId", "activity.id")
      .select([
        "activity.id",
        "activity.title",
        "activityAttendance.checkinAt",
        "activityAttendance.checkinMethod",
      ])
      .where("activityAttendance.userId", "=", input.userId)
      .orderBy("activityAttendance.checkinAt", "desc")
      .limit(20)
      .execute();

    // Fetch recent books borrowed
    const borrows = await db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .select([
        "borrowRecord.id",
        "book.title as bookTitle",
        "borrowRecord.status",
        "borrowRecord.createdAt",
        "borrowRecord.completedAt",
      ])
      .where("borrowRecord.borrowerId", "=", input.userId)
      .orderBy("borrowRecord.createdAt", "desc")
      .limit(20)
      .execute();

    return new Response(
      superjson.stringify({
        auditLogs,
        activities,
        borrows,
      } satisfies OutputType)
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