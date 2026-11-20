"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Loader2,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { INDUSTRY_PRESETS } from "@/data/presets";
import { Quote } from "@/types/quote";
import {
  addDaysIso,
  calculateQuoteTotals,
  formatMoney,
  generateQuoteNumber,
} from "@/lib/format";
import { downloadQuotePdf } from "@/lib/pdf-generator";
import { encodeSharedQuote } from "@/lib/share-link";

function buildInitialPreview(presetIndex = 0): Quote {
  const preset = INDUSTRY_PRESETS[presetIndex] ?? INDUSTRY_PRESETS[0];
  return {
    id: `hero-demo-${preset.id}`,
    quoteNumber: "COT-2611-804",
    createdAt: "2026-11-19",
    validUntil: "2026-12-04",
    clientName: "Carlos Méndez",
    clientPhone: "8711-4420",
    clientCompany: "",
    originalMessage: preset.sampleMessages[0]?.text ?? "",
    summary: "Pintura de interiores (65 m²), cerámica en baño (12 m²) y 4 luminarias",
    items: [
      {
        id: "hd-1",
        catalogItemId: preset.catalog[0]?.id,
        name: preset.catalog[0]?.name ?? "Pintura interior / exterior",
        description: preset.catalog[0]?.description ?? "",
        quantity: 65,
        unit: preset.catalog[0]?.unit ?? "m²",
        unitPrice: preset.catalog[0]?.unitPrice ?? 8.5,
      },
      {
        id: "hd-2",
        catalogItemId: preset.catalog[1]?.id,
        name: preset.catalog[1]?.name ?? "Instalación de piso cerámico",
        description: preset.catalog[1]?.description ?? "",
        quantity: 12,
        unit: preset.catalog[1]?.unit ?? "m²",
        unitPrice: preset.catalog[1]?.unitPrice ?? 22,
      },
      {
        id: "hd-3",
        catalogItemId: preset.catalog[3]?.id,
        name: preset.catalog[3]?.name ?? "Punto eléctrico / luminaria",
        description: preset.catalog[3]?.description ?? "",
        quantity: 4,
        unit: preset.catalog[3]?.unit ?? "punto",
        unitPrice: preset.catalog[3]?.unitPrice ?? 35,
      },
    ],
    discountPercent: 0,
    taxPercent: preset.business.taxPercent,
    currency: preset.business.currency,
    notes: preset.business.defaultNotes,
    status: "sent",
    extractionMode: "demo",
  };
}

export function HeroSimulator() {
  const [presetId, setPresetId] = useState<string>(INDUSTRY_PRESETS[0].id);
  const activePreset =
    INDUSTRY_PRESETS.find((p) => p.id === presetId) ?? INDUSTRY_PRESETS[0];

  const [message, setMessage] = useState<string>(
    activePreset.sampleMessages[0]?.text ?? ""
  );
  const [quote, setQuote] = useState<Quote>(() => buildInitialPreview(0));
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number>(420);
  const [error, setError] = useState("");

  async function runExtraction(targetMessage: string, targetPresetId: string) {
    const preset =
      INDUSTRY_PRESETS.find((p) => p.id === targetPresetId) ?? INDUSTRY_PRESETS[0];

    if (!targetMessage.trim()) {
      setError("Escribe o selecciona un mensaje para cotizar.");
      return;
    }

    setError("");
    setLoading(true);
    setStepIndex(1);
    const start = performance.now();

    try {
      const t1 = setTimeout(() => setStepIndex(2), 180);
      const t2 = setTimeout(() => setStepIndex(3), 360);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: targetMessage,
          catalog: preset.catalog,
          business: preset.business,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar la solicitud.");
      }

      const nextQuote: Quote = {
        id: `live-${Date.now()}`,
        quoteNumber: generateQuoteNumber(),
        createdAt: new Date().toISOString().split("T")[0],
        validUntil: addDaysIso(preset.business.validityDays),
        clientName: data.clientName || "Cliente por confirmar",
        clientPhone: data.clientPhone || "",
        clientCompany: data.clientCompany || "",
        originalMessage: targetMessage,
        summary: data.summary || "Cotización generada automáticamente",
        items: Array.isArray(data.items) ? data.items : [],
        discountPercent: 0,
        taxPercent: preset.business.taxPercent,
        currency: preset.business.currency,
        notes: data.notes || preset.business.defaultNotes,
        status: "sent",
        extractionMode: data.mode || "demo",
      };

      setQuote(nextQuote);
      setElapsedMs(Math.max(120, Math.round(performance.now() - start)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al procesar.");
    } finally {
      setLoading(false);
      setStepIndex(0);
    }
  }

  function handlePresetChange(newId: string) {
    const preset = INDUSTRY_PRESETS.find((p) => p.id === newId);
    if (!preset) return;
    setPresetId(preset.id);
    const nextMsg = preset.sampleMessages[0]?.text ?? "";
    setMessage(nextMsg);
    void runExtraction(nextMsg, preset.id);
  }

  const totals = calculateQuoteTotals(quote);
  const shareUrl = `/q?d=${encodeSharedQuote({
    quote,
    business: activePreset.business,
  })}`;

  return (
    <div id="demo" className="relative">
      {/* Subtle outer glow */}
      <div
        className="animate-pulse-glow pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-sky-400/10 to-blue-500/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Window top bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400/80" />
            <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">
              axioma-x / live-sandbox
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300 ring-1 ring-blue-400/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
            Motor Activo ({elapsedMs} ms)
          </span>
        </div>

        {/* Industry selector pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-slate-900/60 px-4 py-2.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Rubro:
          </span>
          {INDUSTRY_PRESETS.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? "text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="hero-preset-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="absolute inset-0 rounded-lg bg-blue-600 shadow-sm shadow-blue-500/30"
                  />
                )}
                <span className="relative z-10">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative grid gap-0 lg:grid-cols-12">
          {/* Animated traveling pulse indicator between input & quote panels */}
          <div
            className="pointer-events-none hidden lg:block lg:absolute lg:inset-y-4 lg:left-[41.666%] lg:z-10 lg:w-px lg:-translate-x-1/2 lg:bg-white/10"
            aria-hidden="true"
          >
            <div className="animate-beam-v h-20 w-full bg-gradient-to-b from-transparent via-blue-400 to-transparent" />
          </div>
          {/* Left: WhatsApp-style informal message input */}
          <div className="flex flex-col justify-between border-b border-white/10 p-4 sm:p-5 lg:col-span-5 lg:border-b-0 lg:border-r">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  1. Solicitud del cliente
                </div>
                <span className="text-[11px] text-slate-400">Editable</span>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Pega un mensaje informal de WhatsApp..."
                className="mt-2.5 w-full resize-none rounded-xl border border-white/10 bg-slate-950/80 p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
              />

              {activePreset.sampleMessages.length > 1 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {activePreset.sampleMessages.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMessage(sample.text);
                        void runExtraction(sample.text, activePreset.id);
                      }}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-sky-200"
                    >
                      Ejemplo: {sample.title}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p className="mt-2 rounded-lg bg-rose-500/15 px-2.5 py-1.5 text-[11px] text-rose-300">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => void runExtraction(message, activePreset.id)}
                disabled={loading}
                className="btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {stepIndex === 1 && "Analizando intención..."}
                    {stepIndex === 2 && "Cruzando catálogo real..."}
                    {stepIndex >= 3 && "Calculando totales e IVA..."}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Procesar con Axioma-X
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Catálogo activo:{" "}
                <span className="font-medium text-slate-200">
                  {activePreset.business.name}
                </span>{" "}
                ({activePreset.catalog.length} servicios)
              </p>
            </div>
          </div>

          {/* Right: Live formal quote output */}
          <div className="flex flex-col justify-between bg-slate-950/40 p-4 sm:p-5 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  2. Cotización estructurada
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {quote.quoteNumber}
                </span>
              </div>

              {/* Mini executive dark quote card */}
              <div className="relative mt-2.5 overflow-hidden rounded-xl border border-white/10 bg-[#0b1120] p-4 text-slate-100 shadow-lg">
                {loading && (
                  <div
                    className="animate-scan-beam pointer-events-none absolute inset-x-0 z-20 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.9)]"
                    aria-hidden="true"
                  />
                )}
                <div
                  className={`transition-opacity duration-300 ${
                    loading ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <p className="text-xs font-extrabold text-white">
                        {activePreset.business.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Para:{" "}
                        <span className="font-semibold text-slate-200">
                          {quote.clientName}
                        </span>
                        {quote.clientPhone ? ` • ${quote.clientPhone}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Lista para enviar
                    </span>
                  </div>

                  {/* Items */}
                  <div key={quote.id} className="mt-2.5 divide-y divide-white/5">
                    {quote.items.slice(0, 4).map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          delay: idx * 0.06,
                        }}
                        className="flex items-center justify-between gap-3 py-1.5 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-200">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.quantity} {item.unit} ×{" "}
                            {formatMoney(item.unitPrice, quote.currency)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold text-white">
                          {formatMoney(item.quantity * item.unitPrice, quote.currency)}
                        </span>
                      </motion.div>
                    ))}
                    {quote.items.length === 0 && (
                      <p className="py-3 text-center text-xs text-slate-500">
                        No se detectaron servicios. Prueba con uno de los ejemplos.
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="mt-2.5 rounded-lg border border-white/10 bg-[#070b14] px-3 py-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Subtotal + {activePreset.business.taxLabel} ({quote.taxPercent}%)
                      </span>
                      <span className="font-mono text-slate-300">
                        {formatMoney(totals.subtotal, quote.currency)} +{" "}
                        {formatMoney(totals.taxAmount, quote.currency)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-1.5">
                      <span className="text-xs font-bold text-slate-300">
                        Total Estimado
                      </span>
                      <span
                        key={`${quote.id}-${totals.total}`}
                        className="animate-total-pop font-mono text-base font-extrabold text-sky-400"
                      >
                        {formatMoney(totals.total, quote.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real action buttons */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => downloadQuotePdf(quote, activePreset.business)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-blue-50 hover:text-blue-800"
              >
                <FileDown className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-blue-400/50 hover:bg-blue-500/15"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Portal Cliente
              </a>
              <Link
                href={`/app?preset=${activePreset.id}`}
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-xs font-semibold text-sky-300 transition hover:bg-blue-500/25 sm:col-span-1"
              >
                Editar
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
