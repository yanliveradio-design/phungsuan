import { z } from "zod";
import superjson from "superjson";
import { BorrowStatus, BorrowStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  status: z.enum(BorrowStatusArrayValues).optional(),
  bookId: z.number().optional(),
  borrowerId: z.number().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export type InputType = z.infer<typeof schema>;

export type AdminBorrowListItem = {
  id: number;
  status: BorrowStatus;
  createdAt: Date;
  completedAt: Date | null;
  completionNote: string | null;
  borrowerConfirmed: boolean;
  ownerConfirmed: boolean;
  bookId: number;
  bookTitle: string;
  bookAuthor: string | null;
  borrowerId: number;
  borrowerName: string;
  borrowerEmail: string;
};

export type OutputType = {
  borrows: AdminBorrowListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const getAdminBorrowsList = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/borrows/list", window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.bookId) url.searchParams.set("bookId", String(params.bookId));
  if (params.borrowerId) url.searchParams.set("borrowerId", String(params.borrowerId));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

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