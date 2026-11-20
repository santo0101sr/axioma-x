"use client";

import { useEffect, useRef } from "react";

interface AntigravityParticle {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  phase: number;
  baseAngle: number;
  baseLen: number;
  color: string;
}

interface RippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

const COLORS = [
  "#60a5fa", // sky blue 400
  "#4f6fff", // cobalt blue
  "#38bdf8", // light sky blue
  "#3b82f6", // royal blue
  "#94a3b8", // subtle starlight
];

export function AntigravityField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let rafId = 0;

    const mouse = {
      x: width * 0.5,
      y: height * 0.35,
      vx: 0,
      vy: 0,
      normX: 0,
      normY: 0,
      active: false,
    };

    const particles: AntigravityParticle[] = [];
    const ripples: RippleWave[] = [];
    const trail: TrailPoint[] = [];

    const buildParticles = (w: number, h: number) => {
      particles.length = 0;
      const total = 190;
      const aspect = Math.max(0.4, w / Math.max(1, h));
      const rows = Math.max(8, Math.round(Math.sqrt(total / aspect)));
      const cols = Math.max(10, Math.round(total / rows));
      const cellW = w / cols;
      const cellH = h / rows;

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const z = 0.35 + ((idx * 37) % 100) / 153.8; // [0.35, 1.0]
          const ox = (c + 0.15 + Math.random() * 0.7) * cellW;
          const oy = (r + 0.15 + Math.random() * 0.7) * cellH;
          const color =
            z < 0.48 && idx % 3 === 0
              ? COLORS[4]
              : COLORS[idx % 4];

          particles.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            z,
            phase: Math.random() * Math.PI * 2,
            baseAngle: (Math.random() - 0.5) * Math.PI,
            baseLen: 3.5 + z * 5.2,
            color,
          });
          idx++;
        }
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(width, height);
    };

    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const nx = e.clientX;
      const ny = e.clientY;
      mouse.vx = mouse.active ? (nx - mouse.x) * 0.45 : 0;
      mouse.vy = mouse.active ? (ny - mouse.y) * 0.45 : 0;
      mouse.x = nx;
      mouse.y = ny;
      mouse.normX = (nx / Math.max(1, width)) * 2 - 1;
      mouse.normY = (ny / Math.max(1, height)) * 2 - 1;
      mouse.active = true;

      const last = trail[trail.length - 1];
      if (!last || Math.hypot(nx - last.x, ny - last.y) > 3) {
        trail.push({ x: nx, y: ny, life: 1 });
        if (trail.length > 16) trail.shift();
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 8,
        maxRadius: 360,
        alpha: 0.55,
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick, { passive: true });

    const startTime = performance.now();

    const renderFrame = (now: number) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const t = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      // Decay cursor velocity smoothly between move events
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      const energized: Array<{ p: AntigravityParticle; energy: number }> = [];
      const radiusLimit = 220;
      const waveScale = prefersReducedMotion ? 0.55 : 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic zero-gravity wave + subtle depth parallax from cursor
        const waveX = Math.sin(t * 0.7 + p.phase) * 14 * p.z * waveScale;
        const waveY = Math.cos(t * 0.55 + p.phase * 1.3) * 12 * p.z * waveScale;
        const paraX = mouse.normX * -24 * p.z;
        const paraY = mouse.normY * -16 * p.z;

        const tx = p.ox + waveX + paraX;
        const ty = p.oy + waveY + paraY;

        let energy = 0;

        // Spring pull back toward drifting anchor target
        p.vx += (tx - p.x) * 0.028;
        p.vy += (ty - p.y) * 0.028;

        // Magnetic fluid cursor parting + tangential swirl + wake drag
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < radiusLimit && dist > 0.001) {
            const force = (1 - dist / radiusLimit) * p.z;
            energy = force;
            const nx = dx / dist;
            const ny = dy / dist;

            // Antigravity radial parting + gentle counter-clockwise swirl + wake
            p.vx += nx * force * 2.2 + -ny * force * 1.15 + mouse.vx * force * 0.22;
            p.vy += ny * force * 2.2 + nx * force * 1.15 + mouse.vy * force * 0.22;
          }
        }

        // Click shockwave impulse
        for (let rIdx = 0; rIdx < ripples.length; rIdx++) {
          const rp = ripples[rIdx];
          const rx = p.x - rp.x;
          const ry = p.y - rp.y;
          const rDist = Math.hypot(rx, ry);
          const band = Math.abs(rDist - rp.radius);
          if (band < 48 && rDist > 0.001) {
            const push = (1 - band / 48) * rp.alpha * 3.8 * p.z;
            p.vx += (rx / rDist) * push;
            p.vy += (ry / rDist) * push;
            energy = Math.max(energy, (1 - band / 48) * 0.85);
          }
        }

        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.hypot(p.vx, p.vy);
        const angle =
          speed > 0.25
            ? Math.atan2(p.vy, p.vx)
            : p.baseAngle + Math.sin(t * 0.45 + p.phase) * 0.35;
        const len = p.baseLen + Math.min(18, speed * 3.8);
        const hx = Math.cos(angle) * (len * 0.5);
        const hy = Math.sin(angle) * (len * 0.5);

        ctx.beginPath();
        ctx.moveTo(p.x - hx, p.y - hy);
        ctx.lineTo(p.x + hx, p.y + hy);
        ctx.strokeStyle = p.color;
        ctx.lineCap = "round";
        ctx.lineWidth = 1.3 + p.z * 1.4;
        ctx.globalAlpha = Math.min(0.98, 0.28 + p.z * 0.42 + energy * 0.55);
        ctx.stroke();

        if (mouse.active && Math.hypot(p.x - mouse.x, p.y - mouse.y) < 180) {
          energized.push({ p, energy });
        }
      }

      // Ultra-crisp micro-filaments ONLY between energized particles near cursor
      for (let i = 0; i < energized.length; i++) {
        const a = energized[i].p;
        for (let j = i + 1; j < energized.length; j++) {
          const b = energized[j].p;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = i % 2 === 0 ? "#60a5fa" : "#4f6fff";
            ctx.lineWidth = 0.75;
            ctx.globalAlpha = (1 - dist / 95) * 0.32;
            ctx.stroke();
          }
        }
      }

      // Subtle fading silk comet trail following fast mouse sweeps
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.032;
        if (trail[i].life <= 0) {
          trail.splice(i, 1);
        }
      }

      if (trail.length > 1) {
        ctx.lineCap = "round";
        for (let i = 1; i < trail.length; i++) {
          const prev = trail[i - 1];
          const curr = trail[i];
          const ratio = i / trail.length;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.lineWidth = Math.max(0.6, ratio * curr.life * 2.6);
          ctx.strokeStyle = i % 2 === 0 ? "#60a5fa" : "#4f6fff";
          ctx.globalAlpha = curr.life * ratio * 0.42;
          ctx.stroke();
        }
      }

      // Render expanding click ripples cleanly
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += 11;
        rp.alpha *= 0.94;

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? "#60a5fa" : "#4f6fff";
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = rp.alpha;
        ctx.stroke();

        if (rp.radius >= rp.maxRadius || rp.alpha < 0.03) {
          ripples.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(renderFrame);
    };

    renderFrame(performance.now());

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 hidden h-full w-full dark:block"
      aria-hidden="true"
    />
  );
}
