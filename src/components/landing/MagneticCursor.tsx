"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "interactive" | "text";

export function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const ringX = useSpring(rawX, { stiffness: 240, damping: 24, mass: 0.45 });
  const ringY = useSpring(rawY, { stiffness: 240, damping: 24, mass: 0.45 });

  const dotX = useSpring(rawX, { stiffness: 650, damping: 32, mass: 0.2 });
  const dotY = useSpring(rawY, { stiffness: 650, damping: 32, mass: 0.2 });

  useEffect(() => {
    const hasFinePointer =
      window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(any-pointer: fine)").matches;

    if (hasFinePointer) {
      setEnabled(true);
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setEnabled(true);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);

      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        setMode("text");
      } else if (target?.closest("a, button, [role='button']")) {
        setMode("interactive");
      } else {
        setMode("default");
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
      setPressed(false);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPressed(true);
    };
    const handlePointerUp = () => setPressed(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [rawX, rawY]);

  if (!enabled) return null;

  const ringScale = pressed ? 0.8 : mode === "interactive" ? 1.48 : 1;
  const ringOpacity = !visible ? 0 : mode === "text" ? 0.15 : 1;
  const dotOpacity =
    !visible || mode === "text" || mode === "interactive" ? 0 : 0.9;

  return (
    <div
      data-magnetic-cursor="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Discreet spring-lagged hairline ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: ringScale,
          opacity: ringOpacity,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={`h-[26px] w-[26px] rounded-full border transition-colors duration-200 ${
          mode === "interactive"
            ? "border-emerald-300/75 bg-emerald-400/[0.06] shadow-[0_0_18px_rgba(52,211,153,0.28)]"
            : "border-emerald-400/45 shadow-[0_0_14px_rgba(52,211,153,0.18)]"
        }`}
      />

      {/* Tighter micro inner spark */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: pressed ? 0.65 : 1,
          opacity: dotOpacity,
        }}
        transition={{ duration: 0.15 }}
        className="h-1 w-1 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
      />
    </div>
  );
}
