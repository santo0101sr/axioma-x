import { CurrencyCode, Quote } from "@/types/quote";

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; locale: string; decimals: number }
> = {
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  CRC: { symbol: "₡", locale: "es-CR", decimals: 0 },
  MXN: { symbol: "MX$", locale: "es-MX", decimals: 2 },
  COP: { symbol: "COL$", locale: "es-CO", decimals: 0 },
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD;
  const formatted = new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(Number.isFinite(amount) ? amount : 0);
  return `${cfg.symbol}${formatted}`;
}

export function calculateQuoteTotals(quote: Pick<Quote, "items" | "discountPercent" | "taxPercent">) {
  const subtotal = quote.items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
    0
  );
  const discountAmount = subtotal * (Math.max(0, Math.min(100, quote.discountPercent)) / 100);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableBase * (Math.max(0, quote.taxPercent) / 100);
  const total = taxableBase + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}

export function generateQuoteNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `COT-${y}${m}-${rand}`;
}

export function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
