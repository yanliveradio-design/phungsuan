import { schema, OutputType } from "./close_POST.schema";
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
      .set({ status: "closed" })
      .where("id", "=", input.activityId)
      .returning(["id", "status", "title"])
      .executeTakeFirstOrThrow();

    await logAudit(
      user.id,
      "activity_closed",
      "activity",
      result.id,
      `Closed activity "${result.title}"`
    );

    return new Response(
      superjson.stringify({
        success: true,
        status: result.status,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi đóng hoạt động",
      }),
      { status: 400 }
    );
  }
}