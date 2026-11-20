"use client";

import { useState } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { CatalogItem, CurrencyCode } from "@/types/quote";
import { formatMoney } from "@/lib/format";

interface CatalogManagerProps {
  catalog: CatalogItem[];
  currency: CurrencyCode;
  onChange: (next: CatalogItem[]) => void;
}

export function CatalogManager({ catalog, currency, onChange }: CatalogManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("servicio");
  const [unitPrice, setUnitPrice] = useState("50");
  const [category, setCategory] = useState("General");
  const [keywordsText, setKeywordsText] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.length === 0) {
      keywords.push(...name.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    }

    const newItem: CatalogItem = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      unit: unit.trim() || "servicio",
      unitPrice: Math.max(0, Number(unitPrice) || 0),
      category: category.trim() || "General",
      keywords,
    };

    onChange([newItem, ...catalog]);
    setName("");
    setDescription("");
    setKeywordsText("");
  }

  function handleDelete(id: string) {
    onChange(catalog.filter((c) => c.id !== id));
  }

  function handlePriceChange(id: string, price: number) {
    onChange(
      catalog.map((c) => (c.id === id ? { ...c, unitPrice: Math.max(0, price) } : c))
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6 lg:col-span-4"
      >
        <h2 className="text-base font-bold text-white">Agregar servicio o producto</h2>
        <p className="mt-1 text-xs text-slate-400">
          El motor usa este catálogo para calcular precios reales automáticamente.
        </p>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Nombre del servicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Instalación de aire acondicionado"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Descripción breve
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incluye soporte y prueba de presión"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Unidad</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="m², hora, proyecto"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">
                Precio ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 font-mono text-sm text-white focus:border-blue-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Instalación, Diseño, Mantenimiento..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Palabras clave (separadas por coma)
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="aire, clima, ac, minisplit"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#070b14] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Agregar al catálogo
          </button>
        </div>
      </form>

      {/* Catalog List */}
      <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-6 lg:col-span-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Catálogo Activo ({catalog.length})
            </h2>
            <p className="text-xs text-slate-400">
              Edita precios en línea en cualquier momento.
            </p>
          </div>
          <Tag className="h-5 w-5 text-blue-400" />
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {catalog.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 bg-[#070b14]/50 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-300">
                Tu catálogo está vacío
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Agrega tus servicios o productos en el formulario de la izquierda para que Axioma-X use tus precios reales automáticamente.
              </p>
            </div>
          )}
          {catalog.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                )}
                {item.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.keywords.slice(0, 6).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 rounded-lg border border-white/10 bg-[#070b14] px-2.5 py-1.5 text-right font-mono text-xs font-bold text-blue-400 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">/ {item.unit}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {formatMoney(item.unitPrice, currency)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                  title="Eliminar servicio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
