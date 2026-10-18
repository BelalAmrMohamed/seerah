"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
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
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem("rihla-pwa-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

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
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
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
