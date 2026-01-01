import { z } from "zod";
import superjson from "superjson";
import { LogoType } from '../../../helpers/schema';

// Define the schema for page covers
const PageCoversSchema = z.record(z.string(), z.string().optional());

export const schema = z.object({
  logoType: z.enum(["emoji", "image"] as [LogoType, ...LogoType[]]),
  logoValue: z.string().min(1, "Logo value is required"),
  appName: z.string().min(1, "App name is required"),
  appDescription: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  pageCovers: PageCoversSchema.optional()
});

export type OutputType = {
  success: boolean;
};

export const postUpdateBranding = async (
body: z.infer<typeof schema>,
init?: RequestInit)
: Promise<OutputType> => {
  const result = await fetch(`/_api/admin/branding/update`, {
    method: "POST",
    body: superjson.stringify(body),
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