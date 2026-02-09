/**
 * Diagnoses art-transform product variants for inventory/stock location issues.
 * Identifies variants that may cause "Sales channel is not associated with any stock location for variant".
 * Run: npm run medusa-diagnose
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env
 */

import "dotenv/config";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";

const COLLECTION_HANDLE = "art-transform";

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

interface VariantReport {
  variant_id: string;
  product_id: string;
  product_handle: string;
  title: string;
  manage_inventory: boolean;
  has_inventory_item: boolean;
  inventory_item_ids: string[];
  status: "ok" | "problematic";
  reason?: string;
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

  // 1. Get collection
  let collectionId: string | null = null;
  try {
    const collections = await api("/admin/collections?handle[]=" + COLLECTION_HANDLE, "GET", token);
    if (collections.collections?.length > 0) {
      collectionId = collections.collections[0].id;
    }
  } catch (e) {
    console.error("Failed to get collection:", e);
    process.exit(1);
  }

  if (!collectionId) {
    console.log("Collection 'art-transform' not found. Nothing to diagnose.");
    process.exit(0);
  }

  // 2. List products by collection
  let products: { id: string; handle: string }[] = [];
  try {
    const productsRes = await api(
      `/admin/products?collection_id[]=${collectionId}&limit=100`,
      "GET",
      token
    );
    products = productsRes.products || [];
  } catch (e) {
    console.error("Failed to list products:", e);
    process.exit(1);
  }

  if (products.length === 0) {
    console.log("No products in collection 'art-transform'. Nothing to diagnose.");
    process.exit(0);
  }

  console.log(`Found ${products.length} product(s) in collection. Scanning variants...\n`);

  const reports: VariantReport[] = [];

  for (const product of products) {
    try {
      const variantsRes = await api(
        `/admin/products/${product.id}/variants?fields=*inventory_items,manage_inventory`,
        "GET",
        token
      );
      const variants = variantsRes.variants || [];

      for (const v of variants) {
        const invItems = v.inventory_items || [];
        const hasInvItem = invItems.length > 0;
        const manageInv = v.manage_inventory === true;

        let status: VariantReport["status"] = "ok";
        let reason: string | undefined;

        if (manageInv || hasInvItem) {
          status = "problematic";
          const reasons: string[] = [];
          if (manageInv) reasons.push("manage_inventory=true");
          if (hasInvItem) reasons.push(`has ${invItems.length} inventory item(s)`);
          reason = reasons.join("; ");
        }

        reports.push({
          variant_id: v.id,
          product_id: product.id,
          product_handle: product.handle,
          title: v.title || "(no title)",
          manage_inventory: manageInv,
          has_inventory_item: hasInvItem,
          inventory_item_ids: invItems.map((i: { id: string }) => i.id),
          status,
          reason,
        });
      }
    } catch (e) {
      console.error(`Failed to get variants for ${product.handle}:`, e);
    }
  }

  // Report
  const problematic = reports.filter((r) => r.status === "problematic");
  const ok = reports.filter((r) => r.status === "ok");

  console.log("--- Summary ---");
  console.log(`Total variants: ${reports.length}`);
  console.log(`OK: ${ok.length}`);
  console.log(`Problematic: ${problematic.length}`);

  if (problematic.length > 0) {
    console.log("\n--- Problematic Variants ---");
    console.log(
      "Run 'npm run medusa-fix-variant-inventory' to fix these.\n"
    );
    for (const r of problematic) {
      console.log(`  ${r.variant_id} | ${r.product_handle} | ${r.title}`);
      console.log(`    ${r.reason}`);
    }
    console.log("\n--- JSON (for scripting) ---");
    console.log(JSON.stringify({ problematic, ok }, null, 2));
  } else {
    console.log("\nAll variants look OK. No fix needed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
