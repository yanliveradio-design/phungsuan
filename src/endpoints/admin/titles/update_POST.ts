import { schema, OutputType } from "./update_POST.schema";
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

    const result = await db
      .updateTable("memberTitles")
      .set({
        name: input.name,
        description: input.description,
        color: input.color,
        isDefault: input.isDefault,
        isActive: input.isActive,
      })
      .where("id", "=", input.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    await logAudit(
      session.user.id,
      "topic_updated" as any, // Placeholder for 'title_updated'
      "member_title",
      result.id,
      `Updated title: ${result.name}`
    );

    return new Response(
      superjson.stringify({ title: result } satisfies OutputType)
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