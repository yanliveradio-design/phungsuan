import { schema, OutputType } from "./submit_POST.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { maskPhoneNumber } from "../../../helpers/maskPhoneNumber";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const ownerPhoneMasked = input.ownerPhoneFull 
      ? maskPhoneNumber(input.ownerPhoneFull) 
      : null;

    const result = await db
      .insertInto('book')
      .values({
        title: input.title,
        author: input.author || null,
        category: input.category || null,
        coverUrl: input.coverUrl || null,
        province: input.province || null,
        district: input.district || null,
        ownerId: user.id,
        ownerName: user.fullName,
        ownerPhoneFull: input.ownerPhoneFull || null,
        ownerPhoneMasked: ownerPhoneMasked,
        status: 'available',
        isApproved: false, // Pending admin approval
        isHidden: false,
        createdAt: new Date(),
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({
      success: true,
      bookId: result.id,
      message: "Sách đã được gửi và đang chờ duyệt."
    } satisfies OutputType));

  } catch (error) {
    console.error("Error submitting book:", error);
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}