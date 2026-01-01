import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  author: z.string().optional(),
  category: z.string().optional(),
  coverUrl: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ownerPhoneFull: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  bookId: number;
  message: string;
};

export const postSubmitBook = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/member/book/submit`, {
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