"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
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
  const dragControls = useDragControls();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
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
        <div className="fixed inset-0 z-50 pointer-events-none" role="dialog" aria-modal="true" aria-label="المساعد الذكي">
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
              className="pointer-events-auto flex w-full max-w-lg flex-col rounded-2xl border shadow-2xl overflow-hidden bg-[color:var(--solid)] relative z-10"
              style={{
                borderColor: "var(--line)",
                boxShadow: "0 20px 60px rgba(0,0,0,.5)",
                height: "min(520px, calc(100dvh - 80px))",
                maxHeight: "calc(100dvh - 80px)",
              }}
            >
              {/* Drag Handle Bar */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 select-none"
                title="اسحب للتحريك أو لأسفل للإغلاق"
              >
                <div className="h-1.5 w-12 rounded-full bg-[color:var(--line)] hover:bg-[color:var(--accent)] transition-colors" />
              </div>

              {/* Header */}
              <div
                onPointerDown={(e) => {
                  if (!(e.target as HTMLElement).closest("button")) {
                    dragControls.start(e);
                  }
                }}
                className="flex items-center justify-between border-b px-4 py-2 sm:px-5 shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-full shrink-0" style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                    <Sparkles size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-ui text-sm font-semibold text-[color:var(--ink)] block">المساعد الذكي</span>
                    {currentStation && (
                      <p className="text-[11px] text-[color:var(--muted)] truncate max-w-[200px]">
                        سياق: محطة {ar(currentStation.id)} — {currentStation.title}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-[color:var(--line)] cursor-pointer text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                  aria-label="إغلاق المساعد الذكي"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages Body */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4" data-lenis-prevent>
                {messages.length === 0 ? (
                  <div className="grid gap-3.5 py-2 text-center">
                    <div>
                      <MessageCircle size={30} className="mx-auto mb-1.5 text-[color:var(--accent)] opacity-70" />
                      <p className="font-ui text-sm font-medium text-[color:var(--ink)]">
                        اسأل عن أي شيء في السيرة النبوية
                      </p>
                      <p className="text-[11px] text-[color:var(--muted)] mt-0.5">
                        إجابات موثقة ومستندة إلى كتاب ابن هشام
                      </p>
                    </div>
                    <div className="grid gap-1.5 text-start mt-1">
                      <p className="label text-[11px] text-[color:var(--muted)] px-1">أسئلة مقترحة:</p>
                      {SUGGESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="rounded-xl border px-3 py-2 text-start font-ui text-xs sm:text-sm transition-all hover:border-[color:var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_8%,transparent)] cursor-pointer text-[color:var(--ink)] active:scale-[0.99]"
                          style={{ borderColor: "var(--line)" }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-ui text-xs sm:text-sm leading-[1.8] sm:leading-[1.9] ${
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
                      <div className="ml-auto flex items-center gap-2 rounded-2xl px-3.5 py-2.5" style={{ background: "var(--panel)" }}>
                        <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                        <span className="font-ui text-xs" style={{ color: "var(--muted)" }}>يفكر...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Form: Firmly pinned inside visible card bounds */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t p-2.5 sm:p-3 shrink-0 bg-[color:var(--solid)] z-10"
                style={{ borderColor: "var(--line)" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="input !rounded-xl !py-2.5 !text-sm flex-1 bg-[color:var(--panel)] text-[color:var(--ink)] placeholder:text-[color:var(--muted)]"
                  placeholder="اكتب سؤالك هنا عن السيرة…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
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
