import { schema, OutputType } from "./my-borrows_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    const input = {
      role: searchParams.role as any,
      status: searchParams.status as any,
    };
    
    const { role, status } = schema.parse(input);

    let query = db
      .selectFrom('borrowRecord')
      .innerJoin('book', 'borrowRecord.bookId', 'book.id')
      .innerJoin('users as borrower', 'borrowRecord.borrowerId', 'borrower.id')
      // We need owner info too, but owner is on book table, let's join users again for owner details
      // Note: book.ownerId can be null, so left join
      .leftJoin('users as owner', 'book.ownerId', 'owner.id')
      .select([
        'borrowRecord.id',
        'borrowRecord.bookId',
        'borrowRecord.status',
        'borrowRecord.borrowerConfirmed',
        'borrowRecord.ownerConfirmed',
        'borrowRecord.completionNote',
        'borrowRecord.createdAt',
        'borrowRecord.completedAt',
        'book.title as bookTitle',
        'book.author as bookAuthor',
        'book.coverUrl as bookCoverUrl',
        'book.ownerPhoneFull',
        'book.ownerPhoneMasked',
        'owner.fullName as ownerName',
        'borrower.fullName as borrowerName',
        'borrower.email as borrowerEmail',
      ]);

    if (role === 'borrower') {
      query = query.where('borrowRecord.borrowerId', '=', user.id);
    } else {
      // role === 'owner'
      query = query.where('book.ownerId', '=', user.id);
    }

    if (status) {
      query = query.where('borrowRecord.status', '=', status);
    }

    const records = await query.orderBy('borrowRecord.createdAt', 'desc').execute();

    // Map results to MemberBorrowItem, handling phone visibility logic
    const borrows = records.map(record => {
      const showFullPhone = ['approved', 'borrowed', 'return_requested', 'completed'].includes(record.status);
      
      return {
        id: record.id,
        bookId: record.bookId,
        bookTitle: record.bookTitle,
        bookAuthor: record.bookAuthor,
        bookCoverUrl: record.bookCoverUrl,
        status: record.status,
        borrowerConfirmed: record.borrowerConfirmed,
        ownerConfirmed: record.ownerConfirmed,
        completionNote: record.completionNote,
        createdAt: record.createdAt,
        completedAt: record.completedAt,
        ownerName: record.ownerName,
        ownerPhoneMasked: record.ownerPhoneMasked,
        ownerPhoneFull: showFullPhone ? record.ownerPhoneFull : null,
        borrowerName: record.borrowerName,
        borrowerEmail: record.borrowerEmail,
      };
    });

    return new Response(superjson.stringify({
      borrows
    } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}