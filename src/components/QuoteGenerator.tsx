"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  FileDown,
  ImagePlus,
  Link2,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import {
  BusinessProfile,
  CatalogItem,
  Quote,
  QuoteLineItem,
} from "@/types/quote";
import {
  addDaysIso,
  calculateQuoteTotals,
  formatMoney,
  generateQuoteNumber,
} from "@/lib/format";
import { downloadQuotePdf } from "@/lib/pdf-generator";
import { encodeSharedQuote } from "@/lib/share-link";

interface QuoteGeneratorProps {
  business: BusinessProfile;
  catalog: CatalogItem[];
  editingQuote?: Quote | null;
  onClearEditing?: () => void;
  onSaveQuote: (quote: Quote) => void;
  onPreviewClient: (quote: Quote) => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function QuoteGenerator({
  business,
  catalog,
  editingQuote,
  onClearEditing,
  onSaveQuote,
  onPreviewClient,
}: QuoteGeneratorProps) {
  const [message, setMessage] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [extractedToast, setExtractedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [draft, setDraft] = useState<Quote>(() => ({
    id: `q-${Date.now()}`,
    quoteNumber: generateQuoteNumber(),
    createdAt: new Date().toISOString().split("T")[0],
    validUntil: addDaysIso(business.validityDays),
    clientName: "",
    clientPhone: "",
    clientCompany: "",
    originalMessage: "",
    summary: "",
    items: [],
    discountPercent: 0,
    taxPercent: business.taxPercent,
    currency: business.currency,
    notes: business.defaultNotes,
    status: "draft",
  }));

  useEffect(() => {
    if (editingQuote) {
      setDraft(editingQuote);
      if (editingQuote.originalMessage) {
        setMessage(editingQuote.originalMessage);
      }
    }
  }, [editingQuote]);

  const totals = calculateQuoteTotals(draft);

  async function handleExtract() {
    setErrorMsg("");
    if (!message.trim() && !imageBase64) {
      setErrorMsg("Pega un mensaje, dicta por voz o adjunta una imagen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          catalog,
          business,
          imageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      onClearEditing?.();
      setDraft({
        id: `q-${Date.now()}`,
        quoteNumber: generateQuoteNumber(),
        createdAt: new Date().toISOString().split("T")[0],
        validUntil: addDaysIso(business.validityDays),
        clientName: data.clientName || "Cliente por confirmar",
        clientPhone: data.clientPhone || "",
        clientCompany: data.clientCompany || "",
        originalMessage: message,
        summary: data.summary || "Cotización generada",
        items: data.items || [],
        discountPercent: 0,
        taxPercent: business.taxPercent,
        currency: business.currency,
        notes: data.notes || business.defaultNotes,
        status: "draft",
        extractionMode: data.mode || "demo",
      });
      setExtractedToast(true);
      setTimeout(() => setExtractedToast(false), 2600);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function toggleVoice() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMsg("Tu navegador no soporta dictado por voz. Prueba en Chrome o Edge.");
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "es-CR";
    rec.interimResults = false;
    rec.continuous = true;

    rec.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setMessage((prev) => `${prev ? prev + " " : ""}${transcript.trim()}`);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function updateItem(id: string, patch: Partial<QuoteLineItem>) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }

  function addFromCatalog(catalogId: string) {
    const found = catalog.find((c) => c.id === catalogId);
    if (!found) return;
    setDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          catalogItemId: found.id,
          name: found.name,
          description: found.description,
          quantity: 1,
          unit: found.unit,
          unitPrice: found.unitPrice,
        },
      ],
    }));
  }

  function addEmptyItem() {
    setDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `manual-${Date.now()}`,
          name: "Servicio adicional",
          description: "",
          quantity: 1,
          unit: "servicio",
          unitPrice: 50,
        },
      ],
    }));
  }

  function removeItem(id: string) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  }

  function handleCopyWhatsApp() {
    const lines = draft.items
      .map(
        (it) =>
          `• ${it.name} (${it.quantity} ${it.unit}): ${formatMoney(
            it.quantity * it.unitPrice,
            draft.currency
          )}`
      )
      .join("\n");

    const text = `Hola ${draft.clientName || ""}, aquí tienes tu cotización *${draft.quoteNumber}* de *${business.name}*:\n\n${lines}\n\n*Total: ${formatMoney(totals.total, draft.currency)}*\nVálida hasta: ${draft.validUntil}\n\n${draft.notes}`;

    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  }

  function handleCopyShareLink() {
    const token = encodeSharedQuote({ quote: draft, business });
    const url = `${window.location.origin}/q?d=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  }

  function handleSave(status: Quote["status"] = "sent") {
    onSaveQuote({ ...draft, status });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Guided 3-Step Visual Bar */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-extrabold text-slate-950">
            1
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Pega o dicta el pedido</p>
            <p className="truncate text-[11px] text-slate-400">WhatsApp, voz o foto</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a]/80 px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-200">
            2
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200">Revisa y ajusta</p>
            <p className="truncate text-[11px] text-slate-400">Cantidades, precios e IVA</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a]/80 px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-200">
            3
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200">Descarga o comparte</p>
            <p className="truncate text-[11px] text-slate-400">PDF corporativo o link /q</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Capture Panel */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white">
                Solicitud del cliente
              </h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                Texto • Voz • Foto
              </span>
            </div>

            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pega aquí el mensaje de tu cliente, dicta por voz o adjunta una foto de referencia..."
              className="mt-3.5 w-full resize-none rounded-xl border border-white/10 bg-[#070b14] p-3.5 text-sm leading-relaxed text-slate-100 placeholder-slate-500 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            {/* Voice + Photo controls */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    listening
                      ? "animate-pulse border-rose-500/50 bg-rose-500/15 text-rose-300"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {listening ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {listening ? "Detener voz" : "Dictar"}
                </button>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <ImagePlus className="h-3.5 w-3.5 text-emerald-400" />
                  {imageBase64 ? "Foto lista" : "Adjuntar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {imageBase64 && (
                <button
                  type="button"
                  onClick={() => setImageBase64(undefined)}
                  className="text-xs font-medium text-rose-400 hover:underline"
                >
                  Quitar foto
                </button>
              )}
            </div>

            {errorMsg && (
              <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleExtract}
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando con tu catálogo...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generar cotización
                </>
              )}
            </button>

            {extractedToast && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Cotización actualizada con tu catálogo.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Clean Live Quote Builder */}
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5 shadow-xl shadow-black/20 sm:p-6 lg:col-span-7">
          {/* Top Summary & Primary Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-300">
                  {draft.quoteNumber}
                </span>
                {editingQuote && (
                  <span className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                    Editando
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-xs text-slate-400">Total actual:</span>
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {formatMoney(totals.total, draft.currency)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadQuotePdf(draft, business)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                <FileDown className="h-4 w-4" />
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={() => handleSave("sent")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                {savedToast ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Guardada
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Share Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onPreviewClient(draft)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              Vista previa
            </button>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Link copiado
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  Copiar link cliente
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copiedWa ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  Texto WhatsApp
                </>
              )}
            </button>
          </div>

          {/* Client Fields */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">
                Cliente
              </label>
              <input
                type="text"
                value={draft.clientName}
                onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
                placeholder="Nombre del cliente"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">
                Teléfono
              </label>
              <input
                type="text"
                value={draft.clientPhone}
                onChange={(e) => setDraft({ ...draft, clientPhone: e.target.value })}
                placeholder="Teléfono / WhatsApp"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">
                Empresa (opcional)
              </label>
              <input
                type="text"
                value={draft.clientCompany}
                onChange={(e) => setDraft({ ...draft, clientCompany: e.target.value })}
                placeholder="Nombre de empresa"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Items Header + Add Controls */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Conceptos ({draft.items.length})
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addFromCatalog(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="rounded-lg border border-white/10 bg-[#070b14] px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>
                    + Agregar del catálogo...
                  </option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatMoney(c.unitPrice, business.currency)}/{c.unit})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addEmptyItem}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                  Manual
                </button>
              </div>
            </div>

            {/* Column labels on desktop */}
            <div className="mt-3 hidden grid-cols-12 gap-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid">
              <span className="col-span-5">Servicio</span>
              <span className="col-span-2">Cantidad</span>
              <span className="col-span-2 text-right">Precio</span>
              <span className="col-span-3 text-right">Subtotal</span>
            </div>

            <div className="mt-2 space-y-2">
              {draft.items.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/15 bg-[#070b14]/50 px-4 py-8 text-center">
                  <p className="text-xs font-semibold text-slate-300">
                    Tu cotización está vacía
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Escribe la solicitud del cliente a la izquierda y presiona{" "}
                    <strong className="text-emerald-400">Generar cotización</strong>, o agrega conceptos manualmente arriba.
                  </p>
                </div>
              )}
              {draft.items.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 sm:grid-cols-12"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-semibold text-white focus:border-white/15 focus:bg-[#070b14] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      placeholder="Descripción breve..."
                      className="mt-0.5 w-full rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-slate-400 placeholder-slate-600 focus:border-white/15 focus:bg-[#070b14] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 rounded-lg border border-white/10 bg-[#070b14] px-2 py-1 text-center font-mono text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#070b14] px-2 py-1 text-right font-mono text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 sm:col-span-3">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      {formatMoney(item.quantity * item.unitPrice, draft.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <label className="text-xs font-semibold text-slate-400">
                Notas y condiciones
              </label>
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-[#070b14] p-3 text-xs leading-relaxed text-slate-300 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-[#070b14]/70 p-4 text-xs sm:col-span-5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">
                  {formatMoney(totals.subtotal, draft.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Descuento (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.discountPercent}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      discountPercent: Number(e.target.value) || 0,
                    })
                  }
                  className="w-16 rounded-lg border border-white/10 bg-[#0f172a] px-2 py-0.5 text-right font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-slate-400">
                <span>
                  {business.taxLabel} ({draft.taxPercent}%)
                </span>
                <span className="font-mono text-slate-200">
                  {formatMoney(totals.taxAmount, draft.currency)}
                </span>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-2.5 text-base font-extrabold text-white">
                <span>Total</span>
                <span className="font-mono text-emerald-400">
                  {formatMoney(totals.total, draft.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
