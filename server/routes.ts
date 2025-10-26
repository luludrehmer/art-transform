import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTransformationSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setupAuth, isAuthenticated } from "./replitAuth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const stylePrompts: Record<string, string> = {
  oil: `Apply an oil painting artistic style to this image while preserving all important details and composition. Transform it with:
- Visible brush strokes and impasto texture overlay
- Rich, saturated oil paint colors while keeping the original color scheme
- Canvas texture throughout
- Painterly edges and soft blending between areas
- Keep all subjects, faces, objects, and background elements exactly as they appear
- Enhance with warm artistic tones typical of oil paintings
- Add depth through brush stroke direction and paint thickness variation
The result should look like the original photo was painted in oils by a skilled artist.`,

  acrylic: `Apply a vibrant acrylic painting style to this image while keeping all original details intact. Transform with:
- Bold, visible brush strokes with clean edges
- Bright, vivid acrylic colors enhancing the original palette
- Matte paint finish with textured brush marks
- Modern, energetic painting aesthetic
- Sharp transitions between color areas
- Preserve all subjects, people, objects, and composition exactly
- Add contemporary artistic flair with dynamic brush work
The result should feel like the original scene painted with acrylics.`,

  sketch: `Convert this image to a detailed pencil sketch while preserving all features and composition. Apply:
- Precise graphite pencil lines and cross-hatching
- Grayscale tones from light to dark
- Paper texture visible throughout
- Hand-drawn aesthetic with natural pencil strokes
- Maintain all facial features, objects, and details exactly as shown
- Use shading and line work to define forms
- Keep the same composition and perspective
The result should look like a skilled artist drew this scene in pencil.`,

  watercolor: `Apply a watercolor painting style to this image while keeping all key elements. Transform with:
- Soft, translucent watercolor washes
- Gentle color bleeds and water blooms
- Visible paper texture showing through
- Preserve all subjects, faces, and important details
- Light, airy watercolor aesthetic
- Delicate brush strokes and flowing edges
- Maintain the original composition and color harmony
The result should appear as if painted with watercolors on paper.`,

  charcoal: `Convert this image to a charcoal drawing while maintaining all details and composition. Apply:
- Rich charcoal blacks and soft grays
- Smudged, blended charcoal texture
- Dramatic shadows and highlights
- Textured paper surface visible
- Preserve all facial features, objects, and scene elements exactly
- Use charcoal strokes to define form and depth
- Keep the same framing and perspective
The result should look like a charcoal drawing of this exact scene.`,

  pastel: `Apply a soft pastel art style to this image while keeping all original elements. Transform with:
- Soft, chalky pastel texture
- Muted, dreamy color palette enhancing the original tones
- Visible pastel stick marks
- Paper texture showing through
- Gentle blending and soft edges
- Preserve all subjects, details, and composition exactly
- Add romantic, ethereal pastel aesthetic
The result should look like this scene rendered in soft pastels.`,
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
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const credits = await storage.getUserCredits(userId);
      res.json({ credits });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Protected transformation endpoint - requires auth and credits
  app.post("/api/transform", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user has credits
      const credits = await storage.getUserCredits(userId);
      if (credits < 1) {
        res.status(403).json({ error: "Insufficient credits. You need 1 credit to transform an image." });
        return;
      }

      const validatedData = insertTransformationSchema.parse(req.body);
      
      if (!validatedData.originalImageUrl || validatedData.originalImageUrl.length === 0) {
        res.status(400).json({ error: "Original image is required" });
        return;
      }

      // Deduct credit before processing
      const deducted = await storage.deductCredits(userId, 1);
      if (!deducted) {
        res.status(403).json({ error: "Failed to deduct credits" });
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
