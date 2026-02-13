#!/usr/bin/env tsx
/**
 * Injects 3 gallery images per art-transform product into Medusa.
 * - Product level: thumbnail + images (for feed, Media tab)
 * - Variant level: metadata.thumbnail + metadata.images (for SKU display in Admin)
 *
 * For images to show per SKU in Admin, install medusa-variant-images plugin in Medusa backend.
 *
 * Prerequisites:
 *   A) Local: npm run copy-gallery + deploy art-transform (uses ART_TRANSFORM_PUBLIC_URL/gallery)
 *   B) R2:   npm run upload-gallery-to-r2, then set ART_TRANSFORM_GALLERY_BASE_URL
 *
 * Run:  npm run medusa-inject-images
 *       npm run medusa-inject-images -- --dry-run
 *       npm run medusa-inject-images -- --products-only   (skip variant metadata)
 *
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD
 * Image base: ART_TRANSFORM_GALLERY_BASE_URL (R2) or ART_TRANSFORM_PUBLIC_URL + /gallery
 */

import "dotenv/config";
import { getProductImageUrls, getVariantImageUrls } from "../server/medusa-variant-images";
import type { Category, ArtStyle, Mood } from "../server/medusa-variant-images";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";
const PUBLIC_URL = process.env.ART_TRANSFORM_PUBLIC_URL || "https://ai.art-and-see.com";
const GALLERY_BASE =
  process.env.ART_TRANSFORM_GALLERY_BASE_URL || `${PUBLIC_URL.replace(/\/$/, "")}/gallery`;

const DRY_RUN = process.argv.includes("--dry-run");
const PRODUCTS_ONLY = process.argv.includes("--products-only");

const COLLECTION_HANDLE = "art-transform";
const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;
const MOODS = ["classic", "royal_noble", "neoclassical", "heritage"] as const;

const STYLE_LABEL_TO_ID: Record<string, ArtStyle> = {
  "Oil Painting": "oil-painting",
  Acrylic: "acrylic",
  "Pencil Sketch": "pencil-sketch",
  Watercolor: "watercolor",
  Charcoal: "charcoal",
  Pastel: "pastel",
};
const MOOD_LABEL_TO_ID: Record<string, Mood> = {
  Classic: "classic",
  Royal: "royal_noble",
  Neoclassical: "neoclassical",
  Heritage: "heritage",
};

function getProductHandle(category: string): string {
  return `art-transform-${category}`;
}

/** Extract style and mood from variant options or title. */
function getStyleAndMoodFromVariant(v: any): { style: ArtStyle; mood: Mood } | null {
  const opts = v.options ?? [];
  let style: ArtStyle | null = null;
  let mood: Mood | null = null;
  for (const o of opts) {
    const val = (o.value ?? o).toString?.() ?? String(o);
    if (STYLES.includes(val as ArtStyle)) style = val as ArtStyle;
    if (MOODS.includes(val as Mood)) mood = val as Mood;
  }
  if (style && mood) return { style, mood };
  const title = v.title ?? "";
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]?.trim() ?? "";
    const firstPart = parts[0]?.trim() ?? "";
    mood = MOOD_LABEL_TO_ID[last] ?? (MOODS.includes(last as Mood) ? (last as Mood) : null);
    const styleLabel = (Object.keys(STYLE_LABEL_TO_ID) as string[]).find((l) =>
      firstPart === l || firstPart.startsWith(l + " ")
    );
    style = styleLabel
      ? (STYLE_LABEL_TO_ID[styleLabel] as ArtStyle)
      : (STYLES.includes(firstPart as ArtStyle) ? (firstPart as ArtStyle) : null);
  }
  return style && mood ? { style, mood } : null;
}

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Medusa auth failed: ${res.status} - ${await res.text()}`);
  }
  const data = await res.json();
  return data.token ?? data.user?.token ?? (data as { access_token?: string }).access_token ?? "";
}

async function api(path: string, method: string, token: string, body?: object): Promise<any> {
  const url = path.startsWith("http") ? path : `${BACKEND}${path}`;
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    throw new Error(`${method} ${path}: ${res.status} - ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("=== Medusa Inject Variant Images (Art Transform) ===");
  console.log(`Backend: ${BACKEND}`);
  console.log(`Gallery base URL: ${GALLERY_BASE}`);
  console.log(`Flags: ${DRY_RUN ? "--dry-run" : ""}\n`);

  if (DRY_RUN) {
    console.log("--- DRY RUN: would update ---");
    for (const cat of CATEGORIES) {
      const urls = getProductImageUrls(GALLERY_BASE, cat);
      console.log(`  ${getProductHandle(cat)}: ${urls[0]}`);
      console.log(`    + ${urls[1]}`);
      console.log(`    + ${urls[2]}`);
    }
    return;
  }

  console.log("Authenticating...");
  const token = await getAdminToken();
  if (!token) {
    console.error("No token");
    process.exit(1);
  }
  console.log("Authenticated.\n");

  // Get products in art-transform collection (with variants)
  let products: any[] = [];
  try {
    const collRes = await api(`/admin/collections?handle[]=${COLLECTION_HANDLE}`, "GET", token);
    const collectionId = collRes.collections?.[0]?.id;
    if (!collectionId) {
      console.error(`Collection "${COLLECTION_HANDLE}" not found. Run medusa-seed-v2 first.`);
      process.exit(1);
    }
    const listRes = await api(
      `/admin/products?collection_id[]=${collectionId}&limit=100&fields=*variants,*variants.options`,
      "GET",
      token
    );
    products = listRes.products ?? [];
  } catch (err) {
    console.error("Failed to list products:", err);
    process.exit(1);
  }

  if (products.length === 0) {
    console.log("No art-transform products found. Run medusa-seed-v2 first.");
    return;
  }

  let updatedProducts = 0;
  let updatedVariants = 0;
  for (const product of products) {
    const handle = product.handle;
    if (!handle?.startsWith("art-transform-")) continue;

    const category = handle.replace(/^art-transform-/, "") as (typeof CATEGORIES)[number];
    if (!CATEGORIES.includes(category)) continue;

    const [url1, url2, url3] = getProductImageUrls(GALLERY_BASE, category);
    const images = [{ url: url1 }, { url: url2 }, { url: url3 }];
    const payload: Record<string, unknown> = { thumbnail: url1, images };

    if (!PRODUCTS_ONLY && product.variants?.length > 0) {
      const variantUpdates: { id: string; metadata: Record<string, unknown> }[] = [];
      for (const variant of product.variants) {
        const parsed = getStyleAndMoodFromVariant(variant);
        if (!parsed) continue;
        const [v1, v2, v3] = getVariantImageUrls(GALLERY_BASE, category, parsed.style, parsed.mood);
        variantUpdates.push({
          id: variant.id,
          metadata: {
            thumbnail: v1,
            images: [{ url: v1 }, { url: v2 }, { url: v3 }],
          },
        });
      }
      if (variantUpdates.length > 0) {
        payload.variants = product.variants.map((v: any) => {
          const upd = variantUpdates.find((u) => u.id === v.id);
          if (!upd) return { id: v.id };
          return { id: v.id, metadata: upd.metadata };
        });
      }
    }

    try {
      await api(`/admin/products/${product.id}`, "POST", token, payload);
      updatedProducts++;
      const variantCount = (payload.variants as any[])?.length ?? 0;
      console.log(
        `✅ ${handle}: injected 3 product images${variantCount ? ` + ${variantCount} variant metadata` : ""}`
      );
      if (variantCount) updatedVariants += variantCount;
    } catch (err) {
      console.error(`❌ ${handle}: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✅ Updated ${updatedProducts} products with images`);
  if (!PRODUCTS_ONLY && updatedVariants > 0) {
    console.log(`✅ Updated ${updatedVariants} variants with metadata (thumbnail + images)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
