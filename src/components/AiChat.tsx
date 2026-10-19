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
          className="fixed inset-0 z-50 flex items-end justify-start p-3 sm:p-4 md:items-end md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none md:pointer-events-none" onClick={() => setOpen(false)} />

          {/* Chat panel */}
          <motion.div
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border md:max-h-[70vh]"
            style={{
              background: "var(--solid)",
              borderColor: "var(--line)",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
              maxHeight: "min(80vh, 600px)",
            }}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                  <Sparkles size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <span className="font-ui text-sm font-semibold">المساعد الذكي</span>
                  {currentStation && (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      سياق: محطة {ar(currentStation.id)} — {currentStation.title}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 transition-colors hover:bg-[color:var(--line)]" aria-label="إغلاق">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4" data-lenis-prevent style={{ minHeight: "300px" }}>
              {messages.length === 0 ? (
                <div className="grid gap-5 py-6">
                  <div className="text-center">
                    <MessageCircle size={36} className="mx-auto mb-3" style={{ color: "var(--muted)", opacity: 0.5 }} />
                    <p className="font-ui text-sm" style={{ color: "var(--muted)" }}>
                      اسأل عن أي شيء في السيرة النبوية
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <p className="label text-xs">أسئلة مقترحة:</p>
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-xl border px-4 py-2.5 text-start font-ui text-sm transition-all hover:border-[color:var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_8%,transparent)]"
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 font-ui text-sm leading-[1.9] ${
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

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3" style={{ borderColor: "var(--line)" }}>
              <input
                ref={inputRef}
                type="text"
                className="input !rounded-xl !py-2.5 text-sm"
                placeholder="اكتب سؤالك هنا…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all disabled:opacity-40"
                style={{
                  background: "var(--era-grad, var(--accent))",
                  color: "var(--bg)",
                }}
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
