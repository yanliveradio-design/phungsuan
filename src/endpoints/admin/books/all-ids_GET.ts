import { schema, OutputType } from "./all-ids_GET.schema";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user.adminRole) {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    // Parse query params manually since GET body is not standard
    // We reuse the same logic as list_GET for consistency
    const params = {
      status: searchParams.status as any,
      isApproved: searchParams.isApproved === 'true' ? true : searchParams.isApproved === 'false' ? false : undefined,
      isHidden: searchParams.isHidden === 'true' ? true : searchParams.isHidden === 'false' ? false : undefined,
      search: searchParams.search,
    };

    const validatedParams = schema.parse(params);

    const { status, isApproved, isHidden, search } = validatedParams;

    let query = db
      .selectFrom("book")
      .leftJoin("users", "book.ownerId", "users.id")
      .select("book.id");

    if (status) {
      query = query.where("book.status", "=", status);
    }

    if (isApproved !== undefined) {
      query = query.where("book.isApproved", isApproved ? "is" : "is not", true);
    }

    if (isHidden !== undefined) {
      query = query.where("book.isHidden", isHidden ? "is" : "is not", true);
    }

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.where((eb) =>
        eb.or([
          eb("book.title", "ilike", searchLower),
          eb("book.author", "ilike", searchLower),
          eb("users.fullName", "ilike", searchLower),
        ])
      );
    }

    // Execute query to get all IDs without pagination
    const books = await query.execute();
    const bookIds = books.map((b) => b.id);

    return new Response(
      superjson.stringify({
        bookIds,
        total: bookIds.length,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}