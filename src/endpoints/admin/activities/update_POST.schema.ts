import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  id: z.number(),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  activity: {
    id: number;
    title: string;
    // ... other fields
  };
};

export const postUpdateActivity = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/activities/update`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
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