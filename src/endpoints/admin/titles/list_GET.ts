import { schema, OutputType } from "./list_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
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

    // Fetch all titles with user count
    const titles = await db
      .selectFrom("memberTitles")
      .select([
        "memberTitles.id",
        "memberTitles.name",
        "memberTitles.description",
        "memberTitles.color",
        "memberTitles.isDefault",
        "memberTitles.isActive",
        "memberTitles.createdAt",
                (eb) =>
          eb
            .selectFrom("userTitles")
            .select(eb.fn.countAll().as("count"))
            .whereRef("userTitles.titleId", "=", "memberTitles.id")
            .as("userCount"),
      ])
      .orderBy("memberTitles.name", "asc")
      .execute();

    const formattedTitles = titles.map((t) => ({
      ...t,
      userCount: Number(t.userCount),
    }));

    return new Response(
      superjson.stringify({ titles: formattedTitles } satisfies OutputType)
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