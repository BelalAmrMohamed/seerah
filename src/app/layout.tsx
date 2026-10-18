import type { Metadata, Viewport } from "next";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-400.css";
import "@fontsource/aref-ruqaa/arabic-400.css";
import "@fontsource/aref-ruqaa/arabic-700.css";
import "@fontsource/aref-ruqaa/latin-400.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import Providers from "@/components/Providers";
import StageLoader from "@/components/StageLoader";
import Header from "@/components/Header";
import ReadingDrawer from "@/components/ReadingDrawer";
import SearchPalette from "@/components/SearchPalette";
import CursorGlow from "@/components/CursorGlow";
import Loader from "@/components/Loader";
import AiChat from "@/components/AiChat";
import InstallPWA from "@/components/InstallPWA";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rihla-seerah.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "رحلة في السيرة — السيرة النبوية لابن هشام",
    template: "%s | رحلة في السيرة",
  },
  description: "ثلاثون محطة من السيرة النبوية لابن هشام، تُروى بالنور والحركة. تجربة تفاعلية حديثة لقراءة السيرة.",
  authors: [{ name: "Belal Amr Mohamed", url: "https://belal-amr.vercel.app" }],
  creator: "Belal Amr Mohamed",
  publisher: "Belal Amr Mohamed",
  keywords: [
    "السيرة النبوية", "ابن هشام", "محمد ﷺ", "النبي", "الإسلام",
    "seerah", "prophet muhammad", "ibn hisham", "islamic history",
    "رحلة في السيرة", "محطات السيرة", "الهجرة", "بدر", "فتح مكة",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/shamsah-favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/shamsah-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/shamsah-icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: "/shamsah-favicon-64.png",
  },
  openGraph: {
    title: "رحلة في السيرة — السيرة النبوية لابن هشام",
    description: "ثلاثون محطة من السيرة النبوية لابن هشام، تُروى بالنور والحركة.",
    url: siteUrl,
    siteName: "رحلة في السيرة",
    images: [
      {
        url: "/thumbnail.jpg",
        width: 1920,
        height: 1080,
        alt: "رحلة في السيرة — ثلاثون محطة من السيرة النبوية",
      },
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "رحلة في السيرة",
      },
    ],
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "رحلة في السيرة — السيرة النبوية لابن هشام",
    description: "ثلاثون محطة من السيرة النبوية لابن هشام، تُروى بالنور والحركة.",
    images: ["/thumbnail.jpg"],
    creator: "@BelalAmrDev",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "رحلة في السيرة",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1e" },
    { media: "(prefers-color-scheme: light)", color: "#f0f2f7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="bg-veil" aria-hidden />
          <Loader />
          <StageLoader />
          <div className="vignette" aria-hidden />
          <CursorGlow />
          <Header />
          <div className="relative z-10">{children}</div>
          <ReadingDrawer />
          <SearchPalette />
          <AiChat />
          <InstallPWA />
          <Toaster
            position="bottom-left"
            dir="rtl"
            toastOptions={{
              style: {
                background: "var(--solid)",
                color: "var(--ink)",
                border: "1px solid var(--line)",
                fontFamily: "var(--font-ui)",
                borderRadius: "0.875rem",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
