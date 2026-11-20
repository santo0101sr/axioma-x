"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Link2,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { ScrollReveal, SpotlightCard } from "@/components/landing/MotionPrimitives";

const MANUAL_STEPS_ES = [
  {
    step: "01",
    time: "10 min",
    title: "Leer audios y chats dispersos",
    desc: "El cliente manda 3 mensajes de WhatsApp con medidas aproximadas y fotos sin orden.",
    icon: MessageSquare,
  },
  {
    step: "02",
    time: "15 min",
    title: "Buscar precios en hojas viejas",
    desc: "Abrir Excel o notas del teléfono para recordar tarifas actualizadas y calcular IVA a mano.",
    icon: FileSpreadsheet,
  },
  {
    step: "03",
    time: "15 min",
    title: "Armar y formatear el documento",
    desc: "Copiar una cotización anterior en Word/Canva, corregir nombres y exportar sin errores.",
    icon: FileText,
  },
  {
    step: "04",
    time: "5+ horas",
    title: "Seguimiento perdido en el chat",
    desc: "Al enviar tarde, el cliente ya eligió a otro proveedor o olvida confirmar el pedido.",
    icon: AlertTriangle,
  },
];

const MANUAL_STEPS_EN = [
  {
    step: "01",
    time: "10 min",
    title: "Read scattered chats & voice notes",
    desc: "The client sends 3 WhatsApp messages with rough measurements and unorganized photos.",
    icon: MessageSquare,
  },
  {
    step: "02",
    time: "15 min",
    title: "Look up prices in old spreadsheets",
    desc: "Open Excel or phone notes to remember updated rates and calculate taxes manually.",
    icon: FileSpreadsheet,
  },
  {
    step: "03",
    time: "15 min",
    title: "Build and format the document",
    desc: "Duplicate an old Word/Canva quote, fix client details, and export without typos.",
    icon: FileText,
  },
  {
    step: "04",
    time: "5+ hours",
    title: "Follow-up lost in chat",
    desc: "By replying late, the client already chose a competitor or forgets to confirm.",
    icon: AlertTriangle,
  },
];

const AXIOMA_STEPS_ES = [
  {
    step: "01",
    time: "3 seg",
    title: "Pega chat, dicta o sube foto",
    desc: "Copia el mensaje de WhatsApp, usa dictado por voz o adjunta una foto de referencia.",
    icon: MessageSquare,
  },
  {
    step: "02",
    time: "2 seg",
    title: "Cruce inteligente con tu catálogo",
    desc: "Axioma-X detecta cantidades, cliente y servicios con tus precios reales e impuestos.",
    icon: Sparkles,
  },
  {
    step: "03",
    time: "5 seg",
    title: "PDF corporativo + Link compartible",
    desc: "Genera el PDF con tu logotipo y un enlace directo (/q) listo para enviar por WhatsApp.",
    icon: Link2,
  },
  {
    step: "04",
    time: "1 clic",
    title: "Aprobación instantánea y pipeline",
    desc: "El cliente aprueba desde su celular y la cotización queda registrada en tu historial.",
    icon: CheckCircle2,
  },
];

const AXIOMA_STEPS_EN = [
  {
    step: "01",
    time: "3 sec",
    title: "Paste chat, dictate, or upload photo",
    desc: "Copy the WhatsApp message, use voice dictation, or attach a reference photo.",
    icon: MessageSquare,
  },
  {
    step: "02",
    time: "2 sec",
    title: "Smart matching with your catalog",
    desc: "Axioma-X detects quantities, client info, and services with your real prices and tax.",
    icon: Sparkles,
  },
  {
    step: "03",
    time: "5 sec",
    title: "Branded PDF + Shareable Link",
    desc: "Generate a PDF with your logo and a direct /q approval link ready for WhatsApp.",
    icon: Link2,
  },
  {
    step: "04",
    time: "1 click",
    title: "Instant approval & pipeline",
    desc: "Your client approves from their phone and the quote is saved in your history.",
    icon: CheckCircle2,
  },
];

export function BeforeAfterSection() {
  const { isEn } = useLanguage();
  const [mode, setMode] = useState<"axioma" | "manual">("axioma");
  const isAxioma = mode === "axioma";
  const steps = isAxioma
    ? isEn
      ? AXIOMA_STEPS_EN
      : AXIOMA_STEPS_ES
    : isEn
    ? MANUAL_STEPS_EN
    : MANUAL_STEPS_ES;

  return (
    <section
      id="como-funciona"
      className="overflow-hidden border-t border-slate-200/80 bg-[#e6ecf4]/70 py-20 backdrop-blur-[1px] transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1120]/85 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-sky-300">
                <TrendingUp className="h-3.5 w-3.5" />
                {isEn ? "The real SMB bottleneck" : "El problema real en PyMEs"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {isEn
                  ? "78% of deals go to the business that quotes first and clearest."
                  : "El 78% de las ventas se las lleva quien cotiza primero y con claridad."}
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                {isEn
                  ? "Compare the traditional manual workflow against running your sales process with Axioma-X."
                  : "Compara el flujo tradicional frente a operar tu proceso comercial con Axioma-X."}
              </p>
            </div>

            {/* Interactive Mode Switcher with spring morphing pill */}
            <div className="inline-flex rounded-2xl border border-slate-300/80 bg-white/80 p-1.5 shadow-sm dark:border-white/10 dark:bg-[#070b14] dark:shadow-none">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  !isAxioma
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {!isAxioma && (
                  <motion.span
                    layoutId="mode-switch-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-slate-200/80 shadow-sm ring-1 ring-slate-300 dark:bg-white/10 dark:ring-white/15"
                  />
                )}
                <Clock className="relative z-10 h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                <span className="relative z-10">
                  {isEn ? "Manual Process (45 min)" : "Proceso Manual (45 min)"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("axioma")}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isAxioma
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {isAxioma && (
                  <motion.span
                    layoutId="mode-switch-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-blue-600 shadow-md shadow-blue-500/25"
                  />
                )}
                <Send className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">
                  {isEn ? "With Axioma-X (15 sec)" : "Con Axioma-X (15 seg)"}
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Step Interactive Cards + Traveling Energy Track */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="relative mt-10"
          >
            {isAxioma && (
              <div
                className="pointer-events-none absolute left-10 right-10 top-1/2 hidden h-px -translate-y-1/2 overflow-hidden bg-blue-500/15 lg:block"
                aria-hidden="true"
              >
                <span className="animate-data-packet absolute top-1/2 h-2 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-sky-300 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              </div>
            )}

            <div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 22,
                      delay: idx * 0.07,
                    }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="h-full"
                  >
                    <SpotlightCard
                      spotlightColor={
                        isAxioma
                          ? "rgba(96, 165, 250, 0.08)"
                          : "rgba(244, 63, 94, 0.07)"
                      }
                      className={`group flex h-full flex-col justify-between rounded-2xl border p-6 transition-colors duration-300 ${
                        isAxioma
                          ? "border-blue-500/25 bg-gradient-to-b from-white to-blue-50/70 shadow-sm hover:border-blue-400/50 dark:from-[#0f172a] dark:to-blue-950/30 dark:shadow-none dark:hover:border-blue-400/45"
                          : "border-slate-200/90 bg-white/90 shadow-sm hover:border-rose-400/45 dark:border-white/10 dark:bg-[#0f172a]/70 dark:shadow-none dark:hover:border-rose-500/35"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                              isAxioma
                                ? "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400"
                                : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${
                              isAxioma
                                ? "border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-sky-300"
                                : "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {item.time}
                          </span>
                        </div>

                        <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          {isEn ? `Step ${item.step}` : `Paso ${item.step}`}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Summary Strip */}
        <ScrollReveal delay={160}>
          <div
            className={`mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4 transition ${
              isAxioma
                ? "border-blue-500/25 bg-blue-500/10 text-blue-950 dark:text-blue-100"
                : "border-rose-500/25 bg-rose-500/10 text-rose-950 dark:text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              {isAxioma ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <p className="text-sm font-medium">
                {isAxioma
                  ? isEn
                    ? "Result: Professional response in under 15 seconds, zero math errors, and full traceability."
                    : "Resultado: Respuesta profesional en menos de 15 segundos, sin errores de cálculo y con trazabilidad completa."
                  : isEn
                  ? "Result: Wasted admin hours, manual calculation errors, and cold leads buying from competitors."
                  : "Resultado: Fugas de tiempo operativo, errores de cálculo manual y leads fríos que compran con la competencia."}
              </p>
            </div>
            <span
              className={`font-mono text-xs font-extrabold uppercase tracking-wider ${
                isAxioma ? "text-blue-700 dark:text-sky-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isAxioma
                ? isEn
                  ? "98% faster"
                  : "98% más rápido"
                : isEn
                ? "High hidden cost"
                : "Alto costo oculto"}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
