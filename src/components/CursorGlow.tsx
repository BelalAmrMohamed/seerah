"use client";
import { useEffect, useRef } from "react";
export default function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    const loop = () => { cx += (x - cx) * 0.08; cy += (y - cy) * 0.08; if (el.current) el.current.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop); };
    addEventListener("pointermove", move); raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={el} className="glow" aria-hidden />;
}
