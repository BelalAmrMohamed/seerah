import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { eraHex, eraWash, type Era } from "./stations";

// Palette copied from the website's globals.css (:root dark / [data-theme=light])
export const palettes = {
  dark: {
    bg: "#0b0f1e", bg2: "#141a36", ink: "#efe9d8", muted: "#a9acc2", line: "rgba(239,233,216,0.18)",
    panel: "rgba(14,19,40,0.78)", solid: "#121832", accent: "#e6b85c", glass: "rgba(14,19,40,0.55)",
    glassBorder: "rgba(239,233,216,0.12)", success: "#4ade80", error: "#f87171", warning: "#fbbf24",
    onAccent: "#0b0f1e", isDark: true,
  },
  light: {
    bg: "#f0f2f7", bg2: "#e2e6ef", ink: "#131a3a", muted: "#454c6c", line: "rgba(19,26,58,0.15)",
    panel: "rgba(240,242,247,0.82)", solid: "#f7f8fc", accent: "#8f6410", glass: "rgba(240,242,247,0.6)",
    glassBorder: "rgba(19,26,58,0.1)", success: "#16a34a", error: "#dc2626", warning: "#d97706",
    onAccent: "#f7f8fc", isDark: false,
  },
} as const;
export type Palette = { [K in keyof (typeof palettes)["dark"]]: (typeof palettes)["dark"][K] extends boolean ? boolean : string };

export const fonts = {
  display: "ArefRuqaa_700Bold",
  displayRegular: "ArefRuqaa_400Regular",
  text: "Amiri_400Regular",
  textBold: "Amiri_700Bold",
  ui: "IBMPlexSansArabic_400Regular",
  uiMedium: "IBMPlexSansArabic_500Medium",
  uiSemi: "IBMPlexSansArabic_600SemiBold",
  uiBold: "IBMPlexSansArabic_700Bold",
} as const;

type Mode = "system" | "dark" | "light";
interface ThemeState { mode: Mode; setMode: (m: Mode) => void; toggle: (current: "dark" | "light") => void }
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "dark", // the website defaults to dark
      setMode: (mode) => set({ mode }),
      toggle: (current) => set({ mode: current === "dark" ? "light" : "dark" }),
    }),
    { name: "rihla_theme_v1", storage: createJSONStorage(() => AsyncStorage) }
  )
);

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const scheme: "dark" | "light" = mode === "system" ? (system === "light" ? "light" : "dark") : mode;
  const c = palettes[scheme] as Palette;
  return { scheme, c, isDark: scheme === "dark" };
}

export function useEra(era: Era) {
  const { scheme } = useTheme();
  return { era: eraHex[era][scheme], wash: eraWash[era][scheme] };
}
/** hex + alpha (0..1) -> rgba string */
export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
