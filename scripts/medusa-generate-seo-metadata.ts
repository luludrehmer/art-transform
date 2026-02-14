#!/usr/bin/env tsx
/**
 * Fase 1: Gera metadata SEO em JSON (sem injetar no Medusa).
 * Rápido: só faz GET para buscar produtos/variantes, computa localmente, escreve arquivo.
 *
 * Run:  npm run medusa-generate-seo
 *       npm run medusa-generate-seo -- --output=seo-data.json
 *
 * Depois:  npm run medusa-inject-seo -- --from-file
 * Requer:  MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD
 */

import "dotenv/config";
import fs from "fs";
import path from "path";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";
const OUTPUT = process.argv.find((a) => a.startsWith("--output="))?.split("=")[1] || "art-transform-seo-metadata.json";
const REQ_TIMEOUT_MS = 90_000;

const COLLECTION_HANDLE = "art-transform";
const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
type ProductType = "digital" | "print" | "handmade";

const STYLE_LABEL_TO_ID: Record<string, string> = {
  "Oil Painting": "oil-painting", Acrylic: "acrylic", "Pencil Sketch": "pencil-sketch",
  Watercolor: "watercolor", Charcoal: "charcoal", Pastel: "pastel",
};
const STYLE_LABEL_HUMAN: Record<string, string> = {
  "oil-painting": "oil painting", acrylic: "acrylic", "pencil-sketch": "pencil sketch",
  watercolor: "watercolor", charcoal: "charcoal", pastel: "pastel",
};
const STYLE_LABEL_DISPLAY: Record<string, string> = {
  "oil-painting": "Oil Painting", acrylic: "Acrylic", "pencil-sketch": "Pencil Sketch",
  watercolor: "Watercolor", charcoal: "Charcoal", pastel: "Pastel",
};
const MOOD_LABEL_TO_ID: Record<string, string> = {
  Classic: "classic", Royal: "royal_noble", Neoclassical: "neoclassical", Heritage: "heritage",
};
const CATEGORY_LABELS: Record<string, string> = {
  pets: "Pet", family: "Family", kids: "Kids", couples: "Couples", "self-portrait": "Self Portrait",
};

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
    style = STYLE_LABEL_TO_ID[beforeMood.replace(" - Digital Download", "").trim()] ?? null;
    type = "digital";
    size = "default";
  } else if (beforeMood.includes(" Print ")) {
    const m = beforeMood.match(/^(.+?) Print (\d+x\d+)$/);
    if (m) { style = STYLE_LABEL_TO_ID[m[1].trim()] ?? null; type = "print"; size = m[2]; }
  } else if (beforeMood.includes(" Handmade ")) {
    const m = beforeMood.match(/^(.+?) Handmade (\d+x\d+)$/);
    if (m) { style = STYLE_LABEL_TO_ID[m[1].trim()] ?? null; type = "handmade"; size = m[2]; }
  }
  return style && mood ? { style, type, size, mood } : null;
}

function generateSku(category: string, style: string, type: ProductType, size: string, mood: string): string {
  return `art-${category}-${style}-${type}-${size}-${mood}`;
}
function generateVariantSeoTitle(cat: string, style: string, type: ProductType, size: string, mood: string): string {
  const t = type === "digital" ? "Digital Download" : type === "print" ? `Print ${size}` : `Handmade ${size}`;
  return `Custom ${cat} Portrait ${style} from Your Photo - ${t} ${mood} | Art & See`;
}
function generateVariantSeoDescription(cat: string, style: string, type: ProductType, size: string, mood: string): string {
  const t = type === "digital" ? "digital download" : type === "print" ? `print ${size}` : `handmade canvas ${size}`;
  return `Order a custom ${cat.toLowerCase()} portrait ${style.toLowerCase()} from your photo. Medium: ${style.toLowerCase()}. ${t} in ${mood.toLowerCase()} style. Transform your photo into stunning wall art. Free shipping on orders over $99.`;
}
function generateVariantSeoKeywords(cat: string, style: string, type: ProductType, size: string): string {
  const kw = [`custom ${cat.toLowerCase()} portrait from your photo`, `${cat.toLowerCase()} portrait ${style.toLowerCase()} from photo`, `${style.toLowerCase()} portrait from photo`, `custom portrait from your photo`];
  if (type === "digital") kw.push(`buy ${cat.toLowerCase()} portrait digital download`, `medium ${style.toLowerCase()} portrait`);
  else kw.push(`buy ${cat.toLowerCase()} portrait painting ${size}`, `${cat.toLowerCase()} portrait ${style.toLowerCase()} wall art ${size} from your photo`, `medium ${style.toLowerCase()} portrait`);
  return kw.join(", ");
}
function generateProductMeta(category: string): { meta_title: string; meta_description: string; meta_keywords: string } {
  const cl = CATEGORY_LABELS[category] ?? category;
  const clLower = cl.toLowerCase();
  return {
    meta_title: `Custom ${cl} Portrait from Your Photo | Oil Painting, Acrylic, Watercolor & More | Art & See`,
    meta_description: `Transform your ${clLower} photos into custom portrait artwork. Choose your medium: oil painting, acrylic, watercolor, pencil sketch, charcoal, pastel. Custom portrait from your photo.`,
    meta_keywords: `custom ${clLower} portrait from your photo, ${clLower} portrait, portrait from photo, oil painting, acrylic, watercolor, pencil sketch, charcoal, pastel`,
  };
}

async function getToken(): Promise<string> {
  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  return (await res.json()).token;
}

async function api(path: string, token: string): Promise<any> {
  const url = `${BACKEND}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

interface ProductMeta {
  id: string;
  handle: string;
  metadata: { meta_title: string; meta_description: string; meta_keywords: string };
}
interface VariantMeta {
  productId: string;
  variantId: string;
  sku: string;
  metadata: Record<string, unknown>;
}

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("=== Medusa Generate SEO Metadata ===\n");
  console.log("Authenticating...");
  const token = await getToken();
  console.log("OK\n");

  console.log("Fetching products...");
  const collRes = await api(`/admin/collections?handle[]=${COLLECTION_HANDLE}`, token);
  const collectionId = collRes.collections?.[0]?.id;
  if (!collectionId) { console.error("Collection not found"); process.exit(1); }
  const listRes = await api(`/admin/products?collection_id[]=${collectionId}&limit=100`, token);
  const products = (listRes.products ?? []).filter((p: any) => p.handle?.startsWith("art-transform-"));
  console.log(`${products.length} products\n`);

  const moodIdToLabel: Record<string, string> = {};
  for (const [label, id] of Object.entries(MOOD_LABEL_TO_ID)) moodIdToLabel[id] = label;

  const productMetas: ProductMeta[] = [];
  const variantMetas: VariantMeta[] = [];

  for (const p of products) {
    const handle = p.handle;
    const category = handle.replace(/^art-transform-/, "");
    if (!CATEGORIES.includes(category as any)) continue;
    const categoryLabel = CATEGORY_LABELS[category] ?? category;

    const pm = generateProductMeta(category);
    productMetas.push({ id: p.id, handle, metadata: pm });

    console.log(`  Fetching variants for ${handle}...`);
    let variants: { id: string; title: string; metadata?: Record<string, unknown> }[] = [];
    let offset = 0;
    while (true) {
      const vRes = await api(
        `/admin/products/${p.id}/variants?limit=100&offset=${offset}&fields=id,title,metadata`,
        token
      );
      variants = variants.concat(vRes.variants ?? []);
      if ((vRes.variants ?? []).length < 100) break;
      offset += 100;
    }
    console.log(`    ${variants.length} variants`);

    for (const v of variants) {
      const parsed = parseVariantTitle(v.title);
      if (!parsed) continue;
      const styleLabel = STYLE_LABEL_HUMAN[parsed.style] ?? parsed.style;
      const styleDisplay = STYLE_LABEL_DISPLAY[parsed.style] ?? styleLabel;
      const moodDisplay = moodIdToLabel[parsed.mood] ?? parsed.mood;

      const sku = generateSku(category, parsed.style, parsed.type, parsed.size, parsed.mood);
      const seoTitle = generateVariantSeoTitle(categoryLabel, styleDisplay, parsed.type, parsed.size, moodDisplay);
      const seoDescription = generateVariantSeoDescription(categoryLabel, styleLabel, parsed.type, parsed.size, moodDisplay);
      const seoKeywords = generateVariantSeoKeywords(categoryLabel, styleLabel, parsed.type, parsed.size);

      const existingMeta = (v as { metadata?: Record<string, unknown> }).metadata ?? {};
      const newMeta: Record<string, unknown> = {
        ...existingMeta,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        google_product_category: "500044",
        product_type: `Custom Portraits > ${categoryLabel} > ${styleDisplay} > ${parsed.type}`,
      };
      variantMetas.push({ productId: p.id, variantId: v.id, sku, metadata: newMeta });
    }
  }

  const outPath = path.resolve(process.cwd(), OUTPUT);
  const data = {
    generatedAt: new Date().toISOString(),
    products: productMetas,
    variants: variantMetas,
  };
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\n=== Done ===`);
  console.log(`Written: ${outPath}`);
  console.log(`  Products: ${productMetas.length}`);
  console.log(`  Variants: ${variantMetas.length}`);
  console.log(`\nNext: npm run medusa-inject-seo -- --from-file`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
