import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, View } from "react-native";

type ViewToken = { item: unknown; isViewable: boolean };
import { useLocalSearchParams } from "expo-router";
import Screen, { AppBar } from "@/components/Screen";
import Hero from "@/components/Hero";
import SceneCard from "@/components/SceneCard";
import JourneyFooter from "@/components/JourneyFooter";
import { Txt } from "@/components/ui";
import { ar, arYear, eraOf, stations } from "@/lib/stations";
import type { Station } from "@/data/types";
import { useAppStore } from "@/lib/appStore";
import { useEra, useTheme } from "@/lib/theme";

function ProgressStrip({ id }: { id: number }) {
  const { c } = useTheme();
  const s = stations.find((x) => x.id === id);
  const { era } = useEra(s ? eraOf(s.category) : "dawn");
  if (!s) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: c.panel }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 4 }}>
        <Txt v="uiMedium" size={13} color={era}>{ar(s.id)} / {ar(30)}</Txt>
        <Txt v="uiMedium" size={13} color={era}>{arYear(s.year)}</Txt>
      </View>
      <View style={{ height: 3, backgroundColor: c.line }}>
        <View style={{ height: 3, width: `${(s.id / 30) * 100}%`, backgroundColor: era }} />
      </View>
    </View>
  );
}

export default function JourneyScreen() {
  const { s: target } = useLocalSearchParams<{ s?: string }>();
  const listRef = useRef<FlatList<Station>>(null);
  const [active, setActive] = React.useState(0);
  const setActiveStation = useAppStore((st) => st.setActiveStation);

  // jump to a station (from search / explore "في الرحلة")
  useEffect(() => {
    const idx = Number(target) - 1;
    if (!target || !(idx >= 0 && idx < stations.length)) return;
    const t = setTimeout(() => listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 }), 300);
    return () => clearTimeout(t);
  }, [target]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable && v.item);
    const id = first ? (first.item as Station).id : 0;
    setActive(id);
    setActiveStation(id);
  }).current;

  const renderItem = useCallback(({ item }: { item: Station }) => <SceneCard s={item} />, []);

  return (
    <Screen edges={["top"]}>
      <AppBar />
      <View style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={stations}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          ListHeaderComponent={Hero}
          ListFooterComponent={<JourneyFooter onTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={7}
          removeClippedSubviews={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 35 }}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
            setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0 }), 350);
          }}
          contentContainerStyle={{ paddingBottom: active ? 44 : 0 }}
        />
        {active > 0 && <ProgressStrip id={active} />}
      </View>
    </Screen>
  );
}
