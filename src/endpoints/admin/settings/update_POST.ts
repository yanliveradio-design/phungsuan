import { schema, OutputType } from "./update_POST.schema";
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

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Upsert setting
    await db
      .insertInto("publishSettings")
      .values({
        settingKey: input.settingKey,
        settingValue: input.settingValue,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.column("settingKey").doUpdateSet({
          settingValue: input.settingValue,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
      )
      .execute();

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