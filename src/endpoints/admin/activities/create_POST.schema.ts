import { z } from "zod";
import superjson from "superjson";
import { ActivityStatusArrayValues, Activity } from "../../../helpers/schema";

// Only allow 'draft' or 'open' for creation
const CreateStatusSchema = z.enum(["draft", "open"]);

export const schema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  status: CreateStatusSchema,
});

export type InputType = z.infer<typeof schema>;

// We return the created activity object (Selectable<Activity>)
// We can approximate the type or use a partial type if needed, but usually we return the full record
export type OutputType = {
  activity: {
    id: number;
    title: string;
    status: string;
    // ... other fields as needed by UI
  };
};

export const postCreateActivity = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/activities/create`, {
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