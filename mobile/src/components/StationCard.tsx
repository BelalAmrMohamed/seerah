import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ar, arYear, eraNames, eraOf, type Era } from "@/lib/stations";
import type { Station } from "@/data/types";
import { alpha, useEra, useTheme } from "@/lib/theme";
import { Btn, Card, Txt } from "./ui";

/** Explore-grid card (port of the website's /explore card). */
export function StationGridCard({ s }: { s: Station }) {
  const { c } = useTheme();
  const era = eraOf(s.category) as Era;
  const { era: col } = useEra(era);
  return (
    <Card era={col} style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: alpha(col, 0.16) }}>
          <Txt v="display" size={18} color={col} style={{ lineHeight: 26 }}>{ar(s.id)}</Txt>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: alpha(col, 0.14) }}>
          <Txt v="uiMedium" size={11.5} color={col}>{eraNames[era]}</Txt>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Feather name="calendar" size={12} color={col} />
          <Txt v="ui" size={12} color={c.muted}>{arYear(s.year)}</Txt>
        </View>
      </View>
      <Pressable onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })}>
        <Txt v="display" size={22} numberOfLines={2}>{s.title}</Txt>
      </Pressable>
      <Txt v="ui" size={13} color={c.muted} numberOfLines={2}>{s.subtitle}</Txt>
      {!!s.quote && (
        <View style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.solid, borderRadius: 14, padding: 12 }}>
          <Txt v="text" size={15} numberOfLines={3}>«{s.quote}»</Txt>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Feather name="map-pin" size={13} color={col} />
        <Txt v="ui" size={12} color={c.muted} numberOfLines={1} style={{ flex: 1 }}>{s.location}</Txt>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <Feather name="users" size={12} color={c.muted} />
        {s.keyFigures.slice(0, 3).map((f) => (
          <View key={f} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7, backgroundColor: alpha(col, 0.1) }}>
            <Txt v="ui" size={11.5} color={col}>{f}</Txt>
          </View>
        ))}
        {s.keyFigures.length > 3 && <Txt v="ui" size={11} color={c.muted}>+{ar(s.keyFigures.length - 3)}</Txt>}
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
        <Btn small label="في الرحلة" icon="compass" color={col} style={{ flex: 1 }} onPress={() => router.navigate({ pathname: "/", params: { s: String(s.id) } })} />
        <Btn small primary label="التفاصيل" icon="book-open" color={col} style={{ flex: 1 }} onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })} />
      </View>
    </Card>
  );
}

/** Explore timeline row (port of the website's timeline view). */
export function StationTimelineRow({ s, last }: { s: Station; last?: boolean }) {
  const { c } = useTheme();
  const era = eraOf(s.category) as Era;
  const { era: col } = useEra(era);
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ alignItems: "center", width: 28 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: col }}>
          <Txt v="display" size={13} color={c.onAccent} style={{ lineHeight: 20 }}>{ar(s.id)}</Txt>
        </View>
        {!last && <View style={{ flex: 1, width: 2, backgroundColor: alpha(col, 0.3), marginTop: 4 }} />}
      </View>
      <Card era={col} style={{ flex: 1, marginBottom: 14, gap: 6, padding: 14 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <Txt v="uiMedium" size={11.5} color={col}>{eraNames[era]}</Txt>
          <Txt v="ui" size={11.5} color={c.muted}>{arYear(s.year)}</Txt>
          <Txt v="ui" size={11.5} color={c.muted}>{s.location}</Txt>
        </View>
        <Pressable onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })}>
          <Txt v="display" size={20}>{s.title}</Txt>
        </Pressable>
        <Txt v="ui" size={13} color={c.muted} numberOfLines={1}>{s.subtitle}</Txt>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          <Btn small label="في الرحلة" color={col} onPress={() => router.navigate({ pathname: "/", params: { s: String(s.id) } })} />
          <Btn small primary label="التفاصيل" color={col} onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })} />
        </View>
      </Card>
    </View>
  );
}
