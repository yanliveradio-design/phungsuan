import { schema, OutputType } from "./delete-all_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { logAudit } from "../../helpers/AuditLogger";
import { AuditAction } from "../../helpers/schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    
    // Validate input (empty object)
    const text = await request.text();
    const json = text ? superjson.parse(text) : {};
    schema.parse(json);

    // Perform hard delete
    const result = await db
      .deleteFrom("notification")
      .where("userId", "=", session.user.id)
      .execute();

    // Calculate total deleted rows (usually one DeleteResult in the array for this query)
    const deletedCount = result.reduce((acc, r) => acc + Number(r.numDeletedRows), 0);

    // Log audit action
    // Note: "notifications_delete_all" is cast to AuditAction to satisfy the helper, 
    // as requested by the user requirements despite not being in the current schema enum.
    await logAudit(
      session.user.id,
      "notifications_delete_all" as AuditAction,
      "user",
      session.user.id,
      `User deleted all ${deletedCount} notifications`
    );

    return new Response(
      superjson.stringify({
        success: true,
        deletedCount,
      } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: error instanceof Error && error.name === "NotAuthenticatedError" ? 401 : 500 }
    );
  }
}