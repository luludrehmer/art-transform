/**
 * Gallery image generation with mood system v5.2.
 * ARCHITECTURE: mood = THEME (costume, setting, character) | medium = RENDERING (technique, material, texture).
 * Mood prompts are medium-agnostic. Medium instructions are injected separately and OVERRIDE rendering.
 */
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// ---------- constants ----------

const STYLE_ORDER = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"];

const styleTechniqueNames: Record<string, string> = {
  "oil-painting": "oil painting",
  acrylic: "acrylic painting",
  "pencil-sketch": "pencil sketch drawing",
  watercolor: "watercolor painting",
  charcoal: "charcoal drawing",
  pastel: "soft pastel artwork",
};

const categoryLabels: Record<string, string> = {
  pets: "pet portrait",
  family: "family portrait",
  kids: "child portrait",
  couples: "couple portrait",
  "self-portrait": "self-portrait",
};

// ---------- mood THEME prompts (v5.2 — MEDIUM-AGNOSTIC, no rendering language) ----------

export const MOODS = ["royal_noble", "neoclassical", "heritage"] as const;
export type MoodId = (typeof MOODS)[number];

/**
 * IMPORTANT: These prompts describe ONLY the theme/costume/setting/lighting concept.
 * They must NOT contain any medium-specific language (no "brushwork", "impasto", "craquelure",
 * "glazes", "varnish", "canvas"). The medium is injected separately.
 */
const MOOD_THEME_PROMPTS: Record<MoodId, string> = {
  royal_noble: `THEME: THE SUBJECT IS A MONARCH — regal, powerful, sovereign.
SUBJECT 60-70% of frame.
ATTIRE — If subject is an animal: vary creatively — heavy mantle/cape (color, fabric, trim vary each time), royal headpiece (crown, coronet, circlet, tiara), jeweled collar or gold chain with medallion, heraldic embroidery (lions, eagles, crowns), fur trim (ermine, sable), on ornate cushion (damask/velvet/silk, tassels).
If human: vary creatively — robes/capes in jewel tones (burgundy, plum, navy, emerald, crimson), fur trim, rich embroidery (gold/silver, heraldic motifs), lace, crown/tiara/diadem ALWAYS present, layered jewelry, hand props (scepter, orb, flower, fan), fabrics (velvet, brocade, damask); children: small crown, scaled robe.
SETTING: deep rich darkness; heavy velvet curtains with fabric folds, palace interior glimpse (column, archway, faint window) OR dramatic clouded sky; background darker than subject with detail and depth; rich tones in shadows (navy, umber, warm black, burgundy).
LIGHTING: strong chiaroscuro, warm upper-left light source, subject glows against shadow, rim light separating subject from background.
PALETTE: burgundy, navy, gold, ivory, ermine white, deep purple, crimson, black.`,

  neoclassical: `THEME: THE SUBJECT IS A GREEK/ROMAN DEITY OR MUSE — serene, timeless, classical.
SUBJECT 60-70% of frame.
ATTIRE — If subject is an animal: draped linen/silk over shoulders (toga-like), crown (laurel, olive, vine, gold diadem), gold chain with classical medallion (owl, eagle, sun, lyre), on carved marble pedestal with classical relief.
If human: vary creatively — toga/chiton/himation (white, cream, ivory), colored accents (terracotta, olive, gold, sage), crown ALWAYS (laurel, olive, gold diadem, vine, myrtle), gold fibula/brooch, gold cuff, signet ring, chain with pendant, classical hair (curls, braids, gold pins); children: white tunic, small wreath, gold pendant.
SETTING: romantic landscape (rolling Tuscan/Greek hills, atmospheric perspective, ancient trees, dramatic golden-hour sky with peach/amber/pink clouds, classical ruins — broken column, archway, temple fragment, atmospheric haze in distance).
LIGHTING: warm golden Mediterranean, late afternoon sun, soft glow on skin/fur, warm edge light catching crown/wreath and hair/fur edges creating luminous separation from background (NOT a religious halo — this is a rim light technique).
PALETTE: warm gold, ochre, terracotta, olive, cream, marble white, sage, sky blue.`,

  heritage: `THEME: THE SUBJECT IS OLD MONEY ARISTOCRACY — refined, understated, inherited elegance.
SUBJECT 60-70% of frame.
ATTIRE — If subject is an animal: Heritage animals are NOT bare: collar ALWAYS PRESENT (fine leather oxblood/British tan with brass buckle and engraved crest; OR tartan collar Stewart/Blackwatch with gold charm; OR pearl-studded with pendant); additional accessories vary (tweed vest/coat herringbone/houndstooth, cashmere blanket, silk neckerchief); props nearby (leather-bound book, riding crop, top hat, pocket watch); impeccably groomed; positioned as prized estate companion on Persian rug or beside Chesterfield.
If human: vary creatively — men: frock coat, morning coat, waistcoat, silk cravat/ascot, high-collar shirt; women: high-collar dress, riding habit, tea gown, cashmere, taffeta; accessories (shawl, leather gloves, book, pocket watch, cameo, pearls); heirloom jewelry; colors ALWAYS muted (charcoal, camel, hunter green, oxblood, navy, slate, taupe, cream); children: Peter Pan collar, sailor suit, knee shorts.
SETTING (SECONDARY to subject — soft, suggested, NOT sharp): interior (wood-paneled study softly suggested — books as soft masses, ancestral portrait barely discernible, fireplace amber glow implied, dark curtain folds) OR exterior (overcast atmospheric sky, rolling greens in mist, stone manor as tiny silhouette); background 2-3 stops DARKER than subject, never competing with subject.
LIGHTING: cool natural side light, refined; warm amber accents; soft highlights on fabric.
PALETTE: charcoal, taupe, hunter green, oxblood, cream, burnished gold, tobacco, slate.`,
};

// ---------- MEDIUM-SPECIFIC rendering instructions (STRONG, placed at END to override) ----------

function getMediumBlock(style: string): string {
  switch (style) {
    case "oil-painting":
      return `

=== MANDATORY MEDIUM: OIL PAINTING ON CANVAS ===
This artwork is an OIL PAINTING. Render with visible impasto texture, layered glazes, craquelure from age, warm amber varnish sheen. Reference: Rembrandt, Velázquez, Van Dyck. Rich, thick paint texture visible throughout. Canvas weave subtly visible. Covers every inch edge to edge.
QUALITY: Museum-grade oil painting — indistinguishable from a 200-year-old masterwork in the National Gallery.`;

    case "acrylic":
      return `

=== MANDATORY MEDIUM: ACRYLIC PAINTING ON CANVAS ===
This artwork is an ACRYLIC PAINTING — NOT oil painting. Render with bold, saturated, vivid colors. Visible brush texture with slightly flatter, more opaque strokes than oil. Slightly more modern feel than oil — crisper edges, brighter saturation, less yellow/amber warmth. No craquelure, no varnish. Covers every inch edge to edge.
QUALITY: Professional acrylic portrait — vivid color and confident brushwork.`;

    case "pencil-sketch":
      return `

=== MANDATORY MEDIUM: GRAPHITE PENCIL SKETCH ON PAPER ===
This artwork is a PENCIL SKETCH — NOT a painting. ZERO color. Rendered ENTIRELY in graphite pencil on textured cream/off-white paper. Show pencil hatching, cross-hatching, fine graphite lines, varying pencil pressure (light to dark). The entire image is shades of gray graphite — from light silvery marks to deep dark graphite black. Paper texture visible. DENSE graphite shading covers entire surface to every edge — all four corners have graphite tone. NO blank white paper as border.
CRITICAL: This is BLACK AND WHITE graphite only. No paint, no color, no brushstrokes, no oil texture, no varnish, no canvas.
QUALITY: Master draughtsman pencil portrait — like a John Singer Sargent or Ingres graphite study.`;

    case "watercolor":
      return `

=== MANDATORY MEDIUM: WATERCOLOR PAINTING ON PAPER ===
This artwork is a WATERCOLOR — NOT oil painting. Render with transparent watercolor washes, visible water blooms and soft color bleeds, granulation of pigment, wet-on-wet soft transitions, fine details with small brush. The luminosity comes from white paper showing through transparent washes — NOT from thick paint. Colors are luminous and airy, not heavy or opaque. ENTIRE paper pre-toned with background wash — covers every corner. Zero white paper as border.
CRITICAL: Transparent washes, NOT thick opaque paint. No impasto, no craquelure, no varnish, no canvas texture.
QUALITY: Royal Watercolour Society exhibition quality — like a Turner or Sargent watercolor.`;

    case "charcoal":
      return `

=== MANDATORY MEDIUM: CHARCOAL DRAWING ON PAPER ===
This artwork is a CHARCOAL DRAWING — NOT a painting. ZERO color. Rendered ENTIRELY in charcoal on textured paper. Show bold charcoal strokes, smudged tonal areas, dramatic darks, lifted highlights with eraser, visible charcoal grain and powder texture. Deep velvety blacks contrasting with lighter areas. Heavy charcoal tones fill entire background to every edge — all four corners have charcoal tone. NO blank white paper.
CRITICAL: This is BLACK AND WHITE charcoal only. No paint, no color, no brushstrokes, no oil texture, no varnish, no canvas.
QUALITY: Master charcoal portrait — like a Käthe Kollwitz or Robert Longo charcoal work.`;

    case "pastel":
      return `

=== MANDATORY MEDIUM: SOFT PASTEL ARTWORK ON PAPER ===
This artwork is a SOFT PASTEL — NOT oil painting. Render with rich, chalky pastel pigment strokes on toned paper. Show visible pastel texture — soft blended areas AND distinct pastel strokes/marks. Slightly dusty, powdery surface quality. Colors are soft, slightly muted/chalky compared to oil. Dense pastel pigment covers ENTIRE image surface — background, subject, every corner. 100% covered edge to edge. NO blank area, NO exposed paper edge, NO mat, NO paspatu, NO border.
CRITICAL: Chalky pastel texture, NOT smooth oil paint. No impasto, no craquelure, no varnish, no canvas.
QUALITY: Exhibition pastel portrait — like a Degas or Mary Cassatt pastel.`;

    default:
      return "";
  }
}

// ---------- format block (MEDIUM-AGNOSTIC) ----------

function getFormatBlock(style: string): string {
  // Quality markers vary by medium
  const isOil = style === "oil-painting";
  const isAcrylic = style === "acrylic";
  const isPaint = isOil || isAcrylic;
  const isPaper = ["pencil-sketch", "watercolor", "charcoal", "pastel"].includes(style);

  const qualityLine = isPaint
    ? "Subject 2-3 stops brighter than background — subject GLOWS; rim light on hair/shoulders/fur."
    : "Subject lighter/more detailed than background — subject is the clear focal point; tonal separation from background.";

  const surfaceLine = isPaper
    ? "For paper media: background tones/washes/shading cover entire surface corner to corner."
    : "Artwork fills entire frame edge to edge.";

  return `

${qualityLine} Indistinguishable from a masterwork in a museum or gallery.

Format — SUBJECT 60-70% & FULL BLEED (artwork covers 100% of surface):
${surfaceLine} All four corners contain content at full density. Image looks like a crop FROM a larger artwork. Show ONLY the artwork — no frame, no edge, no wall, no easel. Animals ALERT and DIGNIFIED.
Warm, uplifting mood. Subject should appear dignified and content. Simple composition.
For family/kids: 2-4 people max, avoid crowded scenes. Wholesome, child-safe.

Negative prompt (always apply):
No vignette, no faded edges, no radial gradient, no blank margins, no white borders, no empty corners, no oval fade, no medallion composition, no frames, no mat, no paspatu, no passepartout, no mounting, no canvas/paper edges as border, no easel, no wall, no visible borders, no rounded corners.
No illustration style, no cartoon, no anime. No sad expressions, no depressed mood.`;
}

// ---------- variation dimensions ----------

type VariationDimensions = {
  subjects: string[];
  poses: string[];
  angles: string[];
};

const categoryDimensions: Record<string, VariationDimensions> = {
  pets: {
    subjects: ["golden retriever", "tabby cat", "black labrador", "siamese cat", "german shepherd", "persian cat", "beagle", "dachshund", "bengal cat"],
    poses: ["profile view", "facing forward", "sitting upright", "lying down gracefully", "alert pose", "head tilted", "ears perked"],
    angles: ["close-up", "three-quarter view", "head and shoulders", "slightly from above", "low angle looking up"],
  },
  family: {
    subjects: ["parents with two children", "grandparents with grandchildren side by side", "siblings laughing together", "single parent with child", "extended family 2-4 people", "father and daughter", "mother and son"],
    poses: ["joyful smiling", "warm and tender", "laughing together", "playful", "happy content", "cheerful", "radiant"],
    angles: ["three-quarter group", "front-facing", "natural candid", "slightly from above", "intimate close grouping"],
  },
  kids: {
    subjects: ["toddler", "school-age child", "baby", "preteen", "child with toy"],
    poses: ["joyful smiling", "playful curious", "gentle serene", "active energetic", "peaceful", "concentrated focus"],
    angles: ["close-up face", "three-quarter", "full upper body", "slightly from above", "candid side angle"],
  },
  couples: {
    subjects: ["young man and woman couple", "middle-aged man and woman", "mixed-gender couple", "newlyweds", "long-term partners"],
    poses: ["romantic tender smiling", "joyful laughing together", "warm embrace", "forehead touch content", "dancing pose", "cheerful together"],
    angles: ["three-quarter", "front-facing", "intimate close-up", "profile embrace", "natural candid"],
  },
  "self-portrait": {
    subjects: ["young woman", "young man", "middle-aged woman", "middle-aged man", "older woman", "older man"],
    poses: ["warm smile", "gentle smile", "confident friendly gaze", "relaxed content", "joyful expression", "approachable"],
    angles: ["close-up face", "upper body", "three-quarter angle", "profile", "slightly from above"],
  },
};

function buildVariationFromDimensions(category: string, imgIndex: number, style: string, moodOffset: number): string {
  const dims = categoryDimensions[category];
  if (!dims) return categoryLabels[category] || "portrait";

  const i = imgIndex - 1;
  const styleOffset = (STYLE_ORDER.indexOf(style) + 1) * 3;
  const totalOffset = styleOffset + moodOffset;
  const subject = dims.subjects[(i + totalOffset) % dims.subjects.length];
  const pose = dims.poses[(i + 1 + totalOffset) % dims.poses.length];
  const angle = dims.angles[(i + 2 + totalOffset) % dims.angles.length];

  return `${subject}, ${pose}, ${angle} angle`;
}

// ---------- prompt builder ----------

/**
 * Prompt structure (order matters — last instruction wins):
 * 1. MEDIUM declaration (what it IS) — first and last position for maximum weight
 * 2. Subject variation
 * 3. Mood THEME (costume, setting, lighting concept — NO medium language)
 * 4. Format block (medium-agnostic)
 * 5. MEDIUM rendering block (STRONG override at the END — this is what the model sees last)
 */
export function buildGenerationPrompt(
  style: string,
  category: string,
  imgIndex?: number,
  mood?: MoodId
): string {
  const technique = styleTechniqueNames[style] || "oil painting";
  const mediumBlock = getMediumBlock(style);
  const formatBlock = getFormatBlock(style);

  const moodOffset = mood ? MOODS.indexOf(mood) * 7 : 0;
  const variation =
    imgIndex !== undefined && imgIndex > 0
      ? buildVariationFromDimensions(category, imgIndex, style, moodOffset)
      : categoryLabels[category] || "portrait";

  if (mood && MOOD_THEME_PROMPTS[mood]) {
    const moodTheme = MOOD_THEME_PROMPTS[mood];
    // Medium declared FIRST, then theme, then medium AGAIN at end (sandwich)
    return `Create a ${technique} of ${variation}. This MUST be a ${technique} — not any other medium.

${moodTheme}
${formatBlock}
${mediumBlock}`;
  }

  // No mood: classic generation
  return `Create a unique, distinctive handmade ${technique} of a ${variation}. This MUST be a ${technique} — not any other medium. The subject should appear happy, warm, or content. Make the composition, subject, pose, expression, and setting distinctly different.
${formatBlock}
${mediumBlock}`;
}

// ---------- image generation ----------

export async function generateGalleryImage(
  style: string,
  category: string,
  imgIndex?: number,
  mood?: MoodId
): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is required. Set it in .env");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:4" },
    } as any,
  });

  const prompt = buildGenerationPrompt(style, category, imgIndex, mood);
  const result = await model.generateContent([{ text: prompt }]);
  const parts = result.response.candidates?.[0]?.content?.parts;

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

// --- Preset thumbnails (for style picker UI) ---
const PRESET_IDS = ["none", "intelligent", "neoclassical", "royal_noble", "heritage"] as const;

const PRESET_THUMBNAIL_PROMPTS: Record<(typeof PRESET_IDS)[number], string> = {
  none:
    "Create a classic handmade oil painting of a portrait subject. Use authentic oil painting techniques. The result must look like a photorealistic painting—warm, timeless, no extra mood. Subject should appear content and the composition clean.",
  intelligent:
    "Create an appealing, artistically curated handmade oil painting portrait that looks like the best possible style choice for the subject. Use authentic oil painting techniques. Sophisticated and versatile.",
  royal_noble:
    "A majestic oil painting portrait immersed in absolute royal opulence. Crown, heavy crimson velvet mantle with ermine fur, golden scepter, baroque palace. Rich theatrical chiaroscuro.",
  neoclassical:
    "A sober, elegant oil painting portrait in Neoclassical style. Marble columns, Greco-Roman draped fabrics, laurel wreath, golden light. Claude Lorrain romantic landscape.",
  heritage:
    "A rich, warm oil painting portrait capturing Old Money essence. Ancestral library, dark wood paneling, tweed, leather. Gainsborough-style soft atmospheric background.",
};

export function buildPresetThumbnailPrompt(presetId: string): string {
  const base = PRESET_THUMBNAIL_PROMPTS[presetId as (typeof PRESET_IDS)[number]] ?? PRESET_THUMBNAIL_PROMPTS.none;
  const fmt = getFormatBlock("oil-painting");
  const med = getMediumBlock("oil-painting");
  return base + " Warm, uplifting mood." + fmt + med;
}

export async function generatePresetThumbnailImage(presetId: string): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is required. Set it in .env");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:4" },
    } as any,
  });

  const prompt = buildPresetThumbnailPrompt(presetId);
  const result = await model.generateContent([{ text: prompt }]);
  const parts = result.response.candidates?.[0]?.content?.parts;

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

export { PRESET_IDS };
