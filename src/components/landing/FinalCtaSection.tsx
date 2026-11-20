"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { MagneticButton, ScrollReveal } from "@/components/landing/MotionPrimitives";

interface FinalCtaSectionProps {
  samplePortalHref: string;
}

export function FinalCtaSection({ samplePortalHref }: FinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
      <div
        className="animate-aurora pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#2546f0]/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="animate-aurora-reverse pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]"
        aria-hidden="true"
      />

      <ScrollReveal className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-2xl shadow-black/60">
          <div
            className="animate-border-spin pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-75"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(59, 91, 255, 0.85) 65deg, rgba(52, 211, 153, 0.9) 140deg, rgba(34, 211, 238, 0.7) 190deg, transparent 255deg, transparent 360deg)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 rounded-[22px] bg-[#0b1120]/95 px-6 py-12 text-center backdrop-blur-xl sm:px-12 sm:py-14">
            <span className="animate-float-gentle inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Prueba instantánea sin registro
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Experimenta el flujo completo de{" "}
              <span className="animate-gradient-text bg-gradient-to-r from-emerald-400 via-teal-200 to-blue-400 bg-clip-text text-transparent">
                Axioma-X
              </span>{" "}
              ahora mismo
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Crea una cotización por voz o WhatsApp, edita tu catálogo de precios,
              descarga el PDF con tu logo y abre el portal de aprobación para clientes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton>
                <Link
                  href="/app"
                  className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98]"
                >
                  Entrar al Workspace
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </MagneticButton>

              <a
                href={samplePortalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/10"
              >
                Ver demo del Portal Cliente
                <ExternalLink className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
