import { schema, OutputType } from "./get_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    const user = await db
      .selectFrom("users")
      .select([
        "id",
        "fullName",
        "email",
        "avatarUrl",
        "province",
        "district",
        "isTrustedMember",
        "joinedAt",
        "joinedAtUpdatedByMember",
      ])
      .where("id", "=", session.user.id)
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ user } satisfies OutputType));
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}