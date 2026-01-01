import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";

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

    // Update activity
    const result = await db
      .updateTable("activity")
      .set({
        title: input.title,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        maxParticipants: input.maxParticipants ?? null,
      })
      .where("id", "=", input.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Log audit
    await logAudit(
      user.id,
      "activity_updated",
      "activity",
      result.id,
      `Updated activity details for "${result.title}"`
    );

    return new Response(
      superjson.stringify({ activity: result } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi cập nhật hoạt động",
      }),
      { status: 400 }
    );
  }
}