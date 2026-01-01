import { schema, OutputType } from "./topics_GET.schema";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    // Validate empty input
    schema.parse({});

    const topics = await db
      .selectFrom("feedbackTopic")
      .select(["id", "name"])
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