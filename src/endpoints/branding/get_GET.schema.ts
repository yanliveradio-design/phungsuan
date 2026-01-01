import { z } from "zod";
import superjson from "superjson";
import { LogoType } from "../../helpers/schema";

export const schema = z.object({});

export type PageCovers = {
  home?: string;
  books?: string;
  activities?: string;
  profile?: string;
  myJourney?: string;
  admin?: string;
  [key: string]: string | undefined;
};

export type BrandingData = {
  logoType: LogoType;
  logoValue: string;
  appName: string;
  appDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  pageCovers: PageCovers;
};

export type OutputType = {
  branding: BrandingData;
};

export const getBranding = async (
  body: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/branding/get`, {
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