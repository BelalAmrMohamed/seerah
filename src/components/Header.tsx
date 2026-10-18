"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import Magnetic from "./Magnetic";
import { Search, Sun, Moon, User, Menu, X, Compass, BookOpen, Sparkles, ChevronLeft, Landmark, Heart } from "lucide-react";
import { ar } from "@/lib/stations";

const ERAS_NAV = [
  { id: 1, name: "فجر الرسالة", span: "المحطات ١–٧", icon: "🌅" },
  { id: 8, name: "العهد المكي", span: "المحطات ٨–١٦", icon: "🌙" },
  { id: 17, name: "طريق الهجرة", span: "المحطة ١٧", icon: "🐪" },
  { id: 18, name: "العهد المدني", span: "المحطات ١٨–٢٤", icon: "🌴" },
  { id: 25, name: "الفتح والتمكين", span: "المحطات ٢٥–٢٨", icon: "⚔️" },
  { id: 29, name: "حجة الوداع", span: "المحطتان ٢٩–٣٠", icon: "🕊️" },
];

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const toggleAiChat = useAppStore((s) => s.toggleAiChat);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  // Handle escape key to close drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email!, name: u.user_metadata?.full_name });
    });
  }, [setUser]);

  const dark = !mounted || resolvedTheme !== "light";

  const navLinks = [
    { href: "/", label: "الرحلة", icon: BookOpen, active: pathname === "/" },
    { href: "/explore", label: "استكشف", icon: Compass, active: pathname === "/explore" },
  ];

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 transition-all"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(20px) saturate(1.2)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-display text-2xl transition-colors hover:text-[color:var(--accent)]"
              style={{ color: "var(--accent)" }}
            >
              رحلة في السيرة
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ui text-sm transition-all"
                  style={{
                    color: link.active ? "var(--accent)" : "var(--muted)",
                    background: link.active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                    fontWeight: link.active ? 600 : 400,
                  }}
                >
                  <link.icon size={15} />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* AI Assistant button */}
            <Magnetic power={0.2}>
              <button
                className="ghost !px-2.5"
                onClick={toggleAiChat}
                aria-label="المساعد الذكي"
                title="اسأل المساعد الذكي عن السيرة"
              >
                <Sparkles size={16} style={{ color: "var(--accent)" }} />
                <span className="hidden sm:inline font-ui text-sm">اسأل</span>
              </button>
            </Magnetic>

            {/* Global Search */}
            <Magnetic power={0.2}>
              <button
                className="ghost"
                onClick={() => window.dispatchEvent(new Event("rihla:search"))}
                aria-label="ابحث في المحطات"
                title="البحث السريع (Ctrl+K)"
              >
                <Search size={16} />
                <span className="hidden sm:inline font-ui text-sm">بحث</span>
              </button>
            </Magnetic>

            {/* Theme switcher */}
            <Magnetic power={0.2}>
              <button
                className="ghost !px-3"
                onClick={() => setTheme(dark ? "light" : "dark")}
                aria-label={dark ? "الوضع النهاري" : "الوضع الليلي"}
                title={dark ? "الوضع النهاري" : "الوضع الليلي"}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </Magnetic>

            {/* User Profile / Sign in */}
            {user ? (
              <Link
                href="/profile"
                className="ghost !px-3"
                aria-label="الملف الشخصي"
                title="الملف الشخصي"
              >
                <User size={16} style={{ color: "var(--accent)" }} />
                <span className="hidden font-ui text-sm sm:inline truncate max-w-[100px]">{user.name || "حسابي"}</span>
              </Link>
            ) : (
              <Link href="/auth" className="ghost font-ui text-sm">
                تسجيل الدخول
              </Link>
            )}

            {/* Hamburger menu button (Always accessible) */}
            <button
              className="ghost !px-2.5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer Overlay & Panel */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="قائمة التصفح">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />

          {/* Drawer Panel */}
          <div
            className="relative ms-auto flex h-full w-full max-w-sm flex-col overflow-y-auto p-6 shadow-2xl transition-transform"
            style={{
              background: "var(--solid)",
              borderInlineStart: "1px solid var(--line)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[color:var(--line)]">
              <div>
                <h2 className="font-display text-2xl" style={{ color: "var(--accent)" }}>
                  رحلة في السيرة
                </h2>
                <p className="text-xs text-[color:var(--muted)]">السيرة النبوية لابن هشام</p>
              </div>
              <button
                className="ghost !px-2.5 !py-1.5"
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
            </div>

            {/* User status card */}
            <div className="my-5 rounded-2xl p-4 border border-[color:var(--line)] bg-[color:var(--panel)]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-[color:var(--ink)]">{user.name || "مرحباً بك"}</p>
                    <p className="text-xs text-[color:var(--muted)] truncate max-w-[180px]">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="btn !py-1 !px-3 !text-xs font-ui"
                  >
                    الملف الشخصي
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--ink)]">حسابك في الرحلة</p>
                    <p className="text-xs text-[color:var(--muted)]">احفظ تقدمك وإشاراتك المرجعية</p>
                  </div>
                  <Link
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary !py-1.5 !px-3 !text-xs"
                  >
                    دخول
                  </Link>
                </div>
              )}
            </div>

            {/* Main Links */}
            <div className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)] px-3 mb-1">
                التنقل الرئيسي
              </span>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base transition-all hover:bg-[color:var(--panel)]"
                style={{
                  color: pathname === "/" ? "var(--accent)" : "var(--ink)",
                  fontWeight: pathname === "/" ? 600 : 400,
                  background: pathname === "/" ? "color-mix(in srgb, var(--accent) 10%, transparent)" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} />
                  <span>الرحلة الكاملة</span>
                </div>
                <span className="text-xs text-[color:var(--muted)]">٣٠ محطة</span>
              </Link>

              <Link
                href="/explore"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base transition-all hover:bg-[color:var(--panel)]"
                style={{
                  color: pathname === "/explore" ? "var(--accent)" : "var(--ink)",
                  fontWeight: pathname === "/explore" ? 600 : 400,
                  background: pathname === "/explore" ? "color-mix(in srgb, var(--accent) 10%, transparent)" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <Compass size={18} />
                  <span>استكشف المحطات</span>
                </div>
                <span className="text-xs text-[color:var(--muted)]">فلاتر وبحث</span>
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  toggleAiChat();
                }}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-start transition-all hover:bg-[color:var(--panel)]"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} style={{ color: "var(--accent)" }} />
                  <span>المساعد الذكي</span>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] bg-[color:var(--accent)] text-[color:var(--bg)] font-semibold">
                  جديد
                </span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new Event("rihla:search"));
                }}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-start transition-all hover:bg-[color:var(--panel)]"
              >
                <div className="flex items-center gap-3">
                  <Search size={18} />
                  <span>البحث في السيرة</span>
                </div>
                <kbd className="rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] text-[color:var(--muted)]">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Eras Section */}
            <div className="mt-6 grid gap-1 border-t border-[color:var(--line)] pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)] px-3 mb-1">
                الحِقَب التاريخية
              </span>
              {ERAS_NAV.map((era) => (
                <Link
                  key={era.id}
                  href={`/#s-${era.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all hover:bg-[color:var(--panel)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span>{era.icon}</span>
                    <span className="text-[color:var(--ink)]">{era.name}</span>
                  </div>
                  <span className="text-xs text-[color:var(--muted)]">{era.span}</span>
                </Link>
              ))}
            </div>

            {/* Drawer Footer & Developer Watermark */}
            <div className="mt-auto border-t border-[color:var(--line)] pt-4 pb-6 text-center text-xs text-[color:var(--muted)]">
              <p className="flex items-center justify-center gap-1.5 mb-2">
                صُنع بـ <Heart size={12} fill="var(--accent)" style={{ color: "var(--accent)" }} /> لخدمة السيرة النبوية
              </p>

              <div className="my-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-2.5">
                <p className="text-[11px] text-[color:var(--muted)]">فكرة وتطوير وتصميم</p>
                <p className="font-medium text-[color:var(--accent)] text-xs mt-0.5">
                  بلال عمرو محمد · Belal Amr Mohamed
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px]">
                  <a
                    href="https://belal-amr.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-[color:var(--ink)]"
                  >
                    الموقع الشخصي
                  </a>
                  <span>·</span>
                  <a
                    href="mailto:belalamrofficial@gmail.com"
                    className="hover:underline hover:text-[color:var(--ink)]"
                  >
                    تواصل
                  </a>
                </div>
              </div>

              <a
                href="https://shamela.ws/book/23833"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-[color:var(--accent)] text-[11px] block mt-1 opacity-80"
              >
                كتاب السيرة النبوية — ابن هشام (المكتبة الشاملة)
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
