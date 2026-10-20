import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Circle,
  LogOut,
  LogIn,
  Star,
  Award,
} from "lucide-react-native";
import { stations, ar, eraOf, eraHex } from "../../src/lib/stations";
import { colors, fonts } from "../../src/lib/theme";
import { HeaderBar } from "../../src/components/HeaderBar";
import { ReadingModal } from "../../src/components/ReadingModal";
import { supabase } from "../../src/lib/supabase";
import {
  getBookmarks,
  getCompletedStations,
  toggleBookmark,
  toggleCompletedStation,
} from "../../src/lib/storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [readingId, setReadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([getBookmarks(), getCompletedStations()]);
      setBookmarks(b);
      setCompleted(c);

      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser({
          id: u.id,
          email: u.email!,
          name: u.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleComplete = async (stationId: number) => {
    await toggleCompletedStation(stationId);
    const updated = await getCompletedStations();
    setCompleted(updated);
  };

  const handleToggleBookmark = async (stationId: number) => {
    await toggleBookmark(stationId);
    const updated = await getBookmarks();
    setBookmarks(updated);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const completedCount = completed.length;
  const bookmarkedCount = bookmarks.length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="إنجازي في السيرة" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user ? (user.name ? `أهلاً، ${user.name}` : user.email) : "قارئ السيرة النبوية"}
            </Text>
            <Text style={styles.userSubtitle}>
              {user ? user.email : "قراءة محلية محفوظة دون إنترنت"}
            </Text>
          </View>

          {user ? (
            <TouchableOpacity style={styles.authBtn} onPress={handleSignOut}>
              <LogOut size={16} color={colors.textMuted} />
              <Text style={styles.authBtnText}>خروج</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.authBtn, styles.authBtnPrimary]}
              onPress={() => router.push("/auth")}
            >
              <LogIn size={16} color={colors.gold} />
              <Text style={[styles.authBtnText, { color: colors.gold }]}>تسجيل الدخول</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BookOpen size={22} color={colors.emerald} />
            <Text style={[styles.statNumber, { color: colors.emerald }]}>
              {ar(completedCount)}
            </Text>
            <Text style={styles.statLabel}>محطة مكتملة</Text>
          </View>

          <View style={styles.statCard}>
            <Bookmark size={22} color={colors.gold} />
            <Text style={[styles.statNumber, { color: colors.gold }]}>
              {ar(bookmarkedCount)}
            </Text>
            <Text style={styles.statLabel}>إشارة مرجعية</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={22} color={colors.goldLight} />
            <Text style={[styles.statNumber, { color: colors.goldLight }]}>
              {ar(progressPercent)}٪
            </Text>
            <Text style={styles.statLabel}>نسبة الإنجاز</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>مستوى إتمام الرحلة</Text>
            <Text style={styles.progressRatio}>
              {ar(completedCount)} من {ar(30)} محطة
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Stations Checklist */}
        <Text style={styles.sectionHeader}>فهرس قراءة المحطات الثلاثين</Text>

        <View style={styles.checklist}>
          {stations.map((s) => {
            const isDone = completed.includes(s.id);
            const isMarked = bookmarks.includes(s.id);
            const era = eraOf(s.category);
            const eraColor = eraHex[era]?.dark || colors.gold;

            return (
              <View key={s.id} style={styles.checkItem}>
                {/* Complete checkbox */}
                <TouchableOpacity
                  onPress={() => handleToggleComplete(s.id)}
                  style={styles.checkboxTouch}
                  accessibilityLabel="إتمام المحطة"
                >
                  {isDone ? (
                    <CheckCircle2 size={22} color={colors.emerald} />
                  ) : (
                    <Circle size={22} color={colors.border} />
                  )}
                </TouchableOpacity>

                {/* Station Title and Number */}
                <TouchableOpacity
                  style={styles.checkTitleArea}
                  onPress={() => setReadingId(s.id)}
                >
                  <View style={styles.checkNumberRow}>
                    <Text style={[styles.checkNum, { color: eraColor }]}>
                      المحطة {ar(s.id)}
                    </Text>
                    <Text style={styles.checkDate}>{s.hijriYear}</Text>
                  </View>
                  <Text
                    style={[
                      styles.checkTitle,
                      isDone && styles.checkTitleDone,
                    ]}
                    numberOfLines={1}
                  >
                    {s.title}
                  </Text>
                </TouchableOpacity>

                {/* Bookmark Toggle */}
                <TouchableOpacity
                  onPress={() => handleToggleBookmark(s.id)}
                  style={styles.bookmarkTouch}
                  accessibilityLabel="حفظ إشارة"
                >
                  <Bookmark
                    size={18}
                    color={isMarked ? colors.gold : colors.textMuted}
                    fill={isMarked ? colors.gold : "transparent"}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <ReadingModal
        stationId={readingId}
        visible={readingId !== null}
        onClose={() => {
          setReadingId(null);
          loadData();
        }}
        onSelectStation={(id) => setReadingId(id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    writingDirection: "rtl",
    textAlign: "right",
    marginBottom: 2,
  },
  userSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    writingDirection: "rtl",
    textAlign: "right",
  },
  authBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authBtnPrimary: {
    borderColor: colors.gold,
    backgroundColor: "rgba(230, 184, 92, 0.12)",
  },
  authBtnText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontFamily: fonts.bold,
    fontSize: 22,
    marginTop: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  progressSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  progressRatio: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.gold,
    borderRadius: 4,
  },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    writingDirection: "rtl",
    textAlign: "right",
    marginBottom: 12,
  },
  checklist: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  checkItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxTouch: {
    padding: 4,
    marginLeft: 8,
  },
  checkTitleArea: {
    flex: 1,
    marginRight: 6,
  },
  checkNumberRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  checkNum: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  checkDate: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  checkTitle: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    writingDirection: "rtl",
    textAlign: "right",
  },
  checkTitleDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  bookmarkTouch: {
    padding: 6,
  },
});
