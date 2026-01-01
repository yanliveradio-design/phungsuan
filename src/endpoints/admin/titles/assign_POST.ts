import { schema, OutputType } from "./assign_POST.schema";
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

    // Check if assignment already exists
    const existing = await db
      .selectFrom("userTitles")
      .select("id")
      .where("userId", "=", input.userId)
      .where("titleId", "=", input.titleId)
      .executeTakeFirst();

    if (existing) {
      return new Response(
        superjson.stringify({ error: "Người dùng đã có danh hiệu này." }),
        { status: 400 }
      );
    }

    await db
      .insertInto("userTitles")
      .values({
        userId: input.userId,
        titleId: input.titleId,
        assignedBy: session.user.id,
        // assignedAt is generated
      })
      .execute();

    // Fetch details for response
    const user = await db
      .selectFrom("users")
      .select(["id", "fullName"])
      .where("id", "=", input.userId)
      .executeTakeFirstOrThrow();

    const title = await db
      .selectFrom("memberTitles")
      .select(["id", "name"])
      .where("id", "=", input.titleId)
      .executeTakeFirstOrThrow();

    await logAudit(
      session.user.id,
      "user_role_changed" as any, // Placeholder for 'title_assigned'
      "user",
      input.userId,
      `Assigned title '${title.name}' to user ${user.fullName}`
    );

    return new Response(
      superjson.stringify({
        success: true,
        user: { id: user.id, fullName: user.fullName },
        title: { id: title.id, name: title.name },
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