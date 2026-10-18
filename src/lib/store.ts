import type { Era } from "./stations";
// Mutable render state read each frame by the 3D stage (no React re-renders).
export const stage = {
  mode: "field" as "field" | "map",
  era: "dawn" as Era,
  route: { pts: [] as [number, number][], progress: 0, id: 0 },
  hero: 1, // 1 at top → 0 after hero
};
let active = 0;
const subs = new Set<() => void>();
export const activeStore = {
  get: () => active,
  set(v: number) { if (v !== active) { active = v; subs.forEach((f) => f()); } },
  sub(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};
