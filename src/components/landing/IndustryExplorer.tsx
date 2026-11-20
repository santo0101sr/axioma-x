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
import { MagneticButton, ScrollReveal } from "@/components/landing/MotionPrimitives";

export function IndustryExplorer() {
  const [selectedId, setSelectedId] = useState(INDUSTRY_PRESETS[0].id);
  const preset =
    INDUSTRY_PRESETS.find((p) => p.id === selectedId) ?? INDUSTRY_PRESETS[0];

  return (
    <section
      id="industrias"
      className="overflow-hidden border-t border-white/10 bg-[#0b1120]/84 py-20 backdrop-blur-[1px] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <Layers className="h-3.5 w-3.5" />
                Multi-industria desde el día 1
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Adaptable a cualquier negocio que cotice por servicios
              </h2>
              <p className="mt-3 text-base text-slate-400">
                Explora nuestras plantillas precargadas o edita tu propio catálogo de precios, monedas e impuestos.
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
                        ? "text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="industry-pill"
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-emerald-500 shadow-sm shadow-emerald-500/20"
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
              className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 lg:grid-cols-12"
            >
              {/* Business profile + sample message */}
              <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-xs font-bold text-white">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    {preset.business.name}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {preset.business.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-300">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                      Moneda: {preset.business.currency}
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                      {preset.business.taxLabel}: {preset.business.taxPercent}%
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                      Validez: {preset.business.validityDays} días
                    </span>
                  </div>

                  {preset.sampleMessages[0] && (
                    <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-[#070b14] p-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        Ejemplo de solicitud real
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        &ldquo;{preset.sampleMessages[0].text}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <MagneticButton className="w-full sm:w-auto">
                    <Link
                      href={`/app?preset=${preset.id}`}
                      className="btn-shimmer group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:w-auto"
                    >
                      Lanzar Workspace con {preset.label}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </MagneticButton>
                </div>
              </div>

              {/* Live Catalog Preview */}
              <div className="rounded-2xl border border-white/10 bg-[#070b14] p-5 lg:col-span-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    Catálogo base cargado ({preset.catalog.length} ítems)
                  </div>
                  <span className="text-[11px] text-slate-500">100% editable</span>
                </div>

                <div className="mt-3 divide-y divide-white/5">
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
                      className="flex items-start justify-between gap-4 rounded-lg px-2 py-3 transition hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-100">{item.name}</p>
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-sm font-extrabold text-emerald-400">
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
