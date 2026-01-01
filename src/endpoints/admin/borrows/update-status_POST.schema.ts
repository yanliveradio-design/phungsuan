import { z } from "zod";
import superjson from "superjson";
import { BorrowStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  borrowId: z.number(),
  status: z.enum(BorrowStatusArrayValues),
  completionNote: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
};

export const postUpdateBorrowStatus = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/borrows/update-status`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
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