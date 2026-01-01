import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { AppThemeSettings } from '../../../helpers/schema';
import { ThemePreset } from '../../../helpers/ThemePresets';

export const schema = z.object({});

export type OutputType = {
  theme: Selectable<AppThemeSettings> | null;
  presets: ThemePreset[];
};

export const getAdminThemeSettings = async (
body: z.infer<typeof schema> = {},
init?: RequestInit)
: Promise<OutputType> => {
  const result = await fetch(`/_api/admin/theme/get`, {
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