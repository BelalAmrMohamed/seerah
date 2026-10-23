import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, useTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.solid, borderTopColor: c.glassBorder, height: 64 + insets.bottom, paddingTop: 6, paddingBottom: 8 + insets.bottom },
        tabBarLabelStyle: { fontFamily: fonts.uiMedium, fontSize: 12 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "الرحلة", tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color as string} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: "استكشف", tabBarIcon: ({ color, size }) => <Feather name="compass" color={color as string} size={size} /> }} />
      <Tabs.Screen name="ai" options={{ title: "المساعد", tabBarIcon: ({ color, size }) => <Feather name="message-circle" color={color as string} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "حسابي", tabBarIcon: ({ color, size }) => <Feather name="user" color={color as string} size={size} /> }} />
    </Tabs>
  );
}
