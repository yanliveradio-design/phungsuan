import { schema, OutputType } from "./toggle-checkin_POST.schema";
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

    const result = await db
      .updateTable("activity")
      .set({ checkinEnabled: input.enabled })
      .where("id", "=", input.activityId)
      .returning(["id", "checkinEnabled", "title"])
      .executeTakeFirstOrThrow();

    await logAudit(
      user.id,
      "activity_checkin_toggled",
      "activity",
      result.id,
      `Toggled checkin to ${input.enabled} for "${result.title}"`
    );

    return new Response(
      superjson.stringify({
        success: true,
        checkinEnabled: result.checkinEnabled,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi thay đổi trạng thái check-in",
      }),
      { status: 400 }
    );
  }
}