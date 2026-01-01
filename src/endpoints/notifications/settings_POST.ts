import { schema, OutputType } from "./settings_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Upsert settings
    const settings = await db
      .insertInto("userNotificationSettings")
      .values({
        userId: session.user.id,
        emailEnabled: input.emailEnabled,
        inAppEnabled: input.inAppEnabled,
        quietHoursEnabled: input.quietHoursEnabled,
        quietHoursStart: input.quietHoursStart,
        quietHoursEnd: input.quietHoursEnd,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          emailEnabled: input.emailEnabled,
          inAppEnabled: input.inAppEnabled,
          quietHoursEnabled: input.quietHoursEnabled,
          quietHoursStart: input.quietHoursStart,
          quietHoursEnd: input.quietHoursEnd,
          updatedAt: new Date(),
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(
      superjson.stringify({ settings } satisfies OutputType)
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