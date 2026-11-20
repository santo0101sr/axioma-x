"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
} from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-50 h-[3px] w-full bg-transparent"
      aria-hidden="true"
    >
      <motion.div
        style={{ scaleX }}
        className="h-full origin-left bg-gradient-to-r from-blue-500 via-sky-400 to-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.75)]"
      />
    </div>
  );
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const initialState =
    direction === "left"
      ? { opacity: 0, x: -28, y: 0, scale: 1 }
      : direction === "right"
      ? { opacity: 0, x: 28, y: 0, scale: 1 }
      : direction === "scale"
      ? { opacity: 0, x: 0, y: 12, scale: 0.94 }
      : { opacity: 0, x: 0, y: 26, scale: 1 };

  return (
    <motion.div
      initial={initialState}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        type: "spring",
        stiffness: 130,
        damping: 22,
        delay: delay / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function MagneticButton({
  children,
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18 });
  const springY = useSpring(y, { stiffness: 260, damping: 18 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x.set(Math.max(-6, Math.min(6, relX * 6)));
    y.set(Math.max(-6, Math.min(6, relY * 6)));
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(96, 165, 250, 0.07)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursor((prev) => ({ ...prev, active: false }))}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Crisp 1px glowing border ring illuminated at cursor */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: cursor.active ? 1 : 0,
          padding: "1px",
          background: `radial-gradient(220px circle at ${cursor.x}px ${cursor.y}px, rgba(96, 165, 250, 0.85), rgba(37, 99, 235, 0.45) 45%, transparent 75%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        aria-hidden="true"
      />
      {/* Ultra-subtle clean interior specular sheen */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: cursor.active ? 1 : 0,
          background: `radial-gradient(260px circle at ${cursor.x}px ${cursor.y}px, ${spotlightColor}, transparent 68%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

interface TiltBannerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltBannerCard({ children, className = "" }: TiltBannerCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hovering: false });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({
      rx: -ny * 3.5,
      ry: nx * 3.8,
      hovering: true,
    });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0, hovering: false });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.hovering
          ? `perspective(1100px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
          : "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
      className={`animated-border-beam relative overflow-hidden rounded-2xl p-[1.5px] transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {/* Orbiting cobalt -> royal blue -> sky blue border beam */}
      <div
        className="animate-border-spin pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-90"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(37, 99, 235, 0.92) 70deg, rgba(96, 165, 250, 0.98) 140deg, rgba(56, 189, 248, 0.85) 190deg, transparent 250deg, transparent 360deg)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 overflow-hidden rounded-[15px] bg-[#041238]">
        {children}
      </div>
    </div>
  );
}

const GRID_SPARKS = [
  { top: "120px", left: "20%", color: "bg-blue-400", delay: "0s" },
  { top: "280px", left: "80%", color: "bg-sky-400", delay: "0.9s" },
  { top: "480px", left: "24%", color: "bg-blue-300", delay: "1.6s" },
  { top: "360px", left: "72%", color: "bg-sky-300", delay: "2.2s" },
];

export function HeroInteractiveBackdrop() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const gridX = useSpring(rawX, { stiffness: 80, damping: 24 });
  const gridY = useSpring(rawY, { stiffness: 80, damping: 24 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      rawX.set(-nx * 16);
      rawY.set(-ny * 12);
    };

    const handleMouseLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rawX, rawY]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Mouse-driven 3D parallax architectural grid */}
      <motion.div
        style={{ x: gridX, y: gridY }}
        className="bg-hero-grid absolute -inset-6"
      />

      {/* Subtle radial vignette softening the edges of the architectural grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 15%, transparent 45%, rgba(2, 6, 23, 0.85) 100%)",
        }}
      />

      {/* Seamless high-blur atmospheric aurora orbs */}
      <div className="animate-aurora absolute -top-36 left-1/4 h-[460px] w-[560px] rounded-full bg-[#2546f0]/20 blur-[160px]" />
      <div className="animate-aurora-reverse absolute -top-20 right-1/4 h-[420px] w-[540px] rounded-full bg-sky-500/14 blur-[160px]" />

      {/* 3 Horizontal shooting light beams gliding along 40px grid tracks */}
      <div
        className="animate-beam-h absolute left-0 top-[120px] h-[1px] w-48 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="animate-beam-h absolute left-0 top-[280px] h-[1px] w-56 bg-gradient-to-r from-transparent via-[#4f6fff] to-transparent"
        style={{ animationDelay: "2.2s" }}
      />
      <div
        className="animate-beam-h absolute left-0 top-[480px] h-[1px] w-44 bg-gradient-to-r from-transparent via-sky-300 to-transparent"
        style={{ animationDelay: "4.5s" }}
      />

      {/* 3 Vertical shooting light beams gliding down grid columns */}
      <div
        className="animate-beam-v absolute left-[16%] top-0 h-44 w-[1px] bg-gradient-to-b from-transparent via-blue-400 to-transparent"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="animate-beam-v absolute left-1/2 top-0 h-52 w-[1px] bg-gradient-to-b from-transparent via-[#4f6fff] to-transparent"
        style={{ animationDelay: "3.6s" }}
      />
      <div
        className="animate-beam-v absolute left-[84%] top-0 h-44 w-[1px] bg-gradient-to-b from-transparent via-sky-300 to-transparent"
        style={{ animationDelay: "5.8s" }}
      />

      {/* Pulsing coordinate sparks at grid intersections */}
      {GRID_SPARKS.map((spark, idx) => (
        <span
          key={idx}
          style={{ top: spark.top, left: spark.left, animationDelay: spark.delay }}
          className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full ${spark.color} opacity-60 shadow-[0_0_12px_currentColor]`}
        />
      ))}
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  formatter = (n) => String(Math.round(n)),
  duration = 420,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    const startVal = currentRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const nextVal = startVal + (endVal - startVal) * eased;
      currentRef.current = nextVal;
      setDisplayValue(nextVal);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = endVal;
        setDisplayValue(endVal);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{formatter(displayValue)}</>;
}

const MARQUEE_ROW_ONE = [
  "WhatsApp → PDF en 15s",
  "Dictado por Voz",
  "Extracción desde Fotos",
  "Portal Cliente /q en 1 Clic",
  "Firebase Auth + Firestore",
  "Catálogo en Tiempo Real",
  "Exportación Excel / CSV",
  "Respaldo JSON 100%",
];

const MARQUEE_ROW_TWO = [
  "Remodelaciones",
  "Agencias Digitales",
  "Talleres Automotrices",
  "Catering & Eventos",
  "Consultorías",
  "Clínicas & Salud",
  "Arquitectura",
  "Servicios Técnicos",
  "Multi-moneda USD · CRC · MXN · COP",
];

export function MarqueeStrip() {
  return (
    <div className="marquee-container relative overflow-hidden border-y border-white/10 bg-[#0b1120]/90 py-4 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#070b14] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#070b14] to-transparent"
        aria-hidden="true"
      />

      <div className="space-y-2.5">
        {/* Row 1: left-scrolling capabilities */}
        <div className="animate-marquee">
          {[0, 1].map((trackIdx) => (
            <div key={trackIdx} className="flex shrink-0 items-center gap-3 pr-3">
              {MARQUEE_ROW_ONE.map((item) => (
                <div
                  key={`r1-${trackIdx}-${item}`}
                  className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Row 2: right-scrolling industries & currencies */}
        <div className="animate-marquee-reverse">
          {[0, 1].map((trackIdx) => (
            <div key={trackIdx} className="flex shrink-0 items-center gap-3 pr-3">
              {MARQUEE_ROW_TWO.map((item) => (
                <div
                  key={`r2-${trackIdx}-${item}`}
                  className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-400 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_8px_rgba(79,111,255,0.85)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
