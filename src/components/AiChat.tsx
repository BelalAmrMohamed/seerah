"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/lib/store";
import { ar, stations } from "@/lib/stations";
import { Send, X, Sparkles, MessageCircle, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "من هي حليمة السعدية؟",
  "ماذا حدث في غار حراء؟",
  "كيف كانت هجرة النبي ﷺ؟",
  "ما هي غزوة بدر؟",
  "لماذا سُمّي عام الحزن؟",
];

export default function AiChat() {
  const open = useAppStore((s) => s.aiChatOpen);
  const setOpen = useAppStore((s) => s.setAiChatOpen);
  const activeStation = useAppStore((s) => s.activeStation);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          stationContext: activeStation || undefined,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ حدث خطأ في الاتصال. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const currentStation = stations.find((s) => s.id === activeStation);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:justify-start p-0 sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:bg-black/30 sm:backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
            onClick={() => setOpen(false)}
          />

          {/* Chat panel */}
          <motion.div
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl h-[85dvh] sm:h-[600px] max-h-[85dvh] sm:max-h-[75vh]"
            style={{
              background: "var(--solid)",
              borderColor: "var(--line)",
              boxShadow: "0 20px 60px rgba(0,0,0,.45)",
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Mobile Sheet Handle */}
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[color:var(--line)] sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-3.5 shrink-0" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full shrink-0" style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                  <Sparkles size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div className="min-w-0">
                  <span className="font-ui text-sm font-semibold text-[color:var(--ink)] block">المساعد الذكي</span>
                  {currentStation && (
                    <p className="text-[11px] text-[color:var(--muted)] truncate max-w-[220px]">
                      سياق: محطة {ar(currentStation.id)} — {currentStation.title}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-[color:var(--line)] cursor-pointer text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                aria-label="إغلاق المساعد الذكي"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages (Scrollable Body) */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4" data-lenis-prevent>
              {messages.length === 0 ? (
                <div className="grid gap-4 py-4 text-center">
                  <div>
                    <MessageCircle size={32} className="mx-auto mb-2 text-[color:var(--accent)] opacity-70" />
                    <p className="font-ui text-sm font-medium text-[color:var(--ink)]">
                      اسأل عن أي شيء في السيرة النبوية
                    </p>
                    <p className="text-xs text-[color:var(--muted)] mt-0.5">
                      إجابات موثقة ومستندة إلى كتاب ابن هشام
                    </p>
                  </div>
                  <div className="grid gap-2 text-start mt-1">
                    <p className="label text-xs text-[color:var(--muted)] px-1">أسئلة مقترحة:</p>
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-xl border px-3.5 py-2.5 text-start font-ui text-xs sm:text-sm transition-all hover:border-[color:var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_8%,transparent)] cursor-pointer text-[color:var(--ink)]"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 font-ui text-xs sm:text-sm leading-[1.8] sm:leading-[1.9] ${
                        msg.role === "user" ? "mr-auto" : "ml-auto"
                      }`}
                      style={{
                        background: msg.role === "user"
                          ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                          : "var(--panel)",
                        borderColor: "var(--line)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="ml-auto flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "var(--panel)" }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                      <span className="font-ui text-xs" style={{ color: "var(--muted)" }}>يفكر...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input (Firmly pinned at bottom with safe-area padding) */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t p-3 sm:p-3.5 shrink-0 bg-[color:var(--solid)]"
              style={{
                borderColor: "var(--line)",
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="input !rounded-xl !py-2.5 text-sm flex-1"
                placeholder="اكتب سؤالك هنا…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all disabled:opacity-40 cursor-pointer"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
