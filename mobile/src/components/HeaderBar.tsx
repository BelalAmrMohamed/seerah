import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Sparkles, User, ChevronRight } from "lucide-react-native";
import { colors, fonts } from "../lib/theme";

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = "رحلة في السيرة",
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* Right side in RTL (leading) */}
      <View style={styles.leading}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            accessibilityLabel="رجوع"
          >
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
          </View>
        )}
      </View>

      {/* Left side in RTL (trailing actions) */}
      <View style={styles.trailing}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => router.push("/(tabs)/chat")}
              accessibilityLabel="المساعد الذكي"
            >
              <Sparkles size={16} color={colors.gold} />
              <Text style={styles.aiBtnText}>المساعد</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityLabel="الملف الشخصي"
            >
              <User size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  brandRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  title: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 18,
    writingDirection: "rtl",
    textAlign: "right",
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    writingDirection: "rtl",
    textAlign: "right",
  },
  trailing: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  actionsGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  aiBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(230, 184, 92, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(230, 184, 92, 0.3)",
  },
  aiBtnText: {
    color: colors.gold,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
