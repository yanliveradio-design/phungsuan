import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { AuditLog, ActivityAttendance, BorrowRecord } from "../../../helpers/schema";

export const schema = z.object({
  userId: z.number(),
});

export type MemberAuditLog = Pick<Selectable<AuditLog>, "id" | "action" | "note" | "createdAt"> & {
  actorName: string | null;
};

export type MemberActivityHistory = Pick<Selectable<ActivityAttendance>, "checkinAt" | "checkinMethod"> & {
  id: number; // activity id
  title: string;
};

export type MemberBorrowHistory = Pick<Selectable<BorrowRecord>, "id" | "status" | "createdAt" | "completedAt"> & {
  bookTitle: string;
};

export type OutputType = {
  auditLogs: MemberAuditLog[];
  activities: MemberActivityHistory[];
  borrows: MemberBorrowHistory[];
};

export const getMemberHistory = async (
  params: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/members/history", window.location.origin);
  url.searchParams.set("userId", params.userId.toString());

  const result = await fetch(url.toString(), {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};