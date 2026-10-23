import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppUser = { id: string; email: string; name?: string } | null;

interface AppState {
  user: AppUser;
  setUser: (u: AppUser) => void;
  /** station currently in view on the journey screen (used as default AI context, like the website) */
  activeStation: number;
  setActiveStation: (id: number) => void;
}
export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeStation: 0,
  setActiveStation: (activeStation) => set({ activeStation }),
}));

/** Per-device reading preferences + bookmarks (the website's reader keeps these in component state). */
interface ReaderState {
  size: number; // rem-like scale, 1.15 .. 2.2 (same range as the website)
  tashkeel: boolean;
  bookmarks: number[];
  setSize: (n: number) => void;
  setTashkeel: (v: boolean) => void;
  toggleBookmark: (id: number) => boolean; // returns new state
}
export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      size: 1.5,
      tashkeel: true,
      bookmarks: [],
      setSize: (size) => set({ size: Math.min(2.2, Math.max(1.15, Math.round(size * 100) / 100)) }),
      setTashkeel: (tashkeel) => set({ tashkeel }),
      toggleBookmark: (id) => {
        const has = get().bookmarks.includes(id);
        set({ bookmarks: has ? get().bookmarks.filter((x) => x !== id) : [...get().bookmarks, id] });
        return !has;
      },
    }),
    { name: "rihla_reader_v1", storage: createJSONStorage(() => AsyncStorage) }
  )
);
