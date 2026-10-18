"use client";
import { ThemeProvider } from "next-themes";
import { ScrollProvider } from "@/lib/scroll";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ScrollProvider>{children}</ScrollProvider>
    </ThemeProvider>
  );
}
