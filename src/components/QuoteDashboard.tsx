"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDown,
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

interface QuoteDashboardProps {
  quotes: Quote[];
  business: BusinessProfile;
  onStatusChange: (id: string, status: QuoteStatus) => void;
  onEditQuote: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onPreviewClient: (quote: Quote) => void;
}

const STATUS_META: Record<
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
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuoteStatus | "all">("all");

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
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <p className="text-xs font-medium text-slate-400">Total Cotizado</p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">
            {formatMoney(totalQuoted, business.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{quotes.length} cotizaciones</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-xs font-semibold text-emerald-300">Ventas Aprobadas</p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-emerald-400">
            {formatMoney(totalApproved, business.currency)}
          </p>
          <p className="mt-1 text-xs text-emerald-200/70">
            {approvedQuotes.length} cerradas con éxito
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Tasa de Cierre</p>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">{closeRate}%</p>
          <p className="mt-1 text-xs text-slate-500">Sobre total emitido</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5">
          <p className="text-xs font-medium text-slate-400">Pendientes</p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-white">
            {quotes.filter((q) => q.status === "sent").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Listas para seguimiento</p>
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
              placeholder="Buscar cliente, empresa o número..."
              className="w-full rounded-xl border border-white/10 bg-[#070b14] py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
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
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {st === "all" ? "Todas" : STATUS_META[st].label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              Exportar CSV
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No hay cotizaciones que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">N.º / Fecha</th>
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Resumen</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
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
                        <p className="text-xs text-slate-500">{q.items.length} ítems</p>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono font-bold text-emerald-400">
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
                            Borrador
                          </option>
                          <option value="sent" className="bg-slate-900 text-slate-200">
                            Enviada
                          </option>
                          <option value="approved" className="bg-slate-900 text-slate-200">
                            Aprobada
                          </option>
                          <option value="rejected" className="bg-slate-900 text-slate-200">
                            Rechazada
                          </option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditQuote(q)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title="Editar en Cotizador"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewClient(q)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title="Vista previa del cliente"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadQuotePdf(q, business)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-500/15 hover:text-emerald-400"
                            title="Descargar PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(q.id)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                            title="Eliminar"
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
