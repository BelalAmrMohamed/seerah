"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { triggerPwaInstall } from "@/components/InstallPWA";
import { toast } from "sonner";
import Magnetic from "./Magnetic";
import { Search, Sun, Moon, User, Menu, X, Compass, BookOpen, Sparkles, Heart, Download } from "lucide-react";

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
        className="fixed inset-x-0 top-0 z-40 transition-all duration-300"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="mx-auto flex h-14 sm:h-16 items-center justify-between px-3.5 sm:px-6 md:px-8 max-w-7xl">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 shrink-0">
            <Link
              href="/"
              className="font-display text-lg sm:text-xl md:text-2xl whitespace-nowrap shrink-0 transition-opacity hover:opacity-85 select-none"
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Assistant button (Desktop/Tablet only - on phones it is in the sidebar) */}
            <div className="hidden sm:inline-flex shrink-0">
              <Magnetic power={0.2}>
                <button
                  type="button"
                  onClick={toggleAiChat}
                  className="flex h-9 sm:w-auto items-center justify-center px-3 gap-1.5 rounded-full border transition-all text-xs sm:text-sm font-ui shrink-0 cursor-pointer"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 40%, var(--line))",
                    background: "color-mix(in srgb, var(--accent) 10%, var(--panel))",
                    color: "var(--accent)",
                  }}
                  aria-label="المساعد الذكي"
                  title="اسأل المساعد الذكي عن السيرة"
                >
                  <Sparkles size={16} className="shrink-0" />
                  <span className="font-medium">اسأل</span>
                </button>
              </Magnetic>
            </div>

            {/* Global Search (Always visible, clean and compact on phones) */}
            <Magnetic power={0.2}>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("rihla:search"))}
                className="ghost !h-9 !w-9 sm:!w-auto !p-0 sm:!px-3 flex items-center justify-center gap-1.5 font-ui text-xs sm:text-sm text-[color:var(--ink)] shrink-0 cursor-pointer"
                aria-label="ابحث في المحطات"
                title="البحث السريع (Ctrl+K)"
              >
                <Search size={16} className="shrink-0" />
                <span className="hidden sm:inline">بحث</span>
              </button>
            </Magnetic>

            {/* Theme switcher (Desktop/Tablet only - on phones it is in the sidebar) */}
            <div className="hidden sm:inline-flex shrink-0">
              <Magnetic power={0.2}>
                <button
                  type="button"
                  onClick={() => setTheme(dark ? "light" : "dark")}
                  className="ghost !h-9 !w-9 !p-0 flex items-center justify-center text-[color:var(--ink)] shrink-0 cursor-pointer"
                  aria-label={dark ? "الوضع النهاري" : "الوضع الليلي"}
                  title={dark ? "الوضع النهاري" : "الوضع الليلي"}
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </Magnetic>
            </div>

            {/* User Profile / Sign in (Desktop/Tablet only - on phones it is in the sidebar) */}
            <div className="hidden sm:inline-flex shrink-0">
              {user ? (
                <Magnetic power={0.2}>
                  <Link
                    href="/profile"
                    className="ghost !h-9 sm:!w-auto sm:!px-3 flex items-center justify-center gap-1.5 font-ui text-xs sm:text-sm shrink-0"
                    aria-label="الملف الشخصي"
                    title="الملف الشخصي"
                  >
                    <User size={16} style={{ color: "var(--accent)" }} className="shrink-0" />
                    <span className="truncate max-w-[90px] font-medium">{user.name || "حسابي"}</span>
                  </Link>
                </Magnetic>
              ) : (
                <Magnetic power={0.2}>
                  <Link
                    href="/auth"
                    className="ghost !h-9 sm:!px-3.5 inline-flex items-center justify-center font-ui text-xs sm:text-sm whitespace-nowrap shrink-0"
                    title="تسجيل الدخول"
                  >
                    تسجيل الدخول
                  </Link>
                </Magnetic>
              )}
            </div>

            {/* Hamburger menu button (Always accessible, opens the rich sidebar) */}
            <Magnetic power={0.2}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="ghost !h-9 !w-9 !p-0 flex items-center justify-center text-[color:var(--ink)] shrink-0 cursor-pointer"
                aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Navigation Drawer Overlay & Panel */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="قائمة التصفح">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative ms-auto flex h-full w-full max-w-[340px] sm:max-w-sm flex-col overflow-y-auto p-5 sm:p-6 shadow-2xl"
              style={{
                background: "var(--solid)",
                borderInlineStart: "1px solid var(--line)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[color:var(--line)]">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl" style={{ color: "var(--accent)" }}>
                    رحلة في السيرة
                  </h2>
                  <p className="text-xs text-[color:var(--muted)]">السيرة النبوية لابن هشام</p>
                </div>
                <button
                  type="button"
                  className="ghost !h-9 !w-9 !p-0 flex items-center justify-center cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User status card (Prominent in sidebar for mobile access) */}
              <div className="my-3.5 rounded-2xl p-4 border border-[color:var(--line)] bg-[color:var(--panel)]">
                {user ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[color:var(--ink)] truncate">{user.name || "مرحباً بك"}</p>
                      <p className="text-xs text-[color:var(--muted)] truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="btn !py-1 !px-3 !text-xs font-ui whitespace-nowrap shrink-0"
                    >
                      الملف الشخصي
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--ink)]">حسابك في الرحلة</p>
                      <p className="text-xs text-[color:var(--muted)] mt-0.5">احفظ تقدمك وإشاراتك المرجعية</p>
                    </div>
                    <Link
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="btn-primary !py-1.5 !px-3.5 !text-xs whitespace-nowrap shrink-0"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Controls Grid on Sidebar (Theme Switcher & AI Assistant) */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                {/* Theme Switcher Button */}
                <button
                  type="button"
                  onClick={() => setTheme(dark ? "light" : "dark")}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-2.5 text-xs font-ui transition-all hover:border-[color:var(--accent)] cursor-pointer"
                  aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
                >
                  <div className="flex items-center gap-1.5">
                    {dark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
                    <span className="text-[color:var(--ink)] font-medium">
                      {dark ? "النهاري" : "الليلي"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[color:var(--muted)]">تبديل</span>
                </button>

                {/* AI Assistant Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleAiChat();
                  }}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-2.5 text-xs font-ui transition-all hover:border-[color:var(--accent)] cursor-pointer"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 35%, var(--line))",
                    background: "color-mix(in srgb, var(--accent) 8%, var(--panel))",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={15} style={{ color: "var(--accent)" }} />
                    <span className="text-[color:var(--accent)] font-medium">المساعد الذكي</span>
                  </div>
                  <span className="rounded-full px-1.5 py-0.2 text-[9px] bg-[color:var(--accent)] text-[color:var(--bg)] font-semibold">
                    اسأل
                  </span>
                </button>
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
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleAiChat();
                  }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-start transition-all hover:bg-[color:var(--panel)] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} style={{ color: "var(--accent)" }} />
                    <span>المساعد الذكي (شات)</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] bg-[color:var(--accent)] text-[color:var(--bg)] font-semibold">
                    جديد
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    window.dispatchEvent(new Event("rihla:search"));
                  }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-start transition-all hover:bg-[color:var(--panel)] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} />
                    <span>البحث السريع في السيرة</span>
                  </div>
                  <kbd className="rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] text-[color:var(--muted)]">
                    Ctrl+K
                  </kbd>
                </button>
              </div>

              {/* Eras Section */}
              <div className="mt-5 grid gap-1 border-t border-[color:var(--line)] pt-4">
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
                {/* Install PWA Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    triggerPwaInstall((msg) => toast(msg, { duration: 6000 }));
                  }}
                  className="w-full mb-3 inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] py-2.5 px-3 text-xs font-medium text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>تثبيت التطبيق على هاتفك</span>
                </button>

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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
