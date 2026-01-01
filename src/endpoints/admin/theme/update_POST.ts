import { schema, OutputType } from "./update_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import {
  getPresetByName,
  ThemeVariables,
  FontSettings,
} from "../../../helpers/ThemePresets";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    
    // Strict check for super_admin
    if (session.user.adminRole !== "super_admin") {
      return new Response(
        superjson.stringify({
          error: "Chỉ Super Admin mới có quyền thay đổi giao diện.",
        }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Determine values to save
    let lightTheme = input.lightTheme;
    let darkTheme = input.darkTheme;
    let customFonts = input.customFonts;

    // If preset is selected and no custom overrides provided, load from preset
    if (input.presetName) {
      const preset = getPresetByName(input.presetName);
      if (preset) {
        if (!lightTheme) lightTheme = preset.lightTheme;
        if (!darkTheme) darkTheme = preset.darkTheme;
        if (!customFonts) customFonts = preset.customFonts;
      }
    }

    if (!lightTheme || !darkTheme || !customFonts) {
      return new Response(
        superjson.stringify({
          error: "Dữ liệu giao diện không hợp lệ hoặc thiếu.",
        }),
        { status: 400 }
      );
    }

    // We will update the existing active record if it exists, or insert a new one.
    // For simplicity and history tracking, let's mark all existing as inactive and insert a new one.
    // This keeps a history of theme changes.

    await db.transaction().execute(async (trx) => {
      // Deactivate all current themes
      await trx
        .updateTable("appThemeSettings")
        .set({ isActive: false })
        .where("isActive", "=", true)
        .execute();

      // Insert new active theme
      const newTheme = await trx
        .insertInto("appThemeSettings")
        .values({
          presetName: input.presetName,
          lightTheme: JSON.stringify(lightTheme),
          darkTheme: JSON.stringify(darkTheme),
          customFonts: JSON.stringify(customFonts),
          isActive: true,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Log audit (using topic_updated as closest available action)
      await logAudit(
        session.user.id,
        "topic_updated",
        "app_theme_settings",
        newTheme.id,
        `Updated theme to preset: ${input.presetName}`
      );
    });

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType)
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