"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDown,
  Loader2,
  Mail,
  Pencil,
  Search,
  Send,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { BusinessProfile, Quote, QuoteStatus } from "@/types/quote";
import { calculateQuoteTotals, formatMoney } from "@/lib/format";
import { downloadQuotePdf } from "@/lib/pdf-generator";
import { useLanguage } from "@/components/LanguageProvider";
import { encodeSharedQuote } from "@/lib/share-link";

interface QuoteDashboardProps {
  quotes: Quote[];
  business: BusinessProfile;
  onStatusChange: (id: string, status: QuoteStatus) => void;
  onEditQuote: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onPreviewClient: (quote: Quote) => void;
}

const STATUS_META_ES: Record<
  QuoteStatus,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: {
    label: "Borrador",
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Clock,
  },
  sent: {
    label: "Enviada",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: Send,
  },
  approved: {
    label: "Aprobada",
    badge: "bg-blue-500/15 text-sky-300 border-blue-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: XCircle,
  },
};

const STATUS_META_EN: Record<
  QuoteStatus,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: {
    label: "Draft",
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Clock,
  },
  sent: {
    label: "Sent",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: Send,
  },
  approved: {
    label: "Approved",
    badge: "bg-blue-500/15 text-sky-300 border-blue-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: XCircle,
  },
};

export function QuoteDashboard({
  quotes,
  business,
  onStatusChange,
  onEditQuote,
  onDelete,
  onPreviewClient,
}: QuoteDashboardProps) {
  const { isEn } = useLanguage();
  const STATUS_META = isEn ? STATUS_META_EN : STATUS_META_ES;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuoteStatus | "all">("all");
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailToast, setEmailToast] = useState<string | null>(null);

  async function handleSendQuoteEmail(q: Quote) {
    const to =
      q.clientEmail?.trim() ||
      window.prompt(`Ingresa el correo de ${q.clientName} para enviar ${q.quoteNumber}:`)?.trim();
    if (!to) return;

    setSendingEmailId(q.id);
    setEmailToast(null);
    try {
      const token = encodeSharedQuote({ quote: q, business });
      const portalUrl = `${window.location.origin}/q?d=${token}`;
      const res = await fetch("/api/integrations/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quote",
          to,
          quote: q,
          business,
          portalUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailToast(data?.error || "No se pudo enviar el correo.");
      } else {
        setEmailToast(`Cotización ${q.quoteNumber} enviada por correo a ${to}.`);
        if (q.status === "draft") {
          onStatusChange(q.id, "sent");
        }
      }
    } catch {
      setEmailToast("Error de conexión al enviar el correo.");
    } finally {
      setSendingEmailId(null);
    }
  }

  const filtered = quotes.filter((q) => {
    const matchesFilter = filter === "all" || q.status === filter;
    const text =
      `${q.quoteNumber} ${q.clientName} ${q.clientCompany} ${q.summary}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const totalQuoted = quotes.reduce((acc, q) => acc + calculateQuoteTotals(q).total, 0);
  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  const totalApproved = approvedQuotes.reduce(
    (acc, q) => acc + calculateQuoteTotals(q).total,
    0
  );
  const closeRate =
    quotes.length > 0 ? Math.round((approvedQuotes.length / quotes.length) * 100) : 0;

  function handleExportCsv() {
    const headers = [
      "Numero",
      "Fecha",
      "ValidaHasta",
      "Cliente",
      "Telefono",
      "Empresa",
      "Estado",
      "Moneda",
      "Subtotal",
      "Total",
    ];
    const rows = filtered.map((q) => {
      const t = calculateQuoteTotals(q);
      return [
        q.quoteNumber,
        q.createdAt,
        q.validUntil,
        q.clientName,
        q.clientPhone,
        q.clientCompany,
        STATUS_META[q.status].label,
        q.currency,
        t.subtotal.toFixed(2),
        t.total.toFixed(2),
      ]
        .map((val) => `"${String(val || "").replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axioma-x-cotizaciones-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {emailToast && (
        <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-medium text-sky-200">
          <span>{emailToast}</span>
          <button
            type="button"
            onClick={() => setEmailToast(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <p className="text-xs font-medium text-slate-400">
            {isEn ? "Total Quoted" : "Total Cotizado"}
          </p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">
            {formatMoney(totalQuoted, business.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {quotes.length} {isEn ? "quotes" : "cotizaciones"}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
          <p className="text-xs font-semibold text-sky-300">
            {isEn ? "Approved Sales" : "Ventas Aprobadas"}
          </p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-blue-400">
            {formatMoney(totalApproved, business.currency)}
          </p>
          <p className="mt-1 text-xs text-blue-200/70">
            {approvedQuotes.length} {isEn ? "closed deals" : "cerradas con éxito"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
              {isEn ? "Close Rate" : "Tasa de Cierre"}
            </p>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">{closeRate}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? "Of total issued" : "Sobre total emitido"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <p className="text-xs font-medium text-slate-400">
            {isEn ? "Pending" : "Pendientes"}
          </p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">
            {quotes.filter((q) => q.status === "sent").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? "Ready for follow-up" : "Listas para seguimiento"}
          </p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEn ? "Search client, company or number..." : "Buscar cliente, empresa o número..."}
              className="w-full rounded-xl border border-white/10 bg-[#070b14] py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {(["all", "draft", "sent", "approved", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === st
                      ? "bg-blue-600 text-white"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {st === "all" ? (isEn ? "All" : "Todas") : STATUS_META[st].label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              {isEn ? "Export CSV" : "Exportar CSV"}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {isEn
              ? "No quotes match your search."
              : "No hay cotizaciones que coincidan con tu búsqueda."}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">{isEn ? "No. / Date" : "N.º / Fecha"}</th>
                  <th className="pb-3 pr-4">{isEn ? "Client" : "Cliente"}</th>
                  <th className="pb-3 pr-4">{isEn ? "Summary" : "Resumen"}</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3 pr-4">{isEn ? "Status" : "Estado"}</th>
                  <th className="pb-3 text-right">{isEn ? "Actions" : "Acciones"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((q) => {
                  const totals = calculateQuoteTotals(q);
                  const meta = STATUS_META[q.status];
                  return (
                    <tr key={q.id} className="transition hover:bg-white/[0.03]">
                      <td className="py-3.5 pr-4">
                        <div className="font-mono text-xs font-bold text-white">
                          {q.quoteNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">{q.createdAt}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-100">{q.clientName}</div>
                        <div className="text-xs text-slate-400">
                          {q.clientCompany || q.clientPhone || "—"}
                        </div>
                      </td>
                      <td className="max-w-xs py-3.5 pr-4">
                        <p className="truncate text-slate-300">{q.summary}</p>
                        <p className="text-xs text-slate-500">
                          {q.items.length} {isEn ? "items" : "ítems"}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono font-bold text-blue-400">
                        {formatMoney(totals.total, q.currency)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <select
                          value={q.status}
                          onChange={(e) =>
                            onStatusChange(q.id, e.target.value as QuoteStatus)
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none ${meta.badge}`}
                        >
                          <option value="draft" className="bg-slate-900 text-slate-200">
                            {isEn ? "Draft" : "Borrador"}
                          </option>
                          <option value="sent" className="bg-slate-900 text-slate-200">
                            {isEn ? "Sent" : "Enviada"}
                          </option>
                          <option value="approved" className="bg-slate-900 text-slate-200">
                            {isEn ? "Approved" : "Aprobada"}
                          </option>
                          <option value="rejected" className="bg-slate-900 text-slate-200">
                            {isEn ? "Rejected" : "Rechazada"}
                          </option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditQuote(q)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title={isEn ? "Edit in Quote Builder" : "Editar en Cotizador"}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewClient(q)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title={isEn ? "Client preview" : "Vista previa del cliente"}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSendQuoteEmail(q)}
                            disabled={sendingEmailId === q.id}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-500/15 hover:text-emerald-400 disabled:opacity-50"
                            title="Enviar cotización por correo"
                          >
                            {sendingEmailId === q.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadQuotePdf(q, business)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/15 hover:text-blue-400"
                            title={isEn ? "Download PDF" : "Descargar PDF"}
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(q.id)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                            title={isEn ? "Delete" : "Eliminar"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
