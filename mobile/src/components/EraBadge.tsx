import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { eraHex, eraNames, type Era } from "../lib/stations";
import { fonts } from "../lib/theme";

interface EraBadgeProps {
  era: Era;
  size?: "sm" | "md";
}

export const EraBadge: React.FC<EraBadgeProps> = ({ era, size = "md" }) => {
  const colors = eraHex[era] || eraHex.dawn;
  const name = eraNames[era] || "السيرة";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.dark,
        },
        size === "sm" ? styles.badgeSm : styles.badgeMd,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.dark }]} />
      <Text
        style={[
          styles.text,
          { color: colors.dark },
          size === "sm" ? styles.textSm : styles.textMd,
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fonts.medium,
    writingDirection: "rtl",
  },
  textMd: {
    fontSize: 12,
  },
  textSm: {
    fontSize: 11,
  },
});
