# Medusa Variant Images (Google Shopping / Pinterest)

As 3 imagens de cada variante do Art Transform são injetadas no Medusa para uso em anúncios (Google Shopping, Pinterest).

## Fluxo

1. **Origem**: `client/src/lib/gallery-images.ts` e `mood-gallery-images.ts` — 3 imagens por (category × style) ou (mood × category × style).

2. **Cópia**: `npm run copy-gallery` — copia assets para `client/public/gallery/`.

3. **URLs** — opção A (local) ou B (R2):
   - **A) Local**: deploy art-transform; URLs = `ART_TRANSFORM_PUBLIC_URL/gallery/...`
   - **B) R2**: `npm run upload-gallery-to-r2`; URLs = `ART_TRANSFORM_GALLERY_BASE_URL/...` (use R2 se /gallery/ retornar 404)

4. **Injeção**: `npm run medusa-inject-images` — envia imagens para o Medusa.

## Comandos

```bash
# 1. Copiar imagens para public (executado automaticamente no prebuild)
npm run copy-gallery

# 2a. (Opcional) Upload para R2 — use se ai.art-and-see.com/gallery/ retornar 404
npm run upload-gallery-to-r2
# Depois defina ART_TRANSFORM_GALLERY_BASE_URL no .env (ex.: https://pub-xxx.r2.dev/art-transform-gallery)

# 3. Injetar no Medusa
npm run medusa-inject-images
npm run medusa-inject-images -- --dry-run       # apenas preview
npm run medusa-inject-images -- --products-only # só imagens de produto, sem metadata por variante
```

## Variáveis

- `MEDUSA_BACKEND_URL` — URL do Medusa (Railway)
- `MEDUSA_ADMIN_EMAIL` / `MEDUSA_ADMIN_PASSWORD`
- `ART_TRANSFORM_PUBLIC_URL` — base do app (ex.: https://ai.art-and-see.com); usado para URLs quando R2 não está configurado
- `ART_TRANSFORM_GALLERY_BASE_URL` — (opcional) base completa para imagens em R2, ex.: https://pub-xxx.r2.dev/art-transform-gallery

## Produtos e variantes

**Produto (nível):**
- `thumbnail` = primeira imagem
- `images` = [img1, img2, img3]

**Variante (metadata):**
- Cada variante recebe `metadata.thumbnail` e `metadata.images` conforme (style, mood).
- O script deriva style e mood do título (ex.: "Oil Painting Print 8x10 - Classic") ou das options da variante.
- Para imagens por variante aparecerem no Admin do Medusa, instale o plugin [medusa-variant-images](https://medusajs.com/integrations/medusa-variant-images).

O product-adapter do portraits usa `additionalImages = images.slice(1, 10)` para o feed XML (g:additional_image_link).
