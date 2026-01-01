import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { NotificationBatch } from "../../../helpers/schema";

export const schema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export type NotificationHistoryItem = Pick<
  Selectable<NotificationBatch>,
  "id" | "title" | "message" | "recipientCount" | "createdAt" | "targetType"
> & {
  adminName: string;
};

export type OutputType = {
  history: NotificationHistoryItem[];
  total: number;
};

export type NotificationHistoryParams = {
  page?: number;
  limit?: number;
};

export const getAdminNotificationHistory = async (
  params: NotificationHistoryParams = {},
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/notifications/history", window.location.origin);
  url.searchParams.set("page", (params.page ?? 1).toString());
  url.searchParams.set("limit", (params.limit ?? 20).toString());

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