"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getLenis } from "@/lib/scroll";
import { ar, arYear, cite, sentences, stations, stripTashkeel } from "@/lib/stations";
import { ChevronRight, ChevronLeft, Minus, Plus, Eye, EyeOff, X, Bookmark } from "lucide-react";
import { toast } from "sonner";

export default function ReadingDrawer() {
  const [id, setId] = useState<number | null>(null);
  const [size, setSize] = useState(1.5);
  const [tashkeel, setTashkeel] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = (e: Event) => { opener.current = document.activeElement; setId((e as CustomEvent<number>).detail); };
    addEventListener("rihla:read", open);
    return () => removeEventListener("rihla:read", open);
  }, []);
  useEffect(() => {
    if (id === null) return;
    getLenis()?.stop(); document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    setBookmarked(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setId(null);
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); getLenis()?.start(); document.body.style.overflow = ""; (opener.current as HTMLElement | null)?.focus?.(); };
  }, [id]);

  const s = stations.find((x) => x.id === id);
  const paras = s ? (() => { const sn = sentences(s.bookContent), out: string[] = []; for (let i = 0; i < sn.length; i += 3) out.push(sn.slice(i, i + 3).join(" ")); return out; })() : [];

  const goPrev = () => { if (s && s.id > 1) setId(s.id - 1); };
  const goNext = () => { if (s && s.id < 30) setId(s.id + 1); };
  const toggleBookmark = () => {
    setBookmarked((v) => !v);
    toast.success(bookmarked ? "تمت إزالة الإشارة المرجعية" : "تمت إضافة إشارة مرجعية");
  };

  return (
    <AnimatePresence>
      {s && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setId(null)} />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={s.title}
            className="absolute inset-y-0 right-0 flex w-[min(100vw,44rem)] flex-col border-s"
            style={{ background: "var(--solid)", borderColor: "var(--line)" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-1.5">
                {/* Station nav */}
                <button className="ghost !px-2" onClick={goPrev} disabled={!s || s.id <= 1} aria-label="المحطة السابقة" title="المحطة السابقة">
                  <ChevronRight size={16} />
                </button>
                <button className="ghost !px-2" onClick={goNext} disabled={!s || s.id >= 30} aria-label="المحطة التالية" title="المحطة التالية">
                  <ChevronLeft size={16} />
                </button>
                <div className="mx-1 h-5 w-px" style={{ background: "var(--line)" }} />
                {/* Font size */}
                <button className="ghost !px-2" onClick={() => setSize((v) => Math.max(1.15, v - 0.1))} aria-label="تصغير الخط">
                  <Minus size={14} />
                </button>
                <button className="ghost !px-2" onClick={() => setSize((v) => Math.min(2.2, v + 0.1))} aria-label="تكبير الخط">
                  <Plus size={14} />
                </button>
                <div className="mx-1 h-5 w-px" style={{ background: "var(--line)" }} />
                {/* Tashkeel */}
                <button className="ghost" aria-pressed={tashkeel} onClick={() => setTashkeel((v) => !v)}>
                  {tashkeel ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="hidden font-ui text-xs sm:inline">{tashkeel ? "التشكيل" : "بدون"}</span>
                </button>
                <div className="mx-1 h-5 w-px" style={{ background: "var(--line)" }} />
                {/* Bookmark */}
                <button className="ghost !px-2" onClick={toggleBookmark} aria-label="إشارة مرجعية">
                  <Bookmark size={14} fill={bookmarked ? "var(--accent)" : "none"} style={{ color: bookmarked ? "var(--accent)" : "currentColor" }} />
                </button>
              </div>
              <button ref={closeRef} className="ghost !px-2" onClick={() => setId(null)} aria-label="إغلاق">
                <X size={16} />
              </button>
            </div>

            {/* Reading progress bar */}
            <div className="h-[2px]" style={{ background: "var(--line)" }}>
              <div className="h-full transition-all duration-300" style={{
                width: scrollRef.current ? `${(scrollRef.current.scrollTop / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight || 1)) * 100}%` : "0%",
                background: "var(--era-grad, var(--accent))",
              }} />
            </div>

            {/* Content */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="grid flex-1 content-start gap-6 overflow-y-auto px-6 py-8 md:px-10"
              onScroll={() => {
                // Force re-render for progress bar
                const el = scrollRef.current;
                if (el) {
                  const bar = el.previousElementSibling?.firstElementChild as HTMLElement;
                  if (bar) bar.style.width = `${(el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100}%`;
                }
              }}
            >
              <div>
                <p style={{ color: "var(--accent)" }}>{ar(s.id)} · {arYear(s.year)}</p>
                <h2 className="font-display mt-2 text-4xl leading-[1.6]">{s.title}</h2>
                <p className="mt-2" style={{ color: "var(--muted)", lineHeight: 1.9 }}>{s.subtitle}</p>
              </div>
              <div className="grid gap-5" style={{ fontSize: `${size}rem`, lineHeight: 2.2 }}>
                {paras.map((p, i) => <p key={i}>{tashkeel ? p : stripTashkeel(p)}</p>)}
              </div>
              {/* Quote */}
              <blockquote className="border-s-4 ps-5" style={{ borderColor: "var(--era, var(--accent))", fontSize: "1.3rem", lineHeight: 2 }}>
                «{s.quote}»
              </blockquote>
              <a className="underline underline-offset-4" style={{ color: "var(--muted)" }} href={s.url} target="_blank" rel="noopener noreferrer">{cite(s)}</a>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
