import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Sparkles, Compass } from "lucide-react-native";
import { stations, ERAS, eraHex, type Era } from "../../src/lib/stations";
import { colors, fonts } from "../../src/lib/theme";
import { HeaderBar } from "../../src/components/HeaderBar";
import { StationCard } from "../../src/components/StationCard";
import { ReadingModal } from "../../src/components/ReadingModal";
import { getBookmarks, getCompletedStations } from "../../src/lib/storage";

export default function JourneyScreen() {
  const router = useRouter();
  const [selectedEra, setSelectedEra] = useState<Era | "all">("all");
  const [readingStationId, setReadingStationId] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);

  const loadUserData = useCallback(async () => {
    const [b, c] = await Promise.all([getBookmarks(), getCompletedStations()]);
    setBookmarks(b);
    setCompleted(c);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const filteredStations = stations.filter((s) => {
    if (selectedEra === "all") return true;
    const cat = s.category;
    if (selectedEra === "farewell") return /توديع|الوفاة/.test(cat);
    if (selectedEra === "victory") return /الفتح الأعظم|عام الوفود/.test(cat);
    if (selectedEra === "hijra") return cat.startsWith("الهجرة");
    if (selectedEra === "dawn") return cat.includes("المولد والنشأة");
    if (selectedEra === "night") return cat.startsWith("العهد المكي");
    return !/توديع|الوفاة|الفتح الأعظم|عام الوفود|المولد والنشأة/.test(cat) && !cat.startsWith("الهجرة") && !cat.startsWith("العهد المكي");
  });

  const renderHeader = () => (
    <View style={styles.heroSection}>
      {/* Intro Badge */}
      <View style={styles.badgePill}>
        <Sparkles size={14} color={colors.gold} />
        <Text style={styles.badgeText}>٣٠ محطة تاريخية موثقة</Text>
      </View>

      {/* Hero Title */}
      <Text style={styles.heroTitle}>رحلة في السيرة النبوية</Text>
      <Text style={styles.heroSubtitle}>
        من المولد الشريف في عام الفيل حتى حجة الوداع ووفاته ﷺ استناداً لكتاب
        «السيرة النبوية» لابن هشام
      </Text>

      {/* Eras Horizontal Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.erasScroll}
        style={styles.erasContainer}
      >
        {ERAS.map((eraItem) => {
          const isActive = selectedEra === eraItem.key;
          const eraColor =
            eraItem.key !== "all"
              ? eraHex[eraItem.key]?.dark
              : colors.gold;

          return (
            <TouchableOpacity
              key={eraItem.key}
              onPress={() => setSelectedEra(eraItem.key)}
              style={[
                styles.eraChip,
                isActive && {
                  backgroundColor:
                    eraItem.key !== "all"
                      ? eraHex[eraItem.key]?.bg
                      : "rgba(230, 184, 92, 0.15)",
                  borderColor: eraColor,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.eraIcon}>{eraItem.icon}</Text>
              <Text
                style={[
                  styles.eraLabel,
                  isActive && { color: eraColor, fontFamily: fonts.bold },
                ]}
              >
                {eraItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar />

      <FlatList
        data={filteredStations}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <StationCard
            station={item}
            isCompleted={completed.includes(item.id)}
            isBookmarked={bookmarks.includes(item.id)}
            onPressDetails={() => router.push(`/station/${item.id}`)}
            onPressRead={() => setReadingStationId(item.id)}
          />
        )}
      />

      {/* Offline Reading Drawer/Modal */}
      <ReadingModal
        stationId={readingStationId}
        visible={readingStationId !== null}
        onClose={() => {
          setReadingStationId(null);
          loadUserData();
        }}
        onSelectStation={(id) => setReadingStationId(id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroSection: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  badgePill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(230, 184, 92, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(230, 184, 92, 0.25)",
    marginBottom: 12,
  },
  badgeText: {
    color: colors.gold,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  heroTitle: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 28,
    writingDirection: "rtl",
    textAlign: "right",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 16,
  },
  erasContainer: {
    width: "100%",
  },
  erasScroll: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingVertical: 4,
  },
  eraChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eraIcon: {
    fontSize: 13,
  },
  eraLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
