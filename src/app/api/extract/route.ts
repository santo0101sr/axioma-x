import { NextResponse } from "next/server";
import { extractQuoteDemo } from "@/lib/demo-extractor";
import { BusinessProfile, CatalogItem, QuoteLineItem } from "@/types/quote";

interface ExtractRequestBody {
  message: string;
  catalog: CatalogItem[];
  business: BusinessProfile;
  imageBase64?: string;
}

const SYSTEM_PROMPT = `Eres un asistente experto en ventas y cotizaciones para PyMEs en Latinoamérica.
Recibirás un mensaje informal de un cliente (WhatsApp, audio transcrito o texto) y el catálogo de servicios del negocio.
Tu tarea es devolver ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "clientName": "Nombre del cliente o 'Cliente por confirmar'",
  "clientPhone": "Teléfono si aparece o ''",
  "clientCompany": "Empresa si aparece o ''",
  "summary": "Resumen corto de 1 línea de lo solicitado",
  "items": [
    {
      "catalogItemId": "id del catálogo si coincide, o null",
      "name": "Nombre claro del servicio/producto",
      "description": "Descripción breve del alcance",
      "quantity": 1,
      "unit": "unidad (ej. m², proyecto, servicio, persona)",
      "unitPrice": 100
    }
  ],
  "notes": "Notas o condiciones recomendadas según la urgencia o detalle del mensaje"
}
Usa los precios y unidades del catálogo siempre que haya coincidencia. Si el cliente pide algo que no está en el catálogo, estima un ítem razonable y márcalo en la descripción.`;

function normalizeExtractedItems(
  rawItems: unknown,
  prefix: string
): QuoteLineItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((it: Partial<QuoteLineItem>, idx: number) => ({
    id: `${prefix}-${Date.now()}-${idx}`,
    catalogItemId: it.catalogItemId || undefined,
    name: it.name || "Servicio",
    description: it.description || "",
    quantity: Number(it.quantity) || 1,
    unit: it.unit || "servicio",
    unitPrice: Number(it.unitPrice) || 0,
  }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExtractRequestBody;
    const message = (body.message || "").trim();
    const catalog = Array.isArray(body.catalog) ? body.catalog : [];
    const defaultNotes = body.business?.defaultNotes || "";

    if (!message && !body.imageBase64) {
      return NextResponse.json(
        { error: "Debes ingresar un mensaje, dictado o imagen para cotizar." },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();

    const userPrompt = `Negocio: ${body.business?.name || "Mi Negocio"} (Moneda: ${body.business?.currency || "USD"})
Catálogo disponible:
${JSON.stringify(
  catalog.map((c) => ({
    id: c.id,
    name: c.name,
    unit: c.unit,
    unitPrice: c.unitPrice,
    description: c.description,
  })),
  null,
  2
)}

Mensaje del cliente:
"""
${message || "Analiza la imagen adjunta y genera una cotización basada en el catálogo."}
"""`;

    // 1) Groq API if configured (ultra-fast Llama 3.3 / Llama 4 Scout)
    if (groqKey) {
      const hasImage = Boolean(body.imageBase64);
      const groqModel = hasImage
        ? "meta-llama/llama-4-scout-17b-16e-instruct"
        : "llama-3.3-70b-versatile";

      const userContent = hasImage
        ? [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: body.imageBase64 } },
          ]
        : userPrompt;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json?.choices?.[0]?.message?.content;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return NextResponse.json({
            clientName: parsed.clientName || "Cliente por confirmar",
            clientPhone: parsed.clientPhone || "",
            clientCompany: parsed.clientCompany || "",
            summary: parsed.summary || "Cotización generada con Groq",
            items: normalizeExtractedItems(parsed.items, "groq"),
            notes: parsed.notes || defaultNotes,
            mode: "groq",
          });
        }
      }
    }

    // 2) Gemini API if configured
    if (geminiKey) {
      const parts: Array<Record<string, unknown>> = [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }];
      if (body.imageBase64) {
        const [meta, data] = body.imageBase64.split(",");
        const mimeMatch = meta?.match(/data:(.*?);base64/);
        if (data) {
          parts.push({
            inlineData: {
              mimeType: mimeMatch?.[1] || "image/jpeg",
              data,
            },
          });
        }
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const items: QuoteLineItem[] = (parsed.items || []).map(
            (it: Partial<QuoteLineItem>, idx: number) => ({
              id: `gem-${Date.now()}-${idx}`,
              catalogItemId: it.catalogItemId || undefined,
              name: it.name || "Servicio",
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              unit: it.unit || "servicio",
              unitPrice: Number(it.unitPrice) || 0,
            })
          );
          return NextResponse.json({
            clientName: parsed.clientName || "Cliente por confirmar",
            clientPhone: parsed.clientPhone || "",
            clientCompany: parsed.clientCompany || "",
            summary: parsed.summary || "Cotización generada con Gemini",
            items,
            notes: parsed.notes || defaultNotes,
            mode: "gemini",
          });
        }
      }
    }

    // 3) OpenAI API if configured
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json?.choices?.[0]?.message?.content;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const items: QuoteLineItem[] = (parsed.items || []).map(
            (it: Partial<QuoteLineItem>, idx: number) => ({
              id: `oai-${Date.now()}-${idx}`,
              catalogItemId: it.catalogItemId || undefined,
              name: it.name || "Servicio",
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              unit: it.unit || "servicio",
              unitPrice: Number(it.unitPrice) || 0,
            })
          );
          return NextResponse.json({
            clientName: parsed.clientName || "Cliente por confirmar",
            clientPhone: parsed.clientPhone || "",
            clientCompany: parsed.clientCompany || "",
            summary: parsed.summary || "Cotización generada con OpenAI",
            items,
            notes: parsed.notes || defaultNotes,
            mode: "openai",
          });
        }
      }
    }

    // 4) Smart Demo Mode fallback (zero-friction)
    const demoResult = extractQuoteDemo(message, catalog, defaultNotes);
    return NextResponse.json(demoResult);
  } catch (err) {
    console.error("Extract error:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la cotización." },
      { status: 500 }
    );
  }
}
