import { schema, OutputType } from "./settings_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    
    // Try to get existing settings
    let settings = await db
      .selectFrom("userNotificationSettings")
      .where("userId", "=", session.user.id)
      .selectAll()
      .executeTakeFirst();

    // If not exists, create default
    if (!settings) {
      settings = await db
        .insertInto("userNotificationSettings")
        .values({
          userId: session.user.id,
          emailEnabled: true,
          inAppEnabled: true,
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "07:00",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    }

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