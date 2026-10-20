import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, MapPin, BookOpen, ChevronLeft, Quote, Users } from "lucide-react-native";
import type { Station } from "../data/types";
import { ar, arYear, eraOf, eraHex } from "../lib/stations";
import { colors, fonts } from "../lib/theme";
import { EraBadge } from "./EraBadge";

interface StationCardProps {
  station: Station;
  onPressDetails: () => void;
  onPressRead: () => void;
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onPressDetails,
  onPressRead,
  isCompleted,
  isBookmarked,
}) => {
  const era = eraOf(station.category);
  const eraColor = eraHex[era]?.dark || colors.gold;

  return (
    <View style={[styles.card, { borderStartColor: eraColor }]}>
      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.metaLeft}>
          <EraBadge era={era} size="sm" />
          {isCompleted && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>مكتملة ✓</Text>
            </View>
          )}
          {isBookmarked && (
            <View style={[styles.statusBadge, { backgroundColor: "#3a2d12" }]}>
              <Text style={[styles.statusText, { color: colors.gold }]}>محفوظة ★</Text>
            </View>
          )}
        </View>

        {/* Station Number */}
        <View style={[styles.numberPill, { backgroundColor: eraHex[era]?.bg || colors.surfaceRaised }]}>
          <Text style={[styles.numberText, { color: eraColor }]}>{ar(station.id)}</Text>
        </View>
      </View>

      {/* Date & Location */}
      <View style={styles.dateLocRow}>
        <View style={styles.metaItem}>
          <Calendar size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {arYear(station.year)} ({ar(station.hijriYear)})
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{station.location}</Text>
        </View>
      </View>

      {/* Title & Subtitle */}
      <TouchableOpacity activeOpacity={0.8} onPress={onPressDetails}>
        <Text style={styles.title}>{station.title}</Text>
        <Text style={styles.subtitle}>{station.subtitle}</Text>
      </TouchableOpacity>

      {/* Quote Preview */}
      <View style={[styles.quoteBox, { borderColor: eraColor + "30" }]}>
        <Quote size={14} color={eraColor} style={styles.quoteIcon} />
        <Text style={styles.quoteText} numberOfLines={2}>
          «{station.quote}»
        </Text>
      </View>

      {/* Key figures chips */}
      {station.keyFigures && station.keyFigures.length > 0 && (
        <View style={styles.figuresRow}>
          <Users size={12} color={colors.textMuted} />
          <View style={styles.chipsContainer}>
            {station.keyFigures.slice(0, 3).map((fig, idx) => (
              <View key={idx} style={styles.figureChip}>
                <Text style={styles.figureChipText}>{fig}</Text>
              </View>
            ))}
            {station.keyFigures.length > 3 && (
              <Text style={styles.moreFigures}>+{ar(station.keyFigures.length - 3)}</Text>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: eraHex[era]?.bg || colors.surfaceRaised, borderColor: eraColor }]}
          onPress={onPressRead}
          activeOpacity={0.75}
        >
          <BookOpen size={15} color={eraColor} />
          <Text style={[styles.primaryBtnText, { color: eraColor }]}>اقرأ نص ابن هشام</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={onPressDetails}
          activeOpacity={0.75}
        >
          <Text style={styles.detailsBtnText}>التفاصيل الكاملة</Text>
          <ChevronLeft size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStartWidth: 4,
  },
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaLeft: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  numberPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  statusBadge: {
    backgroundColor: "#133124",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: colors.emerald,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  dateLocRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    writingDirection: "rtl",
    textAlign: "right",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 12,
  },
  quoteBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  quoteIcon: {
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: fonts.quran,
    color: colors.goldLight,
    fontSize: 14,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 22,
  },
  figuresRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  figureChip: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  figureChipText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  moreFigures: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  primaryBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  detailsBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailsBtnText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
