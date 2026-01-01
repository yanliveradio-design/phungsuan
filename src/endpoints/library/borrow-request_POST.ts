import { schema, OutputType } from "./borrow-request_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { triggerBorrowNotification } from "../../helpers/NotificationService";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const json = superjson.parse(await request.text());
    const { bookId } = schema.parse(json);

    // Check if book exists and is available
    const book = await db
      .selectFrom('book')
      .select(['id', 'status', 'ownerId', 'title'])
      .where('id', '=', bookId)
      .executeTakeFirst();

    if (!book) {
      throw new Error("Book not found");
    }

    if (book.ownerId === user.id) {
      throw new Error("You cannot borrow your own book");
    }

    if (book.status !== 'available') {
      throw new Error("Book is currently not available for borrowing");
    }

    // Check for existing active/pending borrows by this user for this book
    const existingBorrow = await db
      .selectFrom('borrowRecord')
      .select('id')
      .where('bookId', '=', bookId)
      .where('borrowerId', '=', user.id)
      .where('status', 'in', ['pending', 'approved', 'borrowed', 'return_requested'])
      .executeTakeFirst();

    if (existingBorrow) {
      throw new Error("You already have an active request or borrow for this book");
    }

    // Create borrow record
    const borrowRecord = await db
      .insertInto('borrowRecord')
      .values({
        bookId,
        borrowerId: user.id,
        status: 'pending',
        borrowerConfirmed: false,
        ownerConfirmed: false,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Notify owner
    await triggerBorrowNotification(borrowRecord.id, 'request');

    return new Response(superjson.stringify({
      success: true,
      borrowId: borrowRecord.id
    } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}