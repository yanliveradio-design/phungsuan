import { schema, OutputType } from "./lock_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền thực hiện hành động này." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Prevent locking self
    if (input.userId === session.user.id) {
      return new Response(
        superjson.stringify({ error: "Bạn không thể khóa tài khoản của chính mình." }),
        { status: 400 }
      );
    }

    const updatedUser = await db
      .updateTable("users")
      .set({
        isActive: false,
        lockReason: input.reason,
        updatedAt: new Date(),
      })
      .where("id", "=", input.userId)
      .returning(["id", "fullName", "isActive", "lockReason"])
      .executeTakeFirstOrThrow();

    await logAudit(
      session.user.id,
      "user_locked",
      "users",
      input.userId,
      `Locked user. Reason: ${input.reason}`
    );

    return new Response(
      superjson.stringify({ user: updatedUser } satisfies OutputType)
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