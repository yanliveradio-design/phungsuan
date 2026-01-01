import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  activityId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  activityId: number;
  checkInUrl: string;
};

export const getActivityQr = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  searchParams.set("activityId", params.activityId.toString());

  const result = await fetch(`/_api/activities/qr?${searchParams.toString()}`, {
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