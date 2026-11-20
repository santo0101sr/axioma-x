"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileDown, MessageSquareWarning } from "lucide-react";
import { decodeSharedQuote } from "@/lib/share-link";
import { calculateQuoteTotals, formatMoney } from "@/lib/format";
import { downloadQuotePdf } from "@/lib/pdf-generator";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { Quote } from "@/types/quote";

function SharedQuoteContent() {
  const { isEn } = useLanguage();
  const params = useSearchParams();
  const token = params.get("d") || "";
  const [payload, setPayload] = useState(() => (token ? decodeSharedQuote(token) : null));
  const [decision, setDecision] = useState<"approved" | "changes" | null>(null);

  useEffect(() => {
    if (token) {
      setPayload(decodeSharedQuote(token));
    }
  }, [token]);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            {isEn ? "Quote not found" : "Cotización no encontrada"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isEn
              ? "This link is incomplete or expired. Please request a new link from your provider."
              : "El enlace está incompleto o vencido. Solicita un nuevo enlace al proveedor."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isEn ? "Go to Axioma-X" : "Ir a Axioma-X"}
          </Link>
        </div>
      </div>
    );
  }

  const { quote, business } = payload;
  const totals = calculateQuoteTotals(quote);

  function syncLocalStatus(status: Quote["status"]) {
    try {
      const raw = localStorage.getItem("axiomax_quotes_v1");
      if (!raw) return;
      const list = JSON.parse(raw) as Quote[];
      const next = list.map((q) => (q.id === quote.id ? { ...q, status } : q));
      localStorage.setItem("axiomax_quotes_v1", JSON.stringify(next));
    } catch {
      // ignore cross-origin/storage issues
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-3 text-xs text-slate-300">
          <span className="font-semibold text-white">
            {isEn ? "Axioma-X • Client Quote Portal" : "Axioma-X • Portal de Cotización"}
          </span>
          <div className="flex items-center gap-3">
            <span>
              {isEn ? `Document ${quote.quoteNumber}` : `Documento ${quote.quoteNumber}`}
            </span>
            <LanguageToggle className="!border-white/20 !bg-white/10 !py-1 !text-white hover:!bg-white/20" />
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
              <p className="text-sm text-slate-500">{business.tagline}</p>
              <p className="mt-1 text-xs text-slate-400">
                {business.address} • {business.phone} • {business.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {isEn ? "Date:" : "Fecha:"} {quote.createdAt}
              </p>
              <p className="text-xs text-slate-500">
                {isEn ? "Valid until:" : "Válida hasta:"} {quote.validUntil}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isEn ? "Prepared for" : "Preparado para"}
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">{quote.clientName}</p>
            {(quote.clientCompany || quote.clientPhone) && (
              <p className="text-sm text-slate-600">
                {[quote.clientCompany, quote.clientPhone].filter(Boolean).join(" • ")}
              </p>
            )}
            {quote.summary && (
              <p className="mt-2 text-sm font-medium text-slate-700">{quote.summary}</p>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">{isEn ? "Item" : "Concepto"}</th>
                  <th className="px-3 py-3 text-center">{isEn ? "Qty" : "Cant."}</th>
                  <th className="px-3 py-3 text-right">{isEn ? "Price" : "Precio"}</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500">{item.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-700">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700">
                      {formatMoney(item.unitPrice, quote.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatMoney(item.quantity * item.unitPrice, quote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(totals.subtotal, quote.currency)}</span>
              </div>
              {quote.discountPercent > 0 && (
                <div className="flex justify-between text-blue-700">
                  <span>
                    {isEn ? `Discount (${quote.discountPercent}%)` : `Descuento (${quote.discountPercent}%)`}
                  </span>
                  <span>-{formatMoney(totals.discountAmount, quote.currency)}</span>
                </div>
              )}
              {quote.taxPercent > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    {business.taxLabel} ({quote.taxPercent}%)
                  </span>
                  <span>{formatMoney(totals.taxAmount, quote.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-600">
                  {formatMoney(totals.total, quote.currency)}
                </span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {isEn ? "Terms: " : "Condiciones: "}
              </span>
              {quote.notes}
            </div>
          )}

          {decision && (
            <div
              className={`mt-6 rounded-xl border p-4 text-sm font-medium ${
                decision === "approved"
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {decision === "approved"
                ? isEn
                  ? "Quote approved successfully. Thank you for your confirmation."
                  : "Cotización aprobada correctamente. Gracias por su confirmación."
                : isEn
                ? "Change request recorded. The provider will contact you shortly."
                : "Solicitud de ajuste registrada. El proveedor se pondrá en contacto."}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
            <button
              onClick={() => downloadQuotePdf(quote, business)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileDown className="h-4 w-4" />
              {isEn ? "Download PDF" : "Descargar PDF"}
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setDecision("changes");
                  syncLocalStatus("sent");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                <MessageSquareWarning className="h-4 w-4" />
                {isEn ? "Request Changes" : "Solicitar cambio"}
              </button>
              <button
                onClick={() => {
                  setDecision("approved");
                  syncLocalStatus("approved");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isEn ? "Approve Quote" : "Aprobar cotización"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharedQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Cargando cotización...
        </div>
      }
    >
      <SharedQuoteContent />
    </Suspense>
  );
}
