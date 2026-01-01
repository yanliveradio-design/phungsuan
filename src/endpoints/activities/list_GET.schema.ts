import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from "kysely";
import type { Activity } from "../../helpers/schema";

export const schema = z.object({
  // Optional filter to override default 'open' status behavior if needed in future, 
  // though requirements say "Only return activities with status 'open' by default".
  // We'll keep it simple for now based on requirements but allow fetching all if explicitly requested via a flag or similar, 
  // but strictly following requirements: "Only return activities with status 'open' by default" implies we might want others.
  // Let's add an optional boolean to fetch all, otherwise default to open.
  includeAllStatuses: z.boolean().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  activities: Selectable<Activity>[];
};

export const getActivitiesList = async (query: InputType = {}, init?: RequestInit): Promise<OutputType> => {
  const queryString = new URLSearchParams();
  if (query.includeAllStatuses) {
    queryString.append("includeAllStatuses", "true");
  }

  const result = await fetch(`/_api/activities/list?${queryString.toString()}`, {
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