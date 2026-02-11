import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTransformationSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setupAuth, isAuthenticated } from "./auth";
import { generateGalleryImage } from "./generate-gallery";
import sharp from "sharp";
import { getFormatBlock, getIdentityAnchor, getIdentityGuard, getStyleBlock, getMultiPhotoInstruction } from "@shared/build-prompt-from-template";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const categoryLabels: Record<string, string> = {
  pets: "pet portrait",
  family: "family portrait",
  kids: "child portrait",
  couples: "couple portrait",
  "self-portrait": "self-portrait",
};

const styleTechniqueNames: Record<string, string> = {
  "oil-painting": "oil painting",
  acrylic: "acrylic painting",
  "pencil-sketch": "pencil sketch",
  watercolor: "watercolor painting",
  charcoal: "charcoal drawing",
  pastel: "pastel artwork",
};

const styleDisplayNames: Record<string, string> = {
  "oil-painting": "Oil Painting",
  acrylic: "Acrylic",
  "pencil-sketch": "Pencil Sketch",
  watercolor: "Watercolor",
  charcoal: "Charcoal",
  pastel: "Pastel",
};

const typeDisplayNames: Record<string, string> = {
  digital: "Instant Masterpiece",
  print: "Fine Art Print",
  handmade: "Handmade",
};

const typeDescriptions: Record<string, string> = {
  digital: "High-resolution download without watermark. Instant delivery.",
  print: "Museum-quality archival paper with fade-resistant inks.",
  handmade: "Hand-painted by master artists on cotton-blend canvas.",
};

/** Normalize prompt text: single spaces, no leading/trailing spaces per line. */
function normalizePromptText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Builds the full prompt for Gemini from prompt-template.json (v8.6).
 * When a mood preset is set, its vision is placed first; technique (style) is then applied.
 */
const MULTI_PERSON_CATEGORIES = ["family", "kids", "couples"];

function getMultiSubjectRule(category?: string): string {
  if (!category || !MULTI_PERSON_CATEGORIES.includes(category)) return "";
  return `\n\nMULTI-SUBJECT RULE: This photo contains MULTIPLE people. You MUST include EVERY person visible in the input photo. Count them. Paint ALL of them — same number, same arrangement, same relationships. NEVER drop, merge, crop out, or omit any person. NEVER add people who are not in the photo.`;
}

function buildPrompt(style: string, category?: string, stylePresetPrompt?: string | null, photoCount = 1): string {
  const technique = styleTechniqueNames[style] || "oil painting";
  const categoryLabel = category && categoryLabels[category] ? categoryLabels[category] : "photo";
  const styleSuffix = getStyleBlock(style);
  const formatBlock = getFormatBlock();
  const identityAnchor = getIdentityAnchor(category);
  const identityGuard = getIdentityGuard(category);
  const multiRule = getMultiSubjectRule(category);
  const multiPhotoBlock = getMultiPhotoInstruction(photoCount);
  const photoRef = photoCount > 1 ? `these ${photoCount} reference photos` : `this ${categoryLabel} photo`;
  const multiPhotoReminder = photoCount > 1
    ? `\n\nFINAL REMINDER: You received ${photoCount} reference photos. Identify every unique person across all photos and include ALL of them in the final portrait. Do NOT leave anyone out.`
    : "";
  const trimmedPreset = stylePresetPrompt?.trim();
  if (trimmedPreset) {
    const vision = normalizePromptText(trimmedPreset);
    return `${identityGuard}${multiRule}${multiPhotoBlock}\n\nTransform ${photoRef} into an artwork that fulfills this exact vision: ${vision}. The result must be a realistic handmade ${technique} using authentic ${technique} techniques.${styleSuffix}${formatBlock}\n\n${identityAnchor}${multiPhotoReminder}`;
  }
  return `${identityGuard}${multiRule}${multiPhotoBlock}\n\nTransform ${photoRef} into a realistic handmade ${technique} using authentic ${technique} techniques. ${identityAnchor}${styleSuffix}${formatBlock}\n\n${identityAnchor}${multiPhotoReminder}`;
}

const transformWithGemini = async (
  imageUrls: string[],
  style: string,
  category?: string,
  stylePresetPrompt?: string | null
): Promise<string> => {
  try {
    // Parse all images
    const images = imageUrls.map((url, idx) => {
      const match = url.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) throw new Error(`Invalid image data URL format for photo ${idx + 1}`);
      return { mimeType: match[1], base64Data: match[2] };
    });

    // Detect aspect ratio: landscape for groups (3+ photos likely = 3+ people), else from first image
    let aspectRatio = "3:4"; // default portrait
    if (images.length >= 3) {
      // 3+ reference photos likely means a group → force landscape so everyone fits
      aspectRatio = "4:3";
      console.log(`[transform] ${images.length} photos → forcing landscape 4:3 for group portrait`);
    } else {
      try {
        const imgBuffer = Buffer.from(images[0].base64Data, "base64");
        const metadata = await sharp(imgBuffer).metadata();
        if (metadata.width && metadata.height && metadata.width > metadata.height) {
          aspectRatio = "4:3"; // landscape
        }
        console.log(`[transform] image ${metadata.width}x${metadata.height} → aspectRatio ${aspectRatio} (${images.length} photo${images.length > 1 ? "s" : ""})`);
      } catch (e) {
        console.log("[transform] could not detect image orientation, using 3:4");
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio },
      } as any,
    });

    const photoCount = images.length;
    const prompt = buildPrompt(style, category, stylePresetPrompt, photoCount);
    console.log(`[transform] ${photoCount} photo(s), prompt preview:`, prompt.slice(0, 200) + (prompt.length > 200 ? "…" : ""));

    // Build content parts: all images first, then the text prompt
    const contentParts: Array<{ inlineData: { data: string; mimeType: string } } | { text: string }> = [];
    for (const img of images) {
      contentParts.push({
        inlineData: {
          data: img.base64Data,
          mimeType: `image/${img.mimeType}`,
        },
      });
    }
    contentParts.push({ text: prompt });

    // Scale timeout with photo count: 90s base + 15s per additional photo
    const GEMINI_TIMEOUT_MS = photoCount > 1 ? 90_000 + (photoCount * 15_000) : 90_000;
    console.log(`[transform] Gemini timeout: ${GEMINI_TIMEOUT_MS / 1000}s for ${photoCount} photo(s)`);
    const generatePromise = model.generateContent(contentParts);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini request timed out (${Math.round(GEMINI_TIMEOUT_MS / 1000)}s)`)), GEMINI_TIMEOUT_MS)
    );
    const result = await Promise.race([generatePromise, timeoutPromise]);

    console.log("Gemini API response received:", JSON.stringify({
      candidates: result.response.candidates?.length,
      parts: result.response.candidates?.[0]?.content?.parts?.length,
    }));

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
      console.error("No parts in Gemini response");
      throw new Error("No image generated from Gemini API");
    }

    // Find the inline data part (the generated image)
    for (const part of parts) {
      console.log("Checking part:", { hasInlineData: !!part.inlineData, hasText: !!part.text });
      if (part.inlineData && part.inlineData.data) {
        // Return as data URL
        const generatedMimeType = part.inlineData.mimeType || "image/png";
        console.log("Successfully generated image with Gemini");
        return `data:${generatedMimeType};base64,${part.inlineData.data}`;
      }
    }

    console.error("No inline data found in response parts");
    throw new Error("No image data in Gemini API response");
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to transform image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user credits
  app.get('/api/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const credits = await storage.getUserCredits(userId);
      res.json({ credits });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Gallery generation - text-only, no source image (for sample gallery images)
  app.post("/api/generate", async (req: any, res) => {
    try {
      const body = req.body as { style?: string; category?: string; imgIndex?: number };
      const style = body.style || "oil-painting";
      const category = body.category || "pets";
      const imgIndex = body.imgIndex;

      const imageUrl = await generateGalleryImage(style, category, imgIndex);
      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error("Generate error:", error);
      res.status(500).json({
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Free transformation endpoint - no auth required for preview
  app.post("/api/transform", async (req: any, res) => {
    try {
      const body = req.body as {
        originalImageUrl?: string;
        additionalImageUrls?: string[];
        style?: string;
        category?: string;
        width?: number;
        height?: number;
        stylePresetPrompt?: string | null;
      };
      const validatedData = insertTransformationSchema.parse({
        originalImageUrl: body.originalImageUrl,
        style: body.style,
        status: "processing",
      });
      const category = body.category;
      const width = body.width;
      const height = body.height;
      const stylePresetPrompt = body.stylePresetPrompt ?? null;
      // Collect all image URLs: primary + any additional
      const allImageUrls = [validatedData.originalImageUrl];
      if (Array.isArray(body.additionalImageUrls)) {
        allImageUrls.push(...body.additionalImageUrls.filter(u => typeof u === "string" && u.startsWith("data:image/")));
      }
      const totalPayloadMB = allImageUrls.reduce((sum, u) => sum + u.length, 0) / (1024 * 1024);
      console.log(`[transform] ${allImageUrls.length} photo(s), ~${totalPayloadMB.toFixed(1)}MB payload, stylePresetPrompt:`, stylePresetPrompt ? stylePresetPrompt.slice(0, 80) + "..." : "NONE");

      if (!validatedData.originalImageUrl || validatedData.originalImageUrl.length === 0) {
        res.status(400).json({ error: "Original image is required" });
        return;
      }

      const transformation = await storage.createTransformation({
        ...validatedData,
        status: "processing",
      });

      (async () => {
        // Helper: extract readable message from any error type (including WebSocket ErrorEvent)
        const extractErrorMessage = (err: unknown): string => {
          if (err instanceof Error) return err.message;
          if (typeof err === "object" && err !== null) {
            // WebSocket ErrorEvent from Neon has Symbol(kMessage) but also often has .message
            const anyErr = err as Record<string, unknown>;
            if (typeof anyErr.message === "string") return anyErr.message;
            if (typeof anyErr.error === "object" && anyErr.error !== null) {
              const inner = anyErr.error as Record<string, unknown>;
              if (typeof inner.message === "string") return inner.message;
            }
          }
          try { return JSON.stringify(err); } catch { return "Unknown error"; }
        };

        // Helper: retry DB update (Neon WebSocket can drop during long Gemini processing)
        const updateWithRetry = async (id: string, updates: Parameters<typeof storage.updateTransformation>[1], retries = 3) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
            try {
              return await storage.updateTransformation(id, updates);
            } catch (dbErr) {
              const dbMsg = extractErrorMessage(dbErr);
              console.error(`[transform] DB update attempt ${attempt}/${retries} failed: ${dbMsg}`);
              if (attempt === retries) throw dbErr;
              // Wait before retry (exponential: 1s, 2s, 4s)
              await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
            }
          }
        };

        try {
          const transformedImageUrl = await transformWithGemini(
            allImageUrls,
            validatedData.style,
            category,
            stylePresetPrompt
          );
          
          await updateWithRetry(transformation.id, {
            status: "completed",
            transformedImageUrl,
          });
          console.log(`[transform] ✓ Saved completed transformation ${transformation.id}`);
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          console.error("Transformation processing error:", errMsg);
          try {
            await updateWithRetry(transformation.id, {
              status: "failed",
              errorMessage: errMsg.slice(0, 500),
            });
          } catch (dbErr) {
            console.error("[transform] CRITICAL: Could not save failure status to DB:", extractErrorMessage(dbErr));
          }
        }
      })();

      res.json({ 
        success: true, 
        transformationId: transformation.id,
        transformation 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transformation" });
      }
    }
  });

  app.get("/api/transform/:id", async (req, res) => {
    try {
      const transformation = await storage.getTransformation(req.params.id);
      
      if (!transformation) {
        res.status(404).json({ error: "Transformation not found" });
        return;
      }

      res.json(transformation);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transformation" });
    }
  });

  // Serve transformation image for checkout preview (CORS enabled for portraits.art-and-see.com)
  const allowedOrigins = [
    "https://portraits.art-and-see.com",
    "https://ai.art-and-see.com",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ];
  app.get("/api/transform/:id/image", async (req, res) => {
    const origin = req.get("Origin");
    if (origin && (allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Cache-Control", "public, max-age=86400");

    try {
      const transformation = await storage.getTransformation(req.params.id);
      if (!transformation?.transformedImageUrl) {
        res.status(404).json({ error: "Transformation image not found" });
        return;
      }
      const dataUrl = transformation.transformedImageUrl;
      const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: "Invalid image format" });
        return;
      }
      const [mimeType, base64Data] = [match[1] === "jpg" ? "jpeg" : match[1], match[2]];
      let buffer = Buffer.from(base64Data, "base64");

      const maxWidth = req.query.w ? parseInt(String(req.query.w), 10) : 0;
      const quality = req.query.q ? Math.min(100, Math.max(1, parseInt(String(req.query.q), 10))) : 85;

      if (maxWidth > 0 && maxWidth < 4096) {
        try {
          const sharp = (await import("sharp")).default;
          let pipeline = sharp(buffer);
          const meta = await pipeline.metadata();
          const width = meta.width ?? 0;
          if (width > maxWidth) {
            pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
          }
          buffer = await pipeline.jpeg({ quality }).toBuffer();
          res.setHeader("Content-Type", "image/jpeg");
        } catch (sharpErr) {
          console.warn("[transform/image] Sharp resize failed, serving original:", (sharpErr as Error).message);
        }
      }

      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", `image/${mimeType}`);
      }
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  const medusaStorefront = process.env.MEDUSA_STOREFRONT_URL?.replace(/\/$/, "") || process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
  const useMedusa = process.env.USE_MEDUSA_PRODUCTS === "true";

  // Fetch handmade prices directly from Medusa Store API (no proxy, no fallbacks)
  const medusaBackend = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
  const medusaPublishableKey = process.env.MEDUSA_PUBLISHABLE_KEY || "";
  const medusaRegionId = process.env.MEDUSA_REGION_ID || "reg_01KF60P6AREHJSW90593P3VCRZ";

  app.get("/api/art-transform-prices", async (req, res) => {
    if (!medusaBackend) {
      return res.status(503).json({ error: "MEDUSA_BACKEND_URL not configured." });
    }
    const handle = req.query.handle as string;
    if (!handle?.startsWith("art-transform-")) {
      return res.status(400).json({ error: "Invalid handle. Expected art-transform-{category}." });
    }

    // Call Medusa Store API directly
    const params = new URLSearchParams();
    params.set("handle", handle);
    params.set("region_id", medusaRegionId);
    params.set("fields", "*options,*options.values,*variants.options,*variants.calculated_price,thumbnail");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (medusaPublishableKey) headers["x-publishable-api-key"] = medusaPublishableKey;

    try {
      const medusaRes = await fetch(`${medusaBackend}/store/products?${params.toString()}`, { headers });
      if (!medusaRes.ok) {
        const errText = await medusaRes.text();
        console.error("[Art Transform Prices] Medusa error:", medusaRes.status, errText);
        return res.status(medusaRes.status).json({ error: "Medusa API error", details: errText });
      }
      const data = await medusaRes.json() as { products?: Array<{
        options?: Array<{ id: string; title: string; values?: Array<{ id: string; value: string }> }>;
        variants?: Array<{
          title: string;
          options?: Array<{ option_id: string; value: string }>;
          calculated_price?: { calculated_amount: number };
        }>;
      }> };

      const product = data.products?.[0];
      if (!product?.variants?.length) {
        return res.status(404).json({ error: `Product not found: ${handle}. Run: npm run medusa-seed` });
      }

      // Find Type and Size options
      const opts = product.options || [];
      const typeOpt = opts.find(o => o.title?.toLowerCase() === "type");
      const sizeOpt = opts.find(o => o.title?.toLowerCase() === "size");
      if (!typeOpt || !sizeOpt) {
        return res.status(500).json({ error: "Product missing Type or Size options." });
      }

      // Medusa amounts are in dollars (major units). See EVIDENCE_100X_PRICING.md
      const digital: Record<string, number> = {};
      const print: Record<string, number> = {};
      const handmade: Record<string, number> = {};
      let digitalOriginal: number | undefined;

      for (const v of product.variants) {
        const vOpts = v.options || [];
        const typeVal = vOpts.find(o => o.option_id === typeOpt.id)?.value?.toLowerCase();
        const sizeRaw = vOpts.find(o => o.option_id === sizeOpt.id)?.value || "";
        const sizeVal = sizeRaw.replace(/[^0-9x]/gi, "").toLowerCase();
        const amount = v.calculated_price?.calculated_amount;
        if (amount == null) continue;

        if (typeVal === "digital") {
          digital.default = amount;
          if (digitalOriginal == null) digitalOriginal = Math.round(amount * 1.35); // Strikethrough ~$39 when sale is $29
        } else if (typeVal === "print") {
          if (sizeVal) print[sizeVal] = amount;
        } else if (typeVal === "handmade") {
          if (sizeVal) handmade[sizeVal] = amount;
        }
      }

      if (Object.keys(handmade).length === 0) {
        console.warn("[Art Transform Prices] No handmade prices extracted for", handle,
          "| variants:", product.variants.length,
          "| typeOpt.id:", typeOpt.id,
          "| sizeOpt.id:", sizeOpt.id,
          "| sample variant options:", JSON.stringify(product.variants[0]?.options?.slice(0, 3)),
          "| sample calculated_price:", JSON.stringify(product.variants[0]?.calculated_price));
      }

      res.json({ digital, print, handmade, digitalOriginal });
    } catch (err) {
      console.error("[Art Transform Prices] Error:", err);
      res.status(502).json({ error: "Failed to fetch prices from Medusa" });
    }
  });

  app.post("/api/medusa/checkout", async (req, res) => {
    if (!useMedusa || !medusaStorefront) {
      res.status(503).json({ error: "Medusa checkout not configured. Set MEDUSA_STOREFRONT_URL." });
      return;
    }
    try {
      const body = req.body as {
        productHandle?: string;
        style?: string;
        type?: string;
        variantOption?: string;
        transformationId?: string;
        locale?: string;
      };
      const { productHandle, style, type, variantOption, transformationId, locale } = body;
      if (!productHandle) {
        res.status(400).json({ error: "productHandle required" });
        return;
      }

      // Build previewImageUrl and productTitle when transformationId is provided.
      // The image is served from the art-transform endpoint /api/transform/:id/image
      // which reads the base64 from Neon DB. Requires ART_TRANSFORM_PUBLIC_URL in production
      // (e.g. https://ai.art-and-see.com) so the URL works from Photos-to-Paintings.
      let previewImageUrl: string | undefined;
      let productTitle: string | undefined;
      if (transformationId) {
        const transformation = await storage.getTransformation(transformationId);
        if (transformation?.transformedImageUrl) {
          const baseUrl =
            process.env.ART_TRANSFORM_PUBLIC_URL ||
            `${req.protocol}://${req.get("host") || "localhost"}`.replace(/\/$/, "");
          previewImageUrl = `${baseUrl}/api/transform/${transformationId}/image`;
        }
        const styleLabel = (style && styleDisplayNames[style]) || style || "Portrait";
        const typeLabel = (type && typeDisplayNames[type]) || type || "";
        const sizeLabel = variantOption && variantOption !== "default" ? ` ${variantOption}` : "";
        productTitle = typeLabel ? `${styleLabel} - ${typeLabel}${sizeLabel}`.trim() : `${styleLabel}${sizeLabel}`.trim();
      }

      // Always build metadata for checkout display (style, type, size, description)
      const productStyle = (style && styleDisplayNames[style]) || style || "Portrait";
      const productType = (type && typeDisplayNames[type]) || type || "";
      const productSize = (type === "digital" ? "default" : (variantOption && variantOption !== "default" ? variantOption : "default")) || "default";
      const productDescription = (type && typeDescriptions[type]) || "";

      // Variant option values for Medusa (must match product options: Style, Type, Size)
      const variantStyle = style || "oil-painting";
      const variantType = type || "digital";
      const variantSize = productSize;

      // Build productConfig for Photos-to-Paintings POST /api/product/cart
      // downloadUrl: same as previewImageUrl - /api/transform/:id/image serves the clean (non-watermarked) image
      const productConfig = {
        source: "art-transform",
        productTitle: productTitle ?? `${productStyle} - ${productType}`.trim(),
        productStyle,
        productType,
        productSize,
        productDescription: productDescription || undefined,
        previewImageUrl: previewImageUrl || undefined,
        downloadUrl: previewImageUrl || undefined,
        // Raw variant option values for Medusa line-item matching (Style, Type, Size)
        variantStyle,
        variantType,
        variantSize,
      };

      const items = [
        {
          productHandle,
          quantity: 1,
          productConfig,
        },
      ];

      const productCartRes = await fetch(`${medusaStorefront}/api/product/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const productCartBody = await productCartRes.text();
      if (!productCartRes.ok) {
        console.error("[Medusa checkout] Photos-to-Paintings /api/product/cart failed", {
          status: productCartRes.status,
          body: productCartBody,
        });
        let details = productCartBody;
        try {
          const parsed = JSON.parse(productCartBody);
          details = parsed.message || parsed.details || parsed.error || productCartBody;
        } catch {
          // keep raw body
        }
        res.status(productCartRes.status >= 500 ? 502 : productCartRes.status).json({
          error: "Failed to create checkout",
          details: String(details),
        });
        return;
      }

      const productCartData = JSON.parse(productCartBody) as { success?: boolean; cartId?: string };
      const cartId = productCartData.cartId;
      if (!cartId) {
        console.error("[Medusa checkout] No cartId in Photos-to-Paintings response", productCartData);
        res.status(502).json({
          error: "Failed to create checkout",
          details: "Invalid response from storefront",
        });
        return;
      }

      const validLocales = ["de", "fr", "es", "it", "pt", "ko", "ja"];
      const pathPrefix = locale && validLocales.includes(locale) ? `/${locale}` : "";
      const params = new URLSearchParams({ cart_id: cartId });
      if (productTitle) params.set("pt", productTitle);
      if (productStyle) params.set("ps", productStyle);
      if (productType) params.set("ptype", productType);
      if (productSize) params.set("psize", productSize);
      const checkoutUrl = `${medusaStorefront}${pathPrefix}/checkout?${params.toString()}`;
      res.json({ checkoutUrl, cartId });
    } catch (error) {
      console.error("Medusa checkout error:", error);
      res.status(500).json({
        error: "Failed to create checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
