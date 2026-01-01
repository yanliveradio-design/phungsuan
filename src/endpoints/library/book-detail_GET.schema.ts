import { z } from "zod";
import superjson from 'superjson';
import { MemberBookItem } from "./books_GET.schema";
import { Selectable } from "kysely";
import { BorrowRecord } from "../../helpers/schema";

export const schema = z.object({
  bookId: z.number(),
});

export type InputType = z.infer<typeof schema>;

export type BookDetail = MemberBookItem & {
  ownerId: number | null;
};

export type OutputType = {
  book: BookDetail;
  activeBorrow?: Selectable<BorrowRecord>;
};

export const getBookDetail = async (query: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryString = new URLSearchParams();
  queryString.append("bookId", String(query.bookId));

  const result = await fetch(`/_api/library/book-detail?${queryString.toString()}`, {
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