import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Eye,
  EyeOff,
  Minus,
  Plus,
  BookOpen,
} from "lucide-react-native";
import { stations, ar, cite, eraOf, eraHex, sentences, stripTashkeel } from "../lib/stations";
import { colors, fonts } from "../lib/theme";
import {
  getReadingSettings,
  saveReadingSettings,
  getBookmarks,
  toggleBookmark,
} from "../lib/storage";

interface ReadingModalProps {
  stationId: number | null;
  visible: boolean;
  onClose: () => void;
  onSelectStation?: (id: number) => void;
}

export const ReadingModal: React.FC<ReadingModalProps> = ({
  stationId,
  visible,
  onClose,
  onSelectStation,
}) => {
  const [currentId, setCurrentId] = useState<number | null>(stationId);
  const [fontSize, setFontSize] = useState(19);
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (stationId) {
      setCurrentId(stationId);
      checkBookmark(stationId);
    }
  }, [stationId]);

  useEffect(() => {
    getReadingSettings().then((settings) => {
      setFontSize(settings.fontSize);
      setShowTashkeel(settings.tashkeel);
    });
  }, []);

  const checkBookmark = async (id: number) => {
    const list = await getBookmarks();
    setIsBookmarked(list.includes(id));
  };

  const handleToggleBookmark = async () => {
    if (!currentId) return;
    const nowBookmarked = await toggleBookmark(currentId);
    setIsBookmarked(nowBookmarked);
  };

  const adjustFontSize = (delta: number) => {
    const updated = Math.min(28, Math.max(14, fontSize + delta));
    setFontSize(updated);
    saveReadingSettings({ fontSize: updated, tashkeel: showTashkeel });
  };

  const toggleTashkeelState = () => {
    const updated = !showTashkeel;
    setShowTashkeel(updated);
    saveReadingSettings({ fontSize, tashkeel: updated });
  };

  const station = stations.find((s) => s.id === currentId);
  if (!station) return null;

  const era = eraOf(station.category);
  const eraColor = eraHex[era]?.dark || colors.gold;

  const rawParagraphs = (() => {
    const sn = sentences(station.bookContent);
    const out: string[] = [];
    for (let i = 0; i < sn.length; i += 3) {
      out.push(sn.slice(i, i + 3).join(" "));
    }
    return out;
  })();

  const paragraphs = showTashkeel
    ? rawParagraphs
    : rawParagraphs.map((p) => stripTashkeel(p));

  const handlePrev = () => {
    if (currentId && currentId > 1) {
      const prevId = currentId - 1;
      setCurrentId(prevId);
      checkBookmark(prevId);
      onSelectStation?.(prevId);
    }
  };

  const handleNext = () => {
    if (currentId && currentId < 30) {
      const nextId = currentId + 1;
      setCurrentId(nextId);
      checkBookmark(nextId);
      onSelectStation?.(nextId);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconBtn}
            accessibilityLabel="إغلاق"
          >
            <X size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Quick Toolbar */}
          <View style={styles.toolbar}>
            {/* Font size */}
            <View style={styles.toolGroup}>
              <TouchableOpacity
                onPress={() => adjustFontSize(-2)}
                style={styles.toolBtn}
                accessibilityLabel="تصغير الخط"
              >
                <Minus size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.toolValue}>{ar(fontSize)}</Text>
              <TouchableOpacity
                onPress={() => adjustFontSize(2)}
                style={styles.toolBtn}
                accessibilityLabel="تكبير الخط"
              >
                <Plus size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Tashkeel */}
            <TouchableOpacity
              onPress={toggleTashkeelState}
              style={[styles.chipBtn, showTashkeel && styles.chipBtnActive]}
            >
              {showTashkeel ? (
                <Eye size={15} color={colors.gold} />
              ) : (
                <EyeOff size={15} color={colors.textMuted} />
              )}
              <Text
                style={[
                  styles.chipText,
                  { color: showTashkeel ? colors.gold : colors.textMuted },
                ]}
              >
                {showTashkeel ? "تشكيل" : "بدون"}
              </Text>
            </TouchableOpacity>

            {/* Bookmark */}
            <TouchableOpacity
              onPress={handleToggleBookmark}
              style={styles.iconBtn}
              accessibilityLabel="إشارة مرجعية"
            >
              <Bookmark
                size={20}
                color={isBookmarked ? colors.gold : colors.textMuted}
                fill={isBookmarked ? colors.gold : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Station Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={!currentId || currentId <= 1}
            style={[styles.navBtn, currentId === 1 && styles.navBtnDisabled]}
          >
            <ChevronRight
              size={20}
              color={currentId === 1 ? colors.textMuted : colors.text}
            />
            <Text
              style={[
                styles.navText,
                currentId === 1 && { color: colors.textMuted },
              ]}
            >
              السابقة
            </Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.stationNumber, { color: eraColor }]}>
              المحطة {ar(station.id)} من ٣٠
            </Text>
            <Text style={styles.stationTitle} numberOfLines={1}>
              {station.title}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!currentId || currentId >= 30}
            style={[styles.navBtn, currentId === 30 && styles.navBtnDisabled]}
          >
            <Text
              style={[
                styles.navText,
                currentId === 30 && { color: colors.textMuted },
              ]}
            >
              التالية
            </Text>
            <ChevronLeft
              size={20}
              color={currentId === 30 ? colors.textMuted : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Book Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Chapter header */}
          <View style={[styles.chapterCard, { borderColor: eraColor + "40" }]}>
            <BookOpen size={18} color={eraColor} />
            <Text style={[styles.chapterTitle, { color: eraColor }]}>
              {station.chapterTitle}
            </Text>
          </View>

          {/* Ibn Hisham Paragraphs */}
          {paragraphs.map((p, idx) => (
            <View key={idx} style={styles.paragraphWrapper}>
              <Text
                style={[
                  styles.paragraph,
                  {
                    fontSize: fontSize,
                    lineHeight: Math.round(fontSize * 2.1),
                  },
                ]}
              >
                {p}
              </Text>
            </View>
          ))}

          {/* Citation footer */}
          <View style={styles.citationBox}>
            <Text style={styles.citationText}>{cite(station)}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolbar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  toolGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolBtn: {
    padding: 4,
  },
  toolValue: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    paddingHorizontal: 6,
  },
  chipBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipBtnActive: {
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  iconBtn: {
    padding: 6,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  navBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  stationNumber: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  stationTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: 2,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  chapterCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    marginBottom: 20,
  },
  chapterTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
  },
  paragraphWrapper: {
    marginBottom: 20,
  },
  paragraph: {
    fontFamily: fonts.quran,
    color: colors.text,
    textAlign: "justify",
    writingDirection: "rtl",
  },
  citationBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  citationText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
  },
});
