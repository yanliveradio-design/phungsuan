import { schema, OutputType } from "./titles_GET.schema";
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { db } from '../../helpers/db';
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId");

    // If userId is provided, use it. Otherwise use current session user.
    // Note: We might want to restrict viewing other users' titles if privacy is a concern,
    // but titles are generally public badges.
    const targetUserId = userIdParam ? parseInt(userIdParam) : session.user.id;

    if (isNaN(targetUserId)) {
      return new Response(
        superjson.stringify({ error: "User ID không hợp lệ." }),
        { status: 400 }
      );
    }

    const titles = await db.
    selectFrom("userTitles").
    innerJoin("memberTitles", "userTitles.titleId", "memberTitles.id").
    select([
    "memberTitles.id",
    "memberTitles.name",
    "memberTitles.description",
    "memberTitles.color",
    "memberTitles.isDefault",
    "userTitles.assignedAt"]
    ).
    where("userTitles.userId", "=", targetUserId).
    where("memberTitles.isActive", "=", true).
    orderBy("userTitles.assignedAt", "desc").
    execute();

    return new Response(
      superjson.stringify({ titles } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định"
      }),
      { status: 500 }
    );
  }
}