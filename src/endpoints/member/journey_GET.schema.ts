import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type TimelineItem = {
  id: string;
  type: "checkin" | "borrow_completed" | "lend_completed";
  date: Date;
  title: string;
  subtitle: string | null;
  // For checkin
  activityId?: number;
  activityTitle?: string;
  checkinMethod?: string;
  // For borrow/lend
  borrowId?: number;
  bookTitle?: string;
  bookAuthor?: string | null;
  partnerName?: string;
};

export type OutputType = {
  user: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
    joinedAt: Date;
    isTrustedMember: boolean;
  };
  summary: {
    activitiesAttended: number;
    booksLent: number;
    booksBorrowed: number;
  };
  timeline: TimelineItem[];
};

export const getMemberJourney = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/member/journey`, {
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