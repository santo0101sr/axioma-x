"use client";

import { useState } from "react";
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
import { ScrollReveal, SpotlightCard } from "@/components/landing/MotionPrimitives";

const MANUAL_STEPS = [
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

const AXIOMA_STEPS = [
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

export function BeforeAfterSection() {
  const [mode, setMode] = useState<"axioma" | "manual">("axioma");
  const isAxioma = mode === "axioma";
  const steps = isAxioma ? AXIOMA_STEPS : MANUAL_STEPS;

  return (
    <section
      id="como-funciona"
      className="border-t border-white/10 bg-[#0b1120] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
                El problema real en PyMEs
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                El 78% de las ventas se las lleva quien cotiza primero y con claridad.
              </h2>
              <p className="mt-3 text-base text-slate-400">
                Compara el flujo tradicional frente a operar tu proceso comercial con Axioma-X.
              </p>
            </div>

            {/* Interactive Mode Switcher */}
            <div className="inline-flex rounded-2xl border border-white/10 bg-[#070b14] p-1.5">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  !isAxioma
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/15"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                Proceso Manual (45 min)
              </button>
              <button
                type="button"
                onClick={() => setMode("axioma")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isAxioma
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Con Axioma-X (15 seg)
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Step Interactive Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={`${mode}-${item.step}`} delay={idx * 85}>
                <SpotlightCard
                  spotlightColor={
                    isAxioma
                      ? "rgba(52, 211, 153, 0.07)"
                      : "rgba(244, 63, 94, 0.07)"
                  }
                  className={`group flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    isAxioma
                      ? "border-emerald-500/25 bg-gradient-to-b from-[#0f172a] to-emerald-950/20 hover:border-emerald-400/45"
                      : "border-white/10 bg-[#0f172a]/70 hover:border-rose-500/35"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                          isAxioma
                            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-white/5 text-slate-400 ring-1 ring-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${
                          isAxioma
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        {item.time}
                      </span>
                    </div>

                    <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Paso {item.step}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Summary Strip */}
        <ScrollReveal delay={160}>
          <div
            className={`mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4 transition ${
              isAxioma
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                : "border-rose-500/25 bg-rose-500/10 text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              {isAxioma ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
              )}
              <p className="text-sm font-medium">
                {isAxioma
                  ? "Resultado: Respuesta profesional en menos de 15 segundos, sin errores de cálculo y con trazabilidad completa."
                  : "Resultado: Fugas de tiempo operativo, errores de cálculo manual y leads fríos que compran con la competencia."}
              </p>
            </div>
            <span
              className={`font-mono text-xs font-extrabold uppercase tracking-wider ${
                isAxioma ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isAxioma ? "98% más rápido" : "Alto costo oculto"}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
