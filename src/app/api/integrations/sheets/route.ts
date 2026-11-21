import { NextResponse } from "next/server";
import { BusinessProfile, Quote } from "@/types/quote";
import { calculateQuoteTotals } from "@/lib/format";

interface SheetsRequestBody {
  webhookUrl: string;
  action: "sync_quote" | "sync_all" | "test";
  quote?: Quote;
  quotes?: Quote[];
  business?: BusinessProfile;
}

function isSafeWebhookUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function quoteToRow(q: Quote) {
  const totals = calculateQuoteTotals(q);
  return {
    id: q.id,
    quoteNumber: q.quoteNumber,
    createdAt: q.createdAt,
    validUntil: q.validUntil,
    clientName: q.clientName,
    clientPhone: q.clientPhone || "",
    clientEmail: q.clientEmail || "",
    clientCompany: q.clientCompany || "",
    status: q.status,
    currency: q.currency,
    subtotal: Number(totals.subtotal.toFixed(2)),
    taxAmount: Number(totals.taxAmount.toFixed(2)),
    total: Number(totals.total.toFixed(2)),
    summary: q.summary || "",
    itemsCount: q.items.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SheetsRequestBody;
    const webhookUrl = body?.webhookUrl?.trim();

    if (!webhookUrl || !isSafeWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        {
          error:
            "La URL del webhook debe ser una dirección HTTPS válida (por ejemplo, tu Google Apps Script Web App).",
        },
        { status: 400 }
      );
    }

    const rows =
      body.action === "sync_all" && Array.isArray(body.quotes)
        ? body.quotes.map(quoteToRow)
        : body.action === "sync_quote" && body.quote
        ? [quoteToRow(body.quote)]
        : [];

    const payload = {
      source: "Axioma-X",
      action: body.action,
      businessName: body.business?.name || "Axioma-X",
      sentAt: new Date().toISOString(),
      rows,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Google Sheets respondió con código ${res.status}. Verifica que el Web App esté publicado con acceso para "Cualquier persona".`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      syncedCount: rows.length,
    });
  } catch (err) {
    console.error("Error in /api/integrations/sheets:", err);
    return NextResponse.json(
      { error: "No se pudo conectar con la URL de Google Sheets." },
      { status: 500 }
    );
  }
}
