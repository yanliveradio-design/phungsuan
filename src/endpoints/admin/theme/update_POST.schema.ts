import { z } from "zod";
import superjson from "superjson";
import { ThemeVariables, FontSettings } from "../../../helpers/ThemePresets";

// We need to define Zod schemas that match the types
const ThemeVariablesSchema = z.object({
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  surface: z.string(),
  surfaceForeground: z.string(),
  border: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
  card: z.string(),
  cardForeground: z.string(),
  success: z.string(),
  successForeground: z.string(),
  error: z.string(),
  errorForeground: z.string(),
  warning: z.string(),
  warningForeground: z.string(),
  info: z.string(),
  infoForeground: z.string(),
  radiusSm: z.string(),
  radius: z.string(),
  radiusMd: z.string(),
  radiusLg: z.string(),
});

const FontSettingsSchema = z.object({
  heading: z.string(),
  base: z.string(),
  monospace: z.string(),
});

export const schema = z.object({
  presetName: z.string(),
  lightTheme: ThemeVariablesSchema.optional(),
  darkTheme: ThemeVariablesSchema.optional(),
  customFonts: FontSettingsSchema.optional(),
});

export type OutputType = {
  success: boolean;
};

export const postUpdateTheme = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/theme/update`, {
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