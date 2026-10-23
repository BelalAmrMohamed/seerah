import React, { useMemo, useRef, useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Screen from "@/components/Screen";
import { Btn, IconBtn, Txt } from "@/components/ui";
import { ar, arYear, cite, eraOf, paragraphs, stationById, stripTashkeel, type Era } from "@/lib/stations";
import { useReaderStore } from "@/lib/appStore";
import { toast } from "@/lib/toast";
import { useEra, useTheme } from "@/lib/theme";

/** Port of the website's ReadingDrawer: Ibn Hisham's text with size / tashkeel / bookmark controls. */
export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = stationById(Number(id));
  const { c } = useTheme();
  const { era: col } = useEra((s ? eraOf(s.category) : "dawn") as Era);
  const { size, tashkeel, bookmarks, setSize, setTashkeel, toggleBookmark } = useReaderStore();
  const [pct, setPct] = useState(0);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const paras = useMemo(() => (s ? paragraphs(s.bookContent) : []), [s]);
  if (!s) return null;
  const marked = bookmarks.includes(s.id);
  const go = (n: number) => { scroller.current?.scrollTo({ y: 0, animated: false }); setPct(0); router.setParams({ id: String(n) }); };

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, height: 52, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.solid }}>
        <IconBtn name="chevron-right" label="المحطة السابقة" disabled={s.id <= 1} style={{ opacity: s.id <= 1 ? 0.35 : 1 }} onPress={() => go(s.id - 1)} />
        <IconBtn name="chevron-left" label="المحطة التالية" disabled={s.id >= 30} style={{ opacity: s.id >= 30 ? 0.35 : 1 }} onPress={() => go(s.id + 1)} />
        <IconBtn name="minus" label="تصغير الخط" onPress={() => setSize(size - 0.1)} />
        <IconBtn name="plus" label="تكبير الخط" onPress={() => setSize(size + 0.1)} />
        <IconBtn name={tashkeel ? "eye" : "eye-off"} label="التشكيل" active={tashkeel} onPress={() => setTashkeel(!tashkeel)} />
        <IconBtn name="bookmark" label="إشارة مرجعية" active={marked} color={marked ? c.accent : undefined}
          onPress={() => toast.success(toggleBookmark(s.id) ? "تمت إضافة إشارة مرجعية" : "تمت إزالة الإشارة المرجعية")} />
        <View style={{ flex: 1 }} />
        <IconBtn name="x" label="إغلاق" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      </View>
      <View style={{ height: 2, backgroundColor: c.line }}><View style={{ height: 2, width: `${pct}%`, backgroundColor: col }} /></View>
      <ScrollView
        ref={scroller}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          setPct(Math.min(100, (contentOffset.y / Math.max(contentSize.height - layoutMeasurement.height, 1)) * 100));
        }}
        contentContainerStyle={{ padding: 22, gap: 22, paddingBottom: 56 }}
      >
        <View>
          <Txt v="ui" size={14} color={c.accent}>{ar(s.id)} · {arYear(s.year)}</Txt>
          <Txt v="display" size={32} style={{ lineHeight: 52, marginTop: 6 }}>{s.title}</Txt>
          <Txt v="ui" size={14} color={c.muted} style={{ marginTop: 6 }}>{s.subtitle}</Txt>
        </View>
        <View style={{ gap: 20 }}>
          {paras.map((p, i) => (
            <Txt key={i} v="text" size={Math.round(size * 15)} style={{ lineHeight: Math.round(size * 15 * 2.2) }}>{tashkeel ? p : stripTashkeel(p)}</Txt>
          ))}
        </View>
        <View style={{ borderStartWidth: 4, borderStartColor: col, paddingStart: 16 }}>
          <Txt v="text" size={21} style={{ lineHeight: 42 }}>«{s.quote}»</Txt>
        </View>
        <Btn small icon="external-link" label={cite(s)} color={c.muted} onPress={() => Linking.openURL(s.url)} />
      </ScrollView>
    </Screen>
  );
}
