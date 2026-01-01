import { z } from "zod";
import superjson from "superjson";
import { ActivityStatus, ActivityStatusArrayValues, RegistrationStatus } from "../../helpers/schema";

export const schema = z.object({
  status: z.enum(ActivityStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type MemberActivityItem = {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  maxParticipants: number | null;
  status: ActivityStatus;
  checkinEnabled: boolean;
  imageUrl: string | null;
  registrationCount: number;
  // User-specific (false/null if not authenticated or not registered)
  isRegistered: boolean | null;
  isCheckedIn: boolean | null;
  hasFeedback: boolean | null;
  registrationStatus: RegistrationStatus | null;
};

export type OutputType = {
  activities: MemberActivityItem[];
};

export const getMemberActivitiesList = async (
  params: InputType = {},
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/activities/member", window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);

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