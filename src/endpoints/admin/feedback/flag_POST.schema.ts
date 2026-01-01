import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  feedbackId: z.number(),
  flagged: z.boolean(),
  reason: z.string().optional(),
});

export type OutputType = {
  success: boolean;
};

export const postFlagFeedback = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/feedback/flag`, {
    method: "POST",
    body: superjson.stringify(body),
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