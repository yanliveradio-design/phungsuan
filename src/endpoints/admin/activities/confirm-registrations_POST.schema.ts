import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  registrationIds: z.array(z.number()),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  confirmedCount: number;
};

export const postConfirmRegistrations = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/activities/confirm-registrations`, {
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