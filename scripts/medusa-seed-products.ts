/**
 * Seeds Art & See products into Medusa backend.
 * 5 products (one per category), each with ~54 variants (style × type × size).
 * Run: npm run medusa-seed
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env
 */

import "dotenv/config";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";

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

const COLLECTION_HANDLE = "art-transform";

const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;

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

type ProductType = "digital" | "print" | "handmade";

// Medusa expects amounts in dollars (major units), not cents. See EVIDENCE_100X_PRICING.md
const PRICES: Record<ProductType, Record<string, number>> = {
  digital: { default: 29 },
  print: { "8x10": 89, "11x14": 119, "16x20": 199, "20x24": 299 },
  handmade: { "12x16": 269.95, "18x24": 349.95, "24x36": 479.95, "40x60": 769.95 },
};

// Handmade: +20% for couples, +30% for family
const HANDMADE_MULTIPLIER: Record<string, number> = {
  family: 1.3,
  couples: 1.2,
  pets: 1,
  kids: 1,
  "self-portrait": 1,
};

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
  title: string;
  amount: number;
}

function buildVariantsForCategory(category: string): VariantSpec[] {
  const variants: VariantSpec[] = [];
  const styleLabels = STYLE_LABELS;

  for (const style of STYLES) {
    variants.push({
      style,
      type: "digital",
      size: "default",
      title: `${styleLabels[style]} - Digital Download`,
      amount: PRICES.digital.default,
    });
    for (const size of ["8x10", "11x14", "16x20", "20x24"] as const) {
      variants.push({
        style,
        type: "print",
        size,
        title: `${styleLabels[style]} Print ${size}`,
        amount: PRICES.print[size],
      });
    }
    for (const size of ["12x16", "18x24", "24x36", "40x60"] as const) {
      variants.push({
        style,
        type: "handmade",
        size,
        title: `${styleLabels[style]} Handmade ${size}`,
        amount: getHandmadePrice(category, size),
      });
    }
  }
  return variants;
}

async function api(path: string, method: string, token: string, body?: object) {
  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Medusa API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("Logging in to Medusa...");
  const token = await getAdminToken();
  if (!token) {
    console.error("No token returned from Medusa auth");
    process.exit(1);
  }
  console.log("Seeding Art & See products (5 products, ~54 variants each)...");

  let collectionId: string | null = null;
  try {
    const collections = await api("/admin/collections?handle[]=" + COLLECTION_HANDLE, "GET", token);
    if (collections.collections?.length > 0) {
      collectionId = collections.collections[0].id;
      console.log("Collection 'art-transform' exists:", collectionId);
    }
  } catch {
    // ignore
  }

  if (!collectionId) {
    const created = await api("/admin/collections", "POST", token, {
      title: "Art Transform",
      handle: COLLECTION_HANDLE,
    });
    collectionId = created.collection?.id;
    console.log("Created collection:", collectionId);
  }

  const styleValues = [...STYLES];
  const typeValues = ["digital", "print", "handmade"];
  const sizeValues = ["default", "8x10", "11x14", "16x20", "20x24", "12x16", "18x24", "24x36", "40x60"];

  for (const category of CATEGORIES) {
    const handle = getProductHandle(category);
    try {
      const existing = await api(`/admin/products?handle[]=${encodeURIComponent(handle)}`, "GET", token);
      if (existing.products?.length > 0) {
        console.log("Product exists:", handle);
        continue;
      }
    } catch {
      // ignore
    }

    const catLabel = CATEGORY_LABELS[category] ?? category;
    const productPayload: Record<string, unknown> = {
      title: `${catLabel} Portrait Art`,
      handle,
      description: `Transform your ${catLabel.toLowerCase()} photos into stunning artwork. Choose your style and delivery type.`,
      status: "published",
      collection_id: collectionId,
      options: [
        { title: "Style", values: styleValues },
        { title: "Type", values: typeValues },
        { title: "Size", values: sizeValues },
      ],
    };

    const createdRes = await api("/admin/products", "POST", token, productPayload);
    const productId = createdRes.product?.id;
    if (!productId) {
      console.error("Failed to create product:", handle);
      continue;
    }

    const variants = buildVariantsForCategory(category);
    for (const v of variants) {
      await api("/admin/products/" + productId + "/variants", "POST", token, {
        title: v.title,
        prices: [{ amount: v.amount, currency_code: "usd" }],
        options: { Style: v.style, Type: v.type, Size: v.size },
        manage_inventory: false,
        allow_backorder: false,
      });
    }

    console.log("Created product:", handle, "with", variants.length, "variants");
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
