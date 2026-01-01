import { z } from "zod";
import superjson from "superjson";
import { BookStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  status: z.enum(BookStatusArrayValues).optional(),
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  search: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  bookIds: number[];
  total: number;
};

export const getAdminBookIds = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/books/all-ids", window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.isApproved !== undefined) url.searchParams.set("isApproved", String(params.isApproved));
  if (params.isHidden !== undefined) url.searchParams.set("isHidden", String(params.isHidden));
  if (params.search) url.searchParams.set("search", params.search);

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