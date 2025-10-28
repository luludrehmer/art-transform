import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTransformationSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setupAuth, isAuthenticated } from "./auth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const stylePrompts: Record<string, string> = {
  "oil-painting": `Transform this photo into a realistic oil painting with authentic oil painting techniques. Apply these specific characteristics:

PAINT APPLICATION & TEXTURE:
- Thick, visible impasto brush strokes with dimensional paint buildup
- Directional brush work following the form and contours of subjects
- Alla prima technique with wet-on-wet blending where colors meet
- Paint knife marks in highlights and textured areas
- Visible canvas weave texture throughout, especially in lighter areas
- Glazing effects in shadow areas with transparent color layers

COLOR & TONE:
- Rich, deep oil paint pigments with natural saturation
- Warm undertones typical of linseed oil medium
- Subtle color mixing and muddy transitions where paint meets
- Chiaroscuro lighting with dramatic light-to-shadow transitions
- Slightly muted highlights to avoid artificial brightness
- Earthy, natural color palette with realistic pigment behavior

ARTISTIC DETAILS:
- Loose, expressive brushwork in background areas
- Tighter, more controlled detail in focal points and faces
- Sfumato effect for soft atmospheric transitions
- Paint buildup creating actual texture and relief
- Traditional oil painting composition and framing

The result must look indistinguishable from a photograph of an actual oil painting on canvas, not a digital filter.`,

  acrylic: `Transform this photo into an authentic acrylic painting with modern acrylic painting characteristics. Apply these specific features:

PAINT APPLICATION & TEXTURE:
- Bold, graphic brush strokes with hard, defined edges
- Fast-drying acrylic aesthetic with no wet blending
- Flat, matte paint surface with slight sheen in thick areas
- Crisp color boundaries and sharp transitions
- Palette knife techniques creating flat color planes
- Visible brush bristle marks in the paint surface
- Layered painting with complete opacity - no underlying layers showing through

COLOR & TONE:
- Vibrant, intense pigments with high chroma colors
- Clean, unmixed colors applied directly
- Bright, saturated hues without oil painting's warmth
- Contemporary color choices - bold primaries and secondaries
- Pop art influenced color relationships
- High contrast between light and dark areas

ARTISTIC STYLE:
- Modern, graphic design aesthetic
- Energetic, dynamic composition
- Contemporary painting techniques
- Urban art influenced edge quality
- Clean, deliberate mark-making
- Confident, expressive brushwork with personality

The result must look like a real contemporary acrylic painting photographed in a gallery, with authentic acrylic paint properties.`,

  "pencil-sketch": `Convert this photo into an authentic pencil sketch with traditional graphite drawing techniques. Apply these specific characteristics:

PENCIL TECHNIQUE & MARKS:
- Visible graphite pencil strokes with varying pressure
- Cross-hatching and parallel line shading for tones
- Contour lines defining edges and forms
- Smudged graphite for soft shadows and atmospheric effects
- Directional hatching following the form and volume
- Sharp, precise lines for details and focal points
- Loose, gestural strokes for less important areas
- Eraser marks creating highlights by lifting graphite

TONAL RANGE & SHADING:
- Full range from white paper to deep graphite blacks
- Midtones built up with layered hatching
- Core shadows with dense, dark graphite
- Highlights left as bare white paper
- Gradual tonal transitions through varied line density
- Reflected light in shadow areas
- Form shadow and cast shadow distinction

PAPER & SURFACE:
- Visible paper tooth and texture throughout
- Slight paper grain affecting pencil strokes
- Uneven graphite coverage showing paper surface
- Natural drawing paper color (off-white/cream)
- Paper texture more visible in lighter areas

DRAWING STYLE:
- Classical academic drawing approach
- Observed life drawing aesthetic
- Anatomically accurate with artistic interpretation
- Construction lines subtly visible
- Artist's hand and personality in mark-making
- Traditional portrait/still life drawing conventions

The result must look like an actual graphite pencil drawing photographed on drawing paper, not a digital sketch effect.`,

  watercolor: `Transform this photo into an authentic watercolor painting with traditional watercolor techniques. Apply these specific characteristics:

WATERCOLOR TECHNIQUE:
- Transparent, luminous washes with light showing through
- Wet-on-wet bleeding where colors meet naturally
- Cauliflower blooms and backruns from water pooling
- Hard edges where paint dries with pigment concentration
- Soft, diffused edges from wet-into-wet technique
- Granulation in darker washes showing pigment settling
- White paper preserved for brightest highlights
- Lifting and scraping effects for texture

COLOR & PIGMENT:
- Transparent, flowing color with natural water diffusion
- Subtle color mixing happening on paper, not pre-mixed
- Watercolor staining and settling patterns
- Lighter values overall due to water dilution
- Colors becoming more intense at edges of washes
- Natural pigment separation in mixed areas
- Watercolor palette typical colors and combinations

PAPER & SURFACE:
- Cold-pressed watercolor paper texture highly visible
- Paper buckling and warping slightly from water
- White paper showing through transparent washes
- Paper texture affecting paint flow and settling
- Deckled edges or paper border if full sheet
- Natural watercolor paper color (bright white)

PAINTING CHARACTERISTICS:
- Light, airy, ethereal quality
- Spontaneous, fluid paint application
- Happy accidents and organic effects
- Loose, impressionistic rendering
- Atmospheric perspective with lighter distant areas
- Traditional watercolor subject treatment
- Negative space with bare paper

The result must look like a real watercolor painting photographed under natural light, showing authentic watercolor medium properties.`,

  charcoal: `Transform this photo into an authentic charcoal drawing with traditional charcoal techniques. Apply these specific characteristics:

CHARCOAL TECHNIQUE & MARKS:
- Rich, velvety black charcoal marks with depth
- Smudged and blended tones using finger or tortillon
- Compressed charcoal for intense blacks
- Vine charcoal for lighter, atmospheric tones
- Directional strokes following form and contour
- Cross-contour shading building volume
- Eraser used for highlights - lifting charcoal to reveal paper
- Charcoal dust creating soft, atmospheric effects

TONAL RANGE & CONTRAST:
- Dramatic value range from pure white to deepest black
- High contrast with bold shadows
- Chiaroscuro lighting emphasis
- Dense, solid blacks in deepest shadows
- Soft, graduated midtones through blending
- Bright highlights from eraser or bare paper
- Atmospheric grays in background and distance
- Form revealed through light and shadow alone

TEXTURE & SURFACE:
- Visible charcoal particle texture
- Rough paper tooth showing through
- Smudge marks and finger blending visible
- Paper texture affecting charcoal adhesion
- Slightly dusty, matte surface quality
- Natural drawing paper tone (off-white or toned)
- Uneven charcoal coverage showing hand-drawn quality

DRAWING STYLE:
- Expressive, gestural mark-making
- Bold, confident strokes
- Classical figure drawing aesthetic
- Emphasis on form, volume, and light
- Dramatic, emotional rendering
- Traditional academic drawing approach
- Artist's hand evident in every mark

The result must look like an actual charcoal drawing photographed on paper, with authentic charcoal medium characteristics and no digital processing.`,

  pastel: `Transform this photo into an authentic soft pastel artwork with traditional pastel techniques. Apply these specific characteristics:

PASTEL APPLICATION & TEXTURE:
- Soft, chalky pastel stick marks with powdery texture
- Visible individual pastel strokes and layers
- Blended areas using finger or blending stump
- Unblended strokes showing pure pigment color
- Layered color building up on paper surface
- Side-of-stick broad marks for large areas
- Tip-of-stick precise marks for details
- Pastel dust and particles visible on surface

COLOR & PIGMENT:
- Soft, muted color palette with gentle saturation
- Multiple pastel colors layered creating optical mixing
- Pure pigment colors from pastel sticks
- Velvety color quality unique to pastels
- Subtle color variations from layering
- Romantic, dreamy color harmonies
- Colors slightly dusty and chalky in appearance
- Pastel's natural light-reflecting quality

PAPER & SURFACE:
- Textured pastel paper (sanded or velour surface)
- Paper tooth visible affecting pastel adhesion
- Paper color influencing overall tone
- Texture most visible in lighter applications
- Paper showing through in some areas
- Pastel fixed creating slight sheen in some areas

ARTISTIC STYLE:
- Impressionistic, soft-focus rendering
- Ethereal, romantic atmosphere
- Gentle edges and soft transitions
- Light, luminous quality
- French Impressionist pastel traditions
- Emphasis on color harmony and mood
- Delicate, refined aesthetic
- Atmospheric and dreamlike quality

TECHNIQUE DETAILS:
- Hatching and cross-hatching with pastel sticks
- Scumbling technique for texture
- Feathering strokes for soft edges
- Impasto-like buildup in some areas
- Subtle blending for smooth transitions
- Linear marks over blended areas for detail

The result must look like an actual soft pastel artwork photographed in natural light, showing authentic pastel medium characteristics and traditional pastel painting techniques.`,
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
    const prompt = stylePrompts[style] || stylePrompts["oil-painting"];

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

  // Protected transformation endpoint - requires auth and credits
  app.post("/api/transform", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
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
