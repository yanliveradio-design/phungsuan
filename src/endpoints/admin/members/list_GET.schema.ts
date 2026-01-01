import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../../helpers/schema";

export const schema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isTrustedMember: z.boolean().optional(),
  isActive: z.boolean().optional(),
  province: z.string().optional(),
});

export type MemberListItem = Pick<
  Selectable<Users>,
  | "id"
  | "fullName"
  | "email"
  | "avatarUrl"
  | "province"
  | "district"
  | "isTrustedMember"
  | "isActive"
  | "lockReason"
  | "joinedAt"
  | "lastLoginAt"
>;

export type OutputType = {
  users: MemberListItem[];
  total: number;
};

export type MemberListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isTrustedMember?: boolean;
  isActive?: boolean;
  province?: string;
};

export const getMembersList = async (
  params: MemberListParams = {},
  init?: RequestInit
): Promise<OutputType> => {
  const url = new URL("/_api/admin/members/list", window.location.origin);
  url.searchParams.set("page", (params.page ?? 1).toString());
  url.searchParams.set("limit", (params.limit ?? 20).toString());
  
  if (params.search) url.searchParams.set("search", params.search);
  if (params.isTrustedMember !== undefined) url.searchParams.set("isTrustedMember", String(params.isTrustedMember));
  if (params.isActive !== undefined) url.searchParams.set("isActive", String(params.isActive));
  if (params.province) url.searchParams.set("province", params.province);

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