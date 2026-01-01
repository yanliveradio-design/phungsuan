import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  activityId: z.coerce.number().optional(),
  topicId: z.coerce.number().optional(),
  limit: z.coerce.number().optional().default(5),
});

export type InputType = z.input<typeof schema>;

export type PublishedFeedbackItem = {
  id: number;
  rating: number;
  comment: string | null;
  topicName: string | null;
  createdAt: Date;
  user: {
    fullName: string;
  } | null;
};

export type OutputType = {
  feedbacks: PublishedFeedbackItem[];
};

export const getPublishedFeedback = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  // Construct query string
  const searchParams = new URLSearchParams();
  if (params.activityId) searchParams.set("activityId", params.activityId.toString());
  if (params.topicId) searchParams.set("topicId", params.topicId.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const result = await fetch(`/_api/feedback/published?${searchParams.toString()}`, {
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