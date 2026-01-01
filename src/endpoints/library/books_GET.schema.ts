import { z } from "zod";
import superjson from 'superjson';
import { BookStatus } from "../../helpers/schema";

export const schema = z.object({
  category: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(12),
});

export type InputType = z.infer<typeof schema>;

export type MemberBookItem = {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  coverUrl: string | null;
  ownerName: string | null;
  province: string | null;
  district: string | null;
  status: BookStatus;
  createdAt: Date;
};

export type OutputType = {
  books: MemberBookItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const getMemberBooks = async (query: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryString = new URLSearchParams();
  if (query.category) queryString.append("category", query.category);
  if (query.province) queryString.append("province", query.province);
  if (query.district) queryString.append("district", query.district);
  if (query.search) queryString.append("search", query.search);
  if (query.page) queryString.append("page", String(query.page));
  if (query.pageSize) queryString.append("pageSize", String(query.pageSize));

  const result = await fetch(`/_api/library/books?${queryString.toString()}`, {
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