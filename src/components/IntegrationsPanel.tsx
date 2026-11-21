"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileSpreadsheet,
  Loader2,
  Mail,
  MessageSquare,
  Receipt,
  RefreshCw,
  Send,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react";
import { BusinessIntegrations, BusinessProfile, Quote } from "@/types/quote";
import { calculateQuoteTotals, formatMoney } from "@/lib/format";
import { encodeSharedQuote } from "@/lib/share-link";

interface IntegrationsPanelProps {
  business: BusinessProfile;
  quotes: Quote[];
  onChangeBusiness: (next: BusinessProfile) => void;
  onMarkFollowUp?: (quoteId: string) => void;
}

const GOOGLE_APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var headers = [
    "ID", "Numero", "Fecha", "ValidaHasta", "Cliente", "Telefono",
    "Correo", "Empresa", "Estado", "Moneda", "Subtotal", "Impuesto",
    "Total", "Resumen", "Items", "Actualizado"
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  var rows = payload.rows || [];
  var existingIds = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(function(r) { return String(r[0]); })
    : [];

  rows.forEach(function(item) {
    var rowData = [
      item.id, item.quoteNumber, item.createdAt, item.validUntil,
      item.clientName, item.clientPhone, item.clientEmail, item.clientCompany,
      item.status, item.currency, item.subtotal, item.taxAmount,
      item.total, item.summary, item.itemsCount, item.updatedAt
    ];
    var idx = existingIds.indexOf(String(item.id));
    if (idx !== -1) {
      sheet.getRange(idx + 2, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      existingIds.push(String(item.id));
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, count: rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

function daysSince(isoDate: string): number {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diffMs = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function IntegrationsPanel({
  business,
  quotes,
  onChangeBusiness,
  onMarkFollowUp,
}: IntegrationsPanelProps) {
  const integrations: BusinessIntegrations = business.integrations ?? {};
  const followUpDays = integrations.autoFollowUpDays ?? 3;

  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetsFeedback, setSheetsFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const [sendingFollowUpId, setSendingFollowUpId] = useState<string | null>(null);
  const [followUpNotice, setFollowUpNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/integrations/send-email")
      .then((r) => r.json())
      .then((d) => setEmailConfigured(Boolean(d?.configured)))
      .catch(() => setEmailConfigured(false));
  }, []);

  function updateIntegration<K extends keyof BusinessIntegrations>(
    key: K,
    value: BusinessIntegrations[K]
  ) {
    onChangeBusiness({
      ...business,
      integrations: {
        ...integrations,
        [key]: value,
      },
    });
  }

  async function handleTestEmail() {
    const targetEmail = business.email?.trim();
    if (!targetEmail) {
      setEmailFeedback({
        type: "err",
        text: "Primero configura el correo de tu empresa en la pestaña 'Mi Empresa'.",
      });
      return;
    }
    setTestingEmail(true);
    setEmailFeedback(null);
    try {
      const res = await fetch("/api/integrations/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "test",
          to: targetEmail,
          business,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailFeedback({
          type: "err",
          text: data?.error || "No se pudo enviar el correo de prueba.",
        });
      } else {
        setEmailFeedback({
          type: "ok",
          text: `Correo de prueba enviado correctamente a ${targetEmail}.`,
        });
      }
    } catch {
      setEmailFeedback({
        type: "err",
        text: "Error de red al intentar enviar el correo.",
      });
    } finally {
      setTestingEmail(false);
    }
  }

  async function handleSheetsAction(action: "test" | "sync_all") {
    const webhookUrl = integrations.googleSheetsWebhookUrl?.trim();
    if (!webhookUrl) {
      setSheetsFeedback({
        type: "err",
        text: "Pega primero la URL de tu Google Apps Script Web App.",
      });
      return;
    }
    setSyncingSheets(true);
    setSheetsFeedback(null);
    try {
      const res = await fetch("/api/integrations/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          action,
          quotes: action === "sync_all" ? quotes : undefined,
          business,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSheetsFeedback({
          type: "err",
          text: data?.error || "No se pudo conectar con Google Sheets.",
        });
      } else {
        setSheetsFeedback({
          type: "ok",
          text:
            action === "test"
              ? "Conexión con Google Sheets verificada correctamente."
              : `${data.syncedCount ?? quotes.length} cotizaciones sincronizadas con Google Sheets.`,
        });
      }
    } catch {
      setSheetsFeedback({
        type: "err",
        text: "Error de red al conectar con Google Sheets.",
      });
    } finally {
      setSyncingSheets(false);
    }
  }

  async function handleCopyScript() {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SNIPPET);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleEmailFollowUp(quote: Quote) {
    const to =
      quote.clientEmail?.trim() ||
      window.prompt(`Ingresa el correo de ${quote.clientName} para enviar el seguimiento:`)?.trim();
    if (!to) return;

    setSendingFollowUpId(quote.id);
    setFollowUpNotice(null);
    try {
      const token = encodeSharedQuote({ quote, business });
      const portalUrl = `${window.location.origin}/q?d=${token}`;
      const res = await fetch("/api/integrations/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "followup",
          to,
          quote,
          business,
          portalUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFollowUpNotice(data?.error || "No se pudo enviar el recordatorio por correo.");
      } else {
        setFollowUpNotice(`Recordatorio enviado a ${to} (${quote.quoteNumber}).`);
        onMarkFollowUp?.(quote.id);
      }
    } catch {
      setFollowUpNotice("Error de conexión al enviar el recordatorio.");
    } finally {
      setSendingFollowUpId(null);
    }
  }

  function handleWhatsappFollowUp(quote: Quote) {
    const totals = calculateQuoteTotals(quote);
    const token = encodeSharedQuote({ quote, business });
    const portalUrl = `${window.location.origin}/q?d=${token}`;
    const msg = `Hola ${quote.clientName}, te escribimos de ${business.name} para dar seguimiento a tu cotización ${quote.quoteNumber} por ${formatMoney(totals.total, quote.currency)}. Puedes revisarla o aprobarla aquí: ${portalUrl}`;
    const phone = (quote.clientPhone || "").replace(/[^\d]/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onMarkFollowUp?.(quote.id);
  }

  const pendingFollowUps = quotes.filter(
    (q) => q.status === "sent" && daysSince(q.createdAt) >= followUpDays
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Email + Google Sheets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Resend Email Integration */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Correos Automáticos
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Envía cotizaciones, seguimientos y avisos de aprobación.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                emailConfigured
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  emailConfigured ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {emailConfigured === null
                ? "Verificando..."
                : emailConfigured
                ? "Resend Activo"
                : "Falta RESEND_API_KEY"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-[#070b14]">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Avisarme cuando un cliente apruebe en /q
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Envía una alerta inmediata a {business.email || "tu correo de empresa"}.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(integrations.notifyEmailOnApproval)}
                onChange={(e) =>
                  updateIntegration("notifyEmailOnApproval", e.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />
            </label>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Remitente personalizado (opcional)
              </label>
              <input
                type="text"
                value={integrations.resendFromEmail || ""}
                onChange={(e) => updateIntegration("resendFromEmail", e.target.value)}
                placeholder="Ej. Cotizaciones <ventas@tudominio.com>"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#070b14] dark:text-slate-100 dark:placeholder-slate-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Si lo dejas vacío, se usa el remitente por defecto configurado en Resend.
              </p>
            </div>

            {!emailConfigured && emailConfigured !== null && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                Para activar el envío real: crea una API key gratis en{" "}
                <strong>resend.com</strong> y agrégala en Vercel como{" "}
                <code className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-black/40">
                  RESEND_API_KEY
                </code>
                .
              </div>
            )}

            {emailFeedback && (
              <div
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                  emailFeedback.type === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {emailFeedback.text}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleTestEmail()}
              disabled={testingEmail}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
            >
              {testingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar correo de prueba
            </button>
          </div>
        </div>

        {/* Card 2: Google Sheets Live Sync */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Google Sheets en Tiempo Real
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Registra y actualiza cada cotización automáticamente en tu hoja.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                integrations.googleSheetsWebhookUrl
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <Webhook className="h-3 w-3" />
              {integrations.googleSheetsWebhookUrl ? "Conectado" : "Sin configurar"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                URL de Google Apps Script (Web App)
              </label>
              <input
                type="url"
                value={integrations.googleSheetsWebhookUrl || ""}
                onChange={(e) =>
                  updateIntegration("googleSheetsWebhookUrl", e.target.value)
                }
                placeholder="https://script.google.com/macros/s/.../exec"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#070b14] dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-[#070b14]">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Auto-sincronizar al guardar o cambiar estado
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Actualiza tu hoja automáticamente desde /app y desde /q.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(integrations.autoSyncSheets)}
                onChange={(e) =>
                  updateIntegration("autoSyncSheets", e.target.checked)
                }
                className="h-4 w-4 accent-emerald-600"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSheetsAction("test")}
                disabled={syncingSheets}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {syncingSheets ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
                Probar conexión
              </button>
              <button
                type="button"
                onClick={() => void handleSheetsAction("sync_all")}
                disabled={syncingSheets || quotes.length === 0}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingSheets ? "animate-spin" : ""}`} />
                Sincronizar todo ({quotes.length})
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowScript((v) => !v)}
                className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-sky-400"
              >
                {showScript ? "Ocultar script de Google Sheets" : "¿Cómo conectarlo en 1 minuto?"}
              </button>
              <button
                type="button"
                onClick={() => void handleCopyScript()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {copiedScript ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Script copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar script
                  </>
                )}
              </button>
            </div>

            {showScript && (
              <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 text-[11px] text-slate-300 dark:border-white/10">
                <p className="mb-2 text-slate-400">
                  1. Abre tu Google Sheet → <strong>Extensiones → Apps Script</strong>.
                  <br />
                  2. Pega este código, haz clic en <strong>Implementar → Nueva implementación → Aplicación web</strong> (acceso: <em>Cualquier persona</em>) y pega aquí la URL generada:
                </p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-black/50 p-2.5 font-mono text-[10px] text-sky-300">
                  {GOOGLE_APPS_SCRIPT_SNIPPET}
                </pre>
              </div>
            )}

            {sheetsFeedback && (
              <div
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                  sheetsFeedback.type === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {sheetsFeedback.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Follow-up Automation Center */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Centro de Seguimientos Automáticos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detecta cotizaciones enviadas sin respuesta y dispara recordatorios en 1 clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Alertar después de:
            </span>
            <select
              value={followUpDays}
              onChange={(e) =>
                updateIntegration("autoFollowUpDays", Number(e.target.value))
              }
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:border-white/15 dark:bg-[#070b14] dark:text-white"
            >
              <option value={0}>Hoy mismo (0 días)</option>
              <option value={2}>2 días</option>
              <option value={3}>3 días</option>
              <option value={5}>5 días</option>
              <option value={7}>7 días</option>
            </select>
          </div>
        </div>

        {followUpNotice && (
          <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-medium text-blue-800 dark:text-sky-200">
            {followUpNotice}
          </div>
        )}

        <div className="mt-5">
          {pendingFollowUps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-[#070b14]/60 dark:text-slate-400">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-blue-500" />
              No tienes cotizaciones enviadas vencidas por seguimiento (umbral actual:{" "}
              <strong>{followUpDays} días</strong>).
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
              {pendingFollowUps.map((q) => {
                const totals = calculateQuoteTotals(q);
                const age = daysSince(q.createdAt);
                return (
                  <div
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {q.quoteNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          Hace {age} {age === 1 ? "día" : "días"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {q.clientName} • {formatMoney(totals.total, q.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleEmailFollowUp(q)}
                        disabled={sendingFollowUpId === q.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-500/20 disabled:opacity-50 dark:text-sky-300"
                      >
                        {sendingFollowUpId === q.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                        Recordar por Correo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWhatsappFollowUp(q)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Next Phases Roadmap (WhatsApp Cloud API + Costa Rica Hacienda v4.4) */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-[#0b1120]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Zap className="h-4 w-4 text-emerald-500" />
              Fase 2: WhatsApp Business Cloud API (Híbrido)
            </div>
            <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-sky-300">
              Siguiente fase
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Recibe mensajes entrantes de WhatsApp en{" "}
            <code className="font-mono">/api/whatsapp</code>, crea el borrador automáticamente con IA en tu bandeja y te permite aprobar y enviar el PDF al cliente con 1 clic.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-[#0b1120]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Receipt className="h-4 w-4 text-blue-500" />
              Fase 3: Facturación Electrónica CR (Hacienda v4.4)
            </div>
            <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-sky-300">
              En hoja de ruta
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Convierte cotizaciones aprobadas en Factura Electrónica o Tiquete Electrónico (XML v4.4, CAByS, llave criptográfica ATV o proveedor autorizado en Costa Rica).
          </p>
        </div>
      </div>
    </div>
  );
}
