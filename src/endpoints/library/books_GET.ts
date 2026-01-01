import { schema, OutputType } from "./books_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    // Parse query params
    const input = {
      category: searchParams.category || undefined,
      province: searchParams.province || undefined,
      district: searchParams.district || undefined,
      search: searchParams.search || undefined,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 12,
    };
    
    const validatedInput = schema.parse(input);
    const { category, province, district, search, page, pageSize } = validatedInput;
    const offset = (page - 1) * pageSize;

    let query = db
      .selectFrom('book')
      .leftJoin('users', 'book.ownerId', 'users.id')
      .select([
        'book.id',
        'book.title',
        'book.author',
        'book.category',
        'book.coverUrl',
        (eb) => eb.fn.coalesce('users.fullName', 'book.ownerName').as('ownerName'),
        'book.province',
        'book.district',
        'book.status',
        'book.createdAt'
      ])
      .where('book.isApproved', '=', true)
      .where((eb) => eb.or([
        eb('book.isHidden', '=', false),
eb('book.isHidden', 'is', null)
      ]));

    if (category) {
      query = query.where('book.category', '=', category);
    }

    if (province) {
      query = query.where('book.province', '=', province);
    }

    if (district) {
      query = query.where('book.district', '=', district);
    }

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.where((eb) => eb.or([
        eb('book.title', 'ilike', searchLower),
        eb('book.author', 'ilike', searchLower)
      ]));
    }

    // Get total count for pagination
    const countResult = await query
      .clearSelect()
      .select((eb) => eb.fn.count('book.id').as('total'))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    // Get paginated results
    const books = await query
      .orderBy('book.createdAt', 'desc')
      .limit(pageSize)
      .offset(offset)
      .execute();

    return new Response(superjson.stringify({
      books,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}