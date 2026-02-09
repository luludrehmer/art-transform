/**
 * Verifies that Medusa Store API persists and returns line-item metadata.
 * Run: npm run medusa-verify-metadata
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, MEDUSA_REGION_ID in .env
 *
 * If this passes, product details on checkout will work via metadata.
 * If it fails, use the URL-based fallback in the checkout flow.
 */

import "dotenv/config";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY || "";
const REGION_ID = process.env.MEDUSA_REGION_ID || "reg_01KF60P6AREHJSW90593P3VCRZ";

const storeHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  ...(PUBLISHABLE_KEY && { "x-publishable-api-key": PUBLISHABLE_KEY }),
};

async function main() {
  if (!BACKEND) {
    console.error("Set MEDUSA_BACKEND_URL in .env");
    process.exit(1);
  }

  console.log("Verifying Medusa line-item metadata pipeline...\n");

  let regionId = REGION_ID;
  if (!regionId) {
    console.log("Fetching region...");
    const regionsRes = await fetch(`${BACKEND}/store/regions`, { headers: storeHeaders });
    if (!regionsRes.ok) {
      console.error("Failed to fetch regions:", await regionsRes.text());
      process.exit(1);
    }
    const regionsData = await regionsRes.json();
    regionId = regionsData.regions?.[0]?.id;
    if (!regionId) {
      console.error("No region found");
      process.exit(1);
    }
  }

  // 1. Get product and variant
  const productHandle = "art-transform-pets";
  const productsRes = await fetch(
    `${BACKEND}/store/products?handle[]=${encodeURIComponent(productHandle)}&region_id=${regionId}`,
    { headers: storeHeaders }
  );
  if (!productsRes.ok) {
    console.error("Failed to fetch product:", await productsRes.text());
    process.exit(1);
  }
  const productsData = await productsRes.json();
  const product = productsData.products?.[0];
  if (!product) {
    console.error(`Product ${productHandle} not found`);
    process.exit(1);
  }

  const variant = product.variants?.find(
    (v: { options?: { value?: string }[] }) =>
      v.options?.some((o) => o.value === "oil-painting") &&
      v.options?.some((o) => o.value === "digital") &&
      v.options?.some((o) => o.value === "default")
  );
  if (!variant) {
    console.error("Variant not found");
    process.exit(1);
  }

  // 2. Create cart
  const cartRes = await fetch(`${BACKEND}/store/carts`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify({ region_id: regionId, metadata: { source: "art-transform" } }),
  });
  if (!cartRes.ok) {
    console.error("Failed to create cart:", await cartRes.text());
    process.exit(1);
  }
  const cartData = await cartRes.json();
  const cartId = cartData.cart?.id;
  if (!cartId) {
    console.error("No cart ID in response");
    process.exit(1);
  }

  // 3. Add line item with metadata
  const metadata = {
    source: "art-transform",
    productTitle: "Oil Painting - Instant Masterpiece",
    productStyle: "Oil Painting",
    productType: "Instant Masterpiece",
    productSize: "N/A",
  };

  const addRes = await fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify({ variant_id: variant.id, quantity: 1, metadata }),
  });

  if (!addRes.ok) {
    console.error("Failed to add line item:", await addRes.text());
    process.exit(1);
  }

  const addBody = await addRes.json();
  const cartAfterAdd = addBody.cart;

  // 4. Assert metadata in add response
  const itemAfterAdd = cartAfterAdd?.items?.[0];
  if (!itemAfterAdd) {
    console.error("FAIL: No items in cart after add");
    process.exit(1);
  }

  const meta = itemAfterAdd.metadata || {};
  const hasProductTitle = meta.productTitle === metadata.productTitle || meta.product_title === metadata.productTitle;
  const hasProductStyle = meta.productStyle === metadata.productStyle || meta.product_style === metadata.productStyle;
  const hasSource = meta.source === metadata.source;

  if (!hasProductTitle || !hasProductStyle || !hasSource) {
    console.error("FAIL: Metadata not in add response");
    console.error("  Expected:", metadata);
    console.error("  Got:", meta);
    process.exit(1);
  }
  console.log("  Add response: metadata present ✓");

  // 5. Retrieve cart and assert metadata
  const getRes = await fetch(`${BACKEND}/store/carts/${cartId}`, { headers: storeHeaders });
  if (!getRes.ok) {
    console.error("Failed to retrieve cart:", await getRes.text());
    process.exit(1);
  }
  const getBody = await getRes.json();
  const cartRetrieved = getBody.cart;

  const itemRetrieved = cartRetrieved?.items?.[0];
  if (!itemRetrieved) {
    console.error("FAIL: No items in cart after retrieve");
    process.exit(1);
  }

  const metaRetrieved = itemRetrieved.metadata || {};
  const hasProductTitleRetrieved =
    metaRetrieved.productTitle === metadata.productTitle || metaRetrieved.product_title === metadata.productTitle;
  const hasProductStyleRetrieved =
    metaRetrieved.productStyle === metadata.productStyle || metaRetrieved.product_style === metadata.productStyle;

  if (!hasProductTitleRetrieved || !hasProductStyleRetrieved) {
    console.error("FAIL: Metadata not in retrieve response");
    console.error("  Expected:", metadata);
    console.error("  Got:", metaRetrieved);
    process.exit(1);
  }
  console.log("  Retrieve response: metadata present ✓");

  console.log("\nSUCCESS: Medusa line-item metadata pipeline verified.");
  console.log("Product details on checkout will work via metadata.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
