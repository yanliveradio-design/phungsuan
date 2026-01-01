import { JsonValue } from "./schema";

export type ThemeVariables = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  surface: string;
  surfaceForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  success: string;
  successForeground: string;
  error: string;
  errorForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  radiusSm: string;
  radius: string;
  radiusMd: string;
  radiusLg: string;
};

export type FontSettings = {
  heading: string;
  base: string;
  monospace: string;
};

export type ThemePreset = {
  name: string;
  displayName: string;
  icon: string;
  lightTheme: ThemeVariables;
  darkTheme: ThemeVariables;
  customFonts: FontSettings;
};

const DEFAULT_FONTS: FontSettings = {
  heading: "Inter, sans-serif",
  base: "Inter, sans-serif",
  monospace: "JetBrains Mono, monospace",
};

// Color conversion utilities
export function hslToHex(hslString: string | undefined): string {
  if (!hslString) {
    return "#000000";
  }
  // Parse "hsl(h s% l%)" format
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) {
    console.error("Invalid HSL format:", hslString);
    return "#000000";
  }

  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10) / 100;
  const l = parseInt(match[3], 10) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

export function hexToHsl(hexString: string): string {
  // Handle both #RGB and #RRGGBB formats
  let hex = hexString.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `hsl(${hDeg} ${sPercent}% ${lPercent}%)`;
}

// Helper to create a preset with less boilerplate
const createPreset = (
  name: string,
  displayName: string,
  icon: string,
  light: Partial<ThemeVariables>,
  dark: Partial<ThemeVariables>,
  fonts: FontSettings = DEFAULT_FONTS
): ThemePreset => {
  const baseLight: ThemeVariables = {
    primary: "hsl(220 13% 36%)", // Slate 600
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(215 16% 65%)", // Slate 400
    secondaryForeground: "hsl(222 47% 11%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222 47% 11%)", // Slate 900
    accent: "hsl(210 40% 96%)", // Slate 100
    accentForeground: "hsl(222 47% 11%)",
    surface: "hsl(0 0% 100%)",
    surfaceForeground: "hsl(222 47% 11%)",
    border: "hsl(214 32% 91%)", // Slate 200
    muted: "hsl(210 40% 98%)", // Slate 50
    mutedForeground: "hsl(215 16% 47%)", // Slate 500
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(222 47% 11%)",
    success: "hsl(142 71% 45%)",
    successForeground: "hsl(0 0% 100%)",
    error: "hsl(0 84% 60%)",
    errorForeground: "hsl(0 0% 100%)",
    warning: "hsl(38 92% 50%)",
    warningForeground: "hsl(0 0% 100%)",
    info: "hsl(217 91% 60%)",
    infoForeground: "hsl(0 0% 100%)",
    radiusSm: "0.25rem",
    radius: "0.5rem",
    radiusMd: "0.75rem",
    radiusLg: "1rem",
    ...light,
  };

  const baseDark: ThemeVariables = {
    primary: "hsl(215 16% 65%)", // Slate 400
    primaryForeground: "hsl(222 47% 11%)",
    secondary: "hsl(220 13% 36%)", // Slate 600
    secondaryForeground: "hsl(0 0% 100%)",
    background: "hsl(222 47% 1%)", // Slate 950
    foreground: "hsl(210 40% 98%)", // Slate 50
    accent: "hsl(215 28% 17%)", // Slate 800
    accentForeground: "hsl(210 40% 98%)",
    surface: "hsl(222 47% 11%)", // Slate 900
    surfaceForeground: "hsl(210 40% 98%)",
    border: "hsl(215 28% 17%)", // Slate 800
    muted: "hsl(222 47% 11%)", // Slate 900
    mutedForeground: "hsl(215 16% 65%)", // Slate 400
    card: "hsl(222 47% 11%)", // Slate 900
    cardForeground: "hsl(210 40% 98%)",
    success: "hsl(142 71% 45%)",
    successForeground: "hsl(0 0% 100%)",
    error: "hsl(0 84% 60%)",
    errorForeground: "hsl(0 0% 100%)",
    warning: "hsl(38 92% 50%)",
    warningForeground: "hsl(0 0% 100%)",
    info: "hsl(217 91% 60%)",
    infoForeground: "hsl(0 0% 100%)",
    radiusSm: "0.25rem",
    radius: "0.5rem",
    radiusMd: "0.75rem",
    radiusLg: "1rem",
    ...dark,
  };

  return {
    name,
    displayName,
    icon,
    lightTheme: baseLight,
    darkTheme: baseDark,
    customFonts: fonts,
  };
};

export const THEME_PRESETS: ThemePreset[] = [
  createPreset(
    "default",
    "Wabi-Sabi",
    "🍃",
    {
      // Light mode - exact values from base.css
      primary: "hsl(108 15% 39%)",
      primaryForeground: "hsl(60 10% 98%)",
      secondary: "hsl(30 15% 75%)",
      secondaryForeground: "hsl(100 5% 25%)",
      accent: "hsl(200 15% 85%)",
      accentForeground: "hsl(100 5% 25%)",
      background: "hsl(60 10% 98%)",
      foreground: "hsl(100 5% 25%)",
      surface: "hsl(60 5% 95%)",
      surfaceForeground: "hsl(100 5% 20%)",
      border: "hsl(60 5% 85%)",
      muted: "hsl(60 8% 90%)",
      mutedForeground: "hsl(100 4% 45%)",
      card: "hsl(60 10% 99%)",
      cardForeground: "hsl(100 5% 25%)",
      success: "hsl(108 20% 45%)",
      successForeground: "hsl(60 10% 98%)",
      error: "hsl(0 30% 60%)",
      errorForeground: "hsl(0 30% 98%)",
      warning: "hsl(35 40% 60%)",
      warningForeground: "hsl(35 40% 10%)",
      info: "hsl(200 20% 50%)",
      infoForeground: "hsl(200 20% 95%)",
      radiusSm: "4px",
      radius: "8px",
      radiusMd: "12px",
      radiusLg: "16px",
    },
    {
      // Dark mode - exact values from base.css
      primary: "hsl(108 20% 55%)",
      primaryForeground: "hsl(60 5% 10%)",
      secondary: "hsl(30 10% 40%)",
      secondaryForeground: "hsl(60 10% 90%)",
      accent: "hsl(60 4% 25%)",
      accentForeground: "hsl(60 10% 90%)",
      background: "hsl(60 5% 11%)",
      foreground: "hsl(60 10% 90%)",
      surface: "hsl(60 3% 15%)",
      surfaceForeground: "hsl(60 10% 95%)",
      border: "hsl(60 3% 20%)",
      muted: "hsl(60 4% 25%)",
      mutedForeground: "hsl(60 5% 65%)",
      card: "hsl(60 3% 15%)",
      cardForeground: "hsl(60 10% 95%)",
      success: "hsl(108 20% 45%)",
      successForeground: "hsl(60 10% 98%)",
      error: "hsl(0 30% 60%)",
      errorForeground: "hsl(0 30% 98%)",
      warning: "hsl(35 40% 60%)",
      warningForeground: "hsl(35 40% 10%)",
      info: "hsl(200 20% 50%)",
      infoForeground: "hsl(200 20% 95%)",
      radiusSm: "4px",
      radius: "8px",
      radiusMd: "12px",
      radiusLg: "16px",
    }
  ),
  createPreset(
    "tet_nguyen_dan",
    "Tết Nguyên Đán",
    "🧧",
    {
      primary: "hsl(0 100% 41%)", // #d00000
      primaryForeground: "hsl(54 100% 50%)", // #ffea00
      secondary: "hsl(45 98% 51%)", // #ffba08
      secondaryForeground: "hsl(349 94% 11%)",
      accent: "hsl(52 100% 84%)",
      background: "hsl(55 100% 98%)",
      border: "hsl(45 98% 51%)",
    },
    {
      primary: "hsl(0 100% 65%)",
      primaryForeground: "hsl(349 94% 11%)",
      secondary: "hsl(39 98% 50%)",
      background: "hsl(349 94% 11%)",
      surface: "hsl(355 93% 22%)",
      border: "hsl(358 97% 31%)",
    }
  ),
  createPreset(
    "trung_thu",
    "Trung Thu",
    "🏮",
    {
      primary: "hsl(20 95% 48%)", // #ea580c (Orange 600)
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(17 88% 24%)", // #7c2d12 (Orange 900)
      accent: "hsl(34 100% 92%)", // #ffedd5 (Orange 100)
      background: "hsl(33 100% 96%)", // #fff7ed (Orange 50)
    },
    {
      primary: "hsl(27 96% 61%)", // #fb923c (Orange 400)
      primaryForeground: "hsl(15 86% 13%)",
      secondary: "hsl(18 80% 40%)", // #c2410c (Orange 700)
      background: "hsl(15 86% 13%)",
      surface: "hsl(17 88% 24%)",
      border: "hsl(17 78% 32%)",
    }
  ),
  createPreset(
    "quoc_khanh",
    "Quốc Khánh",
    "🇻🇳",
    {
      primary: "hsl(2 76% 48%)", // #da251d (Flag Red)
      primaryForeground: "hsl(60 100% 50%)", // #ffff00 (Flag Yellow)
      secondary: "hsl(60 100% 50%)",
      secondaryForeground: "hsl(2 76% 48%)",
      background: "hsl(0 100% 98%)",
    },
    {
      primary: "hsl(0 84% 60%)",
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(45 97% 39%)",
      background: "hsl(0 94% 14%)",
      surface: "hsl(0 73% 31%)",
      border: "hsl(0 79% 35%)",
    }
  ),
  createPreset(
    "valentine",
    "Valentine",
    "💕",
    {
      primary: "hsl(330 81% 51%)", // #db2777 (Pink 600)
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(326 78% 95%)", // #fce7f3 (Pink 100)
      secondaryForeground: "hsl(333 71% 28%)",
      background: "hsl(356 100% 97%)", // #fff1f2 (Rose 50)
      accent: "hsl(326 85% 90%)",
    },
    {
      primary: "hsl(330 77% 70%)", // #f472b6 (Pink 400)
      primaryForeground: "hsl(333 71% 28%)",
      secondary: "hsl(333 71% 28%)",
      background: "hsl(343 89% 15%)",
      surface: "hsl(347 77% 26%)",
      border: "hsl(349 75% 33%)",
    }
  ),
  createPreset(
    "giang_sinh",
    "Giáng Sinh",
    "🎄",
    {
      primary: "hsl(142 71% 33%)", // #15803d (Green 700)
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(0 78% 42%)", // #b91c1c (Red 700)
      secondaryForeground: "hsl(0 0% 100%)",
      background: "hsl(138 76% 97%)", // #f0fdf4 (Green 50)
      accent: "hsl(138 76% 92%)",
    },
    {
      primary: "hsl(142 69% 58%)", // #4ade80 (Green 400)
      primaryForeground: "hsl(151 88% 9%)",
      secondary: "hsl(0 84% 60%)",
      background: "hsl(166 76% 9%)",
      surface: "hsl(158 74% 16%)",
      border: "hsl(160 72% 21%)",
    }
  ),
  createPreset(
    "phu_nu",
    "Ngày Phụ Nữ",
    "🌸",
    {
      primary: "hsl(292 84% 61%)", // #d946ef (Fuchsia 500)
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(300 100% 96%)", // #fae8ff (Fuchsia 100)
      secondaryForeground: "hsl(293 69% 32%)",
      background: "hsl(300 100% 98%)", // #fdf4ff (Fuchsia 50)
      accent: "hsl(291 85% 84%)",
    },
    {
      primary: "hsl(292 76% 71%)", // #e879f9 (Fuchsia 400)
      primaryForeground: "hsl(297 91% 18%)",
      secondary: "hsl(295 72% 28%)",
      background: "hsl(297 91% 18%)",
      surface: "hsl(295 72% 28%)",
      border: "hsl(293 69% 32%)",
    }
  ),
  createPreset(
    "thieu_nhi",
    "Thiếu Nhi",
    "🎈",
    {
      primary: "hsl(221 83% 59%)", // #2563eb (Blue 600)
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(48 96% 53%)", // #facc15 (Yellow 400)
      secondaryForeground: "hsl(0 0% 0%)",
      accent: "hsl(27 96% 61%)", // #fb923c (Orange 400)
      background: "hsl(214 100% 97%)", // #eff6ff (Blue 50)
    },
    {
      primary: "hsl(213 97% 68%)", // #60a5fa (Blue 400)
      primaryForeground: "hsl(222 84% 21%)",
      secondary: "hsl(53 98% 63%)", // #fde047 (Yellow 300)
      background: "hsl(222 84% 21%)",
      surface: "hsl(224 76% 32%)",
      border: "hsl(221 68% 38%)",
    }
  ),
];

export function getPresetByName(name: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.name === name);
}

// Helper to safely parse JSON from DB to ThemeVariables
export function parseThemeVariables(json: JsonValue): ThemeVariables {
  // DB stores JSON as string, so we need to parse it
  if (typeof json === "string") {
    return JSON.parse(json) as ThemeVariables;
  }
  return json as unknown as ThemeVariables;
}

export function parseFontSettings(json: JsonValue): FontSettings {
  // DB stores JSON as string, so we need to parse it
  if (typeof json === "string") {
    return JSON.parse(json) as FontSettings;
  }
  return json as unknown as FontSettings;
}