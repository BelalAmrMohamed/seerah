import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  Send,
  Sparkles,
  Trash2,
  ChevronDown,
  BookOpen,
  Check,
} from "lucide-react-native";
import { stations, ar } from "../../src/lib/stations";
import { colors, fonts } from "../../src/lib/theme";
import { HeaderBar } from "../../src/components/HeaderBar";
import { sendAiChatMessage, type ChatHistoryItem } from "../../src/lib/api";
import {
  getChatSessions,
  saveChatSessions,
  type LocalChatMessage,
} from "../../src/lib/storage";

const SUGGESTIONS = [
  "من هي حليمة السعدية وما دورها في طفولة النبي ﷺ؟",
  "ماذا حدث في غار حراء عند نزول الوحي لأول مرة؟",
  "كيف كانت هجرة النبي ﷺ من مكة إلى المدينة؟",
  "ما هي أحداث غزوة بدر الكبرى ونتائجها؟",
  "لماذا سُمّي عام الحزن بهذا الاسم وماذا جرى فيه؟",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stationContext, setStationContext] = useState<number | undefined>(
    undefined
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat session from storage
  useEffect(() => {
    getChatSessions().then((sessions) => {
      if (sessions.length > 0 && sessions[0].messages.length > 0) {
        setMessages(sessions[0].messages);
        setStationContext(sessions[0].stationId);
      }
    });
  }, []);

  const persistMessages = async (
    newMessages: LocalChatMessage[],
    currentStationContext?: number
  ) => {
    setMessages(newMessages);
    await saveChatSessions([
      {
        id: "default_session",
        title: "محادثة السيرة",
        stationId: currentStationContext,
        messages: newMessages,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: LocalChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedWithUser = [...messages, userMsg];
    await persistMessages(updatedWithUser, stationContext);
    setInput("");
    setLoading(true);

    try {
      const historyPayload: ChatHistoryItem[] = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendAiChatMessage({
        message: text,
        stationContext,
        history: historyPayload,
      });

      const assistantMsg: LocalChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          result.response ||
          result.error ||
          "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.",
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      await persistMessages(finalMessages, stationContext);
    } catch {
      const errorMsg: LocalChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "تعذر الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت والمحاولة ثانية.",
        timestamp: Date.now(),
      };
      await persistMessages([...updatedWithUser, errorMsg], stationContext);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await persistMessages([]);
  };

  const selectedStationObj = stations.find((s) => s.id === stationContext);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        title="مساعد السيرة"
        subtitle="مستند إلى نصوص ابن هشام"
        rightAction={
          messages.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearBtn}
              accessibilityLabel="مسح المحادثة"
            >
              <Trash2 size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Station Context Selector */}
      <View style={styles.contextContainer}>
        <TouchableOpacity
          style={styles.contextPill}
          onPress={() => setPickerOpen(!pickerOpen)}
          activeOpacity={0.7}
        >
          <BookOpen size={14} color={colors.gold} />
          <Text style={styles.contextPillText}>
            {selectedStationObj
              ? `المحطة ${ar(selectedStationObj.id)}: ${selectedStationObj.title}`
              : "سياق المحادثة: كامل السيرة النبوية"}
          </Text>
          <ChevronDown size={14} color={colors.textMuted} />
        </TouchableOpacity>

        {pickerOpen && (
          <View style={styles.pickerDropdown}>
            <ScrollView style={styles.pickerScroll} nestedScrollEnabled={true}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  stationContext === undefined && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setStationContext(undefined);
                  setPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    stationContext === undefined && { color: colors.gold },
                  ]}
                >
                  كامل السيرة النبوية (عام)
                </Text>
                {stationContext === undefined && (
                  <Check size={16} color={colors.gold} />
                )}
              </TouchableOpacity>

              {stations.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pickerItem,
                    stationContext === s.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setStationContext(s.id);
                    setPickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      stationContext === s.id && { color: colors.gold },
                    ]}
                  >
                    محطة {ar(s.id)}: {s.title}
                  </Text>
                  {stationContext === s.id && (
                    <Check size={16} color={colors.gold} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sparkleCircle}>
              <Sparkles size={36} color={colors.gold} />
            </View>
            <Text style={styles.welcomeTitle}>أهلاً بك في مساعد السيرة</Text>
            <Text style={styles.welcomeSubtitle}>
              اسأل بدقة عن أي حدث، شخصية، أو موضع في سيرة النبي محمد ﷺ
              استناداً إلى كتاب ابن هشام.
            </Text>

            <Text style={styles.suggestLabel}>أسئلة مقترحة:</Text>
            <View style={styles.suggestionsList}>
              {SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionItem}
                  onPress={() => handleSend(sug)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View
                  style={[
                    styles.bubbleContainer,
                    isUser ? styles.userBubbleWrap : styles.assistantBubbleWrap,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botAvatar}>
                      <Sparkles size={13} color={colors.gold} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isUser ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={styles.loadingBubbleWrap}>
                  <View style={styles.botAvatar}>
                    <Sparkles size={13} color={colors.gold} />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color={colors.gold} />
                    <Text style={styles.loadingText}>
                      جاري البحث في سيرة ابن هشام...
                    </Text>
                  </View>
                </View>
              ) : undefined
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputField}
            placeholder="اكتب سؤالك عن السيرة النبوية..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline={true}
            maxLength={500}
            textAlign="right"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Send size={18} color={input.trim() ? "#0c0a09" : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  contextPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contextPillText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    writingDirection: "rtl",
    textAlign: "right",
    marginHorizontal: 8,
  },
  pickerDropdown: {
    marginTop: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
    overflow: "hidden",
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemActive: {
    backgroundColor: "rgba(230, 184, 92, 0.12)",
  },
  pickerItemText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
  },
  chatArea: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  sparkleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(230, 184, 92, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  welcomeTitle: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  suggestionsList: {
    width: "100%",
    gap: 8,
  },
  suggestionItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleContainer: {
    flexDirection: "row-reverse",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  userBubbleWrap: {
    justifyContent: "flex-start",
  },
  assistantBubbleWrap: {
    justifyContent: "flex-start",
    gap: 8,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(230, 184, 92, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    writingDirection: "rtl",
    textAlign: "right",
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.textSecondary,
  },
  loadingBubbleWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  loadingBubble: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    color: colors.gold,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  inputBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    maxHeight: 90,
    writingDirection: "rtl",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
