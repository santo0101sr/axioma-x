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
        className="h-full origin-left bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 shadow-[0_0_12px_rgba(16,185,129,0.75)]"
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
  spotlightColor = "rgba(52, 211, 153, 0.06)",
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
          background: `radial-gradient(220px circle at ${cursor.x}px ${cursor.y}px, rgba(52, 211, 153, 0.85), rgba(59, 91, 255, 0.45) 45%, transparent 75%)`,
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
      {/* Orbiting cobalt -> emerald -> cyan border beam */}
      <div
        className="animate-border-spin pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-90"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(59, 91, 255, 0.92) 70deg, rgba(52, 211, 153, 0.98) 140deg, rgba(34, 211, 238, 0.8) 190deg, transparent 250deg, transparent 360deg)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 overflow-hidden rounded-[15px] bg-[#19253f]">
        {children}
      </div>
    </div>
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

const PARTICLE_COLORS = ["#34d399", "#4f6fff", "#38bdf8"];

export function KineticCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let rafId = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles.length = 0;
      const count = 72;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          r: 1.5 + Math.random() * 1.1,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        });
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        initParticles(width, height);
      }
    };

    resize();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
        mouse.x = mx;
        mouse.y = my;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const drawFrame = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(drawFrame);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 8 && dist < 155) {
              p.x += (dx / dist) * 0.22;
              p.y += (dy / dist) * 0.22;
            }
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();

        // Crisp constellation lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 155) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = i % 2 === 0 ? "#34d399" : "#4f6fff";
            ctx.globalAlpha = (1 - dist / 155) * 0.36;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Crisp geometric filaments connecting nearby particles to mouse cursor
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 175) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - mdist / 175) * 0.55;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

const GRID_SPARKS = [
  { top: "120px", left: "20%", color: "bg-emerald-400", delay: "0s" },
  { top: "280px", left: "80%", color: "bg-blue-400", delay: "0.9s" },
  { top: "480px", left: "24%", color: "bg-teal-300", delay: "1.6s" },
  { top: "360px", left: "72%", color: "bg-emerald-300", delay: "2.2s" },
];

export function HeroInteractiveBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle radial vignette softening the edges of the architectural grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 15%, transparent 45%, rgba(2, 6, 23, 0.85) 100%)",
        }}
      />

      {/* Interactive particle constellation canvas */}
      <KineticCanvas />

      {/* Seamless high-blur atmospheric aurora orbs */}
      <div className="animate-aurora absolute -top-36 left-1/4 h-[460px] w-[560px] rounded-full bg-[#2546f0]/16 blur-[160px]" />
      <div className="animate-aurora-reverse absolute -top-20 right-1/4 h-[420px] w-[540px] rounded-full bg-emerald-500/12 blur-[160px]" />

      {/* 3 Horizontal shooting light beams gliding along 40px grid tracks */}
      <div
        className="animate-beam-h absolute left-0 top-[120px] h-[1px] w-48 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="animate-beam-h absolute left-0 top-[280px] h-[1px] w-56 bg-gradient-to-r from-transparent via-[#4f6fff] to-transparent"
        style={{ animationDelay: "2.2s" }}
      />
      <div
        className="animate-beam-h absolute left-0 top-[480px] h-[1px] w-44 bg-gradient-to-r from-transparent via-teal-300 to-transparent"
        style={{ animationDelay: "4.5s" }}
      />

      {/* 3 Vertical shooting light beams gliding down grid columns */}
      <div
        className="animate-beam-v absolute left-[16%] top-0 h-44 w-[1px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="animate-beam-v absolute left-1/2 top-0 h-52 w-[1px] bg-gradient-to-b from-transparent via-[#4f6fff] to-transparent"
        style={{ animationDelay: "3.6s" }}
      />
      <div
        className="animate-beam-v absolute left-[84%] top-0 h-44 w-[1px] bg-gradient-to-b from-transparent via-teal-300 to-transparent"
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
                  className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
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
