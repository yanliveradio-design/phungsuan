import React, { useEffect, useState, useMemo } from "react";
import {
  useActiveTheme,
  useUpdateTheme,
  useThemePreview,
} from "../helpers/useAppTheme";
import {
  THEME_PRESETS,
  ThemeVariables,
  FontSettings,
  ThemePreset,
  parseThemeVariables,
  parseFontSettings,
  hslToHex,
  hexToHsl,
} from "../helpers/ThemePresets";
import { useThemeMode } from "../helpers/themeMode";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { Slider } from "./Slider";
import { Separator } from "./Separator";
import { Skeleton } from "./Skeleton";
import {
  Check,
  RotateCcw,
  Save,
  Palette,
  Type,
  Moon,
  Sun,
  LayoutTemplate,
  X,
} from "lucide-react";
import styles from "./AdminThemeManager.module.css";

// --- Constants ---

const FONT_OPTIONS = [
  { label: "System UI", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Instrument Serif", value: "'Instrument Serif', serif" },
  { label: "Merriweather", value: "'Merriweather', serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
];

const COLOR_FIELDS: { key: keyof ThemeVariables; label: string }[] = [
  { key: "primary", label: "Primary Color" },
  { key: "primaryForeground", label: "Primary Foreground" },
  { key: "secondary", label: "Secondary Color" },
  { key: "secondaryForeground", label: "Secondary Foreground" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Accent Foreground" },
  { key: "surface", label: "Surface" },
  { key: "surfaceForeground", label: "Surface Foreground" },
  { key: "border", label: "Border" },
  { key: "muted", label: "Muted" },
  { key: "card", label: "Card Background" },
];

// --- Helper Components ---

const ColorPickerRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  // Convert HSL to hex for color picker
  const hexValue = hslToHex(value);

  return (
    <div className={styles.colorRow}>
      <div className={styles.colorLabelGroup}>
        <div
          className={styles.colorPreview}
          style={{ backgroundColor: value }}
        />
        <span className={styles.colorLabel}>{label}</span>
      </div>
      <div className={styles.colorInputWrapper}>
        <span className={styles.colorValue}>{value}</span>
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className={styles.colorInput}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

export const AdminThemeManager = ({ className }: { className?: string }) => {
  const { data: activeThemeData, isFetching } = useActiveTheme();
  const { mutate: updateTheme, isPending: isUpdating } = useUpdateTheme();
  const { previewTheme, resetPreview, isPreviewing } = useThemePreview();
  const { mode: currentMode } = useThemeMode();

  // Local state for editing
  const [selectedPresetName, setSelectedPresetName] = useState<string>("default");
  const [customLight, setCustomLight] = useState<ThemeVariables | null>(null);
  const [customDark, setCustomDark] = useState<ThemeVariables | null>(null);
  const [customFonts, setCustomFonts] = useState<FontSettings | null>(null);
  
  // Radius slider state (in px)
  const [radiusPx, setRadiusPx] = useState<number>(8);

  // Initialize state from active theme
  useEffect(() => {
    if (activeThemeData?.theme) {
      const theme = activeThemeData.theme;
      setSelectedPresetName(theme.presetName);
      setCustomLight(parseThemeVariables(theme.lightTheme));
      setCustomDark(parseThemeVariables(theme.darkTheme));
      setCustomFonts(parseFontSettings(theme.customFonts));
      
      // Parse radius from string "8px" or "0.5rem" to number if possible, else default 8
      // For simplicity, we just reset to 8 or try to parse the 'radius' field if it's in px
      // But since we store as rem usually, let's just default to 8 for the slider UI
    } else if (!isFetching) {
      // Default fallback
      const defaultPreset = THEME_PRESETS[0];
      setSelectedPresetName(defaultPreset.name);
      setCustomLight(defaultPreset.lightTheme);
      setCustomDark(defaultPreset.darkTheme);
      setCustomFonts(defaultPreset.customFonts);
    }
  }, [activeThemeData, isFetching]);

  // Handle Preset Selection
  const handlePresetSelect = (preset: ThemePreset) => {
    setSelectedPresetName(preset.name);
    setCustomLight({ ...preset.lightTheme });
    setCustomDark({ ...preset.darkTheme });
    setCustomFonts({ ...preset.customFonts });
    
    // Reset radius slider to default for that preset (assuming 8px roughly)
    setRadiusPx(8);

    previewTheme(
      preset.name,
      preset.lightTheme,
      preset.darkTheme,
      preset.customFonts
    );
  };

  // Handle Custom Color Change
  const handleColorChange = (
    mode: "light" | "dark",
    key: keyof ThemeVariables,
    value: string
  ) => {
    if (mode === "light" && customLight) {
      const newLight = { ...customLight, [key]: value };
      setCustomLight(newLight);
      if (customDark && customFonts) {
        previewTheme("custom", newLight, customDark, customFonts);
      }
    } else if (mode === "dark" && customDark) {
      const newDark = { ...customDark, [key]: value };
      setCustomDark(newDark);
      if (customLight && customFonts) {
        previewTheme("custom", customLight, newDark, customFonts);
      }
    }
  };

  // Handle Font Change
  const handleFontChange = (key: keyof FontSettings, value: string) => {
    if (!customFonts) return;
    const newFonts = { ...customFonts, [key]: value };
    setCustomFonts(newFonts);
    if (customLight && customDark) {
      previewTheme("custom", customLight, customDark, newFonts);
    }
  };

  // Handle Radius Change
  const handleRadiusChange = (val: number[]) => {
    const px = val[0];
    setRadiusPx(px);
    
    if (!customLight || !customDark || !customFonts) return;

    // Calculate rem values based on 16px base
    const r = (px / 16).toFixed(3) + "rem";
    const rSm = (px / 2 / 16).toFixed(3) + "rem";
    const rMd = ((px * 1.5) / 16).toFixed(3) + "rem";
    const rLg = ((px * 2) / 16).toFixed(3) + "rem";

    const newLight = { ...customLight, radius: r, radiusSm: rSm, radiusMd: rMd, radiusLg: rLg };
    const newDark = { ...customDark, radius: r, radiusSm: rSm, radiusMd: rMd, radiusLg: rLg };

    setCustomLight(newLight);
    setCustomDark(newDark);
    previewTheme("custom", newLight, newDark, customFonts);
  };

  // Handle Save
  const handleSave = () => {
    if (!customLight || !customDark || !customFonts) return;
    
    updateTheme({
      presetName: selectedPresetName === "custom" ? "custom" : selectedPresetName,
      lightTheme: customLight,
      darkTheme: customDark,
      customFonts: customFonts,
    });
  };

  // Handle Reset
  const handleReset = () => {
    resetPreview();
    const defaultPreset = THEME_PRESETS[0];
    handlePresetSelect(defaultPreset);
  };

  const handleCancelPreview = () => {
    resetPreview();
    // Revert local state to active theme
    if (activeThemeData?.theme) {
      const theme = activeThemeData.theme;
      setSelectedPresetName(theme.presetName);
      setCustomLight(parseThemeVariables(theme.lightTheme));
      setCustomDark(parseThemeVariables(theme.darkTheme));
      setCustomFonts(parseFontSettings(theme.customFonts));
    }
  };

  if (isFetching) {
    return (
      <div className={className}>
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Quản lý Giao diện</h2>
          <p className={styles.subtitle}>
            Tùy chỉnh màu sắc, phông chữ và phong cách cho toàn bộ ứng dụng.
          </p>
        </div>
        <div className={styles.actions}>
          {isPreviewing && (
            <Button variant="ghost" onClick={handleCancelPreview}>
              <X size={16} /> Hủy xem trước
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw size={16} /> Mặc định
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save size={16} /> {isUpdating ? "Đang lưu..." : "Áp dụng"}
          </Button>
        </div>
      </div>

      {/* Presets Grid */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <LayoutTemplate size={18} /> Theme Presets
        </h3>
        <div className={styles.presetsGrid}>
          {THEME_PRESETS.map((preset) => {
            const isActive = !isPreviewing && activeThemeData?.theme?.presetName === preset.name;
            const isSelected = selectedPresetName === preset.name;
            
            return (
              <button
                key={preset.name}
                className={`${styles.presetCard} ${isSelected ? styles.selected : ""}`}
                onClick={() => handlePresetSelect(preset)}
              >
                <div className={styles.presetHeader}>
                  <span className={styles.presetIcon}>{preset.icon}</span>
                  {isActive && <Badge variant="success" className={styles.activeBadge}>Đang dùng</Badge>}
                </div>
                <div className={styles.presetInfo}>
                  <span className={styles.presetName}>{preset.displayName}</span>
                </div>
                <div className={styles.presetColors}>
                  <div style={{ backgroundColor: preset.lightTheme.primary }} />
                  <div style={{ backgroundColor: preset.lightTheme.secondary }} />
                  <div style={{ backgroundColor: preset.lightTheme.accent }} />
                  <div style={{ backgroundColor: preset.lightTheme.background }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Separator className="my-6" />

      <div className={styles.editorLayout}>
        {/* Customization Panel */}
        <div className={styles.customizationPanel}>
          <h3 className={styles.sectionTitle}>
            <Palette size={18} /> Tùy chỉnh chi tiết
          </h3>
          
          <Tabs defaultValue="light" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="light" className="flex-1">
                <Sun size={14} className="mr-2" /> Light Mode
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex-1">
                <Moon size={14} className="mr-2" /> Dark Mode
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex-1">
                <Type size={14} className="mr-2" /> Fonts & Radius
              </TabsTrigger>
            </TabsList>

            <TabsContent value="light" className={styles.tabContent}>
              {customLight &&
                COLOR_FIELDS.filter((field) => customLight[field.key]).map(
                  (field) => (
                    <ColorPickerRow
                      key={field.key}
                      label={field.label}
                      value={customLight[field.key]}
                      onChange={(val) => handleColorChange("light", field.key, val)}
                    />
                  )
                )}
            </TabsContent>

            <TabsContent value="dark" className={styles.tabContent}>
              {customDark &&
                COLOR_FIELDS.filter((field) => customDark[field.key]).map(
                  (field) => (
                    <ColorPickerRow
                      key={field.key}
                      label={field.label}
                      value={customDark[field.key]}
                      onChange={(val) => handleColorChange("dark", field.key, val)}
                    />
                  )
                )}
            </TabsContent>

            <TabsContent value="fonts" className={styles.tabContent}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Heading Font</label>
                <select 
                  className={styles.select}
                  value={customFonts?.heading}
                  onChange={(e) => handleFontChange("heading", e.target.value)}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Body Font</label>
                <select 
                  className={styles.select}
                  value={customFonts?.base}
                  onChange={(e) => handleFontChange("base", e.target.value)}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Monospace Font</label>
                <select 
                  className={styles.select}
                  value={customFonts?.monospace}
                  onChange={(e) => handleFontChange("monospace", e.target.value)}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <Separator className="my-4" />

              <div className={styles.controlGroup}>
                <div className="flex justify-between mb-2">
                  <label className={styles.controlLabel}>Border Radius</label>
                  <span className="text-sm text-muted-foreground">{radiusPx}px</span>
                </div>
                <Slider 
                  value={[radiusPx]} 
                  min={0} 
                  max={24} 
                  step={1} 
                  onValueChange={handleRadiusChange} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Điều chỉnh độ bo góc cho toàn bộ hệ thống (Buttons, Cards, Inputs...)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h3 className={styles.sectionTitle}>Live Preview</h3>
            {isPreviewing && <Badge variant="warning">Preview Mode</Badge>}
          </div>
          
          <div className={`${styles.previewCard} ${currentMode === 'dark' ? 'dark' : ''}`}>
            <div className={styles.previewContent}>
              <h4 className="text-lg font-heading font-bold mb-2">Typography Heading</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This is a sample body text to demonstrate the font readability and color contrast.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <Input placeholder="Input placeholder..." />
                <div className="flex items-center gap-2">
                  <Badge>Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Success</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-surface">
                <h5 className="font-medium mb-2">Surface Area</h5>
                <p className="text-xs text-muted-foreground">
                  Testing surface colors and nested elements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};