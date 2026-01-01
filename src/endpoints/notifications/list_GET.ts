import { schema, OutputType } from "./list_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const url = new URL(request.url);
    
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    const input = schema.parse({
      page,
      limit,
      unreadOnly,
    });

    const offset = (input.page - 1) * input.limit;

    let query = db
      .selectFrom("notification")
      .where("userId", "=", session.user.id);

    if (input.unreadOnly) {
      query = query.where("isRead", "=", false);
    }

    // Get total count for pagination
    const countResult = await query
      .select((eb) => eb.fn.count<string>("id").as("count"))
      .executeTakeFirst();
    const total = countResult ? parseInt(countResult.count) : 0;

    // Get unread count specifically (useful for badges even when listing all)
    const unreadCountResult = await db
      .selectFrom("notification")
      .where("userId", "=", session.user.id)
      .where("isRead", "=", false)
      .select((eb) => eb.fn.count<string>("id").as("count"))
      .executeTakeFirst();
    const unreadCount = unreadCountResult ? parseInt(unreadCountResult.count) : 0;

    // Get paginated items
    const notifications = await query
      .select([
        "id",
        "title",
        "message",
        "link",
        "type",
        "isRead",
        "createdAt",
        "isImportant",
      ])
      .orderBy("createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();

    return new Response(
      superjson.stringify({
        notifications,
        total,
        unreadCount,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: error instanceof Error && error.message.includes("Not authenticated") ? 401 : 500 }
    );
  }
}