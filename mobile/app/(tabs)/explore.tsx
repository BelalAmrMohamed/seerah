import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, X, ArrowUpDown, Sparkles } from "lucide-react-native";
import { stations, ERAS, eraOf, eraHex, ar, type Era } from "../../src/lib/stations";
import { colors, fonts } from "../../src/lib/theme";
import { HeaderBar } from "../../src/components/HeaderBar";
import { StationCard } from "../../src/components/StationCard";
import { ReadingModal } from "../../src/components/ReadingModal";

type SortOption = "chrono-asc" | "chrono-desc" | "title";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<Era | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("chrono-asc");
  const [readingStationId, setReadingStationId] = useState<number | null>(null);

  const filteredStations = useMemo(() => {
    let list = stations.filter((s) => {
      const era = eraOf(s.category);
      if (selectedEra !== "all" && era !== selectedEra) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.quote.toLowerCase().includes(q) ||
          s.year.includes(q) ||
          s.keyFigures.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "chrono-asc") return a.id - b.id;
      if (sortBy === "chrono-desc") return b.id - a.id;
      if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
      return 0;
    });

    return list;
  }, [query, selectedEra, sortBy]);

  const toggleSort = () => {
    if (sortBy === "chrono-asc") setSortBy("chrono-desc");
    else if (sortBy === "chrono-desc") setSortBy("title");
    else setSortBy("chrono-asc");
  };

  const sortLabel =
    sortBy === "chrono-asc"
      ? "ترتيب زمني (تصاعدي)"
      : sortBy === "chrono-desc"
      ? "ترتيب زمني (تنازلي)"
      : "ترتيب أبجدي";

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="استكشف السيرة" />

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن محطة، شخصية، حدث، أو مكان..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            textAlign="right"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort & Filter Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={toggleSort}
            activeOpacity={0.7}
          >
            <ArrowUpDown size={14} color={colors.gold} />
            <Text style={styles.sortText}>{sortLabel}</Text>
          </TouchableOpacity>

          <Text style={styles.resultsCount}>
            {ar(filteredStations.length)} محطة
          </Text>
        </View>

        {/* Era Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eraChipsList}
        >
          {ERAS.map((item) => {
            const isActive = selectedEra === item.key;
            const eraColor =
              item.key !== "all"
                ? eraHex[item.key]?.dark
                : colors.gold;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSelectedEra(item.key)}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor:
                      item.key !== "all"
                        ? eraHex[item.key]?.bg
                        : "rgba(230, 184, 92, 0.15)",
                    borderColor: eraColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && { color: eraColor, fontFamily: fonts.bold },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stations List */}
      <FlatList
        data={filteredStations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>لا توجد نتائج مطابقة</Text>
            <Text style={styles.emptySubtitle}>
              جرّب البحث بكلمة أخرى مثل (غار حراء، بدر، الطائف، خديجة)
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <StationCard
            station={item}
            onPressDetails={() => router.push(`/station/${item.id}`)}
            onPressRead={() => setReadingStationId(item.id)}
          />
        )}
      />

      <ReadingModal
        stationId={readingStationId}
        visible={readingStationId !== null}
        onClose={() => setReadingStationId(null)}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    writingDirection: "rtl",
  },
  controlsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  resultsCount: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  eraChipsList: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
});
