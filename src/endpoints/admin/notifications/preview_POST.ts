import { schema, OutputType } from "./preview_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền thực hiện hành động này." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    let query = db.selectFrom("users").select(["id", "fullName", "email", "province"]);

    if (input.targetType === "trusted") {
      query = query.where("isTrustedMember", "=", true);
    } else if (input.targetType === "province" && typeof input.targetFilter === "string") {
      query = query.where("province", "=", input.targetFilter);
    } else if (
      input.targetType === "specific" &&
      Array.isArray(input.targetFilter) &&
      input.targetFilter.length > 0
    ) {
      query = query.where("id", "in", input.targetFilter);
    }

    // Get count
    const countResult = await query
      .clearSelect()
      .select((eb) => eb.fn.count<string>("id").as("count"))
      .executeTakeFirst();
    const count = countResult ? parseInt(countResult.count) : 0;

    // Get sample (first 10)
    const sample = await query
      .select(["id", "fullName", "email"])
      .limit(10)
      .execute();

    return new Response(
      superjson.stringify({ count, sample } satisfies OutputType)
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