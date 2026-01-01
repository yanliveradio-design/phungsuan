import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  feedbackId: z.number(),
  newTopicId: z.number(),
});

export type OutputType = {
  success: boolean;
};

export const postRetagFeedback = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/feedback/retag`, {
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