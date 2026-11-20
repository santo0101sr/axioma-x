"use client";

import React, { useEffect, useRef, useState } from "react";

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setProgress(0);
        return;
      }
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setProgress(ratio * 100);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-50 h-[2.5px] w-full bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.96) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenClass =
    direction === "left"
      ? "opacity-0 -translate-x-6"
      : direction === "right"
      ? "opacity-0 translate-x-6"
      : direction === "scale"
      ? "opacity-0 scale-95"
      : "opacity-0 translate-y-6";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : hiddenClass
      } ${className}`}
    >
      {children}
    </div>
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
      rx: -ny * 3.2,
      ry: nx * 3.5,
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
          ? `perspective(1100px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`
          : "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
      className={`animated-border-beam relative overflow-hidden rounded-2xl p-[1.5px] transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {/* Orbiting cobalt -> emerald -> cyan border beam */}
      <div
        className="animate-border-spin pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-85"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(59, 91, 255, 0.9) 70deg, rgba(52, 211, 153, 0.95) 140deg, rgba(34, 211, 238, 0.75) 190deg, transparent 250deg, transparent 360deg)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 overflow-hidden rounded-[15px] bg-[#19253f]">
        {children}
      </div>
    </div>
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

      {/* Seamless high-blur atmospheric aurora orbs (no 8-bit banding) */}
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

const MARQUEE_ITEMS = [
  "WhatsApp → PDF en 15s",
  "Dictado por Voz",
  "Extracción desde Fotos",
  "Catálogo en Tiempo Real",
  "Firebase Auth + Firestore",
  "Portal Cliente /q en 1 Clic",
  "Multi-moneda USD · CRC · MXN · COP",
  "Exportación Excel / CSV",
  "Respaldo JSON 100%",
];

export function MarqueeStrip() {
  return (
    <div className="marquee-container relative overflow-hidden border-y border-white/10 bg-[#0b1120]/90 py-3.5 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#070b14] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#070b14] to-transparent"
        aria-hidden="true"
      />

      <div className="animate-marquee">
        {[0, 1].map((trackIdx) => (
          <div key={trackIdx} className="flex shrink-0 items-center gap-6 pr-6">
            {MARQUEE_ITEMS.map((item) => (
              <div
                key={`${trackIdx}-${item}`}
                className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap text-xs font-semibold tracking-wide text-slate-300"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
