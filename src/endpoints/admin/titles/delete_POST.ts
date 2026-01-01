import { schema, OutputType } from "./delete_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    if (session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Check if title exists
    const title = await db
      .selectFrom("memberTitles")
      .select("name")
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (!title) {
      return new Response(
        superjson.stringify({ error: "Danh hiệu không tồn tại." }),
        { status: 404 }
      );
    }

    // Delete title (cascade should handle user_titles if configured in DB, but we can also delete manually to be safe or if cascade isn't set up)
    // Assuming DB schema handles cascade or we rely on application logic.
    // Let's delete user assignments first to be safe.
    await db.deleteFrom("userTitles").where("titleId", "=", input.id).execute();

    await db.deleteFrom("memberTitles").where("id", "=", input.id).execute();

    await logAudit(
      session.user.id,
      "topic_updated" as any, // Placeholder for 'title_deleted'
      "member_title",
      input.id,
      `Deleted title: ${title.name}`
    );

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType)
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