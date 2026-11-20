import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { INDUSTRY_PRESETS, INITIAL_QUOTES } from "@/data/presets";
import { encodeSharedQuote } from "@/lib/share-link";
import { AxiomaLogo } from "@/components/landing/AxiomaLogo";
import { AntigravityField } from "@/components/landing/AntigravityField";
import { ThemeToggle } from "@/components/ThemeProvider";
import { ScrollProgressBar } from "@/components/landing/MotionPrimitives";
import { HeroSection } from "@/components/landing/HeroSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { IndustryExplorer } from "@/components/landing/IndustryExplorer";
import { ArchitectureBento } from "@/components/landing/ArchitectureBento";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

export default function LandingPage() {
  const samplePortalHref = `/q?d=${encodeSharedQuote({
    quote: INITIAL_QUOTES[0],
    business: INDUSTRY_PRESETS[0].business,
  })}`;

  return (
    <div className="relative min-h-screen bg-[#eef2f7] text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100">
      <ScrollProgressBar />
      <AntigravityField />

      <div className="relative z-10">
        {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8fafc]/85 backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" aria-label="Axioma-X Inicio" className="shrink-0">
              <AxiomaLogo variant="auto" size="md" />
            </Link>
          </div>

          <nav className="hidden items-center gap-5 whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300 lg:flex">
            <a href="#demo" className="transition hover:text-slate-950 dark:hover:text-white">
              Demo en vivo
            </a>
            <a href="#como-funciona" className="transition hover:text-slate-950 dark:hover:text-white">
              Cómo funciona
            </a>
            <a href="#impacto" className="transition hover:text-slate-950 dark:hover:text-white">
              Impacto &amp; ROI
            </a>
            <a href="#industrias" className="transition hover:text-slate-950 dark:hover:text-white">
              Industrias
            </a>
            <a href="#arquitectura" className="transition hover:text-slate-950 dark:hover:text-white">
              Arquitectura
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
            <ThemeToggle />
            <a
              href={samplePortalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white sm:inline-flex"
            >
              Portal Cliente
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/app"
              className="btn-shimmer group inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              Abrir Plataforma
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Kinetic Parallax Hero + Live Sandbox */}
      <HeroSection />

      {/* Interactive Before vs After Section */}
      <BeforeAfterSection />

      {/* Interactive Business ROI Calculator */}
      <RoiCalculator />

      {/* Interactive Multi-Industry Presets Explorer */}
      <IndustryExplorer />

      {/* Capabilities Bento Grid & Architecture */}
      <ArchitectureBento />

      {/* Final Executive Dark CTA Banner */}
      <FinalCtaSection samplePortalHref={samplePortalHref} />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-[#e6ecf4] py-8 text-slate-600 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <AxiomaLogo variant="auto" size="sm" />
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span>Plataforma de Cotizaciones y Gestión Comercial</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="transition hover:text-slate-950 dark:hover:text-white">
              Workspace
            </Link>
            <a href="#demo" className="transition hover:text-slate-950 dark:hover:text-white">
              Simulador
            </a>
            <span className="text-slate-500">© 2026 Axioma-X</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
