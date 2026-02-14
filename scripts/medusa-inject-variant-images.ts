#!/usr/bin/env tsx
/**
 * Injects gallery images into Medusa art-transform products + variant metadata.
 *
 * - Product level: thumbnail + images[3] (for Google Shopping feed, Media tab)
 * - Variant level: metadata.thumbnail + metadata.images[3] (per-SKU in Admin)
 *
 * IMPORTANT: Variant metadata is updated individually via
 *   POST /admin/products/:productId/variants/:variantId
 * NOT via the product-level endpoint (which replaces the variants array).
 *
 * Run:  npm run medusa-inject-images
 *       npm run medusa-inject-images -- --dry-run
 *       npm run medusa-inject-images -- --products-only
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
const STYLES: ArtStyle[] = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"];
const MOODS: Mood[] = ["classic", "royal_noble", "neoclassical", "heritage"];

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

// ---------- Style/Mood parsing ----------

function parseStyleAndMood(title: string): { style: ArtStyle; mood: Mood } | null {
  const lastDash = title.lastIndexOf(" - ");
  if (lastDash === -1) return null;
  const moodStr = title.slice(lastDash + 3).trim();
  const beforeMood = title.slice(0, lastDash).trim();
  const mood = MOOD_LABEL_TO_ID[moodStr] ?? null;
  if (!mood) return null;
  let style: ArtStyle | null = null;
  for (const [label, id] of Object.entries(STYLE_LABEL_TO_ID)) {
    if (beforeMood === label || beforeMood.startsWith(label + " ")) {
      style = id;
      break;
    }
  }
  return style && mood ? { style, mood } : null;
}

// ---------- API helpers ----------

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  return (await res.json()).token;
}

async function api(path: string, method: string, token: string, body?: object): Promise<any> {
  const url = `${BACKEND}${path}`;
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} - ${await res.text()}`);
  return res.json();
}

/**
 * Update variant metadata via individual endpoint.
 * Discards response body to avoid waiting for huge product serialization.
 * Retries on timeout/502 up to 2 times.
 */
async function updateVariantMetadata(
  productId: string,
  variantId: string,
  metadata: object,
  token: string
): Promise<boolean> {
  const path = `/admin/products/${productId}/variants/${variantId}`;
  const url = `${BACKEND}${path}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000); // 2 min timeout
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ metadata }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        // Discard body — don't wait for full product serialization
        if (res.body) try { res.body.cancel(); } catch {}
        return true;
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        console.error(`    retry ${attempt}/3: ${res.status} on variant ${variantId}`);
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        continue;
      }
      console.error(`    variant ${variantId}: ${res.status}`);
      return false;
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt < 3) {
        console.error(`    retry ${attempt}/3: ${err.name === "AbortError" ? "timeout" : err.message}`);
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        continue;
      }
      console.error(`    variant ${variantId}: ${err.name === "AbortError" ? "timeout" : err.message}`);
      return false;
    }
  }
  return false;
}

// ---------- Main ----------

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("=== Medusa Inject Variant Images ===");
  console.log(`Backend: ${BACKEND}`);
  console.log(`Gallery: ${GALLERY_BASE}`);
  console.log(`Flags: ${DRY_RUN ? "--dry-run " : ""}${PRODUCTS_ONLY ? "--products-only" : ""}\n`);

  if (DRY_RUN) {
    for (const cat of CATEGORIES) {
      const [u1, u2, u3] = getProductImageUrls(GALLERY_BASE, cat);
      console.log(`art-transform-${cat}: ${u1}`);
    }
    return;
  }

  console.log("Authenticating...");
  const token = await getAdminToken();
  console.log("OK\n");

  // Fetch products (with retry — Railway can drop connection)
  let products: any[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const collRes = await api(`/admin/collections?handle[]=${COLLECTION_HANDLE}`, "GET", token);
      const collectionId = collRes.collections?.[0]?.id;
      if (!collectionId) { console.error("Collection not found"); process.exit(1); }
      const listRes = await api(`/admin/products?collection_id[]=${collectionId}&limit=100`, "GET", token);
      products = (listRes.products ?? []).filter((p: any) => p.handle?.startsWith("art-transform-"));
      break;
    } catch (err: any) {
      console.error(`Fetch products attempt ${attempt}/3: ${err.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 5000));
      else throw err;
    }
  }
  console.log(`${products.length} products\n`);

  let totalVariantsOk = 0;
  let totalVariantsFail = 0;

  for (const product of products) {
    const handle = product.handle;
    const category = handle.replace(/^art-transform-/, "") as (typeof CATEGORIES)[number];
    if (!CATEGORIES.includes(category)) continue;

    // Product images (only thumbnail + images, no variants in payload!)
    const [url1, url2, url3] = getProductImageUrls(GALLERY_BASE, category);
    try {
      await api(`/admin/products/${product.id}`, "POST", token, {
        thumbnail: url1,
        images: [{ url: url1 }, { url: url2 }, { url: url3 }],
      });
      console.log(`✅ ${handle}: 3 product images`);
    } catch (err: any) {
      console.error(`❌ ${handle}: ${err.message}`);
      continue;
    }

    if (PRODUCTS_ONLY) continue;

    // Fetch variant IDs + titles (lightweight)
    let variants: { id: string; title: string }[] = [];
    let offset = 0;
    while (true) {
      const vRes = await api(
        `/admin/products/${product.id}/variants?limit=100&offset=${offset}&fields=id,title`,
        "GET", token
      );
      variants = variants.concat(vRes.variants ?? []);
      if ((vRes.variants ?? []).length < 100) break;
      offset += 100;
    }

    // Build updates
    const updates: { id: string; metadata: object }[] = [];
    for (const v of variants) {
      const parsed = parseStyleAndMood(v.title);
      if (!parsed) continue;
      const [v1, v2, v3] = getVariantImageUrls(GALLERY_BASE, category, parsed.style, parsed.mood);
      updates.push({
        id: v.id,
        metadata: { thumbnail: v1, images: [{ url: v1 }, { url: v2 }, { url: v3 }] },
      });
    }

    console.log(`  ${variants.length} variants, ${updates.length} with images. Updating sequentially...`);

    // Update variants ONE BY ONE (Medusa is slow but safe)
    let ok = 0;
    let fail = 0;
    for (const upd of updates) {
      const success = await updateVariantMetadata(product.id, upd.id, upd.metadata, token);
      if (success) ok++;
      else fail++;
      if ((ok + fail) % 25 === 0) {
        console.log(`    ${ok + fail}/${updates.length} (${ok} ok, ${fail} fail)`);
      }
      // Small delay between calls
      await new Promise((r) => setTimeout(r, 500));
    }
    totalVariantsOk += ok;
    totalVariantsFail += fail;
    console.log(`  → ${ok}/${updates.length} variants updated${fail ? ` (${fail} failed)` : ""}`);
  }

  console.log(`\n=== Done ===`);
  console.log(`Variants: ${totalVariantsOk} ok, ${totalVariantsFail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
