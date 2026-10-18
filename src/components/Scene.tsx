"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import type { Station } from "@/data/types";
import { sceneEffect, variant, type Effect } from "@/config/scenes";
import { mountActive, mountEffect } from "@/lib/effects";
import { reduced } from "@/lib/scroll";
import { ar, arYear, cite, eraOf, sentences } from "@/lib/stations";
import { geo } from "@/data/geo";
import Magnetic from "./Magnetic";

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

function Intro({ s, compact, center, noSub }: { s: Station; compact?: boolean; center?: boolean; noSub?: boolean }) {
  return (
    <div className={`wrap grid gap-5 ${center ? "justify-items-center text-center" : ""}`}>
      <div className="flex items-end gap-5" style={{ color: "var(--era)" }}>
        {!compact && <span className="num" aria-hidden>{ar(s.id)}</span>}
        <div className="pb-2 leading-snug">
          <div className="text-2xl">{arYear(s.year)}</div>
          <div className="text-lg" style={{ color: "var(--muted)" }}>{ar(s.hijriYear)}</div>
        </div>
      </div>
      <h2 data-title className="title" style={compact ? { fontSize: "clamp(1.7rem,3.4vw,2.8rem)" } : undefined}>{s.title}</h2>
      {!compact && !noSub && <p className="sub">{s.subtitle}</p>}
      <p className="meta"><PinIcon />{s.location}</p>
    </div>
  );
}

const Quote = ({ s, words, big }: { s: Station; words?: boolean; big?: boolean }) => (
  <figure className="grid gap-4">
    <blockquote className="font-text" style={{ fontSize: big ? "clamp(1.6rem,3.6vw,2.9rem)" : "clamp(1.4rem,2.6vw,2rem)", lineHeight: 2, maxWidth: "34ch", textWrap: "balance" }}>
      «{words ? s.quote.split(/\s+/).map((w, i) => <span key={i} data-w>{w} </span>) : s.quote}»
    </blockquote>
    <figcaption style={{ color: "var(--muted)", fontSize: "1rem" }}>
      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line)] underline-offset-4 hover:text-[color:var(--era)]">{cite(s)}</a>
    </figcaption>
  </figure>
);

const Chips = ({ s }: { s: Station }) => (
  <ul className="flex flex-wrap gap-2" aria-label="شخصيات المحطة">{s.keyFigures.map((f) => <li key={f} className="chip">{f}</li>)}</ul>
);
const Sig = ({ s }: { s: Station }) => (
  <p className="max-w-[44ch] border-s-2 ps-5" style={{ borderColor: "var(--era)", lineHeight: 2, color: "var(--muted)" }}>
    <strong style={{ color: "var(--era)" }}>الدلالة: </strong>{s.significance}
  </p>
);
const ReadBtn = ({ s }: { s: Station }) => (
  <Magnetic>
    <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("rihla:read", { detail: s.id }))}>اقرأ نص ابن هشام</button>
  </Magnetic>
);

const dune = ["M0 260 C240 160 420 300 720 210 S1200 120 1440 220 V400 H0Z", "M0 300 C300 220 520 330 820 270 S1240 210 1440 280 V400 H0Z",
  "M0 340 C260 290 560 380 900 320 S1300 290 1440 330 V400 H0Z", "M0 372 C320 340 640 396 980 360 S1340 346 1440 366 V400 H0Z"];
const Dunes = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {dune.map((d, i) => (
      <div key={i} data-layer className="absolute inset-x-0 bottom-[-12%] h-[70%]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full"><path d={d} fill="var(--era)" fillOpacity={0.07 + i * 0.07} /></svg>
      </div>
    ))}
  </div>
);

export default function Scene({ s }: { s: Station }) {
  const ref = useRef<HTMLElement>(null);
  const effect: Effect = sceneEffect[s.id];
  const v = variant(s.id);

  useEffect(() => {
    const sec = ref.current!;
    const ctx = gsap.context(() => { mountActive(sec, s); if (!reduced()) mountEffect(sec, s, effect, variant(s.id)); }, sec);
    return () => ctx.revert();
  }, [s, effect]);

  const pts = geo[s.id] ?? [];
  let top: ReactNode;
  switch (effect) {
    case "iris":
      top = (
        <div data-pin className="pin">
          <div data-iris className="iris" style={{ clipPath: `circle(0% at ${v.x}% ${v.y}%)` }} />
          <Intro s={s} />
        </div>);
      break;
    case "parallax":
      top = <div data-a className="pin"><Dunes /><Intro s={s} /></div>; break;
    case "quote":
      top = (
        <div data-pin className="pin">
          <div className="wrap grid gap-8"><Intro s={s} compact noSub /><Quote s={s} words big /></div>
        </div>); break;
    case "figures":
      top = (
        <>
          <div className="pin"><Intro s={s} /></div>
          <div data-pin className="pin">
            <div className="wrap mb-8"><p className="meta">شخصيات المحطة</p></div>
            <div data-track className="flex w-max gap-6" style={{ paddingInline: "clamp(1.25rem,6vw,4.5rem)" }}>
              {s.keyFigures.map((f) => (
                <div key={f} data-fig className="card grid min-h-[16rem] min-w-[78vw] content-between md:min-w-[30vw]">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--era)" strokeWidth="1.4" aria-hidden><path d="M12 3l2.4 5.6L20 9.3l-4.2 3.9L17 19l-5-3-5 3 1.2-5.8L4 9.3l5.6-.7z" /></svg>
                  <span className="font-display text-3xl leading-[1.7] md:text-4xl">{f}</span>
                </div>))}
            </div>
          </div>
        </>); break;
    case "route":
      top = (
        <div data-pin className="pin !items-end md:!items-center">
          <div className="wrap grid">
            <div className="grid max-w-md gap-5 rounded-3xl border p-6 md:p-8" style={{ background: "var(--panel)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
              <Intro s={s} compact noSub />
              <ul className="grid gap-3 ps-1" aria-label="محطات الطريق">
                {pts.map((p) => <li key={p.n} data-wp className="flex items-center gap-3" style={{ color: "var(--muted)" }}><span className="hud-dot" />{p.n}</li>)}
              </ul>
            </div>
          </div>
        </div>); break;
    case "curtain":
      top = (
        <div data-pin className="pin">
          <Intro s={s} />
          <div data-cl className="curtain left-0" /><div data-cr className="curtain right-0" />
        </div>); break;
    case "zoom":
      top = (
        <div data-pin className="pin">
          <div data-flash className="absolute inset-0 opacity-0" style={{ background: "var(--era)" }} aria-hidden />
          <Intro s={s} compact center />
        </div>); break;
    case "wash":
      top = (
        <div data-pin className="pin">
          <div data-wash className="absolute inset-0" style={{ background: "var(--wash)" }} aria-hidden />
          <div className="wrap relative grid gap-4">
            <div className="flex items-baseline gap-3" style={{ color: "var(--era)" }} aria-hidden>
              <span data-count className="num !text-[clamp(4rem,16vw,11rem)]">{ar(571)}</span><span className="text-3xl">م</span>
            </div>
            <Intro s={s} compact />
          </div>
        </div>); break;
    default: // ink, stack
      top = <div className="pin"><Intro s={s} /></div>;
  }

  const lead = effect === "quote" || effect === "route" || effect === "zoom";
  const sticky = (i: number): CSSProperties => ({ position: "sticky", top: `calc(5.5rem + ${i * 1.3}rem)`, marginBottom: "4rem" });
  const reading =
    effect === "stack" ? (
      <div className="wrap pb-24 pt-8 md:pb-40">
        <div data-card className="card" style={sticky(0)}><p className="body-text">{s.description}</p></div>
        <div data-card className="card" style={sticky(1)}><Sig s={s} /></div>
        <div data-card className="card" style={sticky(2)}><Quote s={s} /></div>
        <div className="mt-8 grid gap-6"><Chips s={s} /><div><ReadBtn s={s} /></div></div>
      </div>
    ) : (
      <div className="wrap grid gap-14 py-20 md:py-32">
        {lead && <p className="sub">{s.subtitle}</p>}
        <p className="body-text">{s.description}</p>
        {effect === "ink" && (
          <div className="grid max-w-[40ch] gap-4" style={{ fontSize: "clamp(1.35rem,2.4vw,1.7rem)", lineHeight: 2.2 }}>
            {sentences(s.bookContent).map((t, i) => <span key={i} data-ink className="block">{t}</span>)}
          </div>)}
        {effect !== "quote" && effect !== "ink" && <Quote s={s} />}
        {effect !== "figures" && <Chips s={s} />}
        <Sig s={s} />
        <div><ReadBtn s={s} /></div>
      </div>
    );

  return (
    <section ref={ref} id={`s-${s.id}`} data-era={eraOf(s.category)} data-effect={effect} aria-label={s.title} className="relative">
      {top}
      {reading}
    </section>
  );
}
