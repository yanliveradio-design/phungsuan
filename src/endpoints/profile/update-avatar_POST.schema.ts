import { z } from "zod";
import superjson from "superjson";
import { OutputType as GetProfileOutput } from "./get_GET.schema";

export const schema = z.object({
  // Basic validation for data URL format
  avatarData: z.string().regex(/^data:image\/[a-zA-Z]+;base64,/, "Invalid image format"),
});

export type OutputType = {
  success: boolean;
  user: GetProfileOutput["user"];
};

export const postUpdateAvatar = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/profile/update-avatar`, {
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