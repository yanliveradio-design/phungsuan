import { z } from "zod";
import superjson from "superjson";
import { ActivityStatus, ActivityStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  status: z.enum(ActivityStatusArrayValues).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type InputType = z.infer<typeof schema>;

export type AdminActivityListItem = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  maxParticipants: number | null;
  status: ActivityStatus;
  checkinEnabled: boolean;
  createdByAdmin: number | null;
  createdAt: Date;
  // Metrics
  registrationCount: number;
  checkinCount: number;
  feedbackCount: number;
};

export type OutputType = {
  activities: AdminActivityListItem[];
};

export const getAdminActivitiesList = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  // Convert dates to strings for query params if needed, but superjson handles body better.
  // Since this is a GET request, we usually pass params in query string.
  // However, the framework wrapper suggests using body for consistency with the schema definition if we use the helper.
  // But standard GET requests don't have body.
  // Floot framework convention in the prompt example shows `fetch('/_api/greeting', { method: "POST", body: ... })`.
  // But for GET, we usually append query params.
  // Let's check the prompt example again. The prompt example uses POST.
  // For GET requests in this framework, we often serialize the input into a query param or just use search params.
  // Given the complexity of Date objects, passing them via query params needs care.
  // We will construct a URL with search params.

  const url = new URL("/_api/admin/activities/list", window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.startDate) url.searchParams.set("startDate", params.startDate.toISOString());
  if (params.endDate) url.searchParams.set("endDate", params.endDate.toISOString());

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