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
    
    const params = {
      status: searchParams.status as any,
      bookId: searchParams.bookId ? parseInt(searchParams.bookId) : undefined,
      borrowerId: searchParams.borrowerId ? parseInt(searchParams.borrowerId) : undefined,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 20,
    };

    const validatedParams = schema.parse(params);
    const { status, bookId, borrowerId, page = 1, pageSize = 20 } = validatedParams;
    const offset = (page - 1) * pageSize;

    let query = db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .innerJoin("users", "borrowRecord.borrowerId", "users.id")
      .select([
        "borrowRecord.id",
        "borrowRecord.status",
        "borrowRecord.createdAt",
        "borrowRecord.completedAt",
        "borrowRecord.completionNote",
        "borrowRecord.borrowerConfirmed",
        "borrowRecord.ownerConfirmed",
        "book.id as bookId",
        "book.title as bookTitle",
        "book.author as bookAuthor",
        "users.id as borrowerId",
        "users.fullName as borrowerName",
        "users.email as borrowerEmail",
      ]);

    if (status) {
      query = query.where("borrowRecord.status", "=", status);
    }

    if (bookId) {
      query = query.where("borrowRecord.bookId", "=", bookId);
    }

    if (borrowerId) {
      query = query.where("borrowRecord.borrowerId", "=", borrowerId);
    }

    const countResult = await query
      .clearSelect()
      .select((eb) => eb.fn.count("borrowRecord.id").as("total"))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    const borrows = await query
      .orderBy("borrowRecord.createdAt", "desc")
      .limit(pageSize)
      .offset(offset)
      .execute();

    return new Response(
      superjson.stringify({
        borrows,
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