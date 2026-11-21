import { CatalogItem, QuoteLineItem } from "@/types/quote";

export interface ExtractedQuotePayload {
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  summary: string;
  items: QuoteLineItem[];
  notes: string;
  mode: "gemini" | "openai" | "demo";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractPhone(text: string): string {
  const match = text.match(/(?:\+?\d{1,3}[\s-]?)?\d{4}[\s-]?\d{4}/);
  return match ? match[0].trim() : "";
}

function extractClientName(text: string): string {
  const patterns = [
    /(?:[Ss]oy|[Mm]e llamo|[Ll]es escribe|[Dd]e parte de)\s+(?:el\s+|la\s+|la\s+Dra\.\s+|el\s+Ing\.\s+)?((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\.?)(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/,
    /(?:[Ii]'m|[Ii] am|[Mm]y name is|[Tt]his is)\s+(?:Dr\.\s+|Mr\.\s+|Ms\.\s+|Mrs\.\s+)?((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\.?)(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      return m[1].trim();
    }
  }
  return /[Ii]'m|[Ii] am|[Mm]y name is|[Tt]his is|\bfor\b|\bquote\b/i.test(text)
    ? "Client to confirm"
    : "Cliente por confirmar";
}

function extractCompany(text: string): string {
  const m = text.match(
    /(?:de|en|from|at)\s+((?:Clínica|Clinica|Consultora|Café|Cafe|TechHub|Empresa|Taller|Grupo)\s+[A-ZÁÉÍÓÚÑa-z0-9]+)/i
  );
  return m ? m[1].trim() : "";
}

function findQuantityNearKeyword(normalizedMsg: string, keyword: string): number {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // e.g. "65 metros", "4 lámparas", "2 ejes", "35 personas"
  const afterOrBefore = [
    new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:m2|m²|sq\\s*m|sqm|square\\s+meters|metros(?:\\s+cuadrados)?|personas|people|guests|meses|months|ejes|axles|puntos|points|lamparas|lámparas|lights|lamps)?\\s*(?:de\\s+|en\\s+|para\\s+|of\\s+|for\\s+)?${escaped}`),
    new RegExp(`${escaped}[^\\d.,;]{0,65}?(\\d+(?:\\.\\d+)?)\\s*(?:m2|m²|sq\\s*m|sqm|square\\s+meters|metros|personas|people|guests|meses|months|ejes|axles|puntos|points)?`),
  ];

  for (const re of afterOrBefore) {
    const match = normalizedMsg.match(re);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (Number.isFinite(val) && val > 0 && val < 10000) {
        return val;
      }
    }
  }
  return 1;
}

export function extractQuoteDemo(
  message: string,
  catalog: CatalogItem[],
  defaultNotes: string
): ExtractedQuotePayload {
  const norm = normalize(message);
  const matchedItems: QuoteLineItem[] = [];

  for (const catItem of catalog) {
    const normalizedKeywords = (catItem.keywords || []).map(normalize);
    const hitKeyword = normalizedKeywords.find((kw) => norm.includes(kw));

    if (hitKeyword) {
      const quantity = findQuantityNearKeyword(norm, hitKeyword);
      matchedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        catalogItemId: catItem.id,
        name: catItem.name,
        description: catItem.description,
        quantity,
        unit: catItem.unit,
        unitPrice: catItem.unitPrice,
      });
    }
  }

  // Fallback if nothing matched in free-form custom input
  if (matchedItems.length === 0) {
    const first = catalog[0];
    if (first) {
      matchedItems.push({
        id: `item-${Date.now()}-fallback`,
        catalogItemId: first.id,
        name: first.name,
        description: first.description,
        quantity: 1,
        unit: first.unit,
        unitPrice: first.unitPrice,
      });
    } else {
      matchedItems.push({
        id: `item-${Date.now()}-custom`,
        name: "Servicio profesional personalizado",
        description: "Alcance según requerimiento enviado por el cliente.",
        quantity: 1,
        unit: "servicio",
        unitPrice: 150,
      });
    }
  }

  const clientName = extractClientName(message);
  const clientPhone = extractPhone(message);
  const clientCompany = extractCompany(message);

  const itemNames = matchedItems.map((i) => i.name.split("(")[0].trim()).slice(0, 3);
  const summary =
    itemNames.length > 0
      ? `Cotización para ${itemNames.join(" + ")}`
      : "Propuesta comercial personalizada";

  return {
    clientName,
    clientPhone,
    clientCompany,
    summary,
    items: matchedItems,
    notes: defaultNotes,
    mode: "demo",
  };
}
