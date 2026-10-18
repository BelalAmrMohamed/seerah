"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reduced } from "@/lib/scroll";
import { stage } from "@/lib/store";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const ctx = gsap.context(() => {
      if (reduced()) return;
      gsap.from("[data-hw]", { yPercent: 60, opacity: 0, filter: "blur(14px)", duration: 1.4, stagger: 0.22, ease: "power3.out", delay: 1.2 });
      gsap.from("[data-hs]", { opacity: 0, y: 16, duration: 1, delay: 2.2 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => { stage.hero = 1 - s.progress; } } });
      tl.to("[data-orb]", { scale: 7, opacity: 0, ease: "power1.in" }, 0).to("[data-h1]", { scale: 1.12, opacity: 0, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} id="top" data-era="dawn" className="relative grid min-h-[100svh] place-items-center overflow-hidden text-center">
      <div data-orb className="orb" aria-hidden />
      <div className="relative z-10 grid gap-6 px-6">
        <h1 data-h1 className="font-display leading-[1.6]" style={{ fontSize: "clamp(3.4rem, 13vw, 10rem)", fontWeight: 700 }}>
          {["رحلة", "في", "السيرة"].map((w) => <span key={w} data-hw className="inline-block px-[.15em]">{w}</span>)}
        </h1>
        <p data-hs className="mx-auto max-w-[30ch] text-xl md:text-2xl" style={{ color: "var(--muted)", lineHeight: 1.9 }}>ثلاثون محطة من السيرة النبوية لابن هشام، من عام الفيل إلى الرفيق الأعلى</p>
      </div>
      <div data-hs className="absolute bottom-8 grid justify-items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
        <span>انزل لتبدأ الرحلة</span>
        <span className="h-10 w-px animate-pulse" style={{ background: "linear-gradient(var(--accent), transparent)" }} />
      </div>
    </section>
  );
}
