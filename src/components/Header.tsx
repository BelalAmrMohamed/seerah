"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Magnetic from "./Magnetic";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8">
      <Link href="/" className="font-display text-2xl" style={{ color: "var(--accent)" }}>رحلة في السيرة</Link>
      <div className="flex items-center gap-2">
        <Magnetic power={0.2}>
          <button className="ghost" onClick={() => window.dispatchEvent(new Event("rihla:search"))} aria-label="ابحث في المحطات">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className="hidden sm:inline">ابحث في المحطات</span>
          </button>
        </Magnetic>
        <Magnetic power={0.2}>
          <button className="ghost !px-3" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "الوضع النهاري" : "الوضع الليلي"}>
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
            )}
          </button>
        </Magnetic>
      </div>
    </header>
  );
}
