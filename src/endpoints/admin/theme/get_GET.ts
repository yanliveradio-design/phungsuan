import { schema, OutputType } from "./get_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { THEME_PRESETS } from "../../../helpers/ThemePresets";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    // Allow any admin to view, but only super_admin can update (enforced in update endpoint)
    if (session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    schema.parse({});

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
        presets: THEME_PRESETS,
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