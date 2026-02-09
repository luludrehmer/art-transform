# Photos-to-Paintings: API Contract for Art Transform Checkout

This document describes the API that art-transform calls and the response format expected. **Photos-to-Paintings must implement this endpoint.**

---

## Endpoint: `POST /api/product/cart`

### Request

**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "items": [
    {
      "productHandle": "art-transform-pets",
      "quantity": 1,
      "productConfig": {
        "source": "art-transform",
        "productTitle": "Oil Painting - Instant Masterpiece",
        "productStyle": "Oil Painting",
        "productType": "Instant Masterpiece",
        "productSize": "default",
        "productDescription": "High-resolution download without watermark. Instant delivery.",
        "previewImageUrl": "https://art-transform.example.com/api/transform/abc123/image",
        "variantStyle": "oil-painting",
        "variantType": "digital",
        "variantSize": "default"
      }
    }
  ]
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `productHandle` | string | Medusa product handle. Format: `art-transform-{category}`. Categories: `pets`, `family`, `kids`, `couples`, `self-portrait`. |
| `quantity` | number | Always 1. |
| `productConfig` | object | Metadata for display and variant matching. |
| `productConfig.source` | string | Always `"art-transform"`. |
| `productConfig.productTitle` | string | Display title for checkout (e.g. "Oil Painting - Instant Masterpiece"). |
| `productConfig.productStyle` | string | Display style (e.g. "Oil Painting", "Acrylic"). |
| `productConfig.productType` | string | Display type (e.g. "Instant Masterpiece", "Fine Art Print", "Handmade"). |
| `productConfig.productSize` | string | Size for display. Digital: `"default"`. Print: `"8x10"`, `"11x14"`, `"16x20"`, `"20x24"`. Handmade: `"12x16"`, `"18x24"`, `"24x36"`, `"40x60"`. |
| `productConfig.productDescription` | string | Optional description. |
| `productConfig.previewImageUrl` | string | Optional URL of the transformed image. |
| `productConfig.variantStyle` | string | **Raw variant option** for Medusa. Values: `oil-painting`, `acrylic`, `pencil-sketch`, `watercolor`, `charcoal`, `pastel`. |
| `productConfig.variantType` | string | **Raw variant option** for Medusa. Values: `digital`, `print`, `handmade`. |
| `productConfig.variantSize` | string | **Raw variant option** for Medusa. Digital: `default`. Print: `8x10`, `11x14`, `16x20`, `20x24`. Handmade: `12x16`, `18x24`, `24x36`, `40x60`. |

### Expected Response

**Success (200)**

```json
{
  "success": true,
  "cartId": "cart_01KGW9EV153W8XJ8BW5PKATC51"
}
```

**Error (4xx/5xx)**

```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

---

## Medusa Product Structure

- **Collection:** `art-transform` (handle). Title: "Art Transform".
- **Products:** `art-transform-pets`, `art-transform-family`, `art-transform-kids`, `art-transform-couples`, `art-transform-self-portrait`.
- **Product options:** `Style` (values: oil-painting, acrylic, pencil-sketch, watercolor, charcoal, pastel), `Type` (digital, print, handmade), `Size` (default, 8x10, 11x14, 16x20, 20x24, 12x16, 18x24, 24x36, 40x60).

## Implementation Steps for Photos-to-Paintings

1. **Create `POST /api/product/cart`** that:
   - Accepts `{ items: [{ productHandle, quantity, productConfig }] }`.
   - Creates a cart (or uses existing cart if applicable).
   - For each item:
     - Looks up product by `productHandle` in Medusa.
     - Finds the variant matching `productConfig.variantStyle`, `productConfig.variantType`, `productConfig.variantSize`.
     - Adds the line item to the cart with metadata from `productConfig` (productTitle, productStyle, productType, productSize, previewImageUrl, etc.) stored in `metadata` for order display.
   - Returns `{ success: true, cartId }`.

2. **Checkout page** must:
   - Accept `cart_id` query param.
   - Fetch cart via `GET /api/wizard/cart/:cartId` (or equivalent).
   - **Ensure line items are returned** – if cart comes back empty, the add-line-item step failed (wrong variant matching or product not found).

3. **Collection logic** for Pay in full vs Deposit:
   - If all items belong to collection `art-transform` → charge full amount.
   - Otherwise → 20% deposit flow.

---

## Checkout Redirect URL

After `POST /api/product/cart` succeeds, art-transform redirects the user to:

```
{MEDUSA_STOREFRONT_URL}/checkout?cart_id={cartId}&pt={productTitle}&ps={productStyle}&ptype={productType}&psize={productSize}
```

Locale support: `/{locale}/checkout?...` for `de`, `fr`, `es`, `it`, `pt`, `ko`, `ja`.

---

## Art-Transform Side (Done)

- ✅ Sends `POST /api/product/cart` with full payload.
- ✅ Includes `variantStyle`, `variantType`, `variantSize` for variant matching.
- ✅ Redirects to checkout with `cart_id`.
- ✅ Sets `ART_TRANSFORM_PUBLIC_URL` in production for correct `previewImageUrl` (art-transform must be reachable from checkout page).
