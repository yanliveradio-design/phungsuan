import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  bookId: z.number(),
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
};

export const postReportBook = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library/report-book`, {
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