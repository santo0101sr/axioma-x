"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  AnimatedNumber,
  MagneticButton,
  ScrollReveal,
  SpotlightCard,
} from "@/components/landing/MotionPrimitives";

export function RoiCalculator() {
  const { isEn } = useLanguage();
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
      className="bg-subtle-grid overflow-hidden border-t border-slate-200/80 bg-[#eef2f7]/80 py-20 backdrop-blur-[1px] transition-colors duration-300 dark:border-white/10 dark:bg-[#070b14]/85 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-sky-300">
            <Calculator className="h-3.5 w-3.5" />
            {isEn ? "Commercial Impact Calculator" : "Calculadora de Impacto Comercial"}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {isEn
              ? "Calculate how much time and revenue you recover each month"
              : "Calcula cuánto tiempo y ventas recuperas cada mes"}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {isEn
              ? "Adjust your business or agency volume and simulate the instant ROI of replying in seconds."
              : "Ajusta el volumen de tu negocio o agencia y simula el retorno inmediato de responder en segundos."}
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* Left: Interactive sliders */}
          <ScrollReveal direction="left" delay={80} className="lg:col-span-5">
            <div className="h-full rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-none sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? "Your operation parameters" : "Parámetros de tu operación"}
              </h3>

              <div className="mt-6 space-y-7">
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="quotes-slider"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {isEn ? "Quotes per week" : "Cotizaciones por semana"}
                    </label>
                    <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-sm font-bold text-blue-700 dark:text-sky-300">
                      {quotesPerWeek} / {isEn ? "wk" : "sem"}
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
                    <span>{isEn ? "5 / wk" : "5 / sem"}</span>
                    <span>{isEn ? "80 / wk" : "80 / sem"}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="minutes-slider"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {isEn ? "Manual time per quote" : "Tiempo manual por cotización"}
                    </label>
                    <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-sm font-bold text-blue-700 dark:text-sky-300">
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
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {isEn ? "Average project deal size" : "Ticket promedio por proyecto"}
                    </label>
                    <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-sm font-bold text-blue-700 dark:text-sky-300">
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
            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-6 text-slate-900 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1120] dark:text-white dark:shadow-xl sm:p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-white/10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {isEn ? "Monthly projection with Axioma-X" : "Proyección mensual con Axioma-X"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {isEn
                        ? `Based on ${monthlyQuotes} quotes/mo and +8% close rate from instant response`
                        : `Basado en ${monthlyQuotes} cotizaciones/mes y +8% de cierre por respuesta inmediata`}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 font-mono text-[11px] font-bold text-blue-700 dark:border-blue-400/25 dark:text-sky-300">
                    {isEn ? "Annual savings: " : "Ahorro anual: "}
                    <AnimatedNumber
                      value={hoursSavedPerMonth * 12}
                      formatter={(n) =>
                        isEn ? `${Math.round(n)} hrs/yr` : `${Math.round(n)} horas/año`
                      }
                    />
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <SpotlightCard className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      {isEn ? "Time saved" : "Tiempo recuperado"}
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                      <AnimatedNumber
                        value={hoursSavedPerMonth}
                        formatter={(n) => `${Math.round(n)}h`}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {isEn ? "hours freed every month" : "horas libres cada mes"}
                    </p>
                  </SpotlightCard>

                  <SpotlightCard className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      {isEn ? "Admin savings" : "Ahorro operativo"}
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                      <AnimatedNumber
                        value={operationalSavings}
                        formatter={(n) => formatUsd(Math.round(n))}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {isEn ? "in administrative hours" : "en horas administrativas"}
                    </p>
                  </SpotlightCard>

                  <SpotlightCard
                    spotlightColor="rgba(96, 165, 250, 0.12)"
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-500/50 dark:border-blue-400/30"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-300">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      {isEn ? "Extra upside" : "Potencial extra"}
                    </div>
                    <p className="mt-2 font-mono text-3xl font-extrabold text-blue-700 dark:text-sky-400">
                      <AnimatedNumber
                        value={projectedExtraRevenue}
                        formatter={(n) => `+${formatUsd(Math.round(n))}`}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-200/80">
                      {isEn
                        ? `~${projectedExtraDeals} extra deals / mo`
                        : `~${projectedExtraDeals} cierres extra / mes`}
                    </p>
                  </SpotlightCard>
                </div>

                {/* Visual Time Bar Comparison */}
                <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-[#070b14]">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isEn ? "Monthly manual effort" : "Esfuerzo manual mensual"}
                      </span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {manualHoursPerMonth.toFixed(1)} {isEn ? "hours" : "horas"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full w-full rounded-full bg-slate-400 dark:bg-slate-600" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-blue-700 dark:text-sky-300">
                        {isEn ? "With Axioma-X" : "Con Axioma-X"}
                      </span>
                      <span className="font-mono font-bold text-blue-700 dark:text-sky-400">
                        {axiomaHoursPerMonth.toFixed(1)} {isEn ? "hours" : "horas"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        animate={{ width: `${axiomaWidthPercent}%` }}
                        transition={{ type: "spring", stiffness: 160, damping: 24 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 shadow-[0_0_14px_rgba(59,130,246,0.45)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? "Zero complex setup or friction to get started."
                    : "Sin configuraciones complejas ni fricción para empezar."}
                </p>
                <MagneticButton>
                  <Link
                    href="/app"
                    className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
                  >
                    {isEn ? "Try with my prices" : "Probar con mis precios"}
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
