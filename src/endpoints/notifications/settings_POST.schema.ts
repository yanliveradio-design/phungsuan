import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { UserNotificationSettings } from "../../helpers/schema";

export const schema = z.object({
  emailEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export type OutputType = {
  settings: Selectable<UserNotificationSettings>;
};

export const postUpdateNotificationSettings = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/notifications/settings`, {
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