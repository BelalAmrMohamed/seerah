// Ported from the website (src/lib/stations.ts) — same logic, data source is the bundled
// stations.json, which is the offline cache of all 30 stations. No network needed to read.
import raw from "@/data/stations.json";
import type { Station } from "@/data/types";

export const stations = raw as Station[];
export type Era = "dawn" | "night" | "hijra" | "madina" | "victory" | "farewell";
export function eraOf(category: string): Era {
  if (/توديع|الوفاة/.test(category)) return "farewell";
  if (/الفتح الأعظم|عام الوفود/.test(category)) return "victory";
  if (category.startsWith("الهجرة")) return "hijra";
  if (category.includes("المولد والنشأة")) return "dawn";
  if (category.startsWith("العهد المكي")) return "night";
  return "madina";
}
export const sortYear = (y: string) => parseInt(y.match(/\d+/)?.[0] ?? "0", 10);
const D = "٠١٢٣٤٥٦٧٨٩";
export const ar = (n: number | string) => String(n).replace(/\d/g, (d) => D[+d]);
export const arYear = (y: string) => ar(y).replace(/-/g, "–");
export const stripTashkeel = (s: string) => s.replace(/[ً-ٰٟـ]/g, "");
export const normalize = (s: string) =>
  stripTashkeel(s).replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
export const eraHex: Record<Era, { dark: string; light: string }> = {
  dawn: { dark: "#E6B85C", light: "#8F6410" },
  night: { dark: "#8E9BFF", light: "#2E3DA6" },
  hijra: { dark: "#9BE8C0", light: "#0C6F4C" },
  madina: { dark: "#3FC9A0", light: "#0B7A5E" },
  victory: { dark: "#FFE9A8", light: "#8A6A00" },
  farewell: { dark: "#B9A4FF", light: "#5B3FB5" },
};
// "wash" colours from the website's globals.css ([data-era] --w-d / --w-l)
export const eraWash: Record<Era, { dark: string; light: string }> = {
  dawn: { dark: "#2e2114", light: "#ecdcb9" },
  night: { dark: "#151a45", light: "#cfd6f3" },
  hijra: { dark: "#0f2a26", light: "#cfe9de" },
  madina: { dark: "#0b2b2a", light: "#c6e6dc" },
  victory: { dark: "#33290f", light: "#f2e6b8" },
  farewell: { dark: "#1b1440", light: "#ddd3f5" },
};
export const eraNames: Record<Era, string> = {
  dawn: "فجر الرسالة",
  night: "العهد المكي",
  hijra: "طريق الهجرة",
  madina: "العهد المدني",
  victory: "الفتح والتمكين",
  farewell: "حجة الوداع",
};
export const eraOrder: Era[] = ["dawn", "night", "hijra", "madina", "victory", "farewell"];
export const sentences = (t: string) => t.split(/(?<=[.…])\s+/).filter(Boolean);
export const cite = (s: { volume: number; page: number }) => `ابن هشام، السيرة النبوية — الجزء ${ar(s.volume)}، صفحة ${ar(s.page)}`;

/** Paragraphs of 3 sentences each — same grouping as the website's station/reader views. */
export function paragraphs(text: string): string[] {
  const sn = sentences(text);
  const out: string[] = [];
  for (let i = 0; i < sn.length; i += 3) out.push(sn.slice(i, i + 3).join(" "));
  return out;
}
export const stationById = (id: number) => stations.find((s) => s.id === id);
