"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
export default function Magnetic({ children, power = 0.3 }: { children: React.ReactNode; power?: number }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 });
  return (
    <motion.span
      className="inline-block" style={{ x: sx, y: sy }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * power); y.set((e.clientY - r.top - r.height / 2) * power); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >{children}</motion.span>
  );
}
