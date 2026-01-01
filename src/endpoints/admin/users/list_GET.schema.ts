import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../../helpers/schema";

export const schema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "member"]).optional(),
});

export type UserListItem = Pick<
  Selectable<Users>,
  | "id"
  | "fullName"
  | "email"
  | "avatarUrl"
  | "role"
  | "adminRole"
  | "isActive"
  | "joinedAt"
>;

export type OutputType = {
  users: UserListItem[];
};

export const getUsersList = async (
  params: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/users/list", window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.role) url.searchParams.set("role", params.role);

  const result = await fetch(url.toString(), {
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