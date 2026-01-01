import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  tab: z.enum(["ai_suggested", "ai_flagged", "all"]),
  activityId: z.coerce.number().optional(),
});

export type FeedbackItem = {
  id: number;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  aiSuggested: boolean;
  aiFlagged: boolean;
  aiReason: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  activityId: number;
  userFullName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  activityTitle: string;
  originalTopicId: number;
  originalTopicName: string;
  displayTopicId: number | null;
  displayTopicName: string | null;
};

export type OutputType = {
  feedback: FeedbackItem[];
};

export const getFeedbackList = async (
  params: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const queryParams = new URLSearchParams();
  queryParams.set("tab", params.tab);
  if (params.activityId) {
    queryParams.set("activityId", params.activityId.toString());
  }

  const result = await fetch(`/_api/admin/feedback/list?${queryParams.toString()}`, {
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