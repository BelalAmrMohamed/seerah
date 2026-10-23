import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Station } from "@/data/types";
import { sceneEffect } from "@/data/scenes";
import { ar, arYear, eraOf, type Era } from "@/lib/stations";
import { alpha, useEra, useTheme } from "@/lib/theme";
import { Btn, Card, Chip, Txt } from "./ui";
import RouteMap from "./RouteMap";
import Wash from "./Wash";

/**
 * One station "scene" on the journey screen. Same content blocks as the website's Scene
 * (number, dates, title, subtitle, place, description, quote, figures, significance, route),
 * with the GSAP/Three.js choreography replaced by a native entrance animation.
 */
function SceneCardImpl({ s }: { s: Station }) {
  const { c } = useTheme();
  const era = eraOf(s.category) as Era;
  const { era: col, wash } = useEra(era);
  const showMap = sceneEffect[s.id] === "route";
  return (
    <View nativeID={`s-${s.id}`} style={{ paddingTop: 28, paddingBottom: 36, overflow: "hidden" }}>
      <Wash wash={wash} era={col} height={420} />
      <Animated.View entering={FadeInDown.duration(550)} style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
          <Txt v="display" size={96} color={alpha(col, 0.28)} style={{ lineHeight: 112 }} accessibilityElementsHidden>{ar(s.id)}</Txt>
          <View style={{ paddingBottom: 14 }}>
            <Txt v="display" size={24} color={col} style={{ lineHeight: 34 }}>{arYear(s.year)}</Txt>
            <Txt v="ui" size={15} color={c.muted}>{ar(s.hijriYear)}</Txt>
          </View>
        </View>
        <Txt v="display" size={34} style={{ lineHeight: 54 }}>{s.title}</Txt>
        <Txt v="text" size={19} color={c.muted}>{s.subtitle}</Txt>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name="map-pin" size={16} color={col} />
          <Txt v="ui" size={13.5} color={c.muted} style={{ flex: 1 }}>{s.location}</Txt>
        </View>

        <Card era={col}>
          <Txt v="text" size={19}>{s.description}</Txt>
        </Card>

        {showMap && <RouteMap stationId={s.id} color={col} />}

        <View style={{ borderStartWidth: 4, borderStartColor: col, paddingStart: 16 }}>
          <Txt v="text" size={23} style={{ lineHeight: 46 }}>«{s.quote}»</Txt>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {s.keyFigures.map((f) => <Chip key={f} label={f} color={col} />)}
        </View>

        <Txt v="text" size={18}>
          <Txt v="textBold" size={18} color={col}>الدلالة: </Txt>
          {s.significance}
        </Txt>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Btn primary icon="book-open" color={col} label="اقرأ نص ابن هشام" onPress={() => router.push({ pathname: "/reader/[id]", params: { id: String(s.id) } })} />
          <Btn icon="info" color={col} label="تفاصيل المحطة" onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })} />
        </View>
      </Animated.View>
    </View>
  );
}
export default React.memo(SceneCardImpl);
