import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  BookOpen,
  Quote,
  Sparkles,
  Lightbulb,
  Users,
  Bookmark,
} from "lucide-react-native";
import {
  stations,
  ar,
  arYear,
  cite,
  eraOf,
  eraHex,
  sentences,
} from "../../src/lib/stations";
import { colors, fonts } from "../../src/lib/theme";
import { EraBadge } from "../../src/components/EraBadge";
import { ReadingModal } from "../../src/components/ReadingModal";
import { toggleBookmark, getBookmarks } from "../../src/lib/storage";

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const stationId = parseInt(id || "1", 10);
  const station = stations.find((s) => s.id === stationId);
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  React.useEffect(() => {
    getBookmarks().then((list) => {
      setBookmarked(list.includes(stationId));
    });
  }, [stationId]);

  if (!station) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>المحطة غير موجودة</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>العودة للرحلة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const era = eraOf(station.category);
  const eraColor = eraHex[era]?.dark || colors.gold;

  const handleToggleBookmark = async () => {
    const isNow = await toggleBookmark(station.id);
    setBookmarked(isNow);
  };

  const paragraphs = (() => {
    const sn = sentences(station.bookContent);
    const out: string[] = [];
    for (let i = 0; i < sn.length; i += 3) {
      out.push(sn.slice(i, i + 3).join(" "));
    }
    return out;
  })();

  const prev = stations.find((x) => x.id === station.id - 1);
  const next = stations.find((x) => x.id === station.id + 1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityLabel="رجوع"
        >
          <ChevronRight size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.barTitle}>المحطة {ar(station.id)}</Text>

        <TouchableOpacity
          onPress={handleToggleBookmark}
          style={styles.iconBtn}
          accessibilityLabel="إشارة مرجعية"
        >
          <Bookmark
            size={20}
            color={bookmarked ? colors.gold : colors.textSecondary}
            fill={bookmarked ? colors.gold : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroCard, { borderStartColor: eraColor }]}>
          <View style={styles.heroTop}>
            <EraBadge era={era} />
            <Text style={[styles.bigNum, { color: eraColor }]}>
              {ar(station.id)}
            </Text>
          </View>

          <View style={styles.dateLoc}>
            <View style={styles.dateLocItem}>
              <Calendar size={14} color={eraColor} />
              <Text style={[styles.dateText, { color: eraColor }]}>
                {arYear(station.year)}
              </Text>
              <Text style={styles.hijriText}>({ar(station.hijriYear)})</Text>
            </View>
            <View style={styles.dateLocItem}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.locText}>{station.location}</Text>
            </View>
          </View>

          <Text style={styles.title}>{station.title}</Text>
          <Text style={styles.subtitle}>{station.subtitle}</Text>

          {/* Quick Ask AI button */}
          <TouchableOpacity
            style={styles.askAiBtn}
            onPress={() => router.push("/(tabs)/chat")}
            activeOpacity={0.75}
          >
            <Sparkles size={16} color={colors.gold} />
            <Text style={styles.askAiText}>اسأل المساعد الذكي عن هذه المحطة</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={18} color={eraColor} />
            <Text style={[styles.sectionTitle, { color: eraColor }]}>الوصف</Text>
          </View>
          <Text style={styles.bodyText}>{station.description}</Text>
        </View>

        {/* Section: Ibn Hisham Text */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={18} color={eraColor} />
            <Text style={[styles.sectionTitle, { color: eraColor }]}>
              نص ابن هشام في السيرة
            </Text>
          </View>
          <View style={styles.bookCard}>
            {paragraphs.map((p, idx) => (
              <Text key={idx} style={styles.bookParagraph}>
                {p}
              </Text>
            ))}
          </View>
          <Text style={styles.citation}>{cite(station)}</Text>
        </View>

        {/* Section: Quote */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Quote size={18} color={eraColor} />
            <Text style={[styles.sectionTitle, { color: eraColor }]}>
              اقتباس بارز
            </Text>
          </View>
          <View style={[styles.quoteCard, { borderStartColor: eraColor }]}>
            <Text style={styles.quoteText}>«{station.quote}»</Text>
          </View>
        </View>

        {/* Section: Significance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={18} color={eraColor} />
            <Text style={[styles.sectionTitle, { color: eraColor }]}>
              الدلالة التاريخية والعبرة
            </Text>
          </View>
          <Text style={styles.bodyText}>{station.significance}</Text>
        </View>

        {/* Section: Key Figures */}
        {station.keyFigures && station.keyFigures.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={18} color={eraColor} />
              <Text style={[styles.sectionTitle, { color: eraColor }]}>
                الشخصيات البارزة
              </Text>
            </View>
            <View style={styles.figuresWrap}>
              {station.keyFigures.map((fig, idx) => (
                <View key={idx} style={styles.figChip}>
                  <Text style={styles.figChipText}>{fig}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Previous / Next Navigation */}
        <View style={styles.navRow}>
          {prev ? (
            <TouchableOpacity
              style={styles.navStationBtn}
              onPress={() => router.replace(`/station/${prev.id}`)}
            >
              <ChevronRight size={18} color={colors.gold} />
              <View style={styles.navStationInfo}>
                <Text style={styles.navStationLabel}>المحطة السابقة</Text>
                <Text style={styles.navStationName} numberOfLines={1}>
                  {prev.title}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.navStationPlaceholder} />
          )}

          {next ? (
            <TouchableOpacity
              style={[styles.navStationBtn, styles.navStationBtnNext]}
              onPress={() => router.replace(`/station/${next.id}`)}
            >
              <View style={styles.navStationInfo}>
                <Text style={styles.navStationLabel}>المحطة التالية</Text>
                <Text style={styles.navStationName} numberOfLines={1}>
                  {next.title}
                </Text>
              </View>
              <ChevronLeft size={18} color={colors.gold} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navStationPlaceholder} />
          )}
        </View>
      </ScrollView>

      <ReadingModal
        stationId={station.id}
        visible={readingModalOpen}
        onClose={() => setReadingModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  backBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    color: colors.gold,
    fontFamily: fonts.medium,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barTitle: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderStartWidth: 4,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bigNum: {
    fontFamily: fonts.bold,
    fontSize: 26,
  },
  dateLoc: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  dateLocItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  hijriText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  locText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    writingDirection: "rtl",
    textAlign: "right",
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 16,
  },
  askAiBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(230, 184, 92, 0.12)",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(230, 184, 92, 0.3)",
  },
  askAiText: {
    color: colors.gold,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  bodyText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 24,
    writingDirection: "rtl",
    textAlign: "justify",
  },
  bookCard: {
    backgroundColor: colors.surfaceRaised,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  bookParagraph: {
    color: colors.text,
    fontFamily: fonts.quran,
    fontSize: 17,
    lineHeight: 32,
    writingDirection: "rtl",
    textAlign: "justify",
  },
  citation: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  quoteCard: {
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStartWidth: 4,
  },
  quoteText: {
    color: colors.goldLight,
    fontFamily: fonts.quran,
    fontSize: 18,
    lineHeight: 34,
    writingDirection: "rtl",
    textAlign: "center",
  },
  figuresWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  figChip: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  figChipText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  navRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 8,
  },
  navStationBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  navStationBtnNext: {
    justifyContent: "space-between",
  },
  navStationPlaceholder: {
    flex: 1,
  },
  navStationInfo: {
    flex: 1,
  },
  navStationLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    writingDirection: "rtl",
    textAlign: "right",
  },
  navStationName: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
    writingDirection: "rtl",
    textAlign: "right",
  },
});
