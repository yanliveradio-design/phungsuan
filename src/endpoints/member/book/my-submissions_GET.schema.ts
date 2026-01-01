import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Book } from "../../../helpers/schema";

export const schema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export type InputType = z.infer<typeof schema>;

export type MyBookSubmission = Pick<Selectable<Book>, 
  'id' | 'title' | 'author' | 'coverUrl' | 'status' | 'isApproved' | 'createdAt'
>;

export type OutputType = {
  books: MyBookSubmission[];
  total: number;
  page: number;
  totalPages: number;
};

export const getMySubmissions = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  
  const result = await fetch(`/_api/member/book/my-submissions?${queryParams}`, {
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