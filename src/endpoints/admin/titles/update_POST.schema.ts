import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { MemberTitles, TitleColorArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.enum(TitleColorArrayValues).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type OutputType = {
  title: Selectable<MemberTitles>;
};

export const postUpdateTitle = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/titles/update`, {
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