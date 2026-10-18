"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView();
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (reduced()) return;
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    if (location.hash) setTimeout(() => scrollToId(location.hash.slice(1)), 600);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; window.removeEventListener("load", onLoad); };
  }, []);
  return <>{children}</>;
}
