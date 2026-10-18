"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { scrollToId } from "@/lib/scroll";
import { ar, arYear, normalize, stations } from "@/lib/stations";
import { useRouter, usePathname } from "next/navigation";

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter(), path = usePathname();
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    const ev = () => setOpen(true);
    addEventListener("keydown", key); addEventListener("rihla:search", ev);
    return () => { removeEventListener("keydown", key); removeEventListener("rihla:search", ev); };
  }, []);
  const go = (id: number) => {
    setOpen(false);
    if (path === "/") setTimeout(() => scrollToId(`s-${id}`), 120); else router.push(`/#s-${id}`);
  };
  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="البحث في المحطات" dir="rtl"
      filter={(value, search) => (normalize(value).includes(normalize(search)) ? 1 : 0)}
      overlayClassName="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[14vh] z-[70] w-[min(92vw,40rem)] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl [background:var(--solid)] [border-color:var(--line)]">
      <Command.Input autoFocus placeholder="ابحث عن محطة أو شخصية أو مكان…" className="w-full border-b bg-transparent px-6 py-5 text-xl outline-none [border-color:var(--line)]" />
      <Command.List className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
        <Command.Empty className="px-4 py-8 text-center" style={{ color: "var(--muted)" }}>لا توجد محطة مطابقة. جرّب اسم شخصية أو مكان.</Command.Empty>
        {stations.map((s) => (
          <Command.Item key={s.id} value={`${s.title} ${s.subtitle} ${s.keyFigures.join(" ")} ${s.location}`} onSelect={() => go(s.id)}
            className="flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 data-[selected=true]:[background:color-mix(in_srgb,var(--accent)_16%,transparent)]">
            <span className="w-7 text-center" style={{ color: "var(--accent)" }}>{ar(s.id)}</span>
            <span className="flex-1">{s.title}</span>
            <span className="text-sm" style={{ color: "var(--muted)" }}>{arYear(s.year)}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
