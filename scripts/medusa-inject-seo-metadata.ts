#!/usr/bin/env tsx
/**
 * Injects SKU + SEO metadata (seo_title, seo_description, seo_keywords, google_product_category, product_type)
 * into all art-transform variants and products. Required for Google Shopping and Pinterest catalog feeds.
 *
 * Obrigatorio: portrait, "from your photo", medium (style).
 *
 * Run:  npm run medusa-inject-seo
 *       npm run medusa-inject-seo -- --dry-run
 *       npm run medusa-inject-seo -- --products-only
 *       npm run medusa-inject-seo -- --resume          (pula variantes que já têm seo_title)
 *       npm run medusa-inject-seo -- --batch-size=50   (batch de 50, default 25)
 *       npm run medusa-inject-seo -- --from-file       (ler de art-transform-seo-metadata.json)
 *       npm run medusa-inject-seo -- --from-file --resume  (pula variantes que já têm seo_title)
 *
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD
 */

import "dotenv/config";
import fs from "fs";
import path from "path";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";

const DRY_RUN = process.argv.includes("--dry-run");
const PRODUCTS_ONLY = process.argv.includes("--products-only");
const RESUME = process.argv.includes("--resume"); // Skip variants that already have seo_title
const FROM_FILE = process.argv.includes("--from-file");
const BATCH_SIZE = parseInt(process.argv.find((a) => a.startsWith("--batch-size="))?.split("=")[1] || "25", 10);
const FILE_PATH = process.argv.find((a) => a.startsWith("--file="))?.split("=")[1] || "art-transform-seo-metadata.json";
const REQ_TIMEOUT_MS = 90_000; // Railway cold start pode levar ~60s

const COLLECTION_HANDLE = "art-transform";
const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;
const MOODS = ["classic", "royal_noble", "neoclassical", "heritage"] as const;
type ProductType = "digital" | "print" | "handmade";

const STYLE_LABEL_TO_ID: Record<string, string> = {
  "Oil Painting": "oil-painting",
  Acrylic: "acrylic",
  "Pencil Sketch": "pencil-sketch",
  Watercolor: "watercolor",
  Charcoal: "charcoal",
  Pastel: "pastel",
};

const STYLE_LABEL_HUMAN: Record<string, string> = {
  "oil-painting": "oil painting",
  acrylic: "acrylic",
  "pencil-sketch": "pencil sketch",
  watercolor: "watercolor",
  charcoal: "charcoal",
  pastel: "pastel",
};

const STYLE_LABEL_DISPLAY: Record<string, string> = {
  "oil-painting": "Oil Painting",
  acrylic: "Acrylic",
  "pencil-sketch": "Pencil Sketch",
  watercolor: "Watercolor",
  charcoal: "Charcoal",
  pastel: "Pastel",
};

const MOOD_LABEL_TO_ID: Record<string, string> = {
  Classic: "classic",
  Royal: "royal_noble",
  Neoclassical: "neoclassical",
  Heritage: "heritage",
};

const CATEGORY_LABELS: Record<string, string> = {
  pets: "Pet",
  family: "Family",
  kids: "Kids",
  couples: "Couples",
  "self-portrait": "Self Portrait",
};

// ---------- Parse variant title ----------

function parseVariantTitle(title: string): { style: string; type: ProductType; size: string; mood: string } | null {
  const lastDash = title.lastIndexOf(" - ");
  if (lastDash === -1) return null;
  const moodStr = title.slice(lastDash + 3).trim();
  const beforeMood = title.slice(0, lastDash).trim();
  const mood = MOOD_LABEL_TO_ID[moodStr] ?? null;
  if (!mood) return null;

  let style: string | null = null;
  let type: ProductType = "digital";
  let size = "default";

  if (beforeMood.includes(" - Digital Download")) {
    const stylePart = beforeMood.replace(" - Digital Download", "").trim();
    style = STYLE_LABEL_TO_ID[stylePart] ?? null;
    type = "digital";
    size = "default";
  } else if (beforeMood.includes(" Print ")) {
    const match = beforeMood.match(/^(.+?) Print (\d+x\d+)$/);
    if (match) {
      style = STYLE_LABEL_TO_ID[match[1].trim()] ?? null;
      type = "print";
      size = match[2];
    }
  } else if (beforeMood.includes(" Handmade ")) {
    const match = beforeMood.match(/^(.+?) Handmade (\d+x\d+)$/);
    if (match) {
      style = STYLE_LABEL_TO_ID[match[1].trim()] ?? null;
      type = "handmade";
      size = match[2];
    }
  }
  return style && mood ? { style, type, size, mood } : null;
}

// ---------- Generate SEO content ----------

function generateSku(category: string, style: string, type: ProductType, size: string, mood: string): string {
  return `art-${category}-${style}-${type}-${size}-${mood}`;
}

function generateVariantSeoTitle(
  categoryLabel: string,
  styleDisplay: string,
  type: ProductType,
  size: string,
  moodLabel: string
): string {
  const typeStr = type === "digital" ? "Digital Download" : type === "print" ? `Print ${size}` : `Handmade ${size}`;
  return `Custom ${categoryLabel} Portrait ${styleDisplay} from Your Photo - ${typeStr} ${moodLabel} | Art & See`;
}

function generateVariantSeoDescription(
  categoryLabel: string,
  styleLabel: string,
  type: ProductType,
  size: string,
  moodLabel: string
): string {
  const typeStr =
    type === "digital"
      ? "digital download"
      : type === "print"
        ? `print ${size}`
        : `handmade canvas ${size}`;
  return `Order a custom ${categoryLabel.toLowerCase()} portrait ${styleLabel.toLowerCase()} from your photo. Medium: ${styleLabel.toLowerCase()}. ${typeStr} in ${moodLabel.toLowerCase()} style. Transform your photo into stunning wall art. Free shipping on orders over $99.`;
}

function generateVariantSeoKeywords(
  category: string,
  categoryLabel: string,
  style: string,
  styleLabel: string,
  type: ProductType,
  size: string,
  moodLabel: string
): string {
  const kw: string[] = [
    `custom ${categoryLabel.toLowerCase()} portrait from your photo`,
    `${categoryLabel.toLowerCase()} portrait ${styleLabel.toLowerCase()} from photo`,
    `${styleLabel.toLowerCase()} portrait from photo`,
    `custom portrait from your photo`,
  ];
  if (type === "digital") {
    kw.push(`buy ${categoryLabel.toLowerCase()} portrait digital download`, `medium ${styleLabel.toLowerCase()} portrait`);
  } else {
    kw.push(
      `buy ${categoryLabel.toLowerCase()} portrait painting ${size}`,
      `${categoryLabel.toLowerCase()} portrait ${styleLabel.toLowerCase()} wall art ${size} from your photo`,
      `medium ${styleLabel.toLowerCase()} portrait`
    );
  }
  return kw.join(", ");
}

function generateProductMetaTitle(categoryLabel: string): string {
  return `Custom ${categoryLabel} Portrait from Your Photo | Oil Painting, Acrylic, Watercolor & More | Art & See`;
}

function generateProductMetaDescription(categoryLabel: string): string {
  return `Transform your ${categoryLabel.toLowerCase()} photos into custom portrait artwork. Choose your medium: oil painting, acrylic, watercolor, pencil sketch, charcoal, pastel. Custom portrait from your photo.`;
}

function generateProductMetaKeywords(category: string, categoryLabel: string): string {
  const mediums = "oil painting, acrylic, watercolor, pencil sketch, charcoal, pastel";
  return `custom ${categoryLabel.toLowerCase()} portrait from your photo, ${categoryLabel.toLowerCase()} portrait, portrait from photo, ${mediums}`;
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      signal: controller.signal,
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    clearTimeout(timer);
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} - ${await res.text()}`);
    return res.json();
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}

async function updateVariantMetadata(
  productId: string,
  variantId: string,
  payload: { sku?: string; metadata?: object },
  token: string
): Promise<boolean> {
  const path = `/admin/products/${productId}/variants/${variantId}`;
  const url = `${BACKEND}${path}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        await res.text();
        return true;
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < 3) await new Promise((r) => setTimeout(r, 3000 * attempt));
        continue;
      }
      return false;
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 3000 * attempt));
      else return false;
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

  console.log("=== Medusa Inject SEO Metadata ===");
  console.log(`Backend: ${BACKEND}`);
  console.log(`Flags: ${DRY_RUN ? "--dry-run " : ""}${FROM_FILE ? "--from-file " : ""}${PRODUCTS_ONLY ? "--products-only " : ""}${RESUME ? "--resume " : ""}batch=${BATCH_SIZE}\n`);

  if (DRY_RUN) {
    const sample = parseVariantTitle("Oil Painting Print 8x10 - Classic");
    if (sample) {
      const cat = "pets";
      const catLabel = CATEGORY_LABELS[cat];
      const styleLabel = STYLE_LABEL_HUMAN[sample.style] ?? sample.style;
      console.log("Sample variant SEO:");
      console.log("  sku:", generateSku(cat, sample.style, sample.type, sample.size, sample.mood));
      const styleDisplay = STYLE_LABEL_DISPLAY[sample.style] ?? styleLabel;
      console.log("  seo_title:", generateVariantSeoTitle(catLabel, styleDisplay, sample.type, sample.size, "Classic"));
      console.log("  seo_keywords:", generateVariantSeoKeywords(cat, catLabel, sample.style, styleLabel, sample.type, sample.size, "Classic").slice(0, 80) + "...");
    }
    console.log("\nSample product meta_title:", generateProductMetaTitle("Pet"));
    return;
  }

  console.log("Authenticating...");
  const token = await getAdminToken();
  console.log("OK\n");

  // Warm-up: primeira requisição pode acordar o Railway (cold start ~60s)
  console.log("Warming up backend...");
  try {
    await api("/admin/products?limit=1", "GET", token);
    console.log("Backend ready.\n");
  } catch (e) {
    console.warn("Warm-up failed, continuing anyway:", (e as Error).message);
  }

  if (FROM_FILE) {
    const outPath = path.resolve(process.cwd(), FILE_PATH);
    if (!fs.existsSync(outPath)) {
      console.error(`File not found: ${outPath}`);
      console.error("Run: npm run medusa-generate-seo");
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(outPath, "utf-8")) as {
      products: { id: string; handle: string; metadata: Record<string, string> }[];
      variants: { productId: string; variantId: string; sku: string; metadata: Record<string, unknown> }[];
    };
    let skipVariants: Set<string> = new Set();
    if (RESUME) {
      console.log("Resume: fetching variants to skip those with seo_title...");
      for (const p of data.products) {
        let offset = 0;
        while (true) {
          const vRes = await api(
            `/admin/products/${p.id}/variants?limit=100&offset=${offset}&fields=id,metadata`,
            "GET",
            token
          );
          for (const v of vRes.variants ?? []) {
            if ((v.metadata as Record<string, unknown>)?.seo_title) skipVariants.add(v.id);
          }
          if ((vRes.variants ?? []).length < 100) break;
          offset += 100;
        }
      }
      console.log(`  Skipping ${skipVariants.size} variants that already have seo_title\n`);
    }
    let totalOk = 0;
    let totalFail = 0;
    for (const p of data.products) {
      try {
        await api(`/admin/products/${p.id}`, "POST", token, { metadata: p.metadata });
        console.log(`✅ ${p.handle}: product metadata`);
      } catch (err: any) {
        console.error(`❌ ${p.handle}: ${err.message}`);
      }
    }
    if (PRODUCTS_ONLY) {
      console.log("\n=== Done (products only) ===");
      return;
    }
    const toInject = data.variants.filter((v) => !skipVariants.has(v.variantId));
    const numBatches = Math.ceil(toInject.length / BATCH_SIZE);
    console.log(`\nInjecting ${toInject.length} variants (${numBatches} batches)\n`);
    let doneCount = 0;
    for (let b = 0; b < numBatches; b++) {
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, toInject.length);
      const batch = toInject.slice(start, end);
      for (const v of batch) {
        doneCount++;
        const success = await updateVariantMetadata(
          v.productId,
          v.variantId,
          { sku: v.sku, metadata: v.metadata },
          token
        );
        if (success) totalOk++;
        else totalFail++;
        if (doneCount % 5 === 0 || doneCount === toInject.length) {
          const pct = Math.round((100 * doneCount) / toInject.length);
          console.log(`  [${doneCount}/${toInject.length}] ${totalOk} ok, ${totalFail} fail (${pct}%)`);
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      const pct = Math.round((100 * end) / toInject.length);
      console.log(`  Batch ${b + 1}/${numBatches} done | ${end}/${toInject.length} (${totalOk} ok, ${totalFail} fail) ${pct}%\n`);
    }
    console.log("\n=== Done ===");
    console.log(`Variants: ${totalOk} ok, ${totalFail} failed`);
    return;
  }

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
    const categoryLabel = CATEGORY_LABELS[category] ?? category;

    // Product-level metadata
    const productMeta = {
      meta_title: generateProductMetaTitle(categoryLabel),
      meta_description: generateProductMetaDescription(categoryLabel),
      meta_keywords: generateProductMetaKeywords(category, categoryLabel),
    };
    try {
      await api(`/admin/products/${product.id}`, "POST", token, { metadata: productMeta });
      console.log(`✅ ${handle}: product metadata`);
    } catch (err: any) {
      console.error(`❌ ${handle}: ${err.message}`);
      continue;
    }

    if (PRODUCTS_ONLY) continue;

    let variants: { id: string; title: string; metadata?: Record<string, unknown> }[] = [];
    let offset = 0;
    while (true) {
      const vRes = await api(
        `/admin/products/${product.id}/variants?limit=100&offset=${offset}&fields=id,title,metadata`,
        "GET",
        token
      );
      variants = variants.concat(vRes.variants ?? []);
      if ((vRes.variants ?? []).length < 100) break;
      offset += 100;
    }

    const moodIdToLabel: Record<string, string> = {};
    for (const [label, id] of Object.entries(MOOD_LABEL_TO_ID)) {
      moodIdToLabel[id] = label;
    }

    const updatesFixed = variants
      .map((v) => {
        if (RESUME) {
          const existing = (v as { metadata?: Record<string, unknown> }).metadata;
          if (existing?.seo_title) return null;
        }
        const parsed = parseVariantTitle(v.title);
        if (!parsed) return null;
        const styleLabel = STYLE_LABEL_HUMAN[parsed.style] ?? parsed.style;
        const styleDisplay = STYLE_LABEL_DISPLAY[parsed.style] ?? styleLabel;
        const moodDisplay = moodIdToLabel[parsed.mood] ?? parsed.mood;
        const sku = generateSku(category, parsed.style, parsed.type, parsed.size, parsed.mood);
        const seoTitle = generateVariantSeoTitle(categoryLabel, styleDisplay, parsed.type, parsed.size, moodDisplay);
        const seoDescription = generateVariantSeoDescription(categoryLabel, styleLabel, parsed.type, parsed.size, moodDisplay);
        const seoKeywords = generateVariantSeoKeywords(category, categoryLabel, parsed.style, styleLabel, parsed.type, parsed.size, moodDisplay);
        const existingMeta = (v as { metadata?: Record<string, unknown> }).metadata ?? {};
        const newMeta = {
          ...existingMeta,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords,
          google_product_category: "500044",
          product_type: `Custom Portraits > ${categoryLabel} > ${styleDisplay} > ${parsed.type}`,
        };
        return { id: v.id, sku, metadata: newMeta };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (updatesFixed.length === 0) {
      console.log(`  [${handle}] 0 to update (${RESUME ? "all have seo_title" : "none parsed"})\n`);
      continue;
    }
    const numBatches = Math.ceil(updatesFixed.length / BATCH_SIZE);
    console.log(`  [${handle}] ${updatesFixed.length} variants in ${numBatches} batches (batch=${BATCH_SIZE})\n`);

    let ok = 0;
    let fail = 0;
    for (let b = 0; b < numBatches; b++) {
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, updatesFixed.length);
      const batch = updatesFixed.slice(start, end);
      for (const u of batch) {
        const success = await updateVariantMetadata(product.id, u.id, { sku: u.sku, metadata: u.metadata }, token);
        if (success) ok++;
        else fail++;
        await new Promise((r) => setTimeout(r, 150));
      }
      const done = end;
      const pct = Math.round((100 * done) / updatesFixed.length);
      console.log(`  [${handle}] Batch ${b + 1}/${numBatches} done | ${done}/${updatesFixed.length} variants (${ok} ok, ${fail} fail) ${pct}%\n`);
    }
    totalVariantsOk += ok;
    totalVariantsFail += fail;
    console.log(`  [${handle}] ✓ Finished: ${ok} ok, ${fail} failed\n`);
  }

  console.log(`\n=== Done ===`);
  console.log(`Variants: ${totalVariantsOk} ok, ${totalVariantsFail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
