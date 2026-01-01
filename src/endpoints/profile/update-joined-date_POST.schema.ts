import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

export const schema = z.object({
  joinedAt: z.date(),
});

export type OutputType = {
  success: boolean;
  user: Pick<Selectable<Users>, "id" | "fullName" | "email" | "avatarUrl" | "province" | "district" | "isTrustedMember" | "joinedAt" | "joinedAtUpdatedByMember">;
};

export const postUpdateProfileJoinedDate = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/profile/update-joined-date`, {
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