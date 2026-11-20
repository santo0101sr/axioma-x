"use client";

import {
  Building2,
  Download,
  ImagePlus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { BusinessProfile, CatalogItem, CurrencyCode, Quote } from "@/types/quote";
import { useLanguage } from "@/components/LanguageProvider";

interface BusinessSettingsProps {
  business: BusinessProfile;
  catalog: CatalogItem[];
  quotes: Quote[];
  onChange: (next: BusinessProfile) => void;
  onImportBackup: (data: {
    business?: BusinessProfile;
    catalog?: CatalogItem[];
    quotes?: Quote[];
  }) => void;
  onResetDefaults: () => void;
}

export function BusinessSettings({
  business,
  catalog,
  quotes,
  onChange,
  onImportBackup,
  onResetDefaults,
}: BusinessSettingsProps) {
  const { isEn } = useLanguage();
  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    onChange({ ...business, [key]: value });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("logoDataUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleExportBackup() {
    const payload = {
      app: "Axioma-X",
      exportedAt: new Date().toISOString(),
      business,
      catalog,
      quotes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axioma-x-respaldo-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportBackup(parsed);
      } catch {
        // ignore invalid file
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Business Profile Form */}
      <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6 lg:col-span-7">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            {isEn ? "Business Profile" : "Perfil de la Empresa"}
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {isEn
            ? "These details and your logo appear on every PDF and shared link."
            : "Estos datos y tu logotipo aparecen en cada PDF y en los enlaces compartidos."}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Business name" : "Nombre comercial"}
            </label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Tagline / Industry" : "Descripción / Giro"}
            </label>
            <input
              type="text"
              value={business.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Phone / WhatsApp" : "Teléfono / WhatsApp"}
            </label>
            <input
              type="text"
              value={business.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Contact email" : "Correo de contacto"}
            </label>
            <input
              type="email"
              value={business.email}
              onChange={(e) => update("email", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Address" : "Dirección"}
            </label>
            <input
              type="text"
              value={business.address}
              onChange={(e) => update("address", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Currency" : "Moneda"}
            </label>
            <select
              value={business.currency}
              onChange={(e) => update("currency", e.target.value as CurrencyCode)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="CRC">CRC (₡)</option>
              <option value="MXN">MXN (MX$)</option>
              <option value="COP">COP (COL$)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300">
                {isEn ? "Tax label" : "Impuesto"}
              </label>
              <input
                type="text"
                value={business.taxLabel}
                onChange={(e) => update("taxLabel", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white focus:border-blue-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">
                {isEn ? "Rate (%)" : "Tasa (%)"}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={business.taxPercent}
                onChange={(e) => update("taxPercent", Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 font-mono text-sm text-white focus:border-blue-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              {isEn ? "Default terms & notes" : "Condiciones por defecto"}
            </label>
            <textarea
              rows={3}
              value={business.defaultNotes}
              onChange={(e) => update("defaultNotes", e.target.value)}
              className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-[#070b14] p-3 text-xs text-slate-200 focus:border-blue-500/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logo & Backup */}
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6">
          <h3 className="text-sm font-bold text-white">
            {isEn ? "PDF Brand Logo" : "Logotipo para PDF"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isEn
              ? "Upload a PNG or JPG to brand your documents."
              : "Sube un PNG o JPG para personalizar tus documentos."}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#070b14]">
              {business.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logoDataUrl}
                  alt="Logo"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <ImagePlus className="h-6 w-6 text-slate-500" />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-blue-500">
                <Upload className="h-3.5 w-3.5" />
                {isEn ? "Upload logo" : "Subir logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {business.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => update("logoDataUrl", undefined)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isEn ? "Remove" : "Quitar"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6">
          <h3 className="text-sm font-bold text-white">
            {isEn ? "Backup & Portability" : "Respaldo y Portabilidad"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isEn
              ? `Export or restore your profile, catalog (${catalog.length}), and history (${quotes.length}) in JSON.`
              : `Exporta o restaura tu perfil, catálogo (${catalog.length}) e historial (${quotes.length}) en JSON.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              {isEn ? "Export JSON" : "Exportar JSON"}
            </button>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              <Upload className="h-3.5 w-3.5 text-blue-400" />
              {isEn ? "Import JSON" : "Importar JSON"}
              <input
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {isEn ? "Reset defaults" : "Restaurar valores"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
