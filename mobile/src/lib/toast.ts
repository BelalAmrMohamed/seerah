import { create } from "zustand";
type T = { id: number; text: string; kind: "success" | "error" | "info" };
interface S { items: T[]; push: (text: string, kind?: T["kind"]) => void; dismiss: (id: number) => void }
let n = 0;
export const useToastStore = create<S>((set, get) => ({
  items: [],
  push: (text, kind = "info") => {
    const id = ++n;
    set({ items: [...get().items.slice(-2), { id, text, kind }] });
    setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) => set({ items: get().items.filter((t) => t.id !== id) }),
}));
export const toast = {
  success: (t: string) => useToastStore.getState().push(t, "success"),
  error: (t: string) => useToastStore.getState().push(t, "error"),
  info: (t: string) => useToastStore.getState().push(t, "info"),
};
