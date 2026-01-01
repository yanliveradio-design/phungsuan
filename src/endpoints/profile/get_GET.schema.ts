import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type OutputType = {
  user: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    province: string | null;
    district: string | null;
    isTrustedMember: boolean;
    joinedAt: Date;
    joinedAtUpdatedByMember: boolean;
  };
};

export const getProfile = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/profile/get`, {
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