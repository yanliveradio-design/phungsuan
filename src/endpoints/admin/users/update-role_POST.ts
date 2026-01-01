import { schema, OutputType } from "./update-role_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    // Only super_admin can perform this action
    if (session.user.adminRole !== "super_admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền thực hiện hành động này." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Prevent self-demotion
    // If the target user is the current user, check if they are removing their own super_admin status
    if (input.userId === session.user.id) {
      if (input.role !== "admin" || input.adminRole !== "super_admin") {
         return new Response(
          superjson.stringify({ error: "Bạn không thể tự hạ quyền của chính mình." }),
          { status: 400 }
        );
      }
    }

    // Update user role
    const updatedUser = await db
      .updateTable("users")
      .set({
        role: input.role,
        adminRole: input.adminRole,
        updatedAt: new Date(),
      })
      .where("id", "=", input.userId)
      .returning(["id", "fullName", "email", "role", "adminRole"])
      .executeTakeFirstOrThrow();

    // Log audit
    await logAudit(
      session.user.id,
      "user_role_changed",
      "users",
      input.userId,
      `Changed role to ${input.role}, adminRole to ${input.adminRole ?? "null"}`
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