import { schema, OutputType } from "./mark-read_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (input.markAll) {
      await db
        .updateTable("notification")
        .set({ isRead: true })
        .where("userId", "=", session.user.id)
        .where("isRead", "=", false)
        .execute();
    } else if (input.notificationIds && input.notificationIds.length > 0) {
      await db
        .updateTable("notification")
        .set({ isRead: true })
        .where("userId", "=", session.user.id)
        .where("id", "in", input.notificationIds)
        .execute();
    }

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