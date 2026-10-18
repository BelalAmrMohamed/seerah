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

/* ─── The Iconic Doors of the Prophet's Mosque (أبواب المسجد النبوي الشريف) ─── */
const BrassRivet = ({ cx, cy }: { cx: number; cy: number }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <circle r="7" fill="url(#nabawiGoldDark)" stroke="#4a300a" strokeWidth="0.8" />
    <circle r="5" fill="url(#nabawiGold)" />
    <circle cx="-1.5" cy="-1.5" r="1.5" fill="#fffbe6" fillOpacity="0.85" />
  </g>
);

const LeafBorder = ({ x, y, len, vertical = false }: { x: number; y: number; len: number; vertical?: boolean }) => {
  const count = Math.floor(len / 20);
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: count }).map((_, i) => (
        <path
          key={i}
          d={vertical
            ? `M 0 ${i * 20} C 6 ${i * 20 + 5}, 8 ${i * 20 + 10}, 0 ${i * 20 + 18} C -8 ${i * 20 + 10}, -6 ${i * 20 + 5}, 0 ${i * 20}`
            : `M ${i * 20} 0 C ${i * 20 + 5} 6, ${i * 20 + 10} 8, ${i * 20 + 18} 0 C ${i * 20 + 10} -8, ${i * 20 + 5} -6, ${i * 20} 0`
          }
          fill="url(#nabawiGold)"
          stroke="#5a3d0e"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
};

const DoorPanelLeft = () => (
  <div className="relative h-full w-full overflow-hidden" aria-hidden>
    <svg viewBox="0 0 500 1000" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="nabawiGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff2be" />
          <stop offset="25%" stopColor="#e8be5a" />
          <stop offset="50%" stopColor="#c5922c" />
          <stop offset="75%" stopColor="#fae08c" />
          <stop offset="100%" stopColor="#966714" />
        </linearGradient>
        <linearGradient id="nabawiGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c5922c" />
          <stop offset="50%" stopColor="#875b10" />
          <stop offset="100%" stopColor="#4a3006" />
        </linearGradient>
        <linearGradient id="teakBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d2615" />
          <stop offset="50%" stopColor="#28170a" />
          <stop offset="100%" stopColor="#1a0e05" />
        </linearGradient>
        {/* 45-degree diagonal woven teak slats with square brass studs at intersections */}
        <pattern id="teakLatticeLeft" width="46" height="46" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="46" height="46" fill="#2b180b" />
          <line x1="0" y1="0" x2="46" y2="0" stroke="#150a03" strokeWidth="4" />
          <line x1="0" y1="0" x2="0" y2="46" stroke="#150a03" strokeWidth="4" />
          <line x1="0" y1="23" x2="46" y2="23" stroke="#4a2c13" strokeWidth="1.2" />
          <line x1="23" y1="0" x2="23" y2="46" stroke="#4a2c13" strokeWidth="1.2" />
          {/* Square brass stud with center gold rivet */}
          <rect x="18" y="18" width="10" height="10" rx="1.5" fill="url(#nabawiGold)" stroke="#523608" strokeWidth="0.8" />
          <circle cx="23" cy="23" r="2.5" fill="#fffced" />
        </pattern>
      </defs>

      {/* Door Leaf Outer Teak & Gold Base */}
      <rect x="0" y="0" width="500" height="1000" fill="url(#teakBg)" />

      {/* Outer Polished Gold Frame (Hinge edge on left, top and bottom) */}
      <rect x="0" y="0" width="48" height="1000" fill="url(#nabawiGold)" stroke="#5c3e0a" strokeWidth="1" />
      <rect x="0" y="0" width="500" height="32" fill="url(#nabawiGold)" stroke="#5c3e0a" strokeWidth="1" />
      <rect x="0" y="968" width="500" height="32" fill="url(#nabawiGold)" stroke="#5c3e0a" strokeWidth="1" />

      {/* Outer Carved Leaf Border */}
      <LeafBorder x={24} y={34} len={930} vertical />
      <LeafBorder x={50} y={16} len={445} />
      <LeafBorder x={50} y={984} len={445} />

      {/* ── TOP HEADER BRASS FRIEZE ── */}
      <rect x="48" y="32" width="452" height="130" fill="url(#nabawiGoldDark)" stroke="#664610" strokeWidth="1.5" />
      <rect x="54" y="38" width="440" height="118" fill="url(#nabawiGold)" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Top Left Corner Medallion with "الله" */}
      <g transform="translate(108, 97)">
        <circle r="38" fill="url(#nabawiGoldDark)" stroke="#4a300a" strokeWidth="2" />
        <circle r="34" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.7" />
        <circle r="30" fill="url(#nabawiGold)" />
        {/* Calligraphic crest: لفظ الجلالة "الله" */}
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="32"
          fill="#2a1800"
          stroke="#f5d67b"
          strokeWidth="0.5"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
        >
          الله
        </text>
      </g>

      {/* Top Horizontal Calligraphy & Arabesque Frieze */}
      <g transform="translate(160, 48)">
        <rect x="0" y="0" width="335" height="98" rx="4" fill="url(#nabawiGoldDark)" stroke="#4a300a" strokeWidth="1" />
        {/* Subtle decorative lines at top and bottom of frieze only */}
        <line x1="12" y1="12" x2="323" y2="12" stroke="url(#nabawiGold)" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="12" y1="86" x2="323" y2="86" stroke="url(#nabawiGold)" strokeWidth="1.5" strokeOpacity="0.5" />
        {/* Clear, large calligraphy text */}
        <text
          x="165"
          y="60"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="34"
          fill="#fff8e0"
          stroke="#5a3d0e"
          strokeWidth="0.6"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        >
          ادْخُلُوهَا بِسَلَامٍ آمِنِينَ
        </text>
      </g>

      {/* Brass Rivet Stud Row below Top Frieze */}
      <rect x="48" y="162" width="452" height="34" fill="url(#nabawiGold)" stroke="#593b09" strokeWidth="1" />
      {[80, 140, 200, 260, 320, 380, 440, 490].map((rx) => (
        <BrassRivet key={rx} cx={rx} cy={179} />
      ))}

      {/* ── MAIN FIELD: DIAGONAL WOVEN TEAK LATTICE ── */}
      <rect x="48" y="196" width="452" height="664" fill="url(#teakLatticeLeft)" stroke="#3d2510" strokeWidth="2" />
      <rect x="54" y="202" width="440" height="652" fill="none" stroke="url(#nabawiGold)" strokeWidth="2" strokeOpacity="0.4" />

      {/* ── THE GRAND PROPHET'S MEDALLION (الشمسة النبوية الكبرى - نصف أيسر) ── */}
      {/* Centered at meeting edge: (500, 528) */}
      <g>
        {/* 8 Radiating Floral Finials / Palmettes pointing outward from left semicircle */}
        {[100, 122.5, 145, 167.5, 190, 212.5, 235, 257.5].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const rBase = 188;
          const bx = 500 + rBase * Math.cos(rad);
          const by = 528 + rBase * Math.sin(rad);
          const tipX = 500 + (rBase + 45) * Math.cos(rad);
          const tipY = 528 + (rBase + 45) * Math.sin(rad);
          const p1x = 500 + (rBase + 20) * Math.cos(rad - 0.12);
          const p1y = 528 + (rBase + 20) * Math.sin(rad - 0.12);
          const p2x = 500 + (rBase + 20) * Math.cos(rad + 0.12);
          const p2y = 528 + (rBase + 20) * Math.sin(rad + 0.12);

          return (
            <path
              key={deg}
              d={`M ${bx} ${by} Q ${p1x} ${p1y}, ${tipX} ${tipY} Q ${p2x} ${p2y}, ${bx} ${by} Z`}
              fill="url(#nabawiGold)"
              stroke="#593b09"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Outer Circular Ring (Left Semicircle: x <= 500) */}
        <path
          d="M 500 340 A 188 188 0 0 0 500 716 Z"
          fill="url(#nabawiGoldDark)"
          stroke="#5c3c0a"
          strokeWidth="3"
        />

        {/* Middle Arabesque Ring */}
        <path
          d="M 500 354 A 174 174 0 0 0 500 702 L 500 652 A 124 124 0 0 1 500 404 Z"
          fill="url(#nabawiGold)"
          stroke="#472e06"
          strokeWidth="1.5"
        />

        {/* Engraved Arabesque Vines on Middle Ring */}
        <path
          d="M 500 375 A 153 153 0 0 0 500 681"
          fill="none"
          stroke="#664610"
          strokeWidth="3.5"
          strokeDasharray="12 6"
        />

        {/* Inner Circular Golden Dome (القرص المركزي المذهب) */}
        <path
          d="M 500 410 A 118 118 0 0 0 500 646 Z"
          fill="url(#nabawiGold)"
          stroke="#4a3008"
          strokeWidth="3"
        />

        {/* Inner Dome Bevel & Ring */}
        <path
          d="M 500 424 A 104 104 0 0 0 500 632 Z"
          fill="url(#nabawiGoldDark)"
          stroke="#fff"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* The Prophet's Sacred Name Composition: "محمد رسول الله" ﷺ */}
        <g transform="translate(500, 528)">
          <path
            d="M 0 -75 A 75 75 0 0 0 0 75 Z"
            fill="url(#nabawiGold)"
            stroke="#472f07"
            strokeWidth="1.5"
          />
          {/* Left half of the circular Thuluth composition */}
          <text
            x="-18"
            y="18"
            textAnchor="middle"
            fontFamily="'Aref Ruqaa', 'Amiri', serif"
            fontWeight="bold"
            fontSize="64"
            fill="#2a1800"
            stroke="#f5d67b"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
          >
            محمد
          </text>
          <text
            x="-42"
            y="-22"
            textAnchor="middle"
            fontFamily="'Aref Ruqaa', 'Amiri', serif"
            fontWeight="bold"
            fontSize="32"
            fill="#2a1800"
            stroke="#e8be5a"
            strokeWidth="0.5"
          >
            رسول
          </text>
        </g>
      </g>

      {/* ── BOTTOM BRASS KICKPLATE ── */}
      <rect x="48" y="860" width="452" height="108" fill="url(#nabawiGold)" stroke="#593b09" strokeWidth="2" />
      <rect x="54" y="866" width="440" height="96" fill="url(#nabawiGoldDark)" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />
      <LeafBorder x={56} y={872} len={435} />

      {/* Two Horizontal Rows of Heavy Brass Rivets */}
      {[90, 160, 230, 300, 370, 440, 490].map((rx) => (
        <g key={rx}>
          <BrassRivet cx={rx} cy={902} />
          <BrassRivet cx={rx} cy={938} />
        </g>
      ))}

      {/* Meeting Edge Seam Highlight (Rightmost line) */}
      <line x1="499" y1="0" x2="499" y2="1000" stroke="#fceeb5" strokeWidth="1" strokeOpacity="0.8" />
    </svg>
  </div>
);

const DoorPanelRight = () => (
  <div className="relative h-full w-full overflow-hidden" aria-hidden>
    <svg viewBox="0 0 500 1000" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="nabawiGoldR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff2be" />
          <stop offset="25%" stopColor="#e8be5a" />
          <stop offset="50%" stopColor="#c5922c" />
          <stop offset="75%" stopColor="#fae08c" />
          <stop offset="100%" stopColor="#966714" />
        </linearGradient>
        <linearGradient id="nabawiGoldDarkR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c5922c" />
          <stop offset="50%" stopColor="#875b10" />
          <stop offset="100%" stopColor="#4a3006" />
        </linearGradient>
        <linearGradient id="teakBgR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d2615" />
          <stop offset="50%" stopColor="#28170a" />
          <stop offset="100%" stopColor="#1a0e05" />
        </linearGradient>
        {/* 45-degree diagonal woven teak slats */}
        <pattern id="teakLatticeRight" width="46" height="46" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="46" height="46" fill="#2b180b" />
          <line x1="0" y1="0" x2="46" y2="0" stroke="#150a03" strokeWidth="4" />
          <line x1="0" y1="0" x2="0" y2="46" stroke="#150a03" strokeWidth="4" />
          <line x1="0" y1="23" x2="46" y2="23" stroke="#4a2c13" strokeWidth="1.2" />
          <line x1="23" y1="0" x2="23" y2="46" stroke="#4a2c13" strokeWidth="1.2" />
          <rect x="18" y="18" width="10" height="10" rx="1.5" fill="url(#nabawiGoldR)" stroke="#523608" strokeWidth="0.8" />
          <circle cx="23" cy="23" r="2.5" fill="#fffced" />
        </pattern>
      </defs>

      {/* Door Leaf Outer Teak & Gold Base */}
      <rect x="0" y="0" width="500" height="1000" fill="url(#teakBgR)" />

      {/* Outer Polished Gold Frame (Hinge edge on right, top and bottom) */}
      <rect x="452" y="0" width="48" height="1000" fill="url(#nabawiGoldR)" stroke="#5c3e0a" strokeWidth="1" />
      <rect x="0" y="0" width="500" height="32" fill="url(#nabawiGoldR)" stroke="#5c3e0a" strokeWidth="1" />
      <rect x="0" y="968" width="500" height="32" fill="url(#nabawiGoldR)" stroke="#5c3e0a" strokeWidth="1" />

      {/* Outer Carved Leaf Border */}
      <LeafBorder x={476} y={34} len={930} vertical />
      <LeafBorder x={5} y={16} len={445} />
      <LeafBorder x={5} y={984} len={445} />

      {/* ── TOP HEADER BRASS FRIEZE ── */}
      <rect x="0" y="32" width="452" height="130" fill="url(#nabawiGoldDarkR)" stroke="#664610" strokeWidth="1.5" />
      <rect x="6" y="38" width="440" height="118" fill="url(#nabawiGoldR)" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Top Right Corner Medallion with "الله" */}
      <g transform="translate(392, 97)">
        <circle r="38" fill="url(#nabawiGoldDarkR)" stroke="#4a300a" strokeWidth="2" />
        <circle r="34" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.7" />
        <circle r="30" fill="url(#nabawiGoldR)" />
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="32"
          fill="#2a1800"
          stroke="#f5d67b"
          strokeWidth="0.5"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
        >
          الله
        </text>
      </g>

      {/* Top Horizontal Calligraphy & Arabesque Frieze */}
      <g transform="translate(5, 48)">
        <rect x="0" y="0" width="335" height="98" rx="4" fill="url(#nabawiGoldDarkR)" stroke="#4a300a" strokeWidth="1" />
        {/* Subtle decorative lines at top and bottom of frieze only */}
        <line x1="12" y1="12" x2="323" y2="12" stroke="url(#nabawiGoldR)" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="12" y1="86" x2="323" y2="86" stroke="url(#nabawiGoldR)" strokeWidth="1.5" strokeOpacity="0.5" />
        {/* Clear, large calligraphy text */}
        <text
          x="165"
          y="60"
          textAnchor="middle"
          fontFamily="'Aref Ruqaa', 'Amiri', serif"
          fontWeight="bold"
          fontSize="34"
          fill="#fff8e0"
          stroke="#5a3d0e"
          strokeWidth="0.6"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        >
          ادْخُلُوهَا بِسَلَامٍ آمِنِينَ
        </text>
      </g>

      {/* Brass Rivet Stud Row below Top Frieze */}
      <rect x="0" y="162" width="452" height="34" fill="url(#nabawiGoldR)" stroke="#593b09" strokeWidth="1" />
      {[10, 60, 120, 180, 240, 300, 360, 420].map((rx) => (
        <BrassRivet key={rx} cx={rx} cy={179} />
      ))}

      {/* ── MAIN FIELD: DIAGONAL WOVEN TEAK LATTICE ── */}
      <rect x="0" y="196" width="452" height="664" fill="url(#teakLatticeRight)" stroke="#3d2510" strokeWidth="2" />
      <rect x="6" y="202" width="440" height="652" fill="none" stroke="url(#nabawiGoldR)" strokeWidth="2" strokeOpacity="0.4" />

      {/* ── THE GRAND PROPHET'S MEDALLION (الشمسة النبوية الكبرى - نصف أيمن) ── */}
      {/* Centered at meeting edge: (0, 528) */}
      <g>
        {/* 8 Radiating Floral Finials / Palmettes pointing outward from right semicircle */}
        {[-77.5, -55, -32.5, -10, 12.5, 35, 57.5, 80].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const rBase = 188;
          const bx = 0 + rBase * Math.cos(rad);
          const by = 528 + rBase * Math.sin(rad);
          const tipX = 0 + (rBase + 45) * Math.cos(rad);
          const tipY = 528 + (rBase + 45) * Math.sin(rad);
          const p1x = 0 + (rBase + 20) * Math.cos(rad - 0.12);
          const p1y = 528 + (rBase + 20) * Math.sin(rad - 0.12);
          const p2x = 0 + (rBase + 20) * Math.cos(rad + 0.12);
          const p2y = 528 + (rBase + 20) * Math.sin(rad + 0.12);

          return (
            <path
              key={deg}
              d={`M ${bx} ${by} Q ${p1x} ${p1y}, ${tipX} ${tipY} Q ${p2x} ${p2y}, ${bx} ${by} Z`}
              fill="url(#nabawiGoldR)"
              stroke="#593b09"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Outer Circular Ring (Right Semicircle: x >= 0) */}
        <path
          d="M 0 340 A 188 188 0 0 1 0 716 Z"
          fill="url(#nabawiGoldDarkR)"
          stroke="#5c3c0a"
          strokeWidth="3"
        />

        {/* Middle Arabesque Ring */}
        <path
          d="M 0 354 A 174 174 0 0 1 0 702 L 0 652 A 124 124 0 0 0 0 404 Z"
          fill="url(#nabawiGoldR)"
          stroke="#472e06"
          strokeWidth="1.5"
        />

        {/* Engraved Arabesque Vines on Middle Ring */}
        <path
          d="M 0 375 A 153 153 0 0 1 0 681"
          fill="none"
          stroke="#664610"
          strokeWidth="3.5"
          strokeDasharray="12 6"
        />

        {/* Inner Circular Golden Dome (القرص المركزي المذهب) */}
        <path
          d="M 0 410 A 118 118 0 0 1 0 646 Z"
          fill="url(#nabawiGoldR)"
          stroke="#4a3008"
          strokeWidth="3"
        />

        {/* Inner Dome Bevel & Ring */}
        <path
          d="M 0 424 A 104 104 0 0 1 0 632 Z"
          fill="url(#nabawiGoldDarkR)"
          stroke="#fff"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* The Prophet's Sacred Name Composition: "محمد رسول الله" ﷺ */}
        <g transform="translate(0, 528)">
          <path
            d="M 0 -75 A 75 75 0 0 1 0 75 Z"
            fill="url(#nabawiGoldR)"
            stroke="#472f07"
            strokeWidth="1.5"
          />
          {/* Right half of the circular Thuluth composition */}
          <text
            x="16"
            y="18"
            textAnchor="middle"
            fontFamily="'Aref Ruqaa', 'Amiri', serif"
            fontWeight="bold"
            fontSize="64"
            fill="#2a1800"
            stroke="#f5d67b"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
          >
            محمد
          </text>
          <text
            x="40"
            y="-22"
            textAnchor="middle"
            fontFamily="'Aref Ruqaa', 'Amiri', serif"
            fontWeight="bold"
            fontSize="32"
            fill="#2a1800"
            stroke="#e8be5a"
            strokeWidth="0.5"
          >
            الله
          </text>
        </g>
      </g>

      {/* ── BOTTOM BRASS KICKPLATE ── */}
      <rect x="0" y="860" width="452" height="108" fill="url(#nabawiGoldR)" stroke="#593b09" strokeWidth="2" />
      <rect x="6" y="866" width="440" height="96" fill="url(#nabawiGoldDarkR)" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />
      <LeafBorder x={10} y={872} len={435} />

      {/* Two Horizontal Rows of Heavy Brass Rivets */}
      {[10, 60, 130, 200, 270, 340, 410].map((rx) => (
        <g key={rx}>
          <BrassRivet cx={rx} cy={902} />
          <BrassRivet cx={rx} cy={938} />
        </g>
      ))}

      {/* Meeting Edge Seam Highlight (Leftmost line) */}
      <line x1="1" y1="0" x2="1" y2="1000" stroke="#fceeb5" strokeWidth="1" strokeOpacity="0.8" />
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
