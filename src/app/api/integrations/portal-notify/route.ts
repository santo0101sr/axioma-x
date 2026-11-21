import { NextResponse } from "next/server";
import { BusinessProfile, Quote } from "@/types/quote";

interface PortalNotifyBody {
  decision: "approved" | "changes";
  quote: Quote;
  business: BusinessProfile;
  portalUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PortalNotifyBody;
    const { decision, quote, business, portalUrl } = body;

    if (!quote || !business) {
      return NextResponse.json({ error: "Payload incompleto." }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const results = {
      emailSent: false,
      sheetsSynced: false,
    };

    const updatedQuote: Quote = {
      ...quote,
      status: decision === "approved" ? "approved" : "sent",
    };

    // 1. Notify business owner via email if enabled
    if (
      business.integrations?.notifyEmailOnApproval &&
      business.email?.trim() &&
      process.env.RESEND_API_KEY?.trim()
    ) {
      try {
        const emailRes = await fetch(`${origin}/api/integrations/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "owner_notification",
            to: business.email.trim(),
            quote: updatedQuote,
            business,
            portalUrl,
            decision,
          }),
        });
        results.emailSent = emailRes.ok;
      } catch {
        // Non-blocking
      }
    }

    // 2. Sync updated status to Google Sheets if configured
    const sheetsUrl = business.integrations?.googleSheetsWebhookUrl?.trim();
    if (sheetsUrl) {
      try {
        const sheetsRes = await fetch(`${origin}/api/integrations/sheets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: sheetsUrl,
            action: "sync_quote",
            quote: updatedQuote,
            business,
          }),
        });
        results.sheetsSynced = sheetsRes.ok;
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (err) {
    console.error("Error in /api/integrations/portal-notify:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
