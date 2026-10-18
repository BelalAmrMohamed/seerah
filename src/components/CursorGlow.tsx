"use client";
import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = -1000;
    let y = -1000;
    let cx = -1000;
    let cy = -1000;
    let raf = 0;
    let initialized = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!initialized) {
        cx = x;
        cy = y;
        initialized = true;
      }
    };

    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      if (el.current) {
        el.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={el} className="glow" aria-hidden />;
}
