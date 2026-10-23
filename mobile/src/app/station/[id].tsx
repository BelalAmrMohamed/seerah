import React from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Screen, { AppBar } from "@/components/Screen";
import Wash from "@/components/Wash";
import { Btn, Card, SectionTitle, Txt } from "@/components/ui";
import { ar, arYear, cite, eraOf, paragraphs, stationById, stations, type Era } from "@/lib/stations";
import { alpha, useEra, useTheme } from "@/lib/theme";

export default function StationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = stationById(Number(id));
  const { c } = useTheme();
  const eraKey = (s ? eraOf(s.category) : "dawn") as Era;
  const { era: col, wash } = useEra(eraKey);
  if (!s) {
    return (
      <Screen><AppBar back />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
          <Txt v="display" size={26}>المحطة غير موجودة</Txt>
          <Btn primary label="العودة إلى الرحلة" onPress={() => router.replace("/")} />
        </View>
      </Screen>
    );
  }
  const prev = stations.find((x) => x.id === s.id - 1);
  const next = stations.find((x) => x.id === s.id + 1);
  const go = (n: number) => router.replace({ pathname: "/station/[id]", params: { id: String(n) } });

  const Row = ({ k, v }: { k: string; v: string }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Txt v="ui" size={13.5} color={c.muted}>{k}</Txt>
      <Txt v="ui" size={13.5}>{v}</Txt>
    </View>
  );

  return (
    <Screen>
      <AppBar back title={`المحطة ${ar(s.id)}`} />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ padding: 20, gap: 16, overflow: "hidden" }}>
          <Wash wash={wash} era={col} height={380} />
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
            <Txt v="display" size={88} color={alpha(col, 0.3)} style={{ lineHeight: 104 }}>{ar(s.id)}</Txt>
            <View style={{ paddingBottom: 12, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="calendar" size={16} color={col} />
                <Txt v="ui" size={17} color={col}>{arYear(s.year)}</Txt>
                <Txt v="ui" size={13} color={c.muted}>({ar(s.hijriYear)})</Txt>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="map-pin" size={15} color={c.muted} />
                <Txt v="ui" size={13} color={c.muted} style={{ flexShrink: 1 }}>{s.location}</Txt>
              </View>
            </View>
          </View>
          <Txt v="display" size={34} style={{ lineHeight: 54 }}>{s.title}</Txt>
          <Txt v="text" size={19} color={c.muted}>{s.subtitle}</Txt>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <View style={{ borderWidth: 1, borderColor: alpha(col, 0.5), borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Txt v="uiMedium" size={12.5} color={col}>{s.category}</Txt>
            </View>
            <Btn small label="شاهد في الرحلة" color={col} onPress={() => router.navigate({ pathname: "/", params: { s: String(s.id) } })} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 30 }}>
          <View style={{ gap: 10 }}>
            <SectionTitle icon="book-open" color={col}>الوصف</SectionTitle>
            <Txt v="text" size={19}>{s.description}</Txt>
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle icon="book-open" color={col}>نص ابن هشام</SectionTitle>
            <Card era={col} style={{ gap: 18 }}>
              {paragraphs(s.bookContent).map((p, i) => <Txt key={i} v="text" size={21} style={{ lineHeight: 46 }}>{p}</Txt>)}
            </Card>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Btn primary small icon="maximize" color={col} label="وضع القراءة" onPress={() => router.push({ pathname: "/reader/[id]", params: { id: String(s.id) } })} />
              <Btn small icon="external-link" color={col} label={cite(s)} onPress={() => Linking.openURL(s.url)} />
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle icon="message-square" color={col}>اقتباس بارز</SectionTitle>
            <View style={{ borderStartWidth: 4, borderStartColor: col, paddingStart: 16 }}>
              <Txt v="text" size={24} style={{ lineHeight: 48 }}>«{s.quote}»</Txt>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle icon="zap" color={col}>الدلالة والأهمية</SectionTitle>
            <Txt v="text" size={19}>{s.significance}</Txt>
          </View>

          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="users" size={18} color={col} />
              <Txt v="display" size={20} color={col}>شخصيات المحطة</Txt>
            </View>
            {s.keyFigures.map((f) => (
              <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: alpha(col, 0.08) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col }} />
                <Txt v="display" size={17}>{f}</Txt>
              </View>
            ))}
          </Card>

          <Card style={{ gap: 10 }}>
            <Txt v="uiMedium" size={13} color={c.muted}>موقع المحطة في الرحلة</Txt>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {Array.from({ length: 30 }, (_, i) => (
                <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i + 1 === s.id ? col : i + 1 < s.id ? alpha(col, 0.3) : c.line }} />
              ))}
            </View>
            <Txt v="uiMedium" size={13} color={c.muted} center>{ar(s.id)} من {ar(30)}</Txt>
          </Card>

          <Card style={{ gap: 8 }}>
            <Txt v="uiMedium" size={13} color={c.muted}>معلومات سريعة</Txt>
            <Row k="التاريخ الميلادي" v={arYear(s.year)} />
            <Row k="التاريخ الهجري" v={ar(s.hijriYear)} />
            <Row k="الجزء" v={ar(s.volume)} />
            <Row k="الصفحة" v={ar(s.page)} />
          </Card>

          <View style={{ flexDirection: "row", gap: 12 }}>
            {[{ st: prev, label: "المحطة السابقة", icon: "chevron-right" as const }, { st: next, label: "المحطة التالية", icon: "chevron-left" as const }].map(({ st, label, icon }, i) =>
              st ? (
                <Pressable key={i} onPress={() => go(st.id)} style={{ flex: 1 }}>
                  <Card era={useEraColor(st.category, c)} style={{ gap: 4, padding: 14, flexDirection: "row", alignItems: "center" }}>
                    {i === 0 && <Feather name={icon} size={20} color={col} />}
                    <View style={{ flex: 1 }}>
                      <Txt v="uiMedium" size={11.5} color={c.muted}>{label}</Txt>
                      <Txt v="display" size={16} numberOfLines={2}>{st.title}</Txt>
                    </View>
                    {i === 1 && <Feather name={icon} size={20} color={col} />}
                  </Card>
                </Pressable>
              ) : <View key={i} style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

// small non-hook helper (kept outside hooks rules: just maps category → era colour for the current scheme)
import { eraHex } from "@/lib/stations";
function useEraColor(category: string, c: { isDark: boolean }) {
  return eraHex[eraOf(category)][c.isDark ? "dark" : "light"];
}
