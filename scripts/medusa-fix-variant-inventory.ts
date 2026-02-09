/**
 * Fixes art-transform variants: sets manage_inventory=false and removes inventory item associations.
 * Resolves "Sales channel is not associated with any stock location for variant".
 * Run: npm run medusa-fix-variant-inventory
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
    console.log("Collection 'art-transform' not found. Nothing to fix.");
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
    console.log("No products in collection 'art-transform'. Nothing to fix.");
    process.exit(0);
  }

  console.log(`Found ${products.length} product(s). Fixing variants...\n`);

  let fixedCount = 0;

  for (const product of products) {
    try {
      const variantsRes = await api(
        `/admin/products/${product.id}/variants?fields=*inventory_items,inventory_items.inventory_item_id,manage_inventory`,
        "GET",
        token
      );
      const variants = variantsRes.variants || [];

      for (const v of variants) {
        const invItems = v.inventory_items || [];
        const manageInv = v.manage_inventory === true;
        const needsFix = manageInv || invItems.length > 0;

        if (!needsFix) continue;

        // 1. Remove inventory item associations (before updating manage_inventory)
        // DELETE expects inventory_item_id (InventoryItem), not the link id (pvitem_)
        for (const inv of invItems) {
          const invItemId = inv.inventory_item_id ?? inv.id;
          if (!invItemId) continue;
          try {
            await api(
              `/admin/products/${product.id}/variants/${v.id}/inventory-items/${invItemId}`,
              "DELETE",
              token
            );
            console.log(`  Removed inventory link: ${v.id} -> ${invItemId}`);
            fixedCount++;
          } catch (e) {
            console.warn(`  Failed to remove inventory link ${v.id} -> ${invItemId}:`, e);
          }
        }

        // 2. Set manage_inventory: false
        if (manageInv) {
          try {
            await api(`/admin/products/${product.id}/variants/${v.id}`, "POST", token, {
              manage_inventory: false,
              allow_backorder: false,
            });
            console.log(`  Updated ${v.id}: manage_inventory=false`);
            fixedCount++;
          } catch (e) {
            console.warn(`  Failed to update variant ${v.id}:`, e);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to process ${product.handle}:`, e);
    }
  }

  console.log(`\nDone. Applied ${fixedCount} fix(es).`);
  console.log("Run 'npm run medusa-diagnose' to verify.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
