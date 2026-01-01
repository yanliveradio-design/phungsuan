import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../../helpers/schema";

export const schema = z.object({
  userId: z.number(),
  isTrustedMember: z.boolean(),
});

export type OutputType = {
  user: Pick<Selectable<Users>, "id" | "fullName" | "isTrustedMember">;
};

export const postUpdateMemberTrusted = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/members/update-trusted`, {
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