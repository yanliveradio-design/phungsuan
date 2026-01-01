import { schema, OutputType } from "./unlock_POST.schema";
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

    const updatedUser = await db
      .updateTable("users")
      .set({
        isActive: true,
        lockReason: null,
        updatedAt: new Date(),
      })
      .where("id", "=", input.userId)
      .returning(["id", "fullName", "isActive", "lockReason"])
      .executeTakeFirstOrThrow();

    await logAudit(
      session.user.id,
      "user_unlocked",
      "users",
      input.userId,
      "Unlocked user account"
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