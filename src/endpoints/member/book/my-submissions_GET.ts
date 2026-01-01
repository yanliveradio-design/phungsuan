import { schema, OutputType } from "./my-submissions_GET.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    const params = schema.parse({ page, limit });
    const offset = (params.page - 1) * params.limit;

    // Get total count
    const countResult = await db
      .selectFrom('book')
      .where('ownerId', '=', user.id)
      .select(db.fn.count('id').as('total'))
      .executeTakeFirst();
      
    const total = Number(countResult?.total || 0);
    const totalPages = Math.ceil(total / params.limit);

    // Get books
    const books = await db
      .selectFrom('book')
      .where('ownerId', '=', user.id)
      .select([
        'id',
        'title',
        'author',
        'coverUrl',
        'status',
        'isApproved',
        'createdAt'
      ])
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .offset(offset)
      .execute();

    return new Response(superjson.stringify({
      books,
      total,
      page: params.page,
      totalPages
    } satisfies OutputType));

  } catch (error) {
    console.error("Error fetching my submissions:", error);
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}