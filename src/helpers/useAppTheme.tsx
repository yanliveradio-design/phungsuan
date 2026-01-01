import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActiveTheme } from "../endpoints/theme/active_GET.schema";
import { postUpdateTheme } from "../endpoints/admin/theme/update_POST.schema";
import {
  ThemeVariables,
  FontSettings,
  THEME_PRESETS,
  getPresetByName,
  parseThemeVariables,
  parseFontSettings,
} from "./ThemePresets";
import { toast } from "sonner";

const THEME_QUERY_KEY = ["theme", "active"];

// --- Hooks ---

export function useActiveTheme() {
  return useQuery({
    queryKey: THEME_QUERY_KEY,
    queryFn: () => getActiveTheme(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateTheme,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đã cập nhật giao diện thành công");
        queryClient.invalidateQueries({ queryKey: THEME_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// --- Context & Provider ---

type ThemeContextValue = {
  activePresetName: string | null;
  previewTheme: (
    presetName: string,
    light?: ThemeVariables,
    dark?: ThemeVariables,
    fonts?: FontSettings
  ) => void;
  resetPreview: () => void;
  isPreviewing: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemePreview() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreview must be used within AppThemeProvider");
  }
  return context;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: activeThemeData, isLoading } = useActiveTheme();

  // Preview state
  const [previewState, setPreviewState] = useState<{
    presetName: string;
    light: ThemeVariables;
    dark: ThemeVariables;
    fonts: FontSettings;
  } | null>(null);

  const activeTheme = activeThemeData?.theme;

  // Determine which theme to apply (Preview > Active > Default)
  const appliedTheme = useMemo(() => {
    if (previewState) {
      return previewState;
    }

    if (activeTheme) {
      return {
        presetName: activeTheme.presetName,
        light: parseThemeVariables(activeTheme.lightTheme),
        dark: parseThemeVariables(activeTheme.darkTheme),
        fonts: parseFontSettings(activeTheme.customFonts),
      };
    }

    // Fallback to default preset
    const defaultPreset = THEME_PRESETS[0];
    return {
      presetName: defaultPreset.name,
      light: defaultPreset.lightTheme,
      dark: defaultPreset.darkTheme,
      fonts: defaultPreset.customFonts,
    };
  }, [activeTheme, previewState]);

  // Inject CSS variables directly on documentElement for highest specificity
  // Use ref to track previous value and avoid infinite loops
  const prevThemeJsonRef = useRef<string>("");
  const appliedThemeJson = JSON.stringify(appliedTheme);
  
  useEffect(() => {
    // Only run if theme actually changed
    if (prevThemeJsonRef.current === appliedThemeJson) {
      return;
    }
    prevThemeJsonRef.current = appliedThemeJson;
    
    const theme = JSON.parse(appliedThemeJson);
    if (!theme) return;

    const root = document.documentElement;
    const { light, dark, fonts } = theme;

    // Helper to convert camelCase to kebab-case
    const toKebabCase = (str: string) => 
      str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

    // Set font variables
    root.style.setProperty("--font-family-heading", fonts.heading);
    root.style.setProperty("--font-family-base", fonts.base);
    root.style.setProperty("--font-family-monospace", fonts.monospace);

    // Set light theme variables on :root (document.documentElement)
    Object.entries(light).forEach(([key, value]) => {
      if (value && typeof value === "string") {
        root.style.setProperty(`--${toKebabCase(key)}`, value);
      }
    });

    // For dark mode, we need a different approach since we can't set .dark styles inline
    // We'll use a style tag specifically for dark mode overrides
    let darkStyleEl = document.getElementById("app-theme-dark-styles");
    if (!darkStyleEl) {
      darkStyleEl = document.createElement("style");
      darkStyleEl.id = "app-theme-dark-styles";
      document.head.appendChild(darkStyleEl);
    }
    
    let darkCss = ".dark {";
    Object.entries(dark).forEach(([key, value]) => {
      if (value) {
        darkCss += `--${toKebabCase(key)}: ${value} !important;`;
      }
    });
    darkCss += "}";
    darkStyleEl.textContent = darkCss;

    // Remove old style element if it exists
    const oldStyleEl = document.getElementById("app-theme-styles");
    if (oldStyleEl) {
      oldStyleEl.remove();
    }

    // Cleanup function to remove inline styles when component unmounts
    return () => {
      // Theme should persist across component lifecycle
    };
  }, [appliedThemeJson]); // eslint-disable-line react-hooks/exhaustive-deps

  const previewTheme = (
    presetName: string,
    light?: ThemeVariables,
    dark?: ThemeVariables,
    fonts?: FontSettings
  ) => {
    // If all values provided, use them directly (custom theme case)
    if (light && dark && fonts) {
      setPreviewState({ presetName, light, dark, fonts });
      return;
    }

    // Otherwise try to get from preset
    const preset = getPresetByName(presetName);
    if (preset) {
      setPreviewState({
        presetName,
        light: light || preset.lightTheme,
        dark: dark || preset.darkTheme,
        fonts: fonts || preset.customFonts,
      });
      return;
    }

    // Fallback to default if preset not found and not enough values provided
    const defaultPreset = THEME_PRESETS[0];
    setPreviewState({
      presetName,
      light: light || defaultPreset.lightTheme,
      dark: dark || defaultPreset.darkTheme,
      fonts: fonts || defaultPreset.customFonts,
    });
  };

  const resetPreview = () => {
    setPreviewState(null);
  };

  const value = {
    activePresetName: appliedTheme.presetName,
    previewTheme,
    resetPreview,
    isPreviewing: !!previewState,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}