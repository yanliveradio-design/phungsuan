import { schema, OutputType } from "./get-phone_POST.schema";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const json = superjson.parse(await request.text());
    const { borrowId } = schema.parse(json);

    const record = await db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .select(["borrowRecord.borrowerId", "borrowRecord.status", "book.ownerPhoneFull"])
      .where("borrowRecord.id", "=", borrowId)
      .executeTakeFirst();

    if (!record) {
      throw new Error("Record not found");
    }

    // Access control:
    // 1. Admin can always see
    // 2. Borrower can see ONLY if status is approved, borrowed, return_requested, completed
    //    (basically not pending or cancelled, assuming pending doesn't reveal phone yet)
    
    const isAdmin = !!user.adminRole;
    const isBorrower = user.id === record.borrowerId;
    
    if (!isAdmin && !isBorrower) {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    if (isBorrower && !isAdmin) {
       const allowedStatuses = ["approved", "borrowed", "return_requested", "completed"];
       if (!allowedStatuses.includes(record.status)) {
         return new Response(
            superjson.stringify({ error: "Phone number not available at this stage" }),
            { status: 403 }
         );
       }
    }

    return new Response(
      superjson.stringify({ 
        phone: record.ownerPhoneFull || "N/A" 
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
}