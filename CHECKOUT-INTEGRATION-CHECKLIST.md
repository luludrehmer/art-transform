# Art-Transform ↔ Photos-to-Paintings Checkout Integration Checklist

## ✅ Art Transform (este lado) – Concluído

- POST `/api/medusa/checkout` chama `POST {MEDUSA_STOREFRONT_URL}/api/product/cart`
- Payload inclui `productHandle`, `quantity`, `productConfig` com `variantStyle`, `variantType`, `variantSize` para matching de variante
- Redirect para `{MEDUSA_STOREFRONT_URL}/checkout?cart_id={cartId}`
- Tratamento de erro no cliente (toast quando falha)

**Especificação completa:** [PHOTOS-TO-PAINTINGS-SPEC.md](./PHOTOS-TO-PAINTINGS-SPEC.md)

---

## 📋 O que fazer do lado do Photos-to-Paintings

### 1. Implementar `POST /api/product/cart`

- **Request:** `{ items: [{ productHandle, quantity, productConfig }] }`
- **Resposta:** `{ success: true, cartId }`

Passos:

1. Criar cart no Medusa
2. Para cada item:
   - Buscar produto por `productHandle` (ex.: `art-transform-pets`)
   - Encontrar variante com `productConfig.variantStyle`, `variantType`, `variantSize` (valores brutos: `oil-painting`, `digital`, `default`, etc.)
   - Adicionar line item ao cart; salvar `productConfig` em `metadata` para exibição no checkout
3. Retornar `cartId`

### 2. Garantir que o checkout carregue os itens

- A rota que busca o cart (ex.: `GET /api/wizard/cart/:cartId`) deve retornar os line items
- Se o cart vier vazio após Add to Cart, o problema está no passo de add line item (produto não encontrado ou variante incorreta)

### 3. Produtos no Medusa

- Collection: `art-transform`
- Produtos: `art-transform-pets`, `art-transform-family`, `art-transform-kids`, `art-transform-couples`, `art-transform-self-portrait`
- Variantes: Style × Type × Size (ex.: oil-painting + digital + default)

### 4. Lógica Pay in full vs Deposit

- Se todos os itens forem da collection `art-transform` → cobrança total
- Caso contrário → depósito 20%

---

## Configuração em produção (art-transform)

- `ART_TRANSFORM_PUBLIC_URL` – URL pública do art-transform (ex.: `https://ai.art-and-see.com`). Necessário para `previewImageUrl` funcionar no checkout.

---

## Troubleshooting

| Sintoma | Causa provável | O que checar |
|--------|----------------|--------------|
| "No cart items found" no checkout | Line items não foram adicionados | Logs do Photos-to-Paintings; produto existe? variante correta? |
| Checkout pede depósito 20% | Produto fora da collection `art-transform` | Medusa Admin → produto → collection |
| Erro 502 ao Add to Cart | `POST /api/product/cart` não existe ou falha | Photos-to-Paintings implementou o endpoint? |
