import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  targetType: z.enum(["all", "trusted", "province", "specific"]),
  targetFilter: z.any().optional(),
});

export type RecipientSample = {
  id: number;
  fullName: string;
  email: string;
};

export type OutputType = {
  count: number;
  sample: RecipientSample[];
};

export const postAdminPreviewRecipients = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/notifications/preview`, {
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