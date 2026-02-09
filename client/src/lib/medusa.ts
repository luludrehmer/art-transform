/**
 * Medusa integration for Art & See products.
 * When USE_MEDUSA_PRODUCTS is true, purchases redirect to Medusa checkout.
 * 5 products (one per category), each with variants for style × type × size.
 */

import type { Category } from "@/lib/category-context";

export const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";

export const USE_MEDUSA_PRODUCTS =
  import.meta.env.VITE_USE_MEDUSA_PRODUCTS === "true";

/** Product handle for checkout (must match medusa-seed-products.ts) */
export function getProductHandle(category: Category): string {
  return `art-transform-${category}`;
}

/** Variant options for print sizes */
export const MEDUSA_PRINT_OPTIONS = ["8x10", "11x14", "16x20", "20x24"] as const;

/** Variant options for handmade sizes */
export const MEDUSA_HANDMADE_OPTIONS = [
  "12x16",
  "18x24",
  "24x36",
  "40x60",
] as const;

const VALID_CHECKOUT_LOCALES = ["de", "fr", "es", "it", "pt", "ko", "ja"];

/** Detect locale for checkout redirect (preserve language when coming from Photos-to-Paintings) */
export function getCheckoutLocale(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  const urlLocale = params.get("locale");
  if (urlLocale && VALID_CHECKOUT_LOCALES.includes(urlLocale)) return urlLocale;
  try {
    const referrer = document.referrer;
    if (referrer) {
      const u = new URL(referrer);
      const match = u.pathname.match(/^\/([a-z]{2})\//);
      if (match && VALID_CHECKOUT_LOCALES.includes(match[1])) return match[1];
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
