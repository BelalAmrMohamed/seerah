"use client";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useAppStore } from "@/lib/store";
import { ar, stations } from "@/lib/stations";
import {
  Send,
  X,
  Sparkles,
  MessageCircle,
  Loader2,
  Mic,
  MicOff,
  History,
  Plus,
  Download,
  FileText,
  Printer,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useChatStore, getActiveThread, type ChatMessage } from "@/lib/chatStore";
import { startVoiceRecognition, stopVoiceRecognition, isSpeechRecognitionSupported, stopSpeaking } from "@/lib/speech";
import { downloadSessionMarkdown, printSessionPdf } from "@/lib/chatExport";
import ChatMessageItem from "./chat/ChatMessageItem";
import ChatHistoryDrawer from "./chat/ChatHistoryDrawer";

const SUGGESTIONS = [
  "من هي حليمة السعدية وما دورها في طفولة النبي ﷺ؟",
  "ماذا حدث في غار حراء عند نزول الوحي لأول مرة؟",
  "كيف كانت هجرة النبي ﷺ من مكة إلى المدينة؟",
  "ما هي أحداث غزوة بدر الكبرى ونتائجها؟",
  "لماذا سُمّي عام الحزن بهذا الاسم وماذا جرى فيه؟",
];

export default function AiChat() {
  const open = useAppStore((s) => s.aiChatOpen);
  const setOpen = useAppStore((s) => s.setAiChatOpen);
  const activeStation = useAppStore((s) => s.activeStation);

  // Chat Store
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const setActiveSessionId = useChatStore((s) => s.setActiveSessionId);
  const createNewSession = useChatStore((s) => s.createNewSession);
  const setSessionStationId = useChatStore((s) => s.setSessionStationId);
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  const addMessage = useChatStore((s) => s.addMessage);
  const editPromptAndBranch = useChatStore((s) => s.editPromptAndBranch);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [contextPickerOpen, setContextPickerOpen] = useState(false);
  const [stationFilterQuery, setStationFilterQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextPickerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Find or create active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  // Handle outside clicks to close context picker dropdown
  useEffect(() => {
    if (!contextPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (contextPickerRef.current && !contextPickerRef.current.contains(e.target as Node)) {
        setContextPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextPickerOpen]);

  useEffect(() => {
    if (open) {
      if (!currentSession) {
        createNewSession(activeStation || undefined);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeaking();
      stopVoiceRecognition();
      setIsRecording(false);
      setContextPickerOpen(false);
    }
  }, [open, currentSession, createNewSession, activeStation]);

  // Active messages thread (from root to current branch leaf)
  const thread = getActiveThread(currentSession);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, loading]);

  // Send message
  const handleSendMessage = async (text: string, customParentId?: string) => {
    if (!text.trim() || loading) return;

    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = createNewSession(undefined, text.trim());
    }

    // Add user message to branch
    const userMsgId = addMessage(sessionId, "user", text.trim(), customParentId);
    setInput("");
    setLoading(true);

    try {
      // Build past history for multi-turn context
      const currentThread = getActiveThread(useChatStore.getState().sessions.find((s) => s.id === sessionId));
      const historyPayload = currentThread
        .filter((m) => m.id !== userMsgId)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          stationContext: currentSession?.stationId || undefined,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.error) {
        addMessage(sessionId, "assistant", `⚠️ ${data.error}`, userMsgId);
      } else {
        addMessage(sessionId, "assistant", data.response, userMsgId);
      }
    } catch {
      addMessage(sessionId, "assistant", "⚠️ حدث خطأ في الاتصال بمحرك الذكاء. يرجى المحاولة مرة أخرى.", userMsgId);
    } finally {
      setLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopVoiceRecognition();
      setIsRecording(false);
    }
    handleSendMessage(input);
  };

  // Edit user prompt and branch conversation
  const handleEditPrompt = async (messageId: string, newContent: string) => {
    if (!currentSession || loading) return;

    const sessionId = currentSession.id;
    // Creates a new user message branch with parent equal to original's parent
    const newUserMsgId = editPromptAndBranch(sessionId, messageId, newContent);
    setLoading(true);

    try {
      // Find thread up to this new branch message
      const updatedSession = useChatStore.getState().sessions.find((s) => s.id === sessionId);
      const currentThread = getActiveThread(updatedSession);
      const historyPayload = currentThread
        .filter((m) => m.id !== newUserMsgId)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newContent,
          stationContext: currentSession.stationId || undefined,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.error) {
        addMessage(sessionId, "assistant", `⚠️ ${data.error}`, newUserMsgId);
      } else {
        addMessage(sessionId, "assistant", data.response, newUserMsgId);
      }
    } catch {
      addMessage(sessionId, "assistant", "⚠️ حدث خطأ أثناء تحديث الإجابة.", newUserMsgId);
    } finally {
      setLoading(false);
    }
  };

  // Voice Dictation Toggle
  const handleToggleVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("المتصفح الحالي لا يدعم التعرف الصوتي");
      return;
    }

    if (isRecording) {
      stopVoiceRecognition();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      toast.info("جارٍ الاستماع... تحدث الآن باللغة العربية");

      startVoiceRecognition({
        onStart: () => setIsRecording(true),
        onTranscript: (spokenText) => {
          setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${spokenText}` : spokenText;
          });
        },
        onEnd: () => setIsRecording(false),
        onError: (err) => {
          setIsRecording(false);
          toast.error(`خطأ في التعرف الصوتي: ${err}`);
        },
      });
    }
  };

  const stationContextId = currentSession?.stationId;
  const currentStation = stationContextId ? stations.find((s) => s.id === stationContextId) : null;
  const isNewChat = !currentSession || Object.keys(currentSession.messages || {}).length === 0;

  const filteredStations = stations.filter((s) => {
    if (!stationFilterQuery.trim()) return true;
    const q = stationFilterQuery.trim().toLowerCase();
    return s.title.toLowerCase().includes(q) || s.id.toString() === q;
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 pointer-events-none select-none" role="dialog" aria-modal="true" aria-label="المساعد الذكي">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setOpen(false)}
          />

          {/* Chat Window Container */}
          <div className="absolute inset-0 flex items-start justify-center p-3 sm:p-6 pointer-events-none pt-14 sm:pt-16">
            <motion.div
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: -80, bottom: 350 }}
              dragElastic={{ top: 0.08, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 130 || info.velocity.y > 450) {
                  setOpen(false);
                }
              }}
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="pointer-events-auto flex w-full max-w-xl flex-col rounded-2xl border shadow-2xl overflow-hidden bg-[color:var(--solid)] relative z-10 select-text"
              style={{
                borderColor: "var(--line)",
                boxShadow: "0 24px 64px rgba(0,0,0,.55)",
                height: "min(560px, calc(100dvh - 75px))",
                maxHeight: "calc(100dvh - 75px)",
              }}
            >
              {/* History Sidebar Component inside the Chat Window */}
              <ChatHistoryDrawer currentStationId={stationContextId} />

              {/* Drag Handle Bar */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 select-none"
                title="اسحب للتحريك أو لأسفل للإغلاق"
              >
                <div className="h-1.5 w-12 rounded-full bg-[color:var(--line)] hover:bg-[color:var(--accent)] transition-colors" />
              </div>

              {/* Window Header */}
              <div
                onPointerDown={(e) => {
                  if (!(e.target as HTMLElement).closest("button") && !(e.target as HTMLElement).closest("input")) {
                    dragControls.start(e);
                  }
                }}
                className="flex items-center justify-between border-b px-4 py-2 shrink-0 select-none cursor-grab active:cursor-grabbing touch-none relative z-20"
                style={{ borderColor: "var(--line)" }}
              >
                {/* Title & Station Context */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-8 w-8 place-items-center rounded-full shrink-0" style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                    <Sparkles size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="font-ui text-sm font-semibold text-[color:var(--ink)] block truncate">
                      {currentSession?.title || "المساعد الذكي"}
                    </span>
                    
                    {/* Interactive Station Context Selector Pill & Dropdown */}
                    <div className="relative flex items-center gap-1 mt-0.5" ref={contextPickerRef}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextPickerOpen(!contextPickerOpen);
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-ui transition-all border cursor-pointer hover:border-[color:var(--accent)] select-none shrink-0"
                        style={{
                          background: currentStation
                            ? "color-mix(in srgb, var(--accent) 12%, var(--panel))"
                            : "color-mix(in srgb, var(--ink) 5%, var(--panel))",
                          borderColor: currentStation
                            ? "color-mix(in srgb, var(--accent) 35%, var(--line))"
                            : "var(--line)",
                          color: currentStation ? "var(--accent)" : "var(--muted)",
                        }}
                        title="انقر لتغيير محطة السياق أو اختيار السيرة كاملة"
                      >
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">
                          {currentStation ? `محطة ${ar(currentStation.id)}: ${currentStation.title}` : "السياق: السيرة كاملة"}
                        </span>
                        <ChevronDown size={10} className={`shrink-0 transition-transform ${contextPickerOpen ? "rotate-180" : ""}`} />
                      </button>

                      {currentStation && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentSession) {
                              setSessionStationId(currentSession.id, undefined);
                              toast.success("تم إزالة حصر المحطة (السياق: السيرة كاملة)");
                            }
                          }}
                          className="rounded p-0.5 text-[color:var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="إلغاء حصر السياق (العودة للسيرة كاملة)"
                          aria-label="إلغاء حصر السياق"
                        >
                          <X size={11} />
                        </button>
                      )}

                      {/* Context Picker Dropdown Popover */}
                      {contextPickerOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute start-0 top-full mt-1.5 w-64 sm:w-72 rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-2 shadow-2xl z-40 space-y-1.5 text-xs font-ui"
                          style={{ boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}
                        >
                          <div className="px-1 pt-0.5 pb-1">
                            <p className="font-semibold text-[color:var(--ink)] text-xs">سياق إجابات المساعد:</p>
                            <p className="text-[10px] text-[color:var(--muted)]">اختر محطة محددة أو السيرة النبوية كاملة</p>
                          </div>

                          <input
                            type="text"
                            placeholder="ابحث عن محطة بالاسم أو الرقم…"
                            value={stationFilterQuery}
                            onChange={(e) => setStationFilterQuery(e.target.value)}
                            className="w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--panel)] px-2.5 py-1.5 text-xs text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
                            autoFocus
                          />

                          <div className="max-h-48 overflow-y-auto space-y-0.5 pe-1" data-lenis-prevent>
                            {/* General / All Seerah option */}
                            <button
                              type="button"
                              onClick={() => {
                                if (currentSession) {
                                  setSessionStationId(currentSession.id, undefined);
                                  toast.success("تم تعيين السياق: السيرة كاملة");
                                }
                                setContextPickerOpen(false);
                              }}
                              className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-start transition-colors cursor-pointer ${
                                !currentStation
                                  ? "bg-[color:color-mix(in_srgb,var(--accent)_15%,var(--panel))] text-[color:var(--accent)] font-semibold"
                                  : "text-[color:var(--ink)] hover:bg-[color:var(--panel)]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>📖</span>
                                <span>السيرة كاملة (عام — بدون حصر)</span>
                              </div>
                              {!currentStation && <Check size={13} />}
                            </button>

                            <div className="h-px bg-[color:var(--line)] my-1" />

                            {/* List of stations */}
                            {filteredStations.map((st) => {
                              const isSelected = currentStation?.id === st.id;
                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => {
                                    if (currentSession) {
                                      setSessionStationId(currentSession.id, st.id);
                                      toast.success(`تم ضبط السياق: محطة ${st.id} — ${st.title}`);
                                    }
                                    setContextPickerOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-start transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[color:color-mix(in_srgb,var(--accent)_15%,var(--panel))] text-[color:var(--accent)] font-semibold"
                                      : "text-[color:var(--ink)] hover:bg-[color:var(--panel)]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-display text-xs w-5 text-center text-[color:var(--accent)]">
                                      {ar(st.id)}
                                    </span>
                                    <span className="truncate">{st.title}</span>
                                  </div>
                                  {isSelected && <Check size={13} className="shrink-0 text-[color:var(--accent)]" />}
                                </button>
                              );
                            })}
                            {filteredStations.length === 0 && (
                              <p className="text-center py-3 text-xs text-[color:var(--muted)]">لا توجد محطة مطابقة</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* New Chat Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isNewChat) return;
                      createNewSession(stationContextId);
                      toast.success("تم بدء محادثة جديدة");
                    }}
                    disabled={isNewChat}
                    className="rounded-lg p-1.5 text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[color:var(--muted)]"
                    title={isNewChat ? "أنت في محادثة جديدة بالفعل" : "محادثة جديدة"}
                    aria-label="محادثة جديدة"
                  >
                    <Plus size={16} />
                  </button>

                  {/* History Sessions Drawer Toggle */}
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="rounded-lg p-1.5 text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)] transition-colors cursor-pointer"
                    title="سجل المحادثات"
                  >
                    <History size={16} />
                  </button>

                  {/* Export Menu Dropdown */}
                  {currentSession && thread.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="rounded-lg p-1.5 text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)] transition-colors cursor-pointer"
                        title="تصدير المحادثة"
                      >
                        <Download size={16} />
                      </button>

                      {showExportMenu && (
                        <div className="absolute end-0 top-full mt-1 w-36 rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-1 shadow-2xl z-30 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              downloadSessionMarkdown(currentSession);
                              toast.success("تم تنزيل ملف Markdown");
                            }}
                            className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-start hover:bg-[color:var(--panel)] text-[color:var(--ink)] cursor-pointer"
                          >
                            <FileText size={13} />
                            <span>تصدير Markdown</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              printSessionPdf(currentSession);
                            }}
                            className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-start hover:bg-[color:var(--panel)] text-[color:var(--ink)] cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>طباعة / حفظ PDF</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close Window */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-[color:var(--line)] cursor-pointer text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    aria-label="إغلاق المساعد الذكي"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" data-lenis-prevent>
                {thread.length === 0 ? (
                  <div className="grid gap-3.5 py-3 text-center">
                    <div>
                      <MessageCircle size={32} className="mx-auto mb-2 text-[color:var(--accent)] opacity-80" />
                      <p className="font-ui text-sm font-medium text-[color:var(--ink)]">
                        اسأل عن أي تفصيل في السيرة النبوية
                      </p>
                      <p className="text-xs text-[color:var(--muted)] mt-0.5">
                        إجابات مدعمة ومستندة إلى نصوص ابن هشام في السيرة
                      </p>
                    </div>

                    <div className="grid gap-1.5 text-start mt-2">
                      <p className="label text-xs text-[color:var(--muted)] px-1">أسئلة مقترحة للبدء:</p>
                      {SUGGESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="rounded-xl border px-3.5 py-2.5 text-start font-ui text-xs sm:text-sm transition-all hover:border-[color:var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_8%,transparent)] cursor-pointer text-[color:var(--ink)] active:scale-[0.99]"
                          style={{ borderColor: "var(--line)" }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {thread.map((msg) => (
                      <ChatMessageItem
                        key={msg.id}
                        session={currentSession!}
                        message={msg}
                        onEditSubmit={handleEditPrompt}
                      />
                    ))}

                    {/* Thinking Loader */}
                    {loading && (
                      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-[color:var(--panel)] border border-[color:var(--line)] w-fit">
                        <Loader2 size={15} className="animate-spin text-[color:var(--accent)]" />
                        <span className="font-ui text-xs text-[color:var(--muted)]">المساعد الذكي يفكر ويستخرج النص...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Form with Voice Dictation */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t p-2.5 sm:p-3 shrink-0 bg-[color:var(--solid)] z-10"
                style={{ borderColor: "var(--line)" }}
              >
                {/* Voice Recognition Microphone Button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all cursor-pointer ${
                    isRecording
                      ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30"
                      : "border border-[color:var(--line)] bg-[color:var(--panel)] text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
                  }`}
                  title={isRecording ? "إيقاف التسجيل الصوتي" : "تحدث بصوتك (إملاء صوتي)"}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {/* Prompt Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  className="input !rounded-xl !py-2.5 !text-sm flex-1 bg-[color:var(--panel)] text-[color:var(--ink)] placeholder:text-[color:var(--muted)]"
                  placeholder={isRecording ? "جارٍ الاستماع إليك... تحدث الآن" : "اكتب سؤالك هنا عن السيرة النبوية…"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-sm text-white"
                  style={{
                    background: "var(--era-grad, var(--accent))",
                    color: "var(--bg)",
                  }}
                  aria-label="إرسال السؤال"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
