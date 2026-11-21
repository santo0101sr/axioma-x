import { NextResponse } from "next/server";
import { BusinessProfile, Quote } from "@/types/quote";
import { calculateQuoteTotals, formatMoney } from "@/lib/format";

type EmailKind = "quote" | "followup" | "owner_notification" | "test";

interface SendEmailBody {
  kind: EmailKind;
  to: string;
  quote?: Quote;
  business: BusinessProfile;
  portalUrl?: string;
  decision?: "approved" | "changes";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildQuoteEmailHtml(
  quote: Quote,
  business: BusinessProfile,
  portalUrl: string | undefined,
  isFollowUp: boolean
): string {
  const totals = calculateQuoteTotals(quote);
  const rows = quote.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;">
          <strong>${escapeHtml(item.name)}</strong>
          ${item.description ? `<div style="color:#64748b;font-size:12px;margin-top:2px;">${escapeHtml(item.description)}</div>` : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#334155;font-size:13px;">
          ${item.quantity} ${escapeHtml(item.unit)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-weight:600;font-size:13px;">
          ${escapeHtml(formatMoney(item.quantity * item.unitPrice, quote.currency))}
        </td>
      </tr>`
    )
    .join("");

  const intro = isFollowUp
    ? `Hola <strong>${escapeHtml(quote.clientName || "cliente")}</strong>, te escribimos para dar seguimiento a la cotización <strong>${escapeHtml(quote.quoteNumber)}</strong>. Quedamos atentos por si deseas aprobarla o realizar algún ajuste.`
    : `Hola <strong>${escapeHtml(quote.clientName || "cliente")}</strong>, adjuntamos el resumen de tu cotización <strong>${escapeHtml(quote.quoteNumber)}</strong> preparada por <strong>${escapeHtml(business.name)}</strong>.`;

  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f1f5f9;padding:24px;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0f172a;padding:22px 28px;color:#ffffff;">
        <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;">${escapeHtml(business.name)}</div>
        ${business.tagline ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px;">${escapeHtml(business.tagline)}</div>` : ""}
      </div>
      <div style="padding:26px 28px;">
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">${intro}</p>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">Concepto</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="margin-top:16px;padding:14px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:4px;">
            <span>Subtotal:</span>
            <span>${escapeHtml(formatMoney(totals.subtotal, quote.currency))}</span>
          </div>
          ${
            quote.taxPercent > 0
              ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:6px;">
                  <span>${escapeHtml(business.taxLabel)} (${quote.taxPercent}%):</span>
                  <span>${escapeHtml(formatMoney(totals.taxAmount, quote.currency))}</span>
                </div>`
              : ""
          }
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#0f172a;border-top:1px solid #cbd5e1;padding-top:8px;">
            <span>Total:</span>
            <span style="color:#2563eb;">${escapeHtml(formatMoney(totals.total, quote.currency))}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:6px;">Válida hasta: ${escapeHtml(quote.validUntil)}</div>
        </div>

        ${
          portalUrl
            ? `<div style="margin-top:22px;text-align:center;">
                <a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;">
                  Ver y aprobar cotización en línea
                </a>
              </div>`
            : ""
        }

        ${
          quote.notes
            ? `<p style="margin:20px 0 0;padding-top:14px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.5;"><strong>Condiciones:</strong> ${escapeHtml(quote.notes)}</p>`
            : ""
        }
      </div>
      <div style="background:#f8fafc;padding:14px 28px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
        Enviado con Axioma-X • ${escapeHtml([business.phone, business.email].filter(Boolean).join(" • "))}
      </div>
    </div>
  </div>`;
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.RESEND_API_KEY?.trim()),
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          error:
            "Falta configurar RESEND_API_KEY en las variables de entorno de Vercel para enviar correos reales.",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as SendEmailBody;
    const to = body?.to?.trim();
    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico de destino válido." },
        { status: 400 }
      );
    }

    const business = body.business;
    const fromEmail =
      business?.integrations?.resendFromEmail?.trim() ||
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "Axioma-X <onboarding@resend.dev>";

    let subject = "";
    let html = "";

    if (body.kind === "test") {
      subject = `Prueba de correos activos — ${business?.name || "Axioma-X"}`;
      html = `
        <div style="font-family:Inter,Arial,sans-serif;padding:24px;background:#f1f5f9;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
            <h2 style="margin:0 0 8px;color:#0f172a;">¡Integración de correo conectada!</h2>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
              Tu espacio de trabajo <strong>${escapeHtml(business?.name || "Axioma-X")}</strong> ya puede enviar cotizaciones, recordatorios de seguimiento y avisos de aprobación automáticamente.
            </p>
          </div>
        </div>`;
    } else if (body.kind === "owner_notification" && body.quote) {
      const totals = calculateQuoteTotals(body.quote);
      const approved = body.decision === "approved";
      subject = approved
        ? `✅ Cotización ${body.quote.quoteNumber} APROBADA por ${body.quote.clientName}`
        : `✏️ Solicitud de ajuste en ${body.quote.quoteNumber} (${body.quote.clientName})`;
      html = `
        <div style="font-family:Inter,Arial,sans-serif;padding:24px;background:#f1f5f9;">
          <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
            <h2 style="margin:0 0 10px;color:${approved ? "#16a34a" : "#d97706"};">
              ${approved ? "Cotización aprobada en el Portal Cliente" : "El cliente solicitó cambios"}
            </h2>
            <p style="margin:0 0 12px;color:#334155;font-size:14px;">
              <strong>Cliente:</strong> ${escapeHtml(body.quote.clientName)} ${body.quote.clientPhone ? `(${escapeHtml(body.quote.clientPhone)})` : ""}<br/>
              <strong>Documento:</strong> ${escapeHtml(body.quote.quoteNumber)}<br/>
              <strong>Monto total:</strong> ${escapeHtml(formatMoney(totals.total, body.quote.currency))}
            </p>
            ${
              body.portalUrl
                ? `<a href="${escapeHtml(body.portalUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;">Abrir cotización</a>`
                : ""
            }
          </div>
        </div>`;
    } else if ((body.kind === "quote" || body.kind === "followup") && body.quote) {
      const isFollowUp = body.kind === "followup";
      subject = isFollowUp
        ? `Seguimiento: Cotización ${body.quote.quoteNumber} — ${business.name}`
        : `Cotización ${body.quote.quoteNumber} — ${business.name}`;
      html = buildQuoteEmailHtml(body.quote, business, body.portalUrl, isFollowUp);
    } else {
      return NextResponse.json(
        { error: "Faltan datos de la cotización para construir el correo." },
        { status: 400 }
      );
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        reply_to: business?.email?.trim() || undefined,
        subject,
        html,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            "Resend rechazó el envío del correo. Verifica el remitente o tu API key.",
        },
        { status: resendRes.status }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Error in /api/integrations/send-email:", err);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al enviar el correo." },
      { status: 500 }
    );
  }
}
