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

    // Just validate empty input
    schema.parse({});

    const topics = await db
      .selectFrom("feedbackTopic")
      .selectAll()
      .where("isActive", "=", true)
      .orderBy("name", "asc")
      .execute();

    return new Response(superjson.stringify({ topics } satisfies OutputType));
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}