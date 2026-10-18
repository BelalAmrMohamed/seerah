"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
export default function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let off = false;
    Promise.all([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => !off && setShow(false));
    return () => { off = true; };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="l" className="fixed inset-0 z-[100] grid place-items-center" style={{ background: "var(--bg)" }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} aria-hidden>
          <div className="relative grid place-items-center">
            <motion.span className="absolute h-40 w-40 rounded-full border" style={{ borderColor: "var(--accent)" }} initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
            <span className="font-display text-6xl" style={{ color: "var(--accent)" }}>رحلة</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
