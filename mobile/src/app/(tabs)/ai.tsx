import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import { AppBar } from "@/components/Screen";
import { ChatMessageItem } from "@/components/chat";
import { Btn, Card, IconBtn, Txt } from "@/components/ui";
import { askAi } from "@/lib/api";
import { getActiveThread, useChatStore } from "@/lib/chatStore";
import { shareSessionMarkdown, saveSessionMarkdown, exportSessionPdf } from "@/lib/chatExport";
import { stopSpeaking } from "@/lib/speech";
import { useAppStore } from "@/lib/appStore";
import { useOnline } from "@/lib/useOnline";
import { ar, stations } from "@/lib/stations";
import { toast } from "@/lib/toast";
import { alpha, fonts, useTheme } from "@/lib/theme";

const SUGGESTIONS = [
  "من هي حليمة السعدية وما دورها في طفولة النبي ﷺ؟",
  "ماذا حدث في غار حراء عند نزول الوحي لأول مرة؟",
  "كيف كانت هجرة النبي ﷺ من مكة إلى المدينة؟",
  "ما هي أحداث غزوة بدر الكبرى ونتائجها؟",
  "لماذا سُمّي عام الحزن بهذا الاسم وماذا جرى فيه؟",
];

export default function AiScreen() {
  const { c } = useTheme();
  const online = useOnline();
  const activeStation = useAppStore((s) => s.activeStation);
  const { sessions, activeSessionId, setActiveSessionId, createNewSession, setSessionStationId, addMessage, editPromptAndBranch, deleteSession, togglePinSession, renameSession, clearAllSessions } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [history, setHistory] = useState(false);
  const [filter, setFilter] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; text: string } | null>(null);
  const listRef = useRef<FlatList>(null);

  const session = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  const thread = getActiveThread(session);
  const isNew = !session || Object.keys(session.messages || {}).length === 0;
  const station = session?.stationId ? stations.find((s) => s.id === session.stationId) : null;

  useEffect(() => { if (!session) createNewSession(activeStation || undefined); }, [session, createNewSession, activeStation]);
  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80); }, [thread.length, loading]);

  const ask = async (sessionId: string, userMsgId: string, message: string, stationContext?: number) => {
    setLoading(true);
    if (!online) {
      addMessage(sessionId, "assistant", "⚠️ المساعد الذكي يحتاج اتصالاً بالإنترنت. القراءة متاحة دون اتصال.", userMsgId);
      setLoading(false);
      return;
    }
    const cur = getActiveThread(useChatStore.getState().sessions.find((s) => s.id === sessionId));
    const history = cur.filter((m) => m.id !== userMsgId).map((m) => ({ role: m.role, content: m.content }));
    const r = await askAi({ message, stationContext, history });
    addMessage(sessionId, "assistant", r.error ? `⚠️ ${r.error}` : r.response!, userMsgId);
    setLoading(false);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const sid = session?.id ?? createNewSession(undefined, text.trim());
    const id = addMessage(sid, "user", text.trim());
    setInput("");
    await ask(sid, id, text.trim(), session?.stationId || undefined);
  };
  const edit = async (messageId: string, content: string) => {
    if (!session || loading) return;
    const id = editPromptAndBranch(session.id, messageId, content);
    await ask(session.id, id, content, session.stationId || undefined);
  };

  const [exportOpen, setExportOpen] = useState(false);
  const exportMenu = () => { if (session && !isNew) setExportOpen(true); };
  const runExport = async (fn: () => Promise<void>, ok?: string) => {
    setExportOpen(false);
    try { await fn(); if (ok) toast.success(ok); } catch { toast.error("تعذر تصدير المحادثة"); }
  };

  const sorted = [...sessions].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  const stList = stations.filter((s) => !filter.trim() || s.title.includes(filter.trim()) || String(s.id) === filter.trim());

  return (
    <Screen edges={["top"]}>
      <AppBar title={session?.title || "المساعد الذكي"} showTools={false} trailing={
        <>
          <IconBtn name="plus" label="محادثة جديدة" onPress={() => { stopSpeaking(); createNewSession(activeStation || undefined); toast.success("تم بدء محادثة جديدة"); }} />
          <IconBtn name="clock" label="سجل المحادثات" onPress={() => setHistory(true)} />
          <IconBtn name="share" label="تصدير" onPress={exportMenu} />
        </>
      } />
      <Pressable onPress={() => setPicker(true)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <Feather name="map-pin" size={13} color={station ? c.accent : c.muted} />
        <Txt v="uiMedium" size={12} color={station ? c.accent : c.muted} numberOfLines={1} style={{ flex: 1 }}>
          {station ? `محطة ${ar(station.id)}: ${station.title}` : "السياق: السيرة كاملة"}
        </Txt>
        <Feather name="chevron-down" size={14} color={c.muted} />
      </Pressable>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={thread}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 14, gap: 16, flexGrow: 1 }}
          renderItem={({ item }) => session ? <ChatMessageItem session={session} message={item} onEditSubmit={edit} /> : null}
          ListEmptyComponent={
            <View style={{ gap: 10, paddingTop: 12 }}>
              <Txt v="display" size={22} center>اسأل عن أي تفصيل في السيرة النبوية</Txt>
              <Txt v="ui" size={13} color={c.muted} center>إجابات مدعمة ومستندة إلى نصوص ابن هشام في السيرة</Txt>
              <Txt v="uiMedium" size={12} color={c.muted} style={{ marginTop: 10 }}>أسئلة مقترحة للبدء:</Txt>
              {SUGGESTIONS.map((q) => (
                <Pressable key={q} onPress={() => send(q)}><Card style={{ padding: 12 }}><Txt v="ui" size={13.5}>{q}</Txt></Card></Pressable>
              ))}
            </View>
          }
          ListFooterComponent={loading ? <Txt v="ui" size={13} color={c.muted}>… جارٍ التفكير</Txt> : undefined}
        />
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.solid }}>
          <TextInput
            value={input} onChangeText={setInput} multiline placeholder={online ? "اكتب سؤالك…" : "يتطلب اتصالاً بالإنترنت"} placeholderTextColor={c.muted}
            style={{ flex: 1, maxHeight: 110, fontFamily: fonts.ui, fontSize: 14.5, color: c.ink, borderWidth: 1, borderColor: c.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, textAlign: "right" }}
          />
          <IconBtn name="send" label="إرسال" disabled={loading || !input.trim()} color={c.onAccent} onPress={() => send(input)} style={{ backgroundColor: c.accent, opacity: loading || !input.trim() ? 0.5 : 1, transform: [{ scaleX: -1 }] }} />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={exportOpen} transparent animationType="fade" onRequestClose={() => setExportOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }} onPress={() => setExportOpen(false)}>
          <View style={{ backgroundColor: c.solid, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, paddingBottom: 28, gap: 4 }}>
            <Txt v="uiSemi" size={15} style={{ marginBottom: 6 }}>تصدير المحادثة</Txt>
            {[
              { icon: "download" as const, label: "حفظ كملف Markdown على الجهاز", run: () => runExport(() => saveSessionMarkdown(session!), "تم حفظ الملف") },
              { icon: "file-text" as const, label: "حفظ كملف PDF على الجهاز", run: () => runExport(() => exportSessionPdf(session!, "save"), "تم حفظ الملف") },
              { icon: "share-2" as const, label: "مشاركة Markdown", run: () => runExport(() => shareSessionMarkdown(session!)) },
              { icon: "share" as const, label: "مشاركة PDF", run: () => runExport(() => exportSessionPdf(session!, "share")) },
            ].map((o) => (
              <Pressable key={o.label} onPress={o.run} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
                <Feather name={o.icon} size={18} color={c.accent} /><Txt v="uiMedium" size={14.5}>{o.label}</Txt>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <Screen>
          <View style={{ padding: 14, gap: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Txt v="uiSemi" size={15} style={{ flex: 1 }}>سياق إجابات المساعد</Txt>
              <IconBtn name="x" label="إغلاق" onPress={() => setPicker(false)} />
            </View>
            <TextInput value={filter} onChangeText={setFilter} placeholder="ابحث عن محطة بالاسم أو الرقم…" placeholderTextColor={c.muted}
              style={{ fontFamily: fonts.ui, color: c.ink, borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, textAlign: "right" }} />
            <FlatList
              data={stList}
              keyExtractor={(s) => String(s.id)}
              ListHeaderComponent={<Pressable onPress={() => { session && setSessionStationId(session.id, undefined); setPicker(false); }} style={{ paddingVertical: 12 }}><Txt v="uiMedium" size={14} color={c.accent}>السيرة كاملة (عام — بدون حصر)</Txt></Pressable>}
              renderItem={({ item }) => (
                <Pressable onPress={() => { session && setSessionStationId(session.id, item.id); toast.success(`تم ضبط السياق: محطة ${item.id} — ${item.title}`); setPicker(false); }} style={{ paddingVertical: 10, flexDirection: "row", gap: 10 }}>
                  <Txt v="uiMedium" size={14} color={c.accent}>{ar(item.id)}</Txt><Txt v="ui" size={14} style={{ flex: 1 }}>{item.title}</Txt>
                </Pressable>
              )}
              ListEmptyComponent={<Txt v="ui" size={13} color={c.muted} center>لا توجد محطة مطابقة</Txt>}
            />
          </View>
        </Screen>
      </Modal>

      <Modal visible={history} animationType="slide" onRequestClose={() => setHistory(false)}>
        <Screen>
          <View style={{ padding: 14, gap: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Txt v="uiSemi" size={16} style={{ flex: 1 }}>سجل المحادثات</Txt>
              <IconBtn name="x" label="إغلاق السجل" onPress={() => setHistory(false)} />
            </View>
            <FlatList
              data={sorted}
              keyExtractor={(s) => s.id}
              ListEmptyComponent={<View style={{ padding: 30 }}><Txt v="uiMedium" size={14} center>لا توجد محادثات سابقة</Txt><Txt v="ui" size={12} color={c.muted} center>ابدأ بطرح سؤال لحفظ السجل</Txt></View>}
              renderItem={({ item }) => (
                <Card style={{ marginBottom: 8, padding: 12, gap: 8, borderColor: item.id === session?.id ? c.accent : c.glassBorder }}>
                  {renaming?.id === item.id ? (
                    <TextInput autoFocus value={renaming!.text} onChangeText={(t) => setRenaming({ id: item.id, text: t })}
                      onSubmitEditing={() => { renameSession(item.id, renaming!.text); setRenaming(null); toast.success("تم تحديث عنوان المحادثة"); }}
                      style={{ fontFamily: fonts.ui, color: c.ink, borderBottomWidth: 1, borderColor: c.accent, textAlign: "right" }} />
                  ) : (
                    <Pressable onPress={() => { setActiveSessionId(item.id); setHistory(false); }}>
                      <Txt v="uiMedium" size={14} numberOfLines={2}>{item.pinned ? "📌 " : ""}{item.title}</Txt>
                    </Pressable>
                  )}
                  <View style={{ flexDirection: "row", gap: 18 }}>
                    <Txt v="ui" size={12} color={c.muted} onPress={() => togglePinSession(item.id)}>{item.pinned ? "إلغاء التثبيت" : "تثبيت في الأعلى"}</Txt>
                    <Txt v="ui" size={12} color={c.muted} onPress={() => setRenaming({ id: item.id, text: item.title })}>إعادة تسمية</Txt>
                    <Txt v="ui" size={12} color={c.error} onPress={() => { deleteSession(item.id); toast.success("تم حذف المحادثة"); }}>حذف المحادثة</Txt>
                  </View>
                </Card>
              )}
            />
            {sessions.length > 0 && (
              <Btn label="مسح السجل بالكامل" icon="trash-2" color={c.error} onPress={() =>
                Alert.alert("مسح السجل", "هل أنت متأكد من رغبتك في مسح سجل المحادثات بالكامل؟", [
                  { text: "إلغاء", style: "cancel" },
                  { text: "مسح", style: "destructive", onPress: () => { clearAllSessions(); toast.success("تم مسح السجل بالكامل"); } },
                ])} />
            )}
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
