"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getLenis } from "@/lib/scroll";
import { ar, arYear, cite, sentences, stations, stripTashkeel } from "@/lib/stations";

export default function ReadingDrawer() {
  const [id, setId] = useState<number | null>(null);
  const [size, setSize] = useState(1.5);
  const [tashkeel, setTashkeel] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const open = (e: Event) => { opener.current = document.activeElement; setId((e as CustomEvent<number>).detail); };
    addEventListener("rihla:read", open);
    return () => removeEventListener("rihla:read", open);
  }, []);
  useEffect(() => {
    if (id === null) return;
    getLenis()?.stop(); document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setId(null);
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); getLenis()?.start(); document.body.style.overflow = ""; (opener.current as HTMLElement | null)?.focus?.(); };
  }, [id]);

  const s = stations.find((x) => x.id === id);
  const paras = s ? (() => { const sn = sentences(s.bookContent), out: string[] = []; for (let i = 0; i < sn.length; i += 3) out.push(sn.slice(i, i + 3).join(" ")); return out; })() : [];
  return (
    <AnimatePresence>
      {s && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setId(null)} />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={s.title}
            className="absolute inset-y-0 right-0 flex w-[min(100vw,42rem)] flex-col border-s" style={{ background: "var(--solid)", borderColor: "var(--line)" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between gap-3 border-b px-6 py-4" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2">
                <button className="ghost" onClick={() => setSize((v) => Math.max(1.15, v - 0.1))} aria-label="تصغير الخط">ا−</button>
                <button className="ghost" onClick={() => setSize((v) => Math.min(2.2, v + 0.1))} aria-label="تكبير الخط">ا+</button>
                <button className="ghost" aria-pressed={tashkeel} onClick={() => setTashkeel((v) => !v)}>التشكيل: {tashkeel ? "ظاهر" : "مخفي"}</button>
              </div>
              <button ref={closeRef} className="ghost" onClick={() => setId(null)} aria-label="إغلاق">إغلاق</button>
            </div>
            <div data-lenis-prevent className="grid flex-1 content-start gap-6 overflow-y-auto px-6 py-8 md:px-10">
              <div><p style={{ color: "var(--accent)" }}>{ar(s.id)} · {arYear(s.year)}</p><h2 className="font-display mt-2 text-4xl leading-[1.6]">{s.title}</h2></div>
              <div className="grid gap-5" style={{ fontSize: `${size}rem`, lineHeight: 2.2 }}>
                {paras.map((p, i) => <p key={i}>{tashkeel ? p : stripTashkeel(p)}</p>)}
              </div>
              <a className="underline underline-offset-4" style={{ color: "var(--muted)" }} href={s.url} target="_blank" rel="noopener noreferrer">{cite(s)}</a>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
