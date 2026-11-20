"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Layers,
  MessageSquareQuote,
  Tag,
} from "lucide-react";
import { INDUSTRY_PRESETS } from "@/data/presets";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/components/LanguageProvider";
import { MagneticButton, ScrollReveal } from "@/components/landing/MotionPrimitives";

export function IndustryExplorer() {
  const { isEn } = useLanguage();
  const [selectedId, setSelectedId] = useState(INDUSTRY_PRESETS[0].id);
  const preset =
    INDUSTRY_PRESETS.find((p) => p.id === selectedId) ?? INDUSTRY_PRESETS[0];

  return (
    <section
      id="industrias"
      className="overflow-hidden border-t border-slate-200/80 bg-[#e6ecf4]/70 py-20 backdrop-blur-[1px] transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1120]/85 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-sky-300">
                <Layers className="h-3.5 w-3.5" />
                {isEn ? "Multi-industry from day 1" : "Multi-industria desde el día 1"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {isEn
                  ? "Built for any service-based business that quotes"
                  : "Adaptable a cualquier negocio que cotice por servicios"}
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                {isEn
                  ? "Explore preloaded industry templates or customize your own price catalog, currency, and taxes."
                  : "Explora nuestras plantillas precargadas o edita tu propio catálogo de precios, monedas e impuestos."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {INDUSTRY_PRESETS.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`relative rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isSelected
                        ? "text-white"
                        : "border border-slate-300/80 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="industry-pill"
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-blue-600 shadow-sm shadow-blue-500/25"
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Active Industry Card */}
        <ScrollReveal delay={100}>
          <AnimatePresence mode="wait">
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="mt-10 grid gap-6 rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/80 dark:shadow-none sm:p-8 lg:grid-cols-12"
            >
              {/* Business profile + sample message */}
              <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-900 dark:border-white/10 dark:bg-[#070b14] dark:text-white">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {preset.business.name}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {preset.business.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                      {isEn ? "Currency:" : "Moneda:"} {preset.business.currency}
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                      {preset.business.taxLabel}: {preset.business.taxPercent}%
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                      {isEn ? "Validity:" : "Validez:"} {preset.business.validityDays}{" "}
                      {isEn ? "days" : "días"}
                    </span>
                  </div>

                  {preset.sampleMessages[0] && (
                    <div className="mt-6 rounded-2xl border border-blue-500/25 bg-blue-50/70 p-4 dark:bg-[#070b14]">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        {isEn ? "Sample client request" : "Ejemplo de solicitud real"}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        &ldquo;{preset.sampleMessages[0].text}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <MagneticButton className="w-full sm:w-auto">
                    <Link
                      href={`/app?preset=${preset.id}`}
                      className="btn-shimmer group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 sm:w-auto"
                    >
                      {isEn ? `Launch Workspace with ${preset.label}` : `Lanzar Workspace con ${preset.label}`}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </MagneticButton>
                </div>
              </div>

              {/* Live Catalog Preview */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-[#070b14] lg:col-span-7">
                <div className="flex items-center justify-between border-b border-slate-200/90 pb-3 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {isEn
                      ? `Base catalog loaded (${preset.catalog.length} items)`
                      : `Catálogo base cargado (${preset.catalog.length} ítems)`}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {isEn ? "100% editable" : "100% editable"}
                  </span>
                </div>

                <div className="mt-3 divide-y divide-slate-200/70 dark:divide-white/5">
                  {preset.catalog.map((item, idx) => (
                    <motion.div
                      key={`${preset.id}-${item.id}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: idx * 0.045,
                        type: "spring",
                        stiffness: 260,
                        damping: 24,
                      }}
                      className="flex items-start justify-between gap-4 rounded-lg px-2 py-3 transition hover:bg-white dark:hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-sm font-extrabold text-blue-600 dark:text-sky-400">
                          {formatMoney(item.unitPrice, preset.business.currency)}
                        </p>
                        <p className="text-[11px] text-slate-500">por {item.unit}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </ScrollReveal>
      </div>
    </section>
  );
}
