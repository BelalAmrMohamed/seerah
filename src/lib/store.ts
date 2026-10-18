import { create } from "zustand";
import type { Era } from "./stations";

/* ------------------------------------------------------------------ */
/* Mutable ref for per-frame 3D reads (no React re-renders).          */
/* The Three.js <Stage> reads this object every frame via useFrame.   */
/* ------------------------------------------------------------------ */
export const stageRef = {
  mode: "field" as "field" | "map",
  era: "dawn" as Era,
  route: { pts: [] as [number, number][], progress: 0, id: 0 },
  hero: 1, // 1 at top of page → 0 after hero scrolls away
};

/* ------------------------------------------------------------------ */
/* Zustand store — drives React UI.                                   */
/* ------------------------------------------------------------------ */
interface AppState {
  // Active station (scroll-driven)
  activeStation: number;
  setActiveStation: (id: number) => void;

  // Reading drawer
  readingDrawerStationId: number | null;
  openReadingDrawer: (id: number) => void;
  closeReadingDrawer: () => void;

  // AI chat
  aiChatOpen: boolean;
  toggleAiChat: () => void;
  setAiChatOpen: (v: boolean) => void;

  // User (set by AuthProvider after session check)
  user: { id: string; email: string; name?: string; avatarUrl?: string } | null;
  setUser: (u: AppState["user"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeStation: 0,
  setActiveStation: (id) => set({ activeStation: id }),

  readingDrawerStationId: null,
  openReadingDrawer: (id) => set({ readingDrawerStationId: id }),
  closeReadingDrawer: () => set({ readingDrawerStationId: null }),

  aiChatOpen: false,
  toggleAiChat: () => set((s) => ({ aiChatOpen: !s.aiChatOpen })),
  setAiChatOpen: (v) => set({ aiChatOpen: v }),

  user: null,
  setUser: (u) => set({ user: u }),
}));

/* ------------------------------------------------------------------ */
/* Legacy compatibility — keep the old subscriptions working for the  */
/* TimelineRail until we migrate it to Zustand hooks.                 */
/* ------------------------------------------------------------------ */
let _active = 0;
const _subs = new Set<() => void>();
export const activeStore = {
  get: () => _active,
  set(v: number) {
    if (v !== _active) {
      _active = v;
      useAppStore.getState().setActiveStation(v);
      _subs.forEach((f) => f());
    }
  },
  sub(f: () => void) {
    _subs.add(f);
    return () => { _subs.delete(f); };
  },
};

/* Alias used by effects.ts — maps to stageRef for backward compat */
export const stage = stageRef;
