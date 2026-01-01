import { schema, OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    
    // Validate input using schema (even though it's GET, we validate query params)
    // We construct an object from query params to validate against the schema
    const input = {
      status: statusParam || undefined
    };
    
    const validatedInput = schema.parse(input);

    let query = db.selectFrom('book').selectAll();

    if (validatedInput.status) {
      query = query.where('status', '=', validatedInput.status);
    }

    // Order by created_at DESC as requested
    const books = await query.orderBy('createdAt', 'desc').execute();

    return new Response(superjson.stringify({ books } satisfies OutputType));
  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}