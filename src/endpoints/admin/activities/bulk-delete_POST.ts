import { schema, OutputType } from "./bulk-delete_POST.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền thực hiện thao tác này (Admin only)" }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (input.activityIds.length === 0) {
      return new Response(
        superjson.stringify({
          success: true,
          deletedCount: 0,
        } satisfies OutputType)
      );
    }

    // Fetch activity titles before deletion for audit logging
    const activitiesToDelete = await db
      .selectFrom("activity")
      .select(["id", "title"])
      .where("id", "in", input.activityIds)
      .execute();

    // Perform hard delete in a transaction
    const deletedCount = await db.transaction().execute(async (trx) => {
      // Delete related records first to handle foreign key constraints
      
      // Delete activity feedback
      await trx
        .deleteFrom("activityFeedback")
        .where("activityId", "in", input.activityIds)
        .execute();
      
      // Delete activity attendance records
      await trx
        .deleteFrom("activityAttendance")
        .where("activityId", "in", input.activityIds)
        .execute();
      
      // Delete activity registrations
      await trx
        .deleteFrom("activityRegistration")
        .where("activityId", "in", input.activityIds)
        .execute();
      
      // Finally, delete the activities themselves
      const result = await trx
        .deleteFrom("activity")
        .where("id", "in", input.activityIds)
        .execute();

      return Number(result.numDeletedRows);
    });

    console.log(`Hard deleted ${deletedCount} activities by admin ${user.id}`);

    // Log audit for each deleted activity
    for (const activity of activitiesToDelete) {
      await logAudit(
        user.id,
        "activity_cancelled",
        "activity",
        activity.id,
        `Permanent delete (hard delete): ${activity.title}`
      );
    }

    return new Response(
      superjson.stringify({
        success: true,
        deletedCount: deletedCount,
      } satisfies OutputType)
    );
  } catch (error) {
    console.error("Bulk delete activities error:", error);
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi khi xóa hàng loạt hoạt động",
      }),
      { status: 400 }
    );
  }
}