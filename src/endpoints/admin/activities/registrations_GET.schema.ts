import { z } from "zod";
import superjson from "superjson";
import { RegistrationStatus } from "../../../helpers/schema";

export const schema = z.object({
  activityId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type ActivityRegistrationItem = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  registeredAt: Date;
  status: RegistrationStatus;
  isConfirmed: boolean; // Kept for backward compatibility, derived from attendance
};

export type OutputType = {
  registrations: ActivityRegistrationItem[];
  activityTitle: string;
};

export const getAdminActivityRegistrations = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL(
    "/_api/admin/activities/registrations",
    window.location.origin
  );
  url.searchParams.set("activityId", params.activityId.toString());

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