import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Markdown from "react-native-markdown-display";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import { fonts, alpha, useTheme } from "@/lib/theme";
import { getMessageSiblings, useChatStore, type ChatMessage, type ChatSession } from "@/lib/chatStore";
import { speakText, stopSpeaking } from "@/lib/speech";
import { toast } from "@/lib/toast";
import { Btn, Txt } from "./ui";

export function MarkdownContent({ content }: { content: string }) {
  const { c } = useTheme();
  const base = { fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 26, color: c.ink, writingDirection: "rtl" as const };
  return (
    <Markdown
      style={{
        body: base, paragraph: { marginTop: 0, marginBottom: 8 }, strong: { fontFamily: fonts.uiBold },
        heading1: { ...base, fontFamily: fonts.display, fontSize: 20, color: c.accent }, heading2: { ...base, fontFamily: fonts.display, fontSize: 18, color: c.accent },
        heading3: { ...base, fontFamily: fonts.display, fontSize: 16, color: c.accent },
        code_inline: { backgroundColor: alpha(c.ink, 0.1), color: c.ink }, link: { color: c.accent },
        blockquote: { backgroundColor: alpha(c.accent, 0.08), borderColor: c.accent },
      }}
    >
      {content}
    </Markdown>
  );
}

export function ChatMessageItem({ session, message, onEditSubmit }: { session: ChatSession; message: ChatMessage; onEditSubmit: (id: string, text: string) => void }) {
  const { c } = useTheme();
  const switchBranch = useChatStore((s) => s.switchBranch);
  const [speaking, setSpeaking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.content);
  const isUser = message.role === "user";
  const { siblings, currentIndex } = getMessageSiblings(session, message.id);

  const act = (icon: keyof typeof Feather.glyphMap, label: string, onPress: () => void) => (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Feather name={icon} size={13} color={c.muted} /><Txt v="ui" size={11} color={c.muted}>{label}</Txt>
    </Pressable>
  );

  return (
    <View style={{ gap: 6, alignItems: "flex-start" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Feather name={isUser ? "user" : "star"} size={13} color={c.accent} />
        <Txt v="uiSemi" size={12} color={isUser ? c.ink : c.accent}>{isUser ? "أنت" : "المساعد الذكي"}</Txt>
        {siblings.length > 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: c.line, borderRadius: 99, paddingHorizontal: 8 }}>
            <Feather name="chevron-right" size={14} color={currentIndex === 0 ? c.line : c.muted} onPress={() => currentIndex > 0 && (stopSpeaking(), switchBranch(session.id, siblings[currentIndex - 1]))} />
            <Txt v="ui" size={11}>{currentIndex + 1} / {siblings.length}</Txt>
            <Feather name="chevron-left" size={14} color={currentIndex === siblings.length - 1 ? c.line : c.muted} onPress={() => currentIndex < siblings.length - 1 && (stopSpeaking(), switchBranch(session.id, siblings[currentIndex + 1]))} />
          </View>
        )}
      </View>
      {editing ? (
        <View style={{ alignSelf: "stretch", gap: 8 }}>
          <TextInput value={text} onChangeText={setText} multiline style={{ fontFamily: fonts.ui, fontSize: 14.5, color: c.ink, borderWidth: 1, borderColor: c.accent, borderRadius: 14, padding: 10, textAlign: "right" }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn small primary label="حفظ وتحديث" onPress={() => { setEditing(false); if (text.trim() && text.trim() !== message.content) onEditSubmit(message.id, text.trim()); }} />
            <Btn small label="إلغاء" onPress={() => { setEditing(false); setText(message.content); }} />
          </View>
        </View>
      ) : (
        <View style={{ alignSelf: isUser ? "flex-start" : "stretch", backgroundColor: isUser ? alpha(c.accent, 0.14) : c.panel, borderWidth: 1, borderColor: c.line, borderRadius: 16, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 2 }}>
          {isUser ? <Txt v="ui" size={14.5} style={{ paddingBottom: 8 }}>{message.content}</Txt> : <MarkdownContent content={message.content} />}
        </View>
      )}
      {!editing && (
        <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 4 }}>
          {act("copy", "نسخ", async () => { await Clipboard.setStringAsync(message.content); toast.success("تم نسخ النص إلى الحافظة"); })}
          {!isUser && act(speaking ? "volume-x" : "volume-2", speaking ? "إيقاف" : "استماع", () => {
            if (speaking) { stopSpeaking(); setSpeaking(false); return; }
            setSpeaking(true);
            speakText(message.content, { onEnd: () => setSpeaking(false), onError: () => { setSpeaking(false); toast.error("تعذر تشغيل الصوت"); } });
          })}
          {isUser && act("edit-3", "تعديل", () => setEditing(true))}
        </View>
      )}
    </View>
  );
}
