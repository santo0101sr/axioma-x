export type CurrencyCode = "USD" | "CRC" | "MXN" | "COP";

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected";

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  category: string;
  keywords: string[];
}

export interface QuoteLineItem {
  id: string;
  catalogItemId?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface BusinessProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logoDataUrl?: string;
  currency: CurrencyCode;
  taxLabel: string;
  taxPercent: number;
  validityDays: number;
  defaultNotes: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  createdAt: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  originalMessage: string;
  summary: string;
  items: QuoteLineItem[];
  discountPercent: number;
  taxPercent: number;
  currency: CurrencyCode;
  notes: string;
  status: QuoteStatus;
  extractionMode?: "gemini" | "openai" | "groq" | "demo";
}

export interface IndustryPreset {
  id: string;
  label: string;
  emoji: string;
  business: BusinessProfile;
  catalog: CatalogItem[];
  sampleMessages: {
    title: string;
    text: string;
  }[];
}
