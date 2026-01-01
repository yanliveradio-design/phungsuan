import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  notificationIds: z.array(z.number()).optional(),
  markAll: z.boolean().optional(),
}).refine(data => data.markAll || (data.notificationIds && data.notificationIds.length > 0), {
  message: "Must provide either notificationIds or markAll=true",
});

export type OutputType = {
  success: boolean;
};

export const postMarkNotificationsRead = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/notifications/mark-read`, {
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