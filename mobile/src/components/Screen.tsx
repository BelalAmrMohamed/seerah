import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useTheme, useThemeStore, alpha } from "@/lib/theme";
import { useOnline } from "@/lib/useOnline";
import { IconBtn, Txt } from "./ui";

export function OfflineBanner() {
  const online = useOnline();
  const { c } = useTheme();
  if (online) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: alpha(c.warning, 0.18) }}>
      <Feather name="wifi-off" size={14} color={c.warning} />
      <Txt v="uiMedium" size={12} color={c.ink}>لا يوجد اتصال — القراءة متاحة دون إنترنت، والمساعد الذكي يحتاج اتصالاً.</Txt>
    </View>
  );
}

/** Top app bar: title (or back), search + theme toggle. */
export function AppBar({ title, back, trailing, showTools = true }: { title?: string; back?: boolean; trailing?: React.ReactNode; showTools?: boolean }) {
  const { c, scheme } = useTheme();
  const toggle = useThemeStore((s) => s.toggle);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 56, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: c.glassBorder, backgroundColor: c.glass }}>
      {back && <IconBtn name="arrow-right" label="رجوع" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />}
      <Txt v="display" size={22} color={c.accent} numberOfLines={1} style={{ flex: 1, paddingHorizontal: 8 }}>{title ?? "رحلة في السيرة"}</Txt>
      {trailing}
      {showTools && (
        <>
          <IconBtn name="search" label="بحث" onPress={() => router.push("/search")} />
          <IconBtn name={scheme === "dark" ? "sun" : "moon"} label="تبديل المظهر" onPress={() => toggle(scheme)} />
        </>
      )}
    </View>
  );
}

export default function Screen({ children, style, edges = ["top", "bottom"] }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; edges?: ("top" | "bottom")[] }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: c.bg, paddingTop: edges.includes("top") ? insets.top : 0, paddingBottom: edges.includes("bottom") ? insets.bottom : 0 }, style]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OfflineBanner />
      {children}
    </View>
  );
}
