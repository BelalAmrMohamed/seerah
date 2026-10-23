import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen, { AppBar } from "@/components/Screen";
import { Btn, Card, Txt } from "@/components/ui";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/lib/supabaseTypes";
import { useAppStore, useReaderStore } from "@/lib/appStore";
import { ar, arYear, eraOf, stations } from "@/lib/stations";
import { toast } from "@/lib/toast";
import { eraHex } from "@/lib/stations";
import { useTheme } from "@/lib/theme";

type Progress = Database["public"]["Tables"]["reading_progress"]["Row"];

export default function ProfileScreen() {
  const { c, scheme } = useTheme();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const localMarks = useReaderStore((s) => s.bookmarks);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !supabaseConfigured) return;
    setLoading(true);
    supabase.from("reading_progress").select("*").eq("user_id", user.id).order("station_id")
      .then(({ data }) => { if (data) setProgress(data); })
      .then(() => setLoading(false), () => setLoading(false)); // offline: just show empty progress
  }, [user]);

  if (!user) {
    return (
      <Screen edges={["top"]}><AppBar />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
          <Feather name="user" size={40} color={c.accent} />
          <Txt v="display" size={26} center>سجّل الدخول لمتابعة تقدمك</Txt>
          <Btn primary label="تسجيل الدخول / حساب جديد" onPress={() => router.push("/auth")} />
        </View>
      </Screen>
    );
  }
  const done = progress.filter((p) => p.completed).length;
  const marked = progress.filter((p) => p.bookmarked).length;
  const map = new Map(progress.map((p) => [p.station_id, p]));
  const stat = (icon: keyof typeof Feather.glyphMap, v: string, l: string) => (
    <Card style={{ flex: 1, alignItems: "center", gap: 4, padding: 12 }}><Feather name={icon} size={22} color={c.accent} /><Txt v="display" size={24} color={c.accent}>{v}</Txt><Txt v="ui" size={11.5} color={c.muted} center>{l}</Txt></Card>
  );
  return (
    <Screen edges={["top"]}>
      <AppBar />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Txt v="display" size={30}>أهلاً{user.name ? ` ${user.name}` : ""}</Txt>
            <Txt v="ui" size={13} color={c.muted}>{user.email}</Txt>
          </View>
          <Btn small icon="log-out" label="تسجيل الخروج" onPress={async () => { await supabase.auth.signOut(); setUser(null); toast.success("تم تسجيل الخروج"); }} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {stat("book-open", ar(done), "محطة مكتملة")}
          {stat("bookmark", ar(marked || localMarks.length), "إشارة مرجعية")}
          {stat("star", `${ar(Math.round((done / 30) * 100))}٪`, "نسبة الإكمال")}
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Txt v="uiMedium" size={13} color={c.muted}>تقدم الرحلة</Txt><Txt v="uiMedium" size={13} color={c.muted}>{ar(done)} / {ar(30)}</Txt></View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}><View style={{ height: 8, width: `${(done / 30) * 100}%`, backgroundColor: c.accent }} /></View>
        </View>
        <Txt v="display" size={22}>المحطات</Txt>
        {loading && <ActivityIndicator color={c.accent} />}
        {stations.map((s) => {
          const p = map.get(s.id); const col = eraHex[eraOf(s.category)][scheme];
          return (
            <Pressable key={s.id} onPress={() => router.push({ pathname: "/station/[id]", params: { id: String(s.id) } })}>
              <Card era={col} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
                <Feather name={p?.completed ? "check-circle" : "circle"} size={22} color={p?.completed ? col : c.line} />
                <Txt v="display" size={17} color={col}>{ar(s.id)}</Txt>
                <Txt v="display" size={17} style={{ flex: 1 }} numberOfLines={1}>{s.title}</Txt>
                <Txt v="ui" size={11.5} color={c.muted}>{arYear(s.year)}</Txt>
                {p?.bookmarked && <Feather name="bookmark" size={15} color={col} />}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
