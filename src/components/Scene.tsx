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

/* ─── Architectural Double Doors (أبواب الصرح الشريف) ─── */
const BrassStud = ({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <circle r={r + 1.5} fill="#1a0e05" opacity="0.6" cy="1.5" />
    <circle r={r} fill="url(#doorGoldDark)" stroke="#3a2205" strokeWidth="0.8" />
    <circle r={r - 1.5} fill="url(#doorGold)" />
    <circle cx={-r * 0.25} cy={-r * 0.25} r={r * 0.3} fill="#fffdf2" fillOpacity="0.9" />
  </g>
);

/* Heavy 3D Cast Brass Door Knocker (حلقة باب إسلامية متقنة) */
const DoorKnocker = ({ cx, cy }: { cx: number; cy: number }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    {/* Ambient drop shadow of backplate */}
    <circle cx="0" cy="8" r="48" fill="#000" opacity="0.45" filter="blur(4px)" />
    
    {/* Circular Backplate (الصفيحة النحاسية المثبتة) */}
    <circle r="46" fill="url(#doorGoldDark)" stroke="#301b04" strokeWidth="1.5" />
    <circle r="42" fill="url(#doorGold)" />
    <circle r="36" fill="url(#doorGoldDark)" stroke="#ffd778" strokeWidth="0.8" />
    <circle r="30" fill="url(#doorGold)" />
    <circle r="22" fill="#201107" stroke="#ffd778" strokeWidth="1" />
    
    {/* Center Boss/Mount */}
    <circle r="14" fill="url(#doorGold)" stroke="#4a2e07" strokeWidth="1" />
    <circle cx="-3" cy="-3" r="4" fill="#fffef5" opacity="0.9" />

    {/* Hanging Ring Shadow */}
    <ellipse cx="0" cy="72" rx="34" ry="42" fill="none" stroke="#000" strokeWidth="13" opacity="0.45" />

    {/* The Heavy Brass Ring (حلقة الباب المتدلية) */}
    <ellipse
      cx="0"
      cy="68"
      rx="32"
      ry="40"
      fill="none"
      stroke="url(#doorGoldDark)"
      strokeWidth="13"
      strokeLinecap="round"
    />
    <ellipse
      cx="0"
      cy="68"
      rx="32"
      ry="40"
      fill="none"
      stroke="url(#doorGold)"
      strokeWidth="9"
      strokeLinecap="round"
    />
    {/* Ring inner specular highlight */}
    <path
      d="M -22 68 A 32 40 0 0 1 22 68"
      fill="none"
      stroke="#fffbe8"
      strokeWidth="2.5"
      opacity="0.85"
      strokeLinecap="round"
    />
  </g>
);

const DoorPanelLeft = () => (
  <div className="relative h-full w-full overflow-hidden" aria-hidden>
    <svg viewBox="0 0 500 1000" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="doorGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff6d1" />
          <stop offset="25%" stopColor="#e8bd54" />
          <stop offset="50%" stopColor="#bd8924" />
          <stop offset="75%" stopColor="#fad77b" />
          <stop offset="100%" stopColor="#87560d" />
        </linearGradient>
        <linearGradient id="doorGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b88422" />
          <stop offset="50%" stopColor="#6e470a" />
          <stop offset="100%" stopColor="#3b2203" />
        </linearGradient>
        <linearGradient id="woodBaseL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c170b" />
          <stop offset="50%" stopColor="#1f0f06" />
          <stop offset="100%" stopColor="#140903" />
        </linearGradient>
        <linearGradient id="woodNicheL" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#180b04" />
          <stop offset="60%" stopColor="#241208" />
          <stop offset="100%" stopColor="#120702" />
        </linearGradient>
      </defs>

      {/* Main Solid Teak Background */}
      <rect x="0" y="0" width="500" height="1000" fill="url(#woodBaseL)" />

      {/* Outer Door Frame / Stiles & Rails */}
      <rect x="0" y="0" width="36" height="1000" fill="url(#doorGold)" stroke="#4a2e06" strokeWidth="1" />
      <rect x="0" y="0" width="500" height="24" fill="url(#doorGold)" stroke="#4a2e06" strokeWidth="1" />
      <rect x="0" y="976" width="500" height="24" fill="url(#doorGold)" stroke="#4a2e06" strokeWidth="1" />

      {/* Heavy Exterior Hinge Plates on Left Edge */}
      {[130, 490, 850].map((hy) => (
        <g key={hy} transform={`translate(4, ${hy})`}>
          <rect x="0" y="0" width="28" height="60" rx="3" fill="url(#doorGoldDark)" stroke="#2b1704" strokeWidth="1.2" />
          <rect x="3" y="4" width="22" height="52" rx="2" fill="url(#doorGold)" />
          <circle cx="14" cy="14" r="3.5" fill="#2b1704" />
          <circle cx="14" cy="46" r="3.5" fill="#2b1704" />
          <circle cx="13" cy="13" r="1.5" fill="#fff" opacity="0.8" />
          <circle cx="13" cy="45" r="1.5" fill="#fff" opacity="0.8" />
        </g>
      ))}

      {/* ── ZONE 1: UPPER CALLIGRAPHY FRIEZE ── */}
      <g transform="translate(48, 38)">
        <rect x="0" y="0" width="436" height="110" rx="4" fill="#140903" stroke="url(#doorGold)" strokeWidth="2" />
        <rect x="6" y="6" width="424" height="98" rx="2" fill="none" stroke="url(#doorGoldDark)" strokeWidth="1" strokeDasharray="6 3" />
        
        {/* Crystal Clear Calligraphy */}
        <text
          x="218"
          y="68"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="42"
          fill="#fffcf0"
          stroke="#422906"
          strokeWidth="0.8"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" }}
        >
          آمِنِينَ
        </text>

        {/* Framing Studs */}
        <BrassStud cx={22} cy={55} r={5} />
        <BrassStud cx={414} cy={55} r={5} />
      </g>

      {/* Horizontal Divider Rail */}
      <rect x="36" y="158" width="464" height="20" fill="url(#doorGold)" stroke="#422906" strokeWidth="0.8" />
      {[70, 150, 230, 310, 390, 465].map((rx) => (
        <BrassStud key={rx} cx={rx} cy={168} r={4.5} />
      ))}

      {/* ── ZONE 2: MAIN ARBITECTURAL ARCHED NICHE ── */}
      {/* Outer recessed field */}
      <rect x="48" y="190" width="436" height="630" rx="6" fill="#160a03" stroke="#3b1f07" strokeWidth="2" />

      {/* The Islamic Moorish Arch (قوس المحراب) */}
      <path
        d="M 80 790 L 80 430 C 80 300, 160 215, 266 215 C 372 215, 452 300, 452 430 L 452 790 Z"
        fill="url(#woodNicheL)"
        stroke="url(#doorGold)"
        strokeWidth="3.5"
      />
      {/* Arch Inner Chamfer Line */}
      <path
        d="M 92 780 L 92 435 C 92 315, 170 232, 266 232 C 362 232, 440 315, 440 435 L 440 780"
        fill="none"
        stroke="url(#doorGoldDark)"
        strokeWidth="1.2"
        strokeDasharray="8 4"
      />

      {/* Cast Brass Door Knocker */}
      <DoorKnocker cx={266} cy={350} />

      {/* ── CENTRAL INSCRIPTION TABLET (CRYSTAL CLEAR) ── */}
      <g transform="translate(86, 520)">
        {/* Tablet Drop Shadow */}
        <rect x="0" y="4" width="360" height="150" rx="10" fill="#000" opacity="0.6" filter="blur(4px)" />
        {/* Tablet Outer Gilded Frame */}
        <rect x="0" y="0" width="360" height="150" rx="8" fill="#100602" stroke="url(#doorGold)" strokeWidth="2.5" />
        {/* Inner Gold Inset Line */}
        <rect x="7" y="7" width="346" height="136" rx="5" fill="#170a04" stroke="url(#doorGoldDark)" strokeWidth="1.2" />

        {/* Sacred Calligraphy: مُحَمَّدٌ رَسُولُ اللَّه */}
        <text
          x="180"
          y="80"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="44"
          fill="#fffbe8"
          stroke="#422906"
          strokeWidth="0.8"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}
        >
          مُحَمَّدٌ رَسُولُ اللَّه
        </text>

        {/* Small Honorific Below */}
        <text
          x="180"
          y="118"
          textAnchor="middle"
          fontFamily="'Amiri', serif"
          fontSize="24"
          fill="#fad77b"
          opacity="0.9"
        >
          ﷺ
        </text>

        {/* Tablet Corner Studs */}
        <BrassStud cx={20} cy={20} r={4} />
        <BrassStud cx={340} cy={20} r={4} />
        <BrassStud cx={20} cy={130} r={4} />
        <BrassStud cx={340} cy={130} r={4} />
      </g>

      {/* Lower Decorative Panel Studs */}
      <BrassStud cx={130} cy={740} r={5} />
      <BrassStud cx={266} cy={740} r={5} />
      <BrassStud cx={400} cy={740} r={5} />

      {/* Horizontal Divider Rail Above Kickplate */}
      <rect x="36" y="830" width="464" height="20" fill="url(#doorGold)" stroke="#422906" strokeWidth="0.8" />
      {[70, 150, 230, 310, 390, 465].map((rx) => (
        <BrassStud key={rx} cx={rx} cy={840} r={4.5} />
      ))}

      {/* ── ZONE 3: LOWER BASE / KICKPLATE ── */}
      <rect x="48" y="860" width="436" height="106" fill="url(#doorGoldDark)" stroke="#301b04" strokeWidth="1.5" />
      <rect x="54" y="866" width="424" height="94" fill="url(#doorGold)" />
      
      {/* Heavy Baseplate Rivets */}
      {[90, 160, 230, 300, 370, 440].map((bx) => (
        <g key={bx}>
          <BrassStud cx={bx} cy={892} r={7} />
          <BrassStud cx={bx} cy={932} r={7} />
        </g>
      ))}

      {/* Meeting Edge Seam Highlight on Right Edge */}
      <line x1="499" y1="0" x2="499" y2="1000" stroke="#fceeb5" strokeWidth="1" strokeOpacity="0.7" />
    </svg>
  </div>
);

const DoorPanelRight = () => (
  <div className="relative h-full w-full overflow-hidden" aria-hidden>
    <svg viewBox="0 0 500 1000" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="doorGoldR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff6d1" />
          <stop offset="25%" stopColor="#e8bd54" />
          <stop offset="50%" stopColor="#bd8924" />
          <stop offset="75%" stopColor="#fad77b" />
          <stop offset="100%" stopColor="#87560d" />
        </linearGradient>
        <linearGradient id="doorGoldDarkR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b88422" />
          <stop offset="50%" stopColor="#6e470a" />
          <stop offset="100%" stopColor="#3b2203" />
        </linearGradient>
        <linearGradient id="woodBaseR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2c170b" />
          <stop offset="50%" stopColor="#1f0f06" />
          <stop offset="100%" stopColor="#140903" />
        </linearGradient>
        <linearGradient id="woodNicheR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#180b04" />
          <stop offset="60%" stopColor="#241208" />
          <stop offset="100%" stopColor="#120702" />
        </linearGradient>
      </defs>

      {/* Main Solid Teak Background */}
      <rect x="0" y="0" width="500" height="1000" fill="url(#woodBaseR)" />

      {/* Outer Door Frame / Stiles & Rails */}
      <rect x="464" y="0" width="36" height="1000" fill="url(#doorGoldR)" stroke="#4a2e06" strokeWidth="1" />
      <rect x="0" y="0" width="500" height="24" fill="url(#doorGoldR)" stroke="#4a2e06" strokeWidth="1" />
      <rect x="0" y="976" width="500" height="24" fill="url(#doorGoldR)" stroke="#4a2e06" strokeWidth="1" />

      {/* Heavy Exterior Hinge Plates on Right Edge */}
      {[130, 490, 850].map((hy) => (
        <g key={hy} transform={`translate(468, ${hy})`}>
          <rect x="0" y="0" width="28" height="60" rx="3" fill="url(#doorGoldDarkR)" stroke="#2b1704" strokeWidth="1.2" />
          <rect x="3" y="4" width="22" height="52" rx="2" fill="url(#doorGoldR)" />
          <circle cx="14" cy="14" r="3.5" fill="#2b1704" />
          <circle cx="14" cy="46" r="3.5" fill="#2b1704" />
          <circle cx="15" cy="13" r="1.5" fill="#fff" opacity="0.8" />
          <circle cx="15" cy="45" r="1.5" fill="#fff" opacity="0.8" />
        </g>
      ))}

      {/* ── ZONE 1: UPPER CALLIGRAPHY FRIEZE ── */}
      <g transform="translate(16, 38)">
        <rect x="0" y="0" width="436" height="110" rx="4" fill="#140903" stroke="url(#doorGoldR)" strokeWidth="2" />
        <rect x="6" y="6" width="424" height="98" rx="2" fill="none" stroke="url(#doorGoldDarkR)" strokeWidth="1" strokeDasharray="6 3" />
        
        {/* Crystal Clear Calligraphy */}
        <text
          x="218"
          y="68"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="40"
          fill="#fffcf0"
          stroke="#422906"
          strokeWidth="0.8"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" }}
        >
          ادْخُلُوهَا بِسَلَامٍ
        </text>

        {/* Framing Studs */}
        <BrassStud cx={22} cy={55} r={5} />
        <BrassStud cx={414} cy={55} r={5} />
      </g>

      {/* Horizontal Divider Rail */}
      <rect x="0" y="158" width="464" height="20" fill="url(#doorGoldR)" stroke="#422906" strokeWidth="0.8" />
      {[35, 110, 190, 270, 350, 430].map((rx) => (
        <BrassStud key={rx} cx={rx} cy={168} r={4.5} />
      ))}

      {/* ── ZONE 2: MAIN ARCHITECTURAL ARCHED NICHE ── */}
      {/* Outer recessed field */}
      <rect x="16" y="190" width="436" height="630" rx="6" fill="#160a03" stroke="#3b1f07" strokeWidth="2" />

      {/* The Islamic Moorish Arch (قوس المحراب) */}
      <path
        d="M 48 790 L 48 430 C 48 300, 128 215, 234 215 C 340 215, 420 300, 420 430 L 420 790 Z"
        fill="url(#woodNicheR)"
        stroke="url(#doorGoldR)"
        strokeWidth="3.5"
      />
      {/* Arch Inner Chamfer Line */}
      <path
        d="M 60 780 L 60 435 C 60 315, 138 232, 234 232 C 330 232, 408 315, 408 435 L 408 780"
        fill="none"
        stroke="url(#doorGoldDarkR)"
        strokeWidth="1.2"
        strokeDasharray="8 4"
      />

      {/* Cast Brass Door Knocker */}
      <DoorKnocker cx={234} cy={350} />

      {/* ── CENTRAL INSCRIPTION TABLET (CRYSTAL CLEAR) ── */}
      <g transform="translate(54, 520)">
        {/* Tablet Drop Shadow */}
        <rect x="0" y="4" width="360" height="150" rx="10" fill="#000" opacity="0.6" filter="blur(4px)" />
        {/* Tablet Outer Gilded Frame */}
        <rect x="0" y="0" width="360" height="150" rx="8" fill="#100602" stroke="url(#doorGoldR)" strokeWidth="2.5" />
        {/* Inner Gold Inset Line */}
        <rect x="7" y="7" width="346" height="136" rx="5" fill="#170a04" stroke="url(#doorGoldDarkR)" strokeWidth="1.2" />

        {/* Sacred Calligraphy: لَا إِلٰهَ إِلَّا اللَّه */}
        <text
          x="180"
          y="80"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="44"
          fill="#fffbe8"
          stroke="#422906"
          strokeWidth="0.8"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}
        >
          لَا إِلٰهَ إِلَّا اللَّه
        </text>

        {/* Subtle Decorative Underline Accent */}
        <path
          d="M 120 110 Q 180 120, 240 110"
          fill="none"
          stroke="url(#doorGoldR)"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Tablet Corner Studs */}
        <BrassStud cx={20} cy={20} r={4} />
        <BrassStud cx={340} cy={20} r={4} />
        <BrassStud cx={20} cy={130} r={4} />
        <BrassStud cx={340} cy={130} r={4} />
      </g>

      {/* Lower Decorative Panel Studs */}
      <BrassStud cx={100} cy={740} r={5} />
      <BrassStud cx={234} cy={740} r={5} />
      <BrassStud cx={368} cy={740} r={5} />

      {/* Horizontal Divider Rail Above Kickplate */}
      <rect x="0" y="830" width="464" height="20" fill="url(#doorGoldR)" stroke="#422906" strokeWidth="0.8" />
      {[35, 110, 190, 270, 350, 430].map((rx) => (
        <BrassStud key={rx} cx={rx} cy={840} r={4.5} />
      ))}

      {/* ── ZONE 3: LOWER BASE / KICKPLATE ── */}
      <rect x="16" y="860" width="436" height="106" fill="url(#doorGoldDarkR)" stroke="#301b04" strokeWidth="1.5" />
      <rect x="22" y="866" width="424" height="94" fill="url(#doorGoldR)" />
      
      {/* Heavy Baseplate Rivets */}
      {[60, 130, 200, 270, 340, 410].map((bx) => (
        <g key={bx}>
          <BrassStud cx={bx} cy={892} r={7} />
          <BrassStud cx={bx} cy={932} r={7} />
        </g>
      ))}

      {/* ── VERTICAL ASTRAGAL / CENTER COVER STRIP (القائم الأوسط) ── */}
      {/* Solid brass strip on the left meeting edge */}
      <rect x="0" y="0" width="16" height="1000" fill="url(#doorGoldDarkR)" stroke="#3a2205" strokeWidth="0.8" />
      <rect x="2" y="0" width="12" height="1000" fill="url(#doorGoldR)" />
      {/* Vertical row of rivets along the center strip */}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx={8} cy={40 + i * 54} r={3} fill="#301a04" />
      ))}
    </svg>
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

    /* ─────────────── NEW EFFECTS ─────────────── */

    case "door":
      top = (
        <div data-pin className="pin">
          <div data-door-glow className="door-glow" />
          <div className="door-container">
            <div data-door-l className="door-panel door-panel--left"><DoorPanelLeft /></div>
            <div data-door-r className="door-panel door-panel--right"><DoorPanelRight /></div>
          </div>
          <div data-door-content style={{ opacity: 0 }}>
            <Intro s={s} center />
          </div>
        </div>); break;

    case "rotate":
      top = (
        <div data-pin className="pin">
          <div data-rotate-wrap className="wrap grid gap-5 justify-items-center text-center" style={{ transformOrigin: "center center" }}>
            <Intro s={s} center />
          </div>
        </div>); break;

    case "horizon":
      top = (
        <div data-pin className="pin">
          <div data-horizon-bg className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(to top, var(--wash), transparent 60%)" }} aria-hidden />
          <div data-horizon-line className="horizon-line" />
          <div data-horizon-content style={{ opacity: 0, transform: "translateX(-60px)" }}>
            <Intro s={s} />
          </div>
        </div>); break;

    case "split":
      top = (
        <div data-pin className="pin">
          <div data-book-l className="book-page book-page--left" />
          <div data-book-r className="book-page book-page--right" />
          <div data-book-spine className="book-spine" />
          <div data-split-content style={{ opacity: 0, position: "relative", zIndex: 10 }}>
            <div className="wrap grid gap-8">
              <Intro s={s} compact center />
              <Quote s={s} words big />
            </div>
          </div>
        </div>); break;

    case "morph":
      top = (
        <div data-pin className="pin">
          <div className="wrap grid gap-6 justify-items-center text-center">
            <span data-morph-num className="morph-number" aria-hidden>{ar(s.id > 1 ? s.id - 1 : s.id)}</span>
            <div data-morph-content style={{ opacity: 0 }}>
              <Intro s={s} compact center />
            </div>
          </div>
        </div>); break;

    case "constellation":
      top = (
        <div data-pin className="pin">
          <div data-constellation className="constellation-canvas" />
          <div data-constellation-content style={{ opacity: 0 }}>
            <Intro s={s} center />
          </div>
        </div>); break;

    default: // ink, stack
      top = <div className="pin"><Intro s={s} /></div>;
  }

  const lead = effect === "quote" || effect === "route" || effect === "zoom" || effect === "door" || effect === "split" || effect === "constellation";
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
        {effect !== "quote" && effect !== "ink" && effect !== "split" && <Quote s={s} />}
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
