import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { MemberTitles } from '../../helpers/schema';

export const schema = z.object({
  userId: z.number().optional()
});

export type MemberTitleItem = Pick<
  Selectable<MemberTitles>,
  "id" | "name" | "description" | "color" | "isDefault"> &
{
  assignedAt: Date;
};

export type OutputType = {
  titles: MemberTitleItem[];
};

export const getMemberTitles = async (
params: z.infer<typeof schema> = {},
init?: RequestInit)
: Promise<OutputType> => {
  const url = new URL("/_api/member/titles", window.location.origin);
  if (params.userId) {
    url.searchParams.set("userId", params.userId.toString());
  }

  const result = await fetch(url.toString(), {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{error: string;}>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};