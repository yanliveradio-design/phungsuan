import { schema, OutputType } from "./book-detail_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const bookIdParam = url.searchParams.get("bookId");
    
    if (!bookIdParam) {
      return new Response(superjson.stringify({ error: "Book ID is required" }), { status: 400 });
    }

    const validatedInput = schema.parse({ bookId: parseInt(bookIdParam) });
    
    // Fetch book details
    const book = await db
      .selectFrom('book')
      .leftJoin('users', 'book.ownerId', 'users.id')
      .select([
        'book.id',
        'book.title',
        'book.author',
        'book.category',
        'book.coverUrl',
        'book.ownerId',
        (eb) => eb.fn.coalesce('users.fullName', 'book.ownerName').as('ownerName'),
        'book.province',
        'book.district',
        'book.status',
        'book.createdAt'
      ])
      .where('book.id', '=', validatedInput.bookId)
      .executeTakeFirst();

    if (!book) {
      return new Response(superjson.stringify({ error: "Book not found" }), { status: 404 });
    }

    // Check for active borrow record if user is authenticated
    let activeBorrow = undefined;
    try {
      const { user } = await getServerUserSession(request);
      
      const borrowRecord = await db
        .selectFrom('borrowRecord')
        .selectAll()
        .where('bookId', '=', book.id)
        .where('borrowerId', '=', user.id)
        .where('status', 'in', ['pending', 'approved', 'borrowed', 'return_requested'])
        .orderBy('createdAt', 'desc')
        .executeTakeFirst();
        
      if (borrowRecord) {
        activeBorrow = borrowRecord;
      }
    } catch (e) {
      // User not authenticated, ignore
    }

    return new Response(superjson.stringify({
      book,
      activeBorrow
    } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}