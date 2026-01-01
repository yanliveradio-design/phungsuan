import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../../helpers/schema";

export const schema = z.object({
  userId: z.number(),
  reason: z.string().min(1, "Lý do khóa tài khoản là bắt buộc"),
});

export type OutputType = {
  user: Pick<Selectable<Users>, "id" | "fullName" | "isActive" | "lockReason">;
};

export const postLockMember = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/members/lock`, {
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