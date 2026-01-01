import { schema, OutputType } from "./home_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    // Parallelize the queries for better performance
    const [booksResult, membersResult, activitiesResult] = await Promise.all([
      // 1. Total Books: Count all books
      db.selectFrom('book')
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst(),

      // 2. Total Members: Count active users with role 'member'
      db.selectFrom('users')
        .where('role', '=', 'member')
        .where('isActive', '=', true)
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst(),

      // 3. Total Activities: Count all activities
      db.selectFrom('activity')
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst()
    ]);

    // Note: Postgres count returns a string (bigint), so we need to convert it to number
    const totalBooks = Number(booksResult?.count ?? 0);
    const totalMembers = Number(membersResult?.count ?? 0);
    const totalActivities = Number(activitiesResult?.count ?? 0);

    const response: OutputType = {
      totalBooks,
      totalMembers,
      totalActivities
    };

    return new Response(superjson.stringify(response), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("Error fetching home stats:", error);
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}