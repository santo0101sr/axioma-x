"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { MagneticButton, ScrollReveal } from "@/components/landing/MotionPrimitives";

interface FinalCtaSectionProps {
  samplePortalHref: string;
}

export function FinalCtaSection({ samplePortalHref }: FinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-transparent py-20 text-slate-900 transition-colors duration-300 dark:bg-slate-950/65 dark:text-white sm:py-24">
      <div
        className="animate-aurora pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#2546f0]/15 blur-[120px] dark:bg-[#2546f0]/20"
        aria-hidden="true"
      />
      <div
        className="animate-aurora-reverse pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-sky-500/15 blur-[120px] dark:bg-sky-500/20"
        aria-hidden="true"
      />

      <ScrollReveal className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-2xl shadow-slate-900/10 dark:shadow-black/60">
          <div
            className="animate-border-spin pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-75"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(37, 99, 235, 0.85) 65deg, rgba(96, 165, 250, 0.9) 140deg, rgba(56, 189, 248, 0.7) 190deg, transparent 255deg, transparent 360deg)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 rounded-[22px] bg-[#f8fafc]/95 px-6 py-12 text-center backdrop-blur-xl transition-colors duration-300 dark:bg-[#0b1120]/95 sm:px-12 sm:py-14">
            <span className="animate-float-gentle inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-400/30 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Prueba instantánea sin registro
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Experimenta el flujo completo de{" "}
              <span className="animate-gradient-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-200 dark:to-blue-500">
                Axioma-X
              </span>{" "}
              ahora mismo
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Crea una cotización por voz o WhatsApp, edita tu catálogo de precios,
              descarga el PDF con tu logo y abre el portal de aprobación para clientes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton>
                <Link
                  href="/app"
                  className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]"
                >
                  Entrar al Workspace
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </MagneticButton>

              <a
                href={samplePortalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-blue-400/40 dark:hover:bg-white/10"
              >
                Ver demo del Portal Cliente
                <ExternalLink className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
