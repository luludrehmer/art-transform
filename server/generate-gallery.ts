/**
 * Gallery image generation - can be used by the API or by the regenerate script in standalone mode.
 */
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const STYLE_ORDER = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"];

type VariationDimensions = {
  subjects: string[];
  poses: string[];
  angles: string[];
  backgrounds: string[];
};

const categoryDimensions: Record<string, VariationDimensions> = {
  pets: {
    subjects: ["golden retriever", "tabby cat", "black labrador", "siamese cat", "german shepherd", "persian cat", "beagle", "dachshund", "bengal cat"],
    poses: ["profile view", "facing forward", "sitting", "lying down", "playful alert pose", "head tilted", "ears perked"],
    angles: ["close-up", "three-quarter view", "head and shoulders", "slightly from above", "low angle"],
    backgrounds: ["soft green foliage", "warm indoor", "neutral studio", "outdoor natural light", "autumn leaves", "cozy couch", "garden", "beach tones"],
  },
  family: {
    subjects: ["parents with two children, smiling", "grandparents with grandchildren, standing or sitting side by side", "siblings laughing", "single parent with child", "extended family, 2-4 people", "father and daughter, natural side-by-side pose", "mother and son, natural side-by-side pose"],
    poses: ["joyful smiling", "warm and tender", "laughing together", "playful", "happy content", "cheerful", "radiant"],
    angles: ["three-quarter group", "front-facing", "natural candid angle", "slightly from above", "intimate close grouping"],
    backgrounds: ["outdoor park", "home interior", "studio portrait", "garden setting", "beach", "cozy living room", "rustic outdoor"],
  },
  kids: {
    subjects: ["toddler", "school-age child", "baby", "preteen", "child with toy"],
    poses: ["joyful smiling", "playful curious", "gentle serene", "active energetic", "peaceful resting", "concentrated focus"],
    angles: ["close-up face", "three-quarter", "full upper body", "slightly from above", "candid side angle"],
    backgrounds: ["soft natural light", "warm indoor", "outdoor", "neutral studio", "playroom", "garden", "window light"],
  },
  couples: {
    subjects: ["young man and woman couple", "middle-aged man and woman", "mixed-gender couple", "newlyweds", "man and woman, long-term partners"],
    poses: ["romantic tender, both smiling", "joyful laughing together", "warm embrace, happy", "forehead touch, content", "dancing pose", "cheerful together"],
    angles: ["three-quarter", "front-facing", "intimate close-up", "profile embrace", "natural candid"],
    backgrounds: ["outdoor sunset", "studio", "home interior", "urban setting", "vineyard", "coastal", "cozy café"],
  },
  "self-portrait": {
    subjects: ["young woman", "young man", "middle-aged woman", "middle-aged man", "older woman", "older man"],
    poses: ["warm smile", "gentle smile", "confident friendly gaze", "relaxed content", "joyful expression", "approachable"],
    angles: ["close-up face", "upper body", "three-quarter angle", "profile", "slightly from above"],
    backgrounds: ["soft neutral", "warm tone", "minimal studio", "subtle gradient", "window backlight", "muted color field"],
  },
};

const FORMAT_BLOCK_GENERATION = `

Format:
Output aspect ratio: 3:4 portrait
Output must be a cropped end-to-end image—the artwork fills the entire frame edge to edge with no visible borders
Show only the artwork surface—no frame, canvas edge, paper edge, wall, or easel
Focus entirely on the medium and technique without external elements
Photorealistic painted portrait—looks like a real photograph of a painting. Not illustration, not cartoon, not sketch-like, not stylized or graphic.
Warm, uplifting, happy mood. Subject must be smiling or have a positive, content expression. No sad, pensive, melancholic, or depressed looks.
Simple composition. For family/kids: 2-4 people max, avoid crowded scenes.
Wholesome, appropriate poses. No inappropriate physical contact. Child-safe composition for kids/family.
Bright, warm lighting. Avoid dark, gothic, melancholic, or depressing atmosphere.
Each image must feel distinctly different—vary subject, pose, expression, and composition to avoid repetition.

Negative prompt:
No frames, no walls, no canvas edges, no paper edges, no canvas mounting, no easels, no hanging display, no room context, no visible borders or margins.
No illustration style, no cartoon, no sketch-like look, no graphic art, no anime.
No sad expressions, no frowning, no depressed mood, no melancholic, no pensive, no somber.
No dark atmosphere, no gothic, no crowded composition, no inappropriate poses, no awkward physical contact.
No surrealism, no abstract, no dreamlike, no fantasy elements, no distorted features, no artistic exaggeration.`;

function buildVariationFromDimensions(category: string, imgIndex: number, style: string): string {
  const dims = categoryDimensions[category];
  if (!dims) return categoryLabels[category] || "portrait";

  const i = imgIndex - 1;
  const styleOffset = (STYLE_ORDER.indexOf(style) + 1) * 3;
  const subject = dims.subjects[(i + styleOffset) % dims.subjects.length];
  const pose = dims.poses[(i + 1 + styleOffset) % dims.poses.length];
  const angle = dims.angles[(i + 2 + styleOffset) % dims.angles.length];
  const background = dims.backgrounds[(i + 3 + styleOffset) % dims.backgrounds.length];

  return `${subject}, ${pose}, ${angle} angle, ${background} background`;
}

function buildGenerationPrompt(style: string, category: string, imgIndex?: number): string {
  const technique = styleTechniqueNames[style] || "oil painting";
  const variation =
    imgIndex !== undefined && imgIndex > 0
      ? buildVariationFromDimensions(category, imgIndex, style)
      : categoryLabels[category] || "portrait";
  const base = `Create a unique, distinctive handmade ${technique} of a ${variation}. Use authentic ${technique} techniques. The result must look like a photorealistic painting—not an illustration or sketch. The subject should appear happy, warm, or content. Make the composition, subject, pose, expression, and setting distinctly different—avoid repetitive or formulaic results.`;
  return base + FORMAT_BLOCK_GENERATION;
}

export async function generateGalleryImage(
  style: string,
  category: string,
  imgIndex?: number
): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is required. Set it in .env");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
  const prompt = buildGenerationPrompt(style, category, imgIndex);

  const result = await model.generateContent([{ text: prompt }]);
  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts;

  if (!parts || parts.length === 0) {
    throw new Error("No image generated from Gemini API");
  }

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data in Gemini API response");
}
