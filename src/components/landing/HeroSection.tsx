"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  HeroInteractiveBackdrop,
  MagneticButton,
} from "@/components/landing/MotionPrimitives";
import { HeroSimulator } from "@/components/landing/HeroSimulator";

const ROTATING_PHRASES_ES = [
  "cotización PDF",
  "propuesta formal",
  "portal de aprobación",
  "venta cerrada",
];

const ROTATING_PHRASES_EN = [
  "branded PDF quote",
  "formal proposal",
  "approval portal",
  "closed deal",
];

const EQ_DELAYS = ["0s", "0.15s", "0.3s", "0.45s", "0.6s"];
const EQ_HEIGHTS = ["h-3", "h-4", "h-2.5", "h-4", "h-3"];

export function HeroSection() {
  const { isEn } = useLanguage();
  const phrases = isEn ? ROTATING_PHRASES_EN : ROTATING_PHRASES_ES;
  const heroRef = useRef<HTMLElement | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2800);
    return () => clearInterval(id);
  }, [phrases.length]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const leftTopY = useTransform(smoothProgress, [0, 1], [0, -56]);
  const leftBottomY = useTransform(smoothProgress, [0, 1], [0, -90]);
  const rightTopY = useTransform(smoothProgress, [0, 1], [0, -68]);
  const rightBottomY = useTransform(smoothProgress, [0, 1], [0, -104]);
  const bannerY = useTransform(smoothProgress, [0, 1], [0, -24]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-transparent pb-20 pt-14 text-slate-900 transition-colors duration-300 dark:bg-slate-950/45 dark:text-white sm:pb-28 sm:pt-20"
    >
      <HeroInteractiveBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top-left floating telemetry card: Extracción IA + live equalizer */}
        <motion.div
          style={{ y: leftTopY }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
          className="pointer-events-auto absolute left-3 top-12 z-20 hidden w-[204px] xl:block"
        >
          <div className="animate-float-gentle flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 dark:border-white/10 dark:bg-[#0b1328]/85 dark:shadow-black/45">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {isEn ? "AI Extraction" : "Extracción IA"}
                </p>
                <div className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
                  {EQ_DELAYS.map((delay, idx) => (
                    <span
                      key={idx}
                      style={{ animationDelay: delay }}
                      className={`animate-eq w-[2.5px] rounded-full bg-blue-500 dark:bg-blue-400 ${EQ_HEIGHTS[idx]}`}
                    />
                  ))}
                </div>
              </div>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? "0.4 sec • Voice & Chat" : "0.4 seg • Voz y Chat"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom-left floating telemetry card: PDF Corporativo + animated progress */}
        <motion.div
          style={{ y: leftBottomY }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.28 }}
          className="pointer-events-auto absolute left-3 top-64 z-20 hidden w-[204px] xl:block"
        >
          <div className="animate-float-alt flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 dark:border-white/10 dark:bg-[#0b1328]/85 dark:shadow-black/45">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {isEn ? "Branded PDF" : "PDF Corporativo"}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? "Logo + Tax + Discount" : "Logo + IVA + Descuento"}
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="animate-pdf-progress h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 dark:to-sky-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top-right floating telemetry card: Cierre en 1 Clic + live ping & badge */}
        <motion.div
          style={{ y: rightTopY }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.2 }}
          className="pointer-events-auto absolute right-3 top-14 z-20 hidden w-[204px] xl:block"
        >
          <div className="animate-float-alt flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 dark:border-white/10 dark:bg-[#0b1328]/85 dark:shadow-black/45">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-400" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {isEn ? "Approved" : "Aprobado"}
                </p>
                <span className="shrink-0 rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-700 dark:text-sky-300">
                  +$1,988
                </span>
              </div>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? "Client portal /q" : "Portal cliente /q"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom-right floating telemetry card: Cloud Firestore + pulsing sync ring */}
        <motion.div
          style={{ y: rightBottomY }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.34 }}
          className="pointer-events-auto absolute right-3 top-[17rem] z-20 hidden w-[204px] xl:block"
        >
          <div className="animate-float-gentle flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 dark:border-white/10 dark:bg-[#0b1328]/85 dark:shadow-black/45">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <Database className="h-4 w-4" />
              <span className="absolute inset-0 animate-pulse rounded-xl ring-1 ring-blue-400/40" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500 dark:bg-sky-400" />
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">Cloud Firestore</p>
              </div>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? "Live sync" : "Sincronización en vivo"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Official Transparent Brand Banner */}
        <motion.div
          style={{ y: bannerY }}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 20 }}
          className="mx-auto mb-10 max-w-3xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative">
            {/* Dark theme banner */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/axioma-banner.png"
              alt="Axioma-X — Cotizador inteligente"
              className="block h-auto w-full object-contain opacity-0 drop-shadow-[0_12px_32px_rgba(37,99,235,0.2)] transition-opacity duration-500 ease-in-out dark:opacity-100"
            />
            {/* Light theme banner (crossfade) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/axioma-banner-light.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 block h-auto w-full object-contain opacity-100 transition-opacity duration-500 ease-in-out dark:opacity-0"
            />
          </div>
        </motion.div>

        {/* Hero Top Copy */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.08 }}
          >
            <div className="animate-float-gentle inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-[0_0_24px_rgba(59,130,246,0.12)] dark:border-blue-400/30 dark:text-sky-300 dark:shadow-[0_0_24px_rgba(59,130,246,0.2)]">
              <Sparkles className="h-3.5 w-3.5" />
              {isEn
                ? "Smart Quoting Platform for SMBs"
                : "Plataforma Inteligente de Cotizaciones para PyMEs"}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.14 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            {isEn ? "From WhatsApp message to " : "De mensaje de WhatsApp a "}
            <span className="inline-flex min-h-[1.2em] items-center justify-center align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phrases[phraseIndex]}
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="animate-gradient-text inline-block bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-200 dark:to-blue-500"
                >
                  {phrases[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            {isEn ? "in 15 seconds." : "en 15 segundos."}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.22 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg"
          >
            {isEn
              ? "Axioma-X turns informal text, voice, or photo requests into accurate corporate quotes with your real price catalog and an instant approval link for your client."
              : "Axioma-X convierte solicitudes informales por texto, dictado de voz o imagen en cotizaciones corporativas exactas con tu catálogo de precios y un enlace de aprobación inmediata para tu cliente."}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticButton>
              <Link
                href="/app"
                className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                {isEn ? "Try Full Workspace" : "Probar Workspace Completo"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>

            <a
              href="#demo"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-500/40 hover:bg-white active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-blue-400/40 dark:hover:bg-white/10"
            >
              <Play className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
              {isEn ? "Try live simulator" : "Probar simulador en vivo"}
            </a>
          </motion.div>

          {/* Proof metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.34 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-600 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong className="text-slate-900 dark:text-white">&lt; 15 sec</strong>{" "}
              {isEn ? "per quote" : "por cotización"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong className="text-slate-900 dark:text-white">Multimodal:</strong>{" "}
              {isEn ? "Text, Voice & Photo" : "Texto, Voz y Foto"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong className="text-slate-900 dark:text-white">PDF + Portal /q</strong>{" "}
              {isEn ? "in 1 click" : "en 1 clic"}
            </span>
          </motion.div>
        </div>

        {/* Live Interactive Sandbox */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.38 }}
          className="mt-12 sm:mt-14"
        >
          <HeroSimulator />
        </motion.div>
      </div>
    </section>
  );
}
