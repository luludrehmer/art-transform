# Medusa Integration

## Setup

1. Add the Medusa env vars to `.env` (see `.env.example`).

2. **Seed products** into your Medusa backend:
   ```bash
   npm run medusa-seed
   ```
   This creates the collection `art-transform` and 5 products (one per category: pets, family, kids, couples, self-portrait), each with variants for style × type × size. Variants are created with `manage_inventory: false` so they do not require stock levels.

3. **Checkout URL**: Set `MEDUSA_STOREFRONT_URL` in `.env` to your storefront base URL (e.g. `https://portraits.art-and-see.com`). The checkout redirect will go to `{MEDUSA_STOREFRONT_URL}/checkout?cart_id=xxx`. The storefront must accept `cart_id` in the URL and fetch the cart from Medusa. If not set, it falls back to `MEDUSA_BACKEND_URL`.

4. **Stock Location and Sales Channel** (required for add-to-cart to work): Run the setup script to associate a Stock Location with the Sales Channel used by your Publishable API Key. Otherwise you will get "Sales channel is not associated with any stock location for variant".
   ```bash
   npm run medusa-setup-stock-location
   ```
   Optionally set `MEDUSA_SALES_CHANNEL_ID` in `.env` if you want a specific channel (e.g. from the error message); otherwise it uses the first sales channel.
   - If you use inventory management for some variants, set inventory levels in Medusa Admin → **Inventory → Manage Inventory**. Variants created by the seed use `manage_inventory: false` and do not require stock levels.

5. **Execution order** (if checkout still fails): Run in this order:
   ```bash
   npm run medusa-seed
   npm run medusa-setup-stock-location
   npm run medusa-diagnose          # optional: identify problematic variants
   npm run medusa-fix-variant-inventory   # if diagnose found issues
   ```
   The fix script sets `manage_inventory: false` and removes inventory item associations from existing variants.

## Flow

When `USE_MEDUSA_PRODUCTS=true` and `VITE_USE_MEDUSA_PRODUCTS=true`:
- "Download Now" / "Order Print" / "Order Handmade" calls `/api/medusa/checkout`
- Server creates a Medusa cart (with `region_id` from Medusa regions), adds the selected product/variant, returns checkout URL
- User is redirected to `{MEDUSA_STOREFRONT_URL}/checkout?cart_id=xxx` (e.g. portraits.art-and-see.com)

## Medusa API

The seed script uses the Admin API. If your Medusa version uses different paths or payloads, adjust `scripts/medusa-seed-products.ts` accordingly.

## Dev / Tooling

- **Browserslist**: If you see "caniuse-lite is outdated", run `npm run update-browserslist`.
- **PostCSS warning**: The "did not pass the from option" warning is usually harmless; it often comes from Tailwind plugins. If it causes build issues, try updating `tailwindcss-animate` and `@tailwindcss/typography`.
