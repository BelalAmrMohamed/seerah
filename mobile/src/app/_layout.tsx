import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { ArefRuqaa_400Regular, ArefRuqaa_700Bold } from "@expo-google-fonts/aref-ruqaa";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { ensureRTL } from "@/lib/rtl";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/lib/appStore";
import { palettes, useTheme } from "@/lib/theme";
import ToastHost from "@/components/ToastHost";

SplashScreen.preventAutoHideAsync();
const rtlReady = ensureRTL(); // must run before the first render

export default function RootLayout() {
  const [loaded] = useFonts({
    Amiri_400Regular, Amiri_700Bold, ArefRuqaa_400Regular, ArefRuqaa_700Bold,
    IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold,
  });
  const setUser = useAppStore((s) => s.setUser);
  const { c } = useTheme();

  useEffect(() => { if (loaded) SplashScreen.hide(); }, [loaded]);

  // Keep the Supabase session in sync (same as the website's Providers component).
  useEffect(() => {
    if (!supabaseConfigured) return;
    const map = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined) =>
      u ? { id: u.id, email: u.email ?? "", name: (u.user_metadata?.full_name as string | undefined) } : null;
    supabase.auth.getSession().then(({ data }) => setUser(map(data.session?.user))).catch(() => {});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(map(session?.user)));
    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!rtlReady) {
    // Shown for a split second while the one-time RTL reload happens.
    return (
      <View style={{ flex: 1, backgroundColor: palettes.dark.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: palettes.dark.ink, fontSize: 18, textAlign: "center" }}>
          جارٍ تهيئة الواجهة العربية… إذا لم يُعد التطبيق تشغيل نفسه، أغلقه وافتحه من جديد.
        </Text>
      </View>
    );
  }
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
          <Stack.Screen name="search" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        </Stack>
        <ToastHost />
      </View>
    </SafeAreaProvider>
  );
}
