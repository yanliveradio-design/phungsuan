import { schema, OutputType } from "./list_GET.schema";
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
    const params = {
      status: searchParams.status as any,
      isApproved: searchParams.isApproved === 'true' ? true : searchParams.isApproved === 'false' ? false : undefined,
      isHidden: searchParams.isHidden === 'true' ? true : searchParams.isHidden === 'false' ? false : undefined,
      search: searchParams.search,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 20,
    };

    const validatedParams = schema.parse(params);

    const { status, isApproved, isHidden, search, page = 1, pageSize = 20 } = validatedParams;
    const offset = (page - 1) * pageSize;

    let query = db
      .selectFrom("book")
      .leftJoin("users", "book.ownerId", "users.id")
      .select([
        "book.id",
        "book.title",
        "book.author",
        "book.category",
        "book.coverUrl",
        "book.province",
        "book.district",
        "book.status",
        "book.isApproved",
        "book.isHidden",
        "book.createdAt",
        "book.ownerId",
        (eb) => eb.fn.coalesce("book.ownerName", "users.fullName").as("ownerName"),
        "users.email as ownerEmail",
      ]);

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

    // Get total count for pagination
    const countResult = await query
      .clearSelect()
      .select((eb) => eb.fn.count("book.id").as("total"))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    // Get paginated results
    const books = await query
      .orderBy("book.createdAt", "desc")
      .limit(pageSize)
      .offset(offset)
      .execute();

    return new Response(
      superjson.stringify({
        books: books.map((b) => ({
          ...b,
          isApproved: !!b.isApproved,
          isHidden: !!b.isHidden,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}