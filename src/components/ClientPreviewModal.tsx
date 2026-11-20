"use client";

import { CheckCircle2, FileDown, MessageSquareWarning, X } from "lucide-react";
import { BusinessProfile, Quote } from "@/types/quote";
import { calculateQuoteTotals, formatMoney } from "@/lib/format";
import { downloadQuotePdf } from "@/lib/pdf-generator";

interface ClientPreviewModalProps {
  quote: Quote;
  business: BusinessProfile;
  onClose: () => void;
  onApprove: (quoteId: string) => void;
  onRequestChange: (quoteId: string) => void;
}

export function ClientPreviewModal({
  quote,
  business,
  onClose,
  onApprove,
  onRequestChange,
}: ClientPreviewModalProps) {
  const totals = calculateQuoteTotals(quote);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0f172a] text-slate-100 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1120] px-6 py-3.5">
          <div className="text-xs font-semibold text-emerald-400">
            Vista pública del cliente • Link compartible
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{business.name}</h2>
              <p className="text-sm text-slate-400">{business.tagline}</p>
              <p className="mt-1 text-xs text-slate-500">
                {business.phone} • {business.email}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                {quote.quoteNumber}
              </span>
              <p className="mt-2 text-xs text-slate-400">Fecha: {quote.createdAt}</p>
              <p className="text-xs text-slate-400">Válida hasta: {quote.validUntil}</p>
            </div>
          </div>

          {/* Client */}
          <div className="mt-5 rounded-xl border border-white/10 bg-[#070b14]/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Preparado para
            </p>
            <p className="mt-1 text-base font-bold text-white">
              {quote.clientName || "Cliente"}
            </p>
            {(quote.clientCompany || quote.clientPhone) && (
              <p className="text-sm text-slate-400">
                {[quote.clientCompany, quote.clientPhone].filter(Boolean).join(" • ")}
              </p>
            )}
            {quote.summary && (
              <p className="mt-2 text-sm text-slate-300">{quote.summary}</p>
            )}
          </div>

          {/* Items */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-3 py-3 text-center">Cant.</th>
                  <th className="px-3 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-400">{item.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs text-slate-300">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs text-slate-300">
                      {formatMoney(item.unitPrice, quote.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {formatMoney(item.quantity * item.unitPrice, quote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-5 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">
                {formatMoney(totals.subtotal, quote.currency)}
              </span>
            </div>
            {quote.discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Descuento ({quote.discountPercent}%)</span>
                <span className="font-mono">
                  -{formatMoney(totals.discountAmount, quote.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>
                {business.taxLabel} ({quote.taxPercent}%)
              </span>
              <span className="font-mono text-slate-200">
                {formatMoney(totals.taxAmount, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-extrabold text-white">
              <span>Total</span>
              <span className="font-mono text-emerald-400">
                {formatMoney(totals.total, quote.currency)}
              </span>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-6 rounded-xl border border-white/10 bg-[#070b14]/70 p-4 text-xs leading-relaxed text-slate-400">
              <strong className="text-slate-200">Condiciones:</strong> {quote.notes}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => downloadQuotePdf(quote, business)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <FileDown className="h-4 w-4 text-emerald-400" />
              Descargar PDF
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onRequestChange(quote.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                <MessageSquareWarning className="h-4 w-4" />
                Solicitar cambio
              </button>
              <button
                type="button"
                onClick={() => onApprove(quote.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprobar cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
