import { schema, OutputType } from "./update-location_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const updatedUser = await db
      .updateTable("users")
      .set({
        province: input.province,
        district: input.district,
        updatedAt: new Date(),
      })
      .where("id", "=", session.user.id)
      .returning([
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
      .executeTakeFirstOrThrow();

    return new Response(
      superjson.stringify({
        success: true,
        user: updatedUser,
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