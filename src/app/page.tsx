import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { INDUSTRY_PRESETS, INITIAL_QUOTES } from "@/data/presets";
import { encodeSharedQuote } from "@/lib/share-link";
import { AxiomaLogo } from "@/components/landing/AxiomaLogo";
import {
  HeroInteractiveBackdrop,
  MarqueeStrip,
  ScrollProgressBar,
  ScrollReveal,
  TiltBannerCard,
} from "@/components/landing/MotionPrimitives";
import { HeroSimulator } from "@/components/landing/HeroSimulator";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { IndustryExplorer } from "@/components/landing/IndustryExplorer";
import { ArchitectureBento } from "@/components/landing/ArchitectureBento";

export default function LandingPage() {
  const samplePortalHref = `/q?d=${encodeSharedQuote({
    quote: INITIAL_QUOTES[0],
    business: INDUSTRY_PRESETS[0].business,
  })}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <ScrollProgressBar />
      {/* Sticky Dark Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" aria-label="Axioma-X Inicio" className="shrink-0">
              <AxiomaLogo variant="dark" size="md" />
            </Link>
          </div>

          <nav className="hidden items-center gap-5 whitespace-nowrap text-xs font-semibold text-slate-300 lg:flex">
            <a href="#demo" className="transition hover:text-white">
              Demo en vivo
            </a>
            <a href="#como-funciona" className="transition hover:text-white">
              Cómo funciona
            </a>
            <a href="#impacto" className="transition hover:text-white">
              Impacto &amp; ROI
            </a>
            <a href="#industrias" className="transition hover:text-white">
              Industrias
            </a>
            <a href="#arquitectura" className="transition hover:text-white">
              Arquitectura
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
            <a
              href={samplePortalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Portal Cliente
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/app"
              className="btn-shimmer group inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98]"
            >
              Abrir Plataforma
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Dark Executive Hero */}
      <section className="bg-hero-grid relative overflow-hidden bg-slate-950 pb-20 pt-14 text-white sm:pb-28 sm:pt-20">
        <HeroInteractiveBackdrop />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Floating Telemetry Chips flanking Hero on Desktop */}
          <div
            className="animate-float-gentle pointer-events-auto absolute left-3 top-12 z-20 hidden w-[200px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1328]/85 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-emerald-400/45 xl:flex"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <p className="truncate text-xs font-bold text-white">Extracción IA</p>
              </div>
              <p className="truncate text-[10px] text-slate-400">0.4 seg • Catálogo real</p>
            </div>
          </div>

          <div
            className="animate-float-alt pointer-events-auto absolute left-3 top-64 z-20 hidden w-[200px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1328]/85 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 xl:flex"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                <p className="truncate text-xs font-bold text-white">PDF Corporativo</p>
              </div>
              <p className="truncate text-[10px] text-slate-400">Logo + IVA + Descuento</p>
            </div>
          </div>

          <div
            className="animate-float-alt pointer-events-auto absolute right-3 top-14 z-20 hidden w-[200px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1328]/85 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-emerald-400/45 xl:flex"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <p className="truncate text-xs font-bold text-white">Cierre en 1 Clic</p>
              </div>
              <p className="truncate text-[10px] text-slate-400">Portal cliente /q</p>
            </div>
          </div>

          <div
            className="animate-float-gentle pointer-events-auto absolute right-3 top-[17rem] z-20 hidden w-[200px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1328]/85 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-400/45 xl:flex"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-400">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <p className="truncate text-xs font-bold text-white">Cloud Firestore</p>
              </div>
              <p className="truncate text-[10px] text-slate-400">Sincronización en vivo</p>
            </div>
          </div>

          {/* Official Brand Banner with 3D tilt + orbiting neon border */}
          <TiltBannerCard className="animate-fade-in-up mx-auto mb-10 max-w-3xl shadow-2xl shadow-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/axioma-banner.jpg"
              alt="Axioma-X — Cotizador inteligente — Build for Business"
              className="block h-auto w-full object-cover"
            />
          </TiltBannerCard>

          {/* Hero Top Copy */}
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="animate-float-gentle inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
                <Sparkles className="h-3.5 w-3.5" />
                Plataforma Inteligente de Cotizaciones para PyMEs
              </div>
            </div>

            <h1
              className="animate-fade-in-up mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "180ms" }}
            >
              De mensaje de WhatsApp a{" "}
              <span className="animate-gradient-text bg-gradient-to-r from-emerald-400 via-teal-200 to-blue-400 bg-clip-text text-transparent">
                cotización PDF
              </span>{" "}
              en 15 segundos.
            </h1>

            <p
              className="animate-fade-in-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
              style={{ animationDelay: "260ms" }}
            >
              Axioma-X convierte solicitudes informales por texto, dictado de voz o
              imagen en cotizaciones corporativas exactas con tu catálogo de precios y
              un enlace de aprobación inmediata para tu cliente.
            </p>

            {/* Primary CTAs */}
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "340ms" }}
            >
              <Link
                href="/app"
                className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98]"
              >
                Probar Workspace Completo
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-white/10 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
                Probar simulador en vivo
              </a>
            </div>

            {/* Proof metrics strip */}
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400"
              style={{ animationDelay: "420ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <strong className="text-white">&lt; 15 seg</strong> por cotización
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <strong className="text-white">Multimodal:</strong> Texto, Voz y Foto
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <strong className="text-white">PDF + Portal /q</strong> en 1 clic
              </span>
            </div>
          </div>

          {/* Live Interactive Sandbox */}
          <div
            className="animate-fade-in-up mt-12 sm:mt-14"
            style={{ animationDelay: "480ms" }}
          >
            <HeroSimulator />
          </div>
        </div>
      </section>

      {/* Infinite Capabilities Marquee */}
      <MarqueeStrip />

      {/* Interactive Before vs After Section */}
      <BeforeAfterSection />

      {/* Interactive Business ROI Calculator */}
      <RoiCalculator />

      {/* Interactive Multi-Industry Presets Explorer */}
      <IndustryExplorer />

      {/* Capabilities Bento Grid & Architecture */}
      <ArchitectureBento />

      {/* Final Executive Dark CTA Banner */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div
          className="animate-aurora pointer-events-none -left-24 top-0 absolute h-72 w-72 rounded-full bg-[#2546f0]/20 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="animate-aurora-reverse pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]"
          aria-hidden="true"
        />
        <ScrollReveal className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="animate-float-gentle inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Prueba instantánea sin registro
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Experimenta el flujo completo de Axioma-X ahora mismo
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Crea una cotización por voz o WhatsApp, edita tu catálogo de precios,
            descarga el PDF con tu logo y abre el portal de aprobación para clientes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98]"
            >
              Entrar al Workspace
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href={samplePortalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              Ver demo del Portal Cliente
              <ExternalLink className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-8 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <AxiomaLogo variant="dark" size="sm" />
            <span className="text-slate-600">|</span>
            <span>Plataforma de Cotizaciones y Gestión Comercial</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="transition hover:text-white">
              Workspace
            </Link>
            <a href="#demo" className="transition hover:text-white">
              Simulador
            </a>
            <span className="text-slate-500">
              © 2026 Axioma-X
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
