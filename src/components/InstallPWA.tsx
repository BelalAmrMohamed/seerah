"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

let globalPrompt: BeforeInstallPromptEvent | null = null;

export async function triggerPwaInstall(showToast?: (msg: string) => void): Promise<void> {
  if (typeof window === "undefined") return;

  // Check if standalone / already installed
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone;
  if (isStandalone) {
    showToast?.("التطبيق مثبت بالفعل ويعمل بكامل ميزاته على جهازك!");
    return;
  }

  // If native prompt is available
  if (globalPrompt) {
    const res = await globalPrompt.prompt();
    if (res.outcome === "accepted") {
      globalPrompt = null;
    }
    return;
  }

  // iOS Safari detection
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  if (isIos) {
    showToast?.("لتثبيت التطبيق: اضغط على زر المشاركة [ ⎋ ] في أسفل المتصفح، ثم اختر «إضافة إلى الشاشة الرئيسية» (+)");
    return;
  }

  // Desktop or Android fallback where prompt wasn't captured or already handled
  showToast?.("يمكنك تثبيت التطبيق من شريط العنوان في المتصفح بالضغط على أيقونة التثبيت (⊕)");
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      const pEvent = e as BeforeInstallPromptEvent;
      globalPrompt = pEvent;
      setDeferredPrompt(pEvent);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem("rihla-pwa-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Also listen for trigger custom event
    const triggerHandler = () => {
      if (globalPrompt) {
        globalPrompt.prompt();
      }
    };
    window.addEventListener("rihla:trigger-install", triggerHandler);

    // Detect if already installed
    const matchMedia = window.matchMedia("(display-mode: standalone)");
    if (matchMedia.matches) setInstalled(true);
    matchMedia.addEventListener("change", (e) => {
      if (e.matches) setInstalled(true);
    });

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      globalPrompt = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("rihla:trigger-install", triggerHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const result = await deferredPrompt.prompt();
    if (result.outcome === "accepted") {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("rihla-pwa-dismissed", "1");
  };

  if (installed || !showBanner) return null;

  return (
    <div
      className="fixed bottom-6 start-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border p-4 shadow-xl animate-in"
      style={{
        background: "var(--solid)",
        borderColor: "var(--line)",
        fontFamily: "var(--font-ui)",
        animation: "slide-up 0.4s var(--ease-out-expo)",
      }}
    >
      {/* Icon */}
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "color-mix(in srgb, var(--accent) 15%, transparent)",
          color: "var(--accent)",
        }}
      >
        <Download size={20} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          تثبيت رحلة في السيرة
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          أضف التطبيق لشاشتك الرئيسية للوصول السريع
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstall}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          تثبيت
        </button>
        <button
          onClick={handleDismiss}
          className="ghost !px-1.5 !py-1.5"
          aria-label="إغلاق"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
