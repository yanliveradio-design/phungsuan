import { schema, OutputType } from "./create_POST.schema";
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

    const existing = await db
      .selectFrom("feedbackTopic")
      .select("id")
      .where("name", "=", input.name)
      .executeTakeFirst();

    if (existing) {
      return new Response(
        superjson.stringify({ error: "Chủ đề này đã tồn tại." }),
        { status: 400 }
      );
    }

    const result = await db
      .insertInto("feedbackTopic")
      .values({
        name: input.name,
        isActive: true,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await logAudit(
      session.user.id,
      "topic_created",
      "feedback_topic",
      result.id,
      `Created topic: ${input.name}`
    );

    return new Response(
      superjson.stringify({ success: true, id: result.id } satisfies OutputType)
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