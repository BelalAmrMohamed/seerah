import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Screen, { AppBar } from "@/components/Screen";
import { Btn, Txt } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen>
      <AppBar back />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <Txt v="display" size={28} center>الصفحة غير موجودة</Txt>
        <Btn primary label="العودة إلى الرحلة" onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}
