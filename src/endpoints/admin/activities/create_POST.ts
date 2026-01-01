import { schema, OutputType } from "./create_POST.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";
import { triggerNewActivityNotification } from "../../../helpers/NotificationService";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập (Admin only)" }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Insert activity
    const result = await db
      .insertInto("activity")
      .values({
        title: input.title,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        maxParticipants: input.maxParticipants ?? null,
        status: input.status,
        createdByAdmin: user.id,
        checkinEnabled: false, // Default to false
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Log audit
    await logAudit(
      user.id,
      "activity_created",
      "activity",
      result.id,
      `Created activity "${result.title}" with status ${result.status}`
    );

    // Send notifications for open activities only
    if (result.status === "open") {
      await triggerNewActivityNotification(result.id, user.id);
    }

    return new Response(
      superjson.stringify({ activity: result } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi tạo hoạt động",
      }),
      { status: 400 }
    );
  }
}