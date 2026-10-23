import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "@/lib/toast";
import { Txt } from "./ui";
import { useTheme } from "@/lib/theme";

export default function ToastHost() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 84, gap: 8, zIndex: 100 }}>
      {items.map((t) => (
        <Pressable key={t.id} onPress={() => dismiss(t.id)} style={{ backgroundColor: c.solid, borderColor: t.kind === "error" ? c.error : t.kind === "success" ? c.success : c.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Txt v="uiMedium" size={13.5}>{t.text}</Txt>
        </Pressable>
      ))}
    </View>
  );
}
