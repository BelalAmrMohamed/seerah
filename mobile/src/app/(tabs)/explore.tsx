import React, { useMemo, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Screen, { AppBar } from "@/components/Screen";
import { StationGridCard, StationTimelineRow } from "@/components/StationCard";
import { Btn, Chip, IconBtn, Txt } from "@/components/ui";
import { ar, eraNames, eraOf, eraOrder, stations, type Era } from "@/lib/stations";
import { eraHex } from "@/lib/stations";
import { fonts, useTheme } from "@/lib/theme";
import type { Station } from "@/data/types";

type Sort = "chrono-asc" | "chrono-desc" | "title";
const SORTS: { key: Sort; label: string }[] = [
  { key: "chrono-asc", label: "ترتيب زمني (١ ← ٣٠)" },
  { key: "chrono-desc", label: "ترتيب عكسي (٣٠ ← ١)" },
  { key: "title", label: "أبجدياً (أ ← ي)" },
];

export default function ExploreScreen() {
  const { c, scheme } = useTheme();
  const [search, setSearch] = useState("");
  const [era, setEra] = useState<Era | "all">("all");
  const [sort, setSort] = useState<Sort>("chrono-asc");
  const [view, setView] = useState<"grid" | "timeline">("grid");

  // counts derived from the data via eraOf (the website hardcodes them)
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: stations.length };
    stations.forEach((s) => { const e = eraOf(s.category); m[e] = (m[e] ?? 0) + 1; });
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = stations.filter((s) => {
      if (era !== "all" && eraOf(s.category) !== era) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) || s.quote.toLowerCase().includes(q) || s.year.includes(q) ||
        s.keyFigures.some((f) => f.toLowerCase().includes(q))
      );
    });
    return [...list].sort((a, b) => (sort === "chrono-asc" ? a.id - b.id : sort === "chrono-desc" ? b.id - a.id : a.title.localeCompare(b.title, "ar")));
  }, [search, era, sort]);

  const reset = () => { setSearch(""); setEra("all"); };
  const eraLabel = era === "all" ? "" : eraNames[era];

  const header = (
    <View style={{ gap: 14, paddingBottom: 12 }}>
      <View style={{ gap: 8 }}>
        <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: c.line, backgroundColor: c.panel, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}>
          <Feather name="star" size={13} color={c.accent} />
          <Txt v="ui" size={12} color={c.muted}>فهرس السيرة النبوية الشامل</Txt>
        </View>
        <Txt v="display" size={32} color={c.accent} style={{ lineHeight: 52 }}>استكشف محطات السيرة</Txt>
        <Txt v="ui" size={14.5} color={c.muted}>تصفح المحطات الثلاثين بحرية، وابحث في أحداث وشخصيات وأماكن سيرة النبي محمد ﷺ</Txt>
        <Txt v="ui" size={12} color={c.muted}>٣٠ محطة تاريخية · ٦ حِقَب كبرى · من عام الفيل ٥٧١ م حتى حجة الوداع ووفاته ﷺ ١١ هـ</Txt>
      </View>

      <View style={{ gap: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.panel, borderRadius: 20, padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: c.line, backgroundColor: c.solid, borderRadius: 14, paddingHorizontal: 12 }}>
          <Feather name="search" size={18} color={c.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن محطة، شخصية، حدث، أو مكان (مثل: غار حراء، بدر، الطائف)..."
            placeholderTextColor={c.muted}
            style={{ flex: 1, fontFamily: fonts.ui, fontSize: 14, color: c.ink, paddingVertical: 10, textAlign: "right" }}
            returnKeyType="search"
          />
          {!!search && <IconBtn name="x" label="مسح البحث" size={16} onPress={() => setSearch("")} style={{ width: 30, height: 30 }} />}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}>
            {SORTS.map((o) => <Chip key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} />)}
          </View>
          <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 2 }}>
            <IconBtn name="grid" label="عرض الشبكة" size={16} active={view === "grid"} onPress={() => setView("grid")} style={{ width: 34, height: 34 }} />
            <IconBtn name="list" label="عرض الجدول الزمني" size={16} active={view === "timeline"} onPress={() => setView("timeline")} style={{ width: 34, height: 34 }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line }}>
          <Feather name="filter" size={14} color={c.muted} />
          <Txt v="ui" size={12} color={c.muted}>الحِقبة:</Txt>
          <Chip label={`جميع المحطات (${ar(counts.all)})`} active={era === "all"} onPress={() => setEra("all")} />
          {eraOrder.map((e) => (
            <Chip key={e} dot color={eraHex[e][scheme]} label={`${eraNames[e]} (${ar(counts[e] ?? 0)})`} active={era === e} onPress={() => setEra(e)} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Txt v="ui" size={12} color={c.muted} style={{ flex: 1 }}>
          عرض <Txt v="uiBold" size={12}>{ar(filtered.length)}</Txt> من أصل <Txt v="uiBold" size={12}>{ar(30)}</Txt> محطة
          {era !== "all" ? ` في حقبة «${eraLabel}»` : ""}
          {search ? ` مطابقة لـ «${search}»` : ""}
        </Txt>
        {(era !== "all" || !!search) && <Txt v="uiMedium" size={12} color={c.accent} onPress={reset}>إعادة ضبط الفلاتر</Txt>}
      </View>
    </View>
  );

  const empty = (
    <View style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.panel, borderRadius: 20, padding: 32, alignItems: "center", gap: 8 }}>
      <Txt v="display" size={22} center>لا توجد محطات مطابقة للبحث</Txt>
      <Txt v="ui" size={13.5} color={c.muted} center>جرّب استخدام كلمات بحث أخرى أو إزالة فلاتر الحِقَب</Txt>
      <Btn label="عرض جميع المحطات" onPress={reset} style={{ marginTop: 10 }} />
    </View>
  );

  return (
    <Screen edges={["top"]}>
      <AppBar />
      <FlatList<Station>
        key={view}
        data={filtered}
        keyExtractor={(s) => String(s.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) =>
          view === "grid" ? (
            <View style={{ marginBottom: 16 }}><StationGridCard s={item} /></View>
          ) : (
            <StationTimelineRow s={item} last={index === filtered.length - 1} />
          )
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}
