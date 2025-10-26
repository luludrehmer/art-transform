import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTransformationSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const stylePrompts: Record<string, string> = {
  oil: `Transform this photograph into a classical oil painting. Apply the following characteristics:
- Visible, expressive brush strokes with texture and depth
- Rich, saturated colors with subtle color mixing on the canvas
- Thick paint application (impasto technique) creating dimensional texture
- Soft, blended edges with painterly transitions
- Canvas texture visible throughout
- Warm, artistic color palette with enhanced contrast
- Traditional oil painting aesthetic with masterful composition
- Maintain the subject and composition while applying full oil painting treatment`,

  acrylic: `Transform this photograph into a vibrant acrylic painting. Apply these characteristics:
- Bold, confident brush strokes with clean edges
- Bright, vivid colors with high saturation and pop
- Matte finish with slight texture
- Modern, contemporary painting style
- Sharp color transitions with defined boundaries
- Energetic, dynamic composition
- Canvas texture with visible brush marks
- Slightly graphic quality while maintaining painterly feel
- Keep the subject recognizable but fully rendered as an acrylic artwork`,

  sketch: `Transform this photograph into a detailed pencil sketch. Apply these characteristics:
- Precise graphite pencil lines with varying pressure and darkness
- Detailed cross-hatching and shading techniques
- Paper texture visible throughout
- Range from light sketch lines to deep, dark shadows
- Artistic interpretation with emphasis on form and volume
- Textured paper grain showing through
- Hand-drawn aesthetic with natural pencil variations
- Focus on light, shadow, and dimensional form
- Monochromatic grayscale tones
- Maintain subject accuracy while achieving artistic sketch quality`,

  watercolor: `Transform this photograph into a delicate watercolor painting. Apply these characteristics:
- Soft, translucent color washes with flowing edges
- Water blooms and natural pigment spreading
- Visible paper texture showing through transparent layers
- Gentle color gradients and blending
- Light, airy quality with luminous colors
- Wet-on-wet technique with organic color mixing
- White paper preservation in highlights
- Delicate brush strokes and paint drips
- Soft edges with beautiful color transitions
- Artistic interpretation maintaining the subject while achieving watercolor elegance`,

  charcoal: `Transform this photograph into a dramatic charcoal drawing. Apply these characteristics:
- Rich, deep blacks with smooth gradients to light grays
- Smudged and blended charcoal marks
- Textured paper surface visible
- Bold, expressive strokes with natural charcoal texture
- Strong contrast between light and shadow
- Finger-smudged blending techniques
- Raw, artistic quality with emotional depth
- Grainy charcoal texture throughout
- Dramatic tonal range
- Maintain subject while achieving powerful charcoal drawing effect`,

  pastel: `Transform this photograph into a soft pastel artwork. Apply these characteristics:
- Soft, chalky pastel texture with gentle blending
- Muted, dreamy color palette with subtle tones
- Visible pastel stick marks and texture
- Paper texture showing through the pastels
- Smooth color transitions with finger-blended areas
- Delicate, romantic aesthetic
- Slight graininess from pastel medium
- Gentle highlights and soft shadows
- Artistic interpretation with ethereal quality
- Maintain subject while achieving beautiful pastel artwork feel`,
};

const transformWithGemini = async (
  originalImageUrl: string,
  style: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image",
    });

    // Extract base64 data from data URL
    const base64Match = originalImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data URL format");
    }

    const [, mimeType, base64Data] = base64Match;

    // Get the appropriate prompt for the style
    const prompt = stylePrompts[style] || stylePrompts.oil;

    // Generate content with image and prompt
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: `image/${mimeType}`,
        },
      },
      { text: prompt },
    ]);

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
  app.post("/api/transform", async (req, res) => {
    try {
      const validatedData = insertTransformationSchema.parse(req.body);
      
      if (!validatedData.originalImageUrl || validatedData.originalImageUrl.length === 0) {
        res.status(400).json({ error: "Original image is required" });
        return;
      }

      const transformation = await storage.createTransformation({
        ...validatedData,
        status: "processing",
      });

      (async () => {
        try {
          const transformedImageUrl = await transformWithGemini(
            validatedData.originalImageUrl,
            validatedData.style
          );
          
          await storage.updateTransformation(transformation.id, {
            status: "completed",
            transformedImageUrl,
          });
        } catch (error) {
          console.error("Transformation processing error:", error);
          await storage.updateTransformation(transformation.id, {
            status: "failed",
          });
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

  const httpServer = createServer(app);

  return httpServer;
}
