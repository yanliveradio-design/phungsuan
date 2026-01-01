import { schema, OutputType } from "./unassign_POST.schema";
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
      .deleteFrom("userTitles")
      .where("userId", "=", input.userId)
      .where("titleId", "=", input.titleId)
      .executeTakeFirst();

    if (Number(result.numDeletedRows) === 0) {
      return new Response(
        superjson.stringify({
          error: "Người dùng không có danh hiệu này hoặc đã bị xóa.",
        }),
        { status: 404 }
      );
    }

    await logAudit(
      session.user.id,
      "user_role_changed" as any, // Placeholder for 'title_unassigned'
      "user",
      input.userId,
      `Unassigned title ID ${input.titleId} from user ID ${input.userId}`
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