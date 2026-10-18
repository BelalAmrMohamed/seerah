"use client";
import Link from "next/link";
import { BookOpen, ArrowUp, Download } from "lucide-react";
import { triggerPwaInstall } from "@/components/InstallPWA";
import { toast } from "sonner";

export default function Footer() {
  const handleInstallClick = () => {
    triggerPwaInstall((msg) => toast(msg, { duration: 6000 }));
  };

  return (
    <footer data-era="farewell" className="relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--era), transparent)" }} />
      <div className="h-[1px] w-full opacity-50" style={{ background: "linear-gradient(90deg, transparent, var(--era), transparent)" }} />

      {/* Main footer content */}
      <div className="grid min-h-[60svh] place-items-center px-6 py-24 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 80%, color-mix(in srgb, var(--era) 10%, transparent), transparent 60%)",
        }} />

        <div className="relative z-10 grid max-w-xl gap-8">
          <p className="font-display text-4xl leading-[1.7] md:text-6xl">
            انتهت الرحلة، وبقي الأثر
          </p>

          <p style={{ color: "var(--muted)", lineHeight: 2 }}>
            النصوص مأخوذة من كتاب «السيرة النبوية» لابن هشام، وروابط كل محطة تفتح صفحتها في{" "}
            <a className="underline underline-offset-4 transition-colors hover:text-[color:var(--era)]" href="https://shamela.ws/book/23833" target="_blank" rel="noopener noreferrer">
              المكتبة الشاملة
            </a>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#top" className="btn-primary gap-2">
              <ArrowUp size={16} />
              العودة إلى البداية
            </a>
            <Link href="/explore" className="btn gap-2">
              <BookOpen size={16} />
              استكشف المحطات
            </Link>
            <button
              onClick={handleInstallClick}
              className="btn gap-2 font-medium"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 40%, var(--line))",
                color: "var(--accent)",
              }}
              title="تثبيت التطبيق على جهازك"
            >
              <Download size={16} />
              تثبيت التطبيق
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors underline underline-offset-4"
            >
              <Download size={13} />
              تثبيت موقع «رحلة في السيرة» كتطبيق على هاتفك أو جهازك (PWA)
            </button>
          </div>

          {/* Divider */}
          <div className="mx-auto h-px w-24" style={{ background: "var(--line)" }} />

          {/* Credits & Developer Watermark */}
          <div className="grid gap-4 font-ui text-sm" style={{ color: "var(--muted)" }}>
            
            {/* Belal Amr Mohamed Watermark Card */}
            <div className="mx-auto w-full max-w-md rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 backdrop-blur-md">
              <p className="text-xs text-[color:var(--muted)] mb-1">فكرة وتصميم وتطوير</p>
              <p className="font-display text-lg font-bold text-[color:var(--accent)]">
                بلال عمرو محمد · Belal Amr Mohamed
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-4 text-xs font-ui">
                <a
                  href="https://belal-amr.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[color:var(--ink)] hover:text-[color:var(--accent)] transition-colors underline underline-offset-4"
                >
                  belal-amr.vercel.app
                </a>
                <span className="text-[color:var(--line)]">|</span>
                <a
                  href="mailto:belalamrofficial@gmail.com"
                  className="inline-flex items-center gap-1.5 text-[color:var(--ink)] hover:text-[color:var(--accent)] transition-colors underline underline-offset-4"
                >
                  belalamrofficial@gmail.com
                </a>
              </div>
            </div>

            <p className="text-xs opacity-75">© {new Date().getFullYear()} رحلة في السيرة</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
