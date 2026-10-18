"use client";
import { useSyncExternalStore } from "react";
import { activeStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { ar, arYear, eraOf, stations } from "@/lib/stations";

export default function TimelineRail() {
  const active = useSyncExternalStore(activeStore.sub, activeStore.get, () => 0);
  const cur = stations.find((s) => s.id === active);
  return (
    <>
      <nav aria-label="خط المحطات" className={`fixed inset-y-0 start-3 z-30 hidden items-center transition-opacity duration-500 md:flex lg:start-6 ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <ul className="grid gap-[5px]">
          {stations.map((s) => (
            <li key={s.id} data-era={eraOf(s.category)} className="group relative flex items-center">
              <button className="tick" data-current={s.id === active} aria-label={`المحطة ${ar(s.id)}: ${s.title}`} aria-current={s.id === active} onClick={() => scrollToId(`s-${s.id}`)} />
              <span className="pointer-events-none absolute start-9 w-max max-w-[16rem] rounded-lg border px-3 py-1 text-base opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" style={{ background: "var(--panel)", backdropFilter: "blur(10px)", borderColor: "var(--line)" }}>
                {s.title}
              </span>
            </li>
          ))}
        </ul>
      </nav>
      {cur && (
        <div className="fixed inset-x-0 bottom-0 z-30 md:hidden" data-era={eraOf(cur.category)} aria-hidden>
          <div className="flex items-center justify-between px-4 py-2 text-sm" style={{ background: "var(--panel)", backdropFilter: "blur(10px)", color: "var(--era)" }}>
            <span>{ar(cur.id)} / {ar(30)}</span><span>{arYear(cur.year)}</span>
          </div>
          <div className="h-[3px]" style={{ background: "var(--line)" }}><div className="h-full" style={{ width: `${(cur.id / 30) * 100}%`, background: "var(--era)", transition: "width .4s" }} /></div>
        </div>
      )}
    </>
  );
}
