import { z } from "zod";
import superjson from "superjson";
import { BookStatus, BookStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  status: z.enum(BookStatusArrayValues).optional(),
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export type InputType = z.infer<typeof schema>;

export type AdminBookListItem = {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  coverUrl: string | null;
  province: string | null;
  district: string | null;
  status: BookStatus;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: Date;
  ownerId: number | null;
  ownerName: string | null;
  ownerEmail: string | null;
};

export type OutputType = {
  books: AdminBookListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const getAdminBooksList = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/books/list", window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.isApproved !== undefined) url.searchParams.set("isApproved", String(params.isApproved));
  if (params.isHidden !== undefined) url.searchParams.set("isHidden", String(params.isHidden));
  if (params.search) url.searchParams.set("search", params.search);
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