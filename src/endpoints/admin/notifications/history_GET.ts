import { schema, OutputType } from "./history_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    const input = schema.parse({ page, limit });
    const offset = (input.page - 1) * input.limit;

    // Get total count
    const countResult = await db
      .selectFrom("notificationBatch")
      .select((eb) => eb.fn.count<string>("id").as("count"))
      .executeTakeFirst();
    const total = countResult ? parseInt(countResult.count) : 0;

    // Get history with admin info
    const history = await db
      .selectFrom("notificationBatch")
      .innerJoin("users", "notificationBatch.sentByAdmin", "users.id")
      .select([
        "notificationBatch.id",
        "notificationBatch.title",
        "notificationBatch.message",
        "notificationBatch.recipientCount",
        "notificationBatch.createdAt",
        "notificationBatch.targetType",
        "users.fullName as adminName",
      ])
      .orderBy("notificationBatch.createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();

    return new Response(
      superjson.stringify({ history, total } satisfies OutputType)
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