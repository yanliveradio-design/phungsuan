import { schema, OutputType } from "./list_GET.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    // Any admin role can access this
    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền truy cập." }),
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const isTrustedMember = url.searchParams.has("isTrustedMember")
      ? url.searchParams.get("isTrustedMember") === "true"
      : undefined;
    const isActive = url.searchParams.has("isActive")
      ? url.searchParams.get("isActive") === "true"
      : undefined;
    const province = url.searchParams.get("province") || undefined;

    const input = schema.parse({
      search,
      page,
      limit,
      isTrustedMember,
      isActive,
      province,
    });

    // Build base query with filters only
    let baseQuery = db.selectFrom("users");

    // Apply filters
    if (input.search) {
      const searchLower = `%${input.search.toLowerCase()}%`;
      baseQuery = baseQuery.where((eb) =>
        eb.or([
          eb("fullName", "ilike", searchLower),
          eb("email", "ilike", searchLower),
        ])
      );
    }

    if (input.isTrustedMember !== undefined) {
      baseQuery = baseQuery.where("isTrustedMember", "=", input.isTrustedMember);
    }

    if (input.isActive !== undefined) {
      baseQuery = baseQuery.where("isActive", "=", input.isActive);
    }

    if (input.province) {
      baseQuery = baseQuery.where("province", "=", input.province);
    }

    // Get total count from base query
    const countResult = await baseQuery
      .select((eb) => eb.fn.count<string>("id").as("count"))
      .executeTakeFirst();
    
    const total = countResult ? parseInt(countResult.count) : 0;

    // Get paginated data from base query
    const offset = (input.page - 1) * input.limit;
    const users = await baseQuery
      .select([
        "id",
        "fullName",
        "email",
        "avatarUrl",
        "province",
        "district",
        "isTrustedMember",
        "isActive",
        "lockReason",
        "joinedAt",
        "lastLoginAt",
      ])
      .orderBy("joinedAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();

    return new Response(
      superjson.stringify({ users, total } satisfies OutputType)
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