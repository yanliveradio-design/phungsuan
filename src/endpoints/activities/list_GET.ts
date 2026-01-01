import { schema, OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const includeAllStatusesParam = url.searchParams.get("includeAllStatuses");
    
    const input = {
      includeAllStatuses: includeAllStatusesParam === "true"
    };
    
    const validatedInput = schema.parse(input);

    let query = db.selectFrom('activity').selectAll();

    if (!validatedInput.includeAllStatuses) {
      // Default behavior: only return 'open' activities
      query = query.where('status', '=', 'open');
    }

    // Order by start_time ASC as requested
    const activities = await query.orderBy('startTime', 'asc').execute();

    return new Response(superjson.stringify({ activities } satisfies OutputType));
  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}