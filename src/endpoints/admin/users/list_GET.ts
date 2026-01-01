import { schema, OutputType } from "./list_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    // Only super_admin can access this endpoint
    if (session.user.adminRole !== "super_admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    // Parse query params from URL since GET requests don't have body
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const role = url.searchParams.get("role") || undefined;

    const input = schema.parse({ search, role });

    let query = db
      .selectFrom("users")
      .select([
        "id",
        "fullName",
        "email",
        "avatarUrl",
        "role",
        "adminRole",
        "isActive",
        "joinedAt",
      ])
      .orderBy("joinedAt", "desc");

    if (input.role) {
      // Cast input.role to the specific union type expected by Kysely
      query = query.where("role", "=", input.role as "admin" | "member");
    }

    if (input.search) {
      const searchLower = `%${input.search.toLowerCase()}%`;
      query = query.where((eb) =>
        eb.or([
          eb("fullName", "ilike", searchLower),
          eb("email", "ilike", searchLower),
        ])
      );
    }

    const users = await query.execute();

    return new Response(superjson.stringify({ users } satisfies OutputType));
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}