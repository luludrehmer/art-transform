/**
 * Seeds Art & See products into Medusa backend — v2 with Mood option.
 * 5 products (one per category), each with ~216 variants (style × type × size × mood).
 *
 * Run:  npm run medusa-seed-v2
 *       npm run medusa-seed-v2 -- --delete-existing   (deletes old products first)
 *       npm run medusa-seed-v2 -- --dry-run            (preview without API calls)
 *
 * Features:
 *   - Resumes where it left off (skips products/variants that already exist)
 *   - Retries failed API calls (3 attempts with backoff)
 *   - Small delay between calls to avoid overwhelming Railway
 *
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env
 */

import "dotenv/config";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";

const DELETE_EXISTING = process.argv.includes("--delete-existing");
const DRY_RUN = process.argv.includes("--dry-run");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const BETWEEN_VARIANTS_DELAY_MS = 300; // small delay to not overwhelm Railway

// ---------- Auth ----------

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

// ---------- Constants ----------

const COLLECTION_HANDLE = "art-transform";

const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;
const MOODS = ["classic", "royal_noble", "neoclassical", "heritage"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  pets: "Pet",
  family: "Family",
  kids: "Kids",
  couples: "Couples",
  "self-portrait": "Self Portrait",
};

const STYLE_LABELS: Record<string, string> = {
  "oil-painting": "Oil Painting",
  acrylic: "Acrylic",
  "pencil-sketch": "Pencil Sketch",
  watercolor: "Watercolor",
  charcoal: "Charcoal",
  pastel: "Pastel",
};

const MOOD_LABELS: Record<string, string> = {
  classic: "Classic",
  royal_noble: "Royal",
  neoclassical: "Neoclassical",
  heritage: "Heritage",
};

type ProductType = "digital" | "print" | "handmade";

// Medusa expects amounts in dollars (major units), not cents
const PRICES: Record<ProductType, Record<string, number>> = {
  digital: { default: 29 },
  print: { "8x10": 89, "11x14": 119, "16x20": 199, "20x24": 299 },
  handmade: { "12x16": 269.95, "18x24": 349.95, "24x36": 479.95, "40x60": 769.95 },
};

const HANDMADE_MULTIPLIER: Record<string, number> = {
  family: 1.3,
  couples: 1.2,
  pets: 1,
  kids: 1,
  "self-portrait": 1,
};

// ---------- Helpers ----------

function getProductHandle(category: string): string {
  return `art-transform-${category}`;
}

function getHandmadePrice(category: string, size: string): number {
  const base = PRICES.handmade[size as keyof typeof PRICES.handmade];
  const mult = HANDMADE_MULTIPLIER[category] ?? 1;
  return Math.round(base * mult * 100) / 100;
}

interface VariantSpec {
  style: string;
  type: ProductType;
  size: string;
  mood: string;
  title: string;
  amount: number;
}

function buildVariantsForCategory(category: string): VariantSpec[] {
  const variants: VariantSpec[] = [];

  for (const mood of MOODS) {
    const moodLabel = MOOD_LABELS[mood];
    for (const style of STYLES) {
      const styleLabel = STYLE_LABELS[style];

      variants.push({
        style, type: "digital", size: "default", mood,
        title: `${styleLabel} - Digital Download - ${moodLabel}`,
        amount: PRICES.digital.default,
      });

      for (const size of ["8x10", "11x14", "16x20", "20x24"] as const) {
        variants.push({
          style, type: "print", size, mood,
          title: `${styleLabel} Print ${size} - ${moodLabel}`,
          amount: PRICES.print[size],
        });
      }

      for (const size of ["12x16", "18x24", "24x36", "40x60"] as const) {
        variants.push({
          style, type: "handmade", size, mood,
          title: `${styleLabel} Handmade ${size} - ${moodLabel}`,
          amount: getHandmadePrice(category, size),
        });
      }
    }
  }
  return variants;
}

// ---------- API with retry ----------

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path: string, method: string, token: string, body?: object): Promise<any> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${BACKEND}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text.slice(0, 200)}`);
      }
      return res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`    ⏳ Retry ${attempt}/${MAX_RETRIES} in ${delay}ms: ${msg.slice(0, 80)}`);
        await sleep(delay);
      } else {
        throw new Error(`${method} ${path} failed after ${MAX_RETRIES} attempts: ${msg}`);
      }
    }
  }
}

// ---------- Delete existing products ----------

async function deleteExistingProducts(token: string): Promise<void> {
  console.log("\n--- Deleting existing art-transform products ---");

  for (const category of CATEGORIES) {
    const handle = getProductHandle(category);
    try {
      const existing = await api(`/admin/products?handle[]=${encodeURIComponent(handle)}`, "GET", token);
      if (existing.products?.length > 0) {
        const productId = existing.products[0].id;
        const variantCount = existing.products[0].variants?.length ?? "?";
        console.log(`  Deleting ${handle} (${productId}, ${variantCount} variants)...`);
        if (!DRY_RUN) {
          await api(`/admin/products/${productId}`, "DELETE", token);
        }
        console.log(`  ✅ Deleted ${handle}`);
      } else {
        console.log(`  ${handle}: not found, skip`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Error deleting ${handle}: ${msg}`);
    }
  }
}

// ---------- Main ----------

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("=== Medusa Product Seed v2 (with Mood) ===");
  console.log(`Backend: ${BACKEND}`);
  console.log(`Flags: ${DELETE_EXISTING ? "--delete-existing" : ""} ${DRY_RUN ? "--dry-run" : ""}`);

  const sampleVariants = buildVariantsForCategory("pets");
  console.log(`Variants per product: ${sampleVariants.length}`);
  console.log(`Total: ${CATEGORIES.length} × ${sampleVariants.length} = ${CATEGORIES.length * sampleVariants.length}`);

  if (DRY_RUN) {
    console.log("\n--- DRY RUN: first 10 variants ---");
    for (const v of sampleVariants.slice(0, 10)) {
      console.log(`  ${v.title} | $${v.amount} | Style=${v.style} Type=${v.type} Size=${v.size} Mood=${v.mood}`);
    }
    console.log(`  ... +${sampleVariants.length - 10} more`);
    return;
  }

  console.log("\nLogging in...");
  const token = await getAdminToken();
  if (!token) { console.error("No token"); process.exit(1); }
  console.log("Authenticated.");

  if (DELETE_EXISTING) {
    await deleteExistingProducts(token);
  }

  // Collection
  let collectionId: string | null = null;
  try {
    const collections = await api("/admin/collections?handle[]=" + COLLECTION_HANDLE, "GET", token);
    if (collections.collections?.length > 0) {
      collectionId = collections.collections[0].id;
    }
  } catch { /* ignore */ }

  if (!collectionId) {
    const created = await api("/admin/collections", "POST", token, {
      title: "Art Transform", handle: COLLECTION_HANDLE,
    });
    collectionId = created.collection?.id;
    console.log(`Created collection: ${collectionId}`);
  }

  const styleValues = [...STYLES] as string[];
  const typeValues = ["digital", "print", "handmade"];
  const sizeValues = ["default", "8x10", "11x14", "16x20", "20x24", "12x16", "18x24", "24x36", "40x60"];
  const moodValues = [...MOODS] as string[];

  console.log("\n--- Creating products ---");

  let totalOk = 0;
  let totalFail = 0;

  for (const category of CATEGORIES) {
    const handle = getProductHandle(category);
    let productId: string | null = null;
    let existingVariantTitles = new Set<string>();

    // Check if product exists (resume support)
    try {
      const existing = await api(`/admin/products?handle[]=${encodeURIComponent(handle)}&fields=*variants`, "GET", token);
      if (existing.products?.length > 0) {
        const product = existing.products[0];
        productId = product.id;
        const existingCount = product.variants?.length ?? 0;

        // Build set of existing variant titles for dedup
        for (const v of product.variants ?? []) {
          if (v.title) existingVariantTitles.add(v.title);
        }

        console.log(`\n${handle}: exists (${existingCount} variants). Resuming...`);
      }
    } catch { /* ignore */ }

    // Create product if needed
    if (!productId) {
      const catLabel = CATEGORY_LABELS[category] ?? category;
      try {
        const createdRes = await api("/admin/products", "POST", token, {
          title: `${catLabel} Portrait Art`,
          handle,
          description: `Transform your ${catLabel.toLowerCase()} photos into stunning artwork. Choose your style, mood, and delivery type.`,
          status: "published",
          collection_id: collectionId,
          options: [
            { title: "Style", values: styleValues },
            { title: "Type", values: typeValues },
            { title: "Size", values: sizeValues },
            { title: "Mood", values: moodValues },
          ],
        });
        productId = createdRes.product?.id;
        console.log(`\n${handle}: created (${productId})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`\n❌ Failed to create ${handle}: ${msg.slice(0, 200)}`);
        continue;
      }
    }

    if (!productId) continue;

    // Create variants (skip existing)
    const allVariants = buildVariantsForCategory(category);
    const toCreate = allVariants.filter((v) => !existingVariantTitles.has(v.title));

    if (toCreate.length === 0) {
      console.log(`  All ${allVariants.length} variants exist. Skipping.`);
      totalOk += allVariants.length;
      continue;
    }

    console.log(`  Creating ${toCreate.length} variants (${existingVariantTitles.size} already exist)...`);

    let ok = existingVariantTitles.size;
    let fail = 0;

    for (let i = 0; i < toCreate.length; i++) {
      const v = toCreate[i];
      try {
        await api(`/admin/products/${productId}/variants`, "POST", token, {
          title: v.title,
          prices: [{ amount: v.amount, currency_code: "usd" }],
          options: { Style: v.style, Type: v.type, Size: v.size, Mood: v.mood },
          manage_inventory: false,
          allow_backorder: false,
        });
        ok++;

        if ((i + 1) % 25 === 0 || i === toCreate.length - 1) {
          console.log(`  [${ok}/${allVariants.length}] created`);
        }
      } catch (err) {
        fail++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ "${v.title}": ${msg.slice(0, 100)}`);
      }

      // Small delay between calls
      if (i < toCreate.length - 1) {
        await sleep(BETWEEN_VARIANTS_DELAY_MS);
      }
    }

    console.log(`  ✅ ${handle}: ${ok}/${allVariants.length} (${fail} failed)`);
    totalOk += ok;
    totalFail += fail;
  }

  console.log(`\n=== Done. ${totalOk} variants OK, ${totalFail} failed ===`);
  if (totalFail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
