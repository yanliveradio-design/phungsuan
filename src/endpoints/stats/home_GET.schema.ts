import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  totalBooks: number;
  totalMembers: number;
  totalActivities: number;
};

export const getHomeStats = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/stats/home`, {
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