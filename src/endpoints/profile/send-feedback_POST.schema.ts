import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  subject: z.string().min(1, "Tiêu đề là bắt buộc"),
  message: z.string().min(1, "Nội dung là bắt buộc"),
});

export type OutputType = {
  success: boolean;
};

export const postSendFeedback = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/profile/send-feedback`, {
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