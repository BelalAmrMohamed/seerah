import React, { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen from "@/components/Screen";
import { IconBtn, Txt } from "@/components/ui";
import { ar, arYear, normalize, stations } from "@/lib/stations";
import { alpha, fonts, useTheme } from "@/lib/theme";

/** Port of the website's Cmd-K SearchPalette (same normalised Arabic matching). */
export default function SearchScreen() {
  const { c } = useTheme();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = normalize(q.trim());
    return stations.filter((s) => !n || normalize(`${s.title} ${s.subtitle} ${s.keyFigures.join(" ")} ${s.location}`).includes(n));
  }, [q]);
  const go = (id: number) => { router.dismiss(); setTimeout(() => router.navigate({ pathname: "/", params: { s: String(id) } }), 50); };
  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <Feather name="search" size={18} color={c.muted} />
        <TextInput
          autoFocus value={q} onChangeText={setQ} placeholder="ابحث عن محطة أو شخصية أو مكان…" placeholderTextColor={c.muted}
          style={{ flex: 1, fontFamily: fonts.ui, fontSize: 16, color: c.ink, paddingVertical: 14, textAlign: "right" }}
        />
        <IconBtn name="x" label="إغلاق" onPress={() => router.dismiss()} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(s) => String(s.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={<Txt v="ui" size={14} color={c.muted} center style={{ padding: 32 }}>لا توجد محطة مطابقة. جرّب اسم شخصية أو مكان.</Txt>}
        renderItem={({ item }) => (
          <Pressable onPress={() => go(item.id)} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: pressed ? alpha(c.accent, 0.16) : "transparent" })}>
            <Txt v="uiMedium" size={15} color={c.accent} style={{ width: 28, textAlign: "center" }}>{ar(item.id)}</Txt>
            <Txt v="text" size={18} style={{ flex: 1 }}>{item.title}</Txt>
            <Txt v="ui" size={12} color={c.muted}>{arYear(item.year)}</Txt>
          </Pressable>
        )}
      />
    </Screen>
  );
}
