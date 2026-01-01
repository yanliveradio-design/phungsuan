import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Notification } from "../../helpers/schema";

export const schema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  unreadOnly: z.boolean().optional(),
});

export type NotificationItem = Pick<
  Selectable<Notification>,
  "id" | "title" | "message" | "link" | "type" | "isRead" | "createdAt" | "isImportant"
>;

export type OutputType = {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
};

export type NotificationListParams = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
};

export const getNotificationsList = async (
  params: NotificationListParams = {},
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/notifications/list", window.location.origin);
  url.searchParams.set("page", (params.page ?? 1).toString());
  url.searchParams.set("limit", (params.limit ?? 20).toString());
  if (params.unreadOnly !== undefined) {
    url.searchParams.set("unreadOnly", String(params.unreadOnly));
  }

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