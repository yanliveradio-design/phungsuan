import { z } from "zod";
import superjson from 'superjson';
import { BookStatusArrayValues } from "../../helpers/schema";
import type { Selectable } from "kysely";
import type { Book } from "../../helpers/schema";

export const schema = z.object({
  status: z.enum(BookStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  books: Selectable<Book>[];
};

export const getBooksList = async (query: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryString = new URLSearchParams();
  if (query.status) {
    queryString.append("status", query.status);
  }

  const result = await fetch(`/_api/books/list?${queryString.toString()}`, {
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