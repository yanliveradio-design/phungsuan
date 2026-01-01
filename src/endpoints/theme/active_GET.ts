import { OutputType } from "./active_GET.schema";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    // Fetch the active theme setting
    // We assume there's only one active, or we take the most recently updated one
    const activeTheme = await db
      .selectFrom("appThemeSettings")
      .selectAll()
      .where("isActive", "=", true)
      .orderBy("updatedAt", "desc")
      .limit(1)
      .executeTakeFirst();

    return new Response(
      superjson.stringify({
        theme: activeTheme || null,
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