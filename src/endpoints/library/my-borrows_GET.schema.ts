import { z } from "zod";
import superjson from 'superjson';
import { BorrowStatus, BorrowStatusArrayValues } from "../../helpers/schema";

export const schema = z.object({
  role: z.enum(["borrower", "owner"]),
  status: z.enum(BorrowStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type MemberBorrowItem = {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  status: BorrowStatus;
  borrowerConfirmed: boolean;
  ownerConfirmed: boolean;
  completionNote: string | null;
  createdAt: Date;
  completedAt: Date | null;
  ownerName: string | null;
  ownerPhoneMasked: string | null;
  ownerPhoneFull: string | null;
  borrowerName: string | null;
  borrowerEmail: string | null;
};

export type OutputType = {
  borrows: MemberBorrowItem[];
};

export const getMyBorrows = async (query: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryString = new URLSearchParams();
  queryString.append("role", query.role);
  if (query.status) queryString.append("status", query.status);

  const result = await fetch(`/_api/library/my-borrows?${queryString.toString()}`, {
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