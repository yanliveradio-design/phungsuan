import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  message: z.string().min(1, "Nội dung là bắt buộc"),
  link: z.string().optional(),
  isImportant: z.boolean().default(false),
  targetType: z.enum(["all", "trusted", "province", "specific"]),
  targetFilter: z.any().optional(), // Can be string (province) or number[] (userIds)
});

export type OutputType = {
  batchId: number;
  recipientCount: number;
};

export const postAdminSendNotification = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/notifications/send`, {
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