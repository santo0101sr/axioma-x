"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Database,
  FileDown,
  FileSpreadsheet,
  Link2,
  Mic,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ScrollReveal, SpotlightCard } from "@/components/landing/MotionPrimitives";

const FEATURES = [
  {
    title: "Entrada Multimodal",
    desc: "Procesa texto libre de WhatsApp, dictado por voz en tiempo real (Web Speech API) e imágenes de referencia.",
    badge: "Texto • Voz • Foto",
    icon: Mic,
  },
  {
    title: "Motor Híbrido Resiliente",
    desc: "Compatible con Gemini / OpenAI cuando configuras API key, y motor determinístico instantáneo para operar sin interrupciones.",
    badge: "Alta Disponibilidad",
    icon: Cpu,
  },
  {
    title: "PDF Corporativo al Instante",
    desc: "Generación cliente con jsPDF + autoTable: logotipo personalizado, descuentos, IVA y condiciones comerciales.",
    badge: "Listo para enviar",
    icon: FileDown,
  },
  {
    title: "Portal de Aprobación (/q)",
    desc: "Cada cotización genera un enlace compartible codificado en URL para que el cliente apruebe o pida cambios en 1 clic.",
    badge: "Sin login requerido",
    icon: Link2,
  },
  {
    title: "Pipeline y Exportación CSV",
    desc: "Gestiona estados (Borrador, Enviada, Aprobada, Rechazada), edita cotizaciones previas y exporta a Excel/CSV.",
    badge: "Control comercial",
    icon: FileSpreadsheet,
  },
  {
    title: "Privacidad y Respaldo JSON",
    desc: "Persistencia local inmediata con exportación y restauración completa de negocio, catálogo e historial en JSON.",
    badge: "Portabilidad 100%",
    icon: Database,
  },
];

const PIPELINE = [
  {
    label: "1. Captura",
    detail: "WhatsApp / Voz / Imagen",
  },
  {
    label: "2. Extracción",
    detail: "/api/extract (LLM + Determinístico)",
  },
  {
    label: "3. Motor Comercial",
    detail: "Catálogo + Descuentos + IVA",
  },
  {
    label: "4. Entrega",
    detail: "PDF + Link /q + CSV",
  },
];

export function ArchitectureBento() {
  return (
    <section
      id="arquitectura"
      className="overflow-hidden border-t border-slate-200/80 bg-[#eef2f7]/80 py-20 backdrop-blur-[1px] transition-colors duration-300 dark:border-white/10 dark:bg-[#070b14]/84 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-sky-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Capacidades &amp; Arquitectura
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Construido para operar en producción desde el primer día
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Cada módulo funciona en vivo dentro de Next.js 15 + React 19 + TypeScript, diseñado para máxima velocidad y cero fricción.
          </p>
        </ScrollReveal>

        {/* 6-Card Bento Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={feat.title} delay={idx * 75}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <SpotlightCard className="group h-full rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm transition-colors duration-300 hover:border-blue-500/40 dark:border-white/10 dark:bg-[#0f172a]/85 dark:shadow-none">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:border-blue-400/60 group-hover:bg-blue-500/20 group-hover:text-blue-700 group-hover:shadow-[0_0_18px_rgba(59,130,246,0.2)] dark:text-blue-400 dark:group-hover:bg-blue-500/25 dark:group-hover:text-sky-300 dark:group-hover:shadow-[0_0_18px_rgba(59,130,246,0.3)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {feat.desc}
                    </p>
                  </SpotlightCard>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Clean Architecture Flow Bar with Traveling Data-Packet Track */}
        <ScrollReveal delay={120}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-6 text-slate-900 shadow-sm dark:border-white/10 dark:bg-[#0b1120] dark:text-white dark:shadow-none sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Flujo Técnico End-to-End de Axioma-X
                </h3>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Next.js 15 • TypeScript • Tailwind CSS • jsPDF • Web Speech API
              </span>
            </div>

            <div className="relative mt-6">
              {/* Traveling horizontal data-packet beam across pipeline nodes */}
              <div
                className="pointer-events-none absolute left-8 right-8 top-1/2 hidden h-px -translate-y-1/2 overflow-hidden bg-slate-200 dark:bg-white/10 lg:block"
                aria-hidden="true"
              >
                <span className="animate-data-packet absolute top-1/2 h-1.5 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-[#4f6fff] shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              </div>

              <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PIPELINE.map((node, idx) => (
                  <div key={node.label} className="relative">
                    <ScrollReveal delay={idx * 90} className="h-full">
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 280, damping: 20 }}
                        className="h-full rounded-xl border border-slate-200/90 bg-slate-50/95 p-4 transition-colors duration-300 hover:border-blue-500/40 dark:border-white/10 dark:bg-[#070b14]/95"
                      >
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {node.label}
                        </span>
                        <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {node.detail}
                        </p>
                      </motion.div>
                    </ScrollReveal>
                    {idx < PIPELINE.length - 1 && (
                      <span
                        style={{ animationDelay: `${idx * 250}ms` }}
                        className="animate-flow-arrow pointer-events-none absolute -right-3 top-1/2 z-10 hidden font-mono text-sm font-bold text-blue-600 dark:text-blue-400 lg:block"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
