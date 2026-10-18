import type { Metadata, Viewport } from "next";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-400.css";
import "@fontsource/aref-ruqaa/arabic-400.css";
import "@fontsource/aref-ruqaa/arabic-700.css";
import "@fontsource/aref-ruqaa/latin-400.css";
import "./globals.css";
import Providers from "@/components/Providers";
import StageLoader from "@/components/StageLoader";
import Header from "@/components/Header";
import ReadingDrawer from "@/components/ReadingDrawer";
import SearchPalette from "@/components/SearchPalette";
import CursorGlow from "@/components/CursorGlow";
import Loader from "@/components/Loader";

export const metadata: Metadata = {
  title: "رحلة في السيرة",
  description: "ثلاثون محطة من السيرة النبوية لابن هشام، تُروى بالنور والحركة.",
  openGraph: { title: "رحلة في السيرة", description: "ثلاثون محطة من السيرة النبوية لابن هشام", images: ["/og.jpg"], locale: "ar_AR", type: "website" },
};
export const viewport: Viewport = { themeColor: "#0b0f1e", width: "device-width", initialScale: 1 };

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
        </Providers>
      </body>
    </html>
  );
}
