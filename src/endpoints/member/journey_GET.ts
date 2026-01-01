import { schema, OutputType, TimelineItem } from "./journey_GET.schema";
import superjson from "superjson";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user: sessionUser } = await getServerUserSession(request);
    const userId = sessionUser.id;

    // 1. Fetch User Details (to ensure fresh data like isTrustedMember)
    const userDetails = await db
      .selectFrom("users")
      .select([
        "id",
        "fullName",
        "avatarUrl",
        "joinedAt",
        "isTrustedMember",
      ])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow();

    // 2. Calculate Summary Stats
    
    // Activities Attended
    const activitiesAttendedResult = await db
      .selectFrom("activityAttendance")
      .select(db.fn.countAll().as("count"))
      .where("userId", "=", userId)
      .executeTakeFirst();
    const activitiesAttended = Number(activitiesAttendedResult?.count ?? 0);

    // Books Borrowed (Completed)
    const booksBorrowedResult = await db
      .selectFrom("borrowRecord")
      .select(db.fn.countAll().as("count"))
      .where("borrowerId", "=", userId)
      .where("status", "=", "completed")
      .executeTakeFirst();
    const booksBorrowed = Number(booksBorrowedResult?.count ?? 0);

    // Books Lent (Completed)
    const booksLentResult = await db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .select(db.fn.countAll().as("count"))
      .where("book.ownerId", "=", userId)
      .where("borrowRecord.status", "=", "completed")
      .executeTakeFirst();
    const booksLent = Number(booksLentResult?.count ?? 0);

    // 3. Fetch Timeline Items

    // 3a. Activity Check-ins
    const checkins = await db
      .selectFrom("activityAttendance")
      .innerJoin("activity", "activityAttendance.activityId", "activity.id")
      .select([
        "activityAttendance.id",
        "activityAttendance.checkinAt as date",
        "activity.title as activityTitle",
        "activityAttendance.checkinMethod",
        "activity.id as activityId",
      ])
      .where("activityAttendance.userId", "=", userId)
      .execute();

    const checkinItems: TimelineItem[] = checkins.map((c) => ({
      id: `checkin-${c.id}`,
      type: "checkin",
      date: c.date,
      title: `Tham gia: ${c.activityTitle}`,
      subtitle: null,
      activityId: c.activityId,
      activityTitle: c.activityTitle,
      checkinMethod: c.checkinMethod,
    }));

    // 3b. Borrows (as Borrower)
    const borrows = await db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .leftJoin("users as owner", "book.ownerId", "owner.id")
      .select([
        "borrowRecord.id",
        "borrowRecord.completedAt",
        "book.title as bookTitle",
        "book.author as bookAuthor",
        "owner.fullName as partnerName",
      ])
      .where("borrowRecord.borrowerId", "=", userId)
      .where("borrowRecord.status", "=", "completed")
      .where("borrowRecord.completedAt", "is not", null)
      .execute();

    const borrowItems: TimelineItem[] = borrows.map((b) => ({
      id: `borrow-${b.id}`,
      type: "borrow_completed",
      date: b.completedAt!, // Safe assertion due to where clause
      title: `Đã đọc xong: ${b.bookTitle}`,
      subtitle: b.bookAuthor ? `Tác giả: ${b.bookAuthor}` : null,
      borrowId: b.id,
      bookTitle: b.bookTitle,
      bookAuthor: b.bookAuthor,
      partnerName: b.partnerName ?? "Người dùng ẩn danh",
    }));

    // 3c. Lends (as Owner)
    const lends = await db
      .selectFrom("borrowRecord")
      .innerJoin("book", "borrowRecord.bookId", "book.id")
      .innerJoin("users as borrower", "borrowRecord.borrowerId", "borrower.id")
      .select([
        "borrowRecord.id",
        "borrowRecord.completedAt",
        "book.title as bookTitle",
        "book.author as bookAuthor",
        "borrower.fullName as partnerName",
      ])
      .where("book.ownerId", "=", userId)
      .where("borrowRecord.status", "=", "completed")
      .where("borrowRecord.completedAt", "is not", null)
      .execute();

    const lendItems: TimelineItem[] = lends.map((l) => ({
      id: `lend-${l.id}`,
      type: "lend_completed",
      date: l.completedAt!, // Safe assertion due to where clause
      title: `Đã cho mượn: ${l.bookTitle}`,
      subtitle: `Người mượn: ${l.partnerName}`,
      borrowId: l.id,
      bookTitle: l.bookTitle,
      bookAuthor: l.bookAuthor,
      partnerName: l.partnerName,
    }));

    // 4. Merge and Sort
    const timeline = [...checkinItems, ...borrowItems, ...lendItems].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    return new Response(
      superjson.stringify({
        user: {
          id: userDetails.id,
          fullName: userDetails.fullName,
          avatarUrl: userDetails.avatarUrl,
          joinedAt: userDetails.joinedAt,
          isTrustedMember: userDetails.isTrustedMember,
        },
        summary: {
          activitiesAttended,
          booksBorrowed,
          booksLent,
        },
        timeline,
      } satisfies OutputType)
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(
      superjson.stringify({ error: "Đã xảy ra lỗi không xác định" }),
      { status: 500 }
    );
  }
}