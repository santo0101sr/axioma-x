"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";
import {
  AnimatedNumber,
  MagneticButton,
  ScrollReveal,
  SpotlightCard,
} from "@/components/landing/MotionPrimitives";

export function RoiCalculator() {
  const [quotesPerWeek, setQuotesPerWeek] = useState(20);
  const [minutesPerQuote, setMinutesPerQuote] = useState(35);
  const [avgTicket, setAvgTicket] = useState(650);

  const monthlyQuotes = quotesPerWeek * 4;
  const manualHoursPerMonth = (monthlyQuotes * minutesPerQuote) / 60;
  const axiomaHoursPerMonth = (monthlyQuotes * 0.5) / 60;
  const hoursSavedPerMonth = Math.max(
    1,
    Math.round(manualHoursPerMonth - axiomaHoursPerMonth)
  );

  const operationalSavings = Math.round(hoursSavedPerMonth * 18);
  const projectedExtraDeals = Math.max(1, Math.round(monthlyQuotes * 0.08));
  const projectedExtraRevenue = projectedExtraDeals * avgTicket;

  const formatUsd = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const axiomaWidthPercent = Math.max(
    3,
    Math.min(100, (axiomaHoursPerMonth / manualHoursPerMonth) * 100)
  );

  return (
    <section
      id="impacto"
      className="bg-subtle-grid overflow-hidden border-t border-white/10 bg-[#070b14] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <Calculator className="h-3.5 w-3.5" />
            Calculadora de Impacto Comercial
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Calcula cuánto tiempo y ventas recuperas cada mes
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Ajusta el volumen de tu negocio o agencia y simula el retorno inmediato de responder en segundos.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* Left: Interactive sliders */}
          <ScrollReveal direction="left" delay={80} className="lg:col-span-5">
            <div className="h-full rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6 sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Parámetros de tu operación
              </h3>

              <div className="mt-6 space-y-7">
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="quotes-slider"
                      className="text-sm font-semibold text-slate-200"
                    >
                      Cotizaciones por semana
                    </label>
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-sm font-bold text-emerald-300">
                      {quotesPerWeek} / sem
                    </span>
                  </div>
                  <input
                    id="quotes-slider"
                    type="range"
                    min={5}
                    max={80}
                    step={5}
                    value={quotesPerWeek}
                    onChange={(e) => setQuotesPerWeek(Number(e.target.value))}
                    className="axioma-slider mt-3 w-full"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>5 / sem</span>
                    <span>80 / sem</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="minutes-slider"
                      className="text-sm font-semibold text-slate-200"
                    >
                      Tiempo manual por cotización
                    </label>
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-sm font-bold text-emerald-300">
                      {minutesPerQuote} min
                    </span>
                  </div>
                  <input
                    id="minutes-slider"
                    type="range"
                    min={10}
                    max={90}
                    step={5}
                    value={minutesPerQuote}
                    onChange={(e) => setMinutesPerQuote(Number(e.target.value))}
                    className="axioma-slider mt-3 w-full"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>10 min</span>
                    <span>90 min</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="ticket-slider"
                      className="text-sm font-semibold text-slate-200"
                    >
                      Ticket promedio por proyecto
                    </label>
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-sm font-bold text-emerald-300">
                      {formatUsd(avgTicket)}
                    </span>
                  </div>
                  <input
                    id="ticket-slider"
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(Number(e.target.value))}
                    className="axioma-slider mt-3 w-full"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>$100</span>
                    <span>$3,000</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Live KPI output panel */}
          <ScrollReveal direction="right" delay={140} className="lg:col-span-7">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0b1120] p-6 text-white shadow-xl sm:p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Proyección mensual con Axioma-X
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Basado en {monthlyQuotes} cotizaciones/mes y +8% de cierre por respuesta inmediata
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
                    Ahorro anual:{" "}
                    <AnimatedNumber
                      value={hoursSavedPerMonth * 12}
                      formatter={(n) => `${Math.round(n)} horas/año`}
                    />
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <SpotlightCard className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      Tiempo recuperado
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-white">
                      <AnimatedNumber
                        value={hoursSavedPerMonth}
                        formatter={(n) => `${Math.round(n)}h`}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      horas libres cada mes
                    </p>
                  </SpotlightCard>

                  <SpotlightCard className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Ahorro operativo
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-white">
                      <AnimatedNumber
                        value={operationalSavings}
                        formatter={(n) => formatUsd(Math.round(n))}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      en horas administrativas
                    </p>
                  </SpotlightCard>

                  <SpotlightCard
                    spotlightColor="rgba(52, 211, 153, 0.10)"
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/50"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Potencial extra
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-emerald-400">
                      <AnimatedNumber
                        value={projectedExtraRevenue}
                        formatter={(n) => `+${formatUsd(Math.round(n))}`}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-200/80">
                      ~{projectedExtraDeals} cierres extra / mes
                    </p>
                  </SpotlightCard>
                </div>

                {/* Visual Time Bar Comparison */}
                <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-[#070b14] p-4">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Esfuerzo manual mensual</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {manualHoursPerMonth.toFixed(1)} horas
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-full rounded-full bg-slate-600" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-emerald-300">
                        Con Axioma-X
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {axiomaHoursPerMonth.toFixed(1)} horas
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        animate={{ width: `${axiomaWidthPercent}%` }}
                        transition={{ type: "spring", stiffness: 160, damping: 24 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Sin configuraciones complejas ni fricción para empezar.
                </p>
                <MagneticButton>
                  <Link
                    href="/app"
                    className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                  >
                    Probar con mis precios
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
