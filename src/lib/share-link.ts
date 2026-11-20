import { BusinessProfile, Quote } from "@/types/quote";

export interface SharedQuotePayload {
  quote: Quote;
  business: BusinessProfile;
}

export function encodeSharedQuote(payload: SharedQuotePayload): string {
  const compactBusiness: BusinessProfile = {
    ...payload.business,
    logoDataUrl: undefined, // keep URL short and reliable
  };
  const json = JSON.stringify({ quote: payload.quote, business: compactBusiness });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSharedQuote(token: string): SharedQuotePayload | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as SharedQuotePayload;
    if (!parsed?.quote || !parsed?.business) return null;
    return parsed;
  } catch {
    return null;
  }
}
