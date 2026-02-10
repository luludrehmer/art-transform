#!/usr/bin/env tsx
/**
 * Test script: generates mood × medium variant images (text-only, no source photo).
 * Verifies that each mood (Royal, Neoclassical, Heritage) actually changes the output
 * when combined with each medium (Oil, Pencil, Watercolor, etc.).
 *
 * Run:  npx tsx scripts/test-mood-variants.ts
 * Or:   npx tsx scripts/test-mood-variants.ts --only=royal_noble
 * Or:   npx tsx scripts/test-mood-variants.ts --only=royal_noble-oil-painting,heritage-pencil-sketch
 * Or:   npx tsx scripts/test-mood-variants.ts --mood=royal_noble --medium=oil-painting
 */

import "dotenv/config";
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "client", "src", "assets", "mood");
const DELAY_MS = 2000;
const MAX_RETRIES = 2;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// ---------- mood × medium definitions ----------

const MOODS = ["royal_noble", "neoclassical", "heritage"] as const;
type MoodId = (typeof MOODS)[number];

const MOOD_LABELS: Record<MoodId, string> = {
  royal_noble: "Royal",
  neoclassical: "Neoclassical",
  heritage: "Heritage",
};

const MEDIUMS = [
  "oil-painting",
  "pencil-sketch",
  "watercolor",
  "acrylic",
  "charcoal",
  "pastel",
] as const;

const MEDIUM_DISPLAY: Record<string, string> = {
  "oil-painting": "Oil Painting",
  acrylic: "Acrylic",
  "pencil-sketch": "Pencil Sketch",
  watercolor: "Watercolor",
  charcoal: "Charcoal",
  pastel: "Pastel",
};

const MEDIUM_TECHNIQUE: Record<string, string> = {
  "oil-painting": "oil painting",
  acrylic: "acrylic painting",
  "pencil-sketch": "pencil sketch",
  watercolor: "watercolor painting",
  charcoal: "charcoal drawing",
  pastel: "pastel artwork",
};

/**
 * Mood prompts from docs/PROMPT-TEMPLATE.md v5 — museum-quality, PAINTED SCENE backgrounds, vary creatively.
 */
const MOOD_PROMPTS: Record<MoodId, string> = {
  royal_noble: `[MEDIUM] portrait of [SUBJECT]. Authentic masterwork painting — not AI-generated, not photo filter; depth and craftsmanship of Old Masters. THE SUBJECT IS A MONARCH. SUBJECT 60-70% of frame. CRITICAL: If [SUBJECT] is an animal: ATTIRE — ANIMALS ONLY — vary creatively: heavy mantle/cape (color, fabric, trim), royal headpiece (crown, coronet, circlet, tiara), jeweled collar or gold chain with medallion, heraldic embroidery on mantle (lions, eagles, crowns), fur trim (ermine, sable), on ornate cushion (damask/velvet/silk, tassels). If human: vary creatively — robes/capes in jewel tones (burgundy, plum, navy, emerald, crimson), fur trim, rich embroidery (gold/silver, heraldic motifs), lace (Belgian/Venetian), crown/tiara/diadem ALWAYS present, layered jewelry (necklaces, brooches, rings, chains of office), hand props (scepter, orb, flower, fan, sealed letter), fabrics (velvet, brocade, damask); children: small crown, scaled robe. BACKGROUND — PAINTED OLD MASTERS SCENE (not flat, not blurred): deep rich darkness with visible brushwork; heavy velvet curtains with fabric folds, palace interior glimpse (column, archway, faint window) OR dramatic clouded Turner-esque sky; background darker than subject but with detail and depth; rich color in shadows (navy, umber, warm black, burgundy). LIGHTING: Caravaggio-level chiaroscuro, strong warm upper-left, subject glows against shadow. PALETTE: burgundy, navy, gold, ivory, ermine white, deep purple, crimson, black.`,
  neoclassical: `[MEDIUM] portrait of [SUBJECT]. Authentic masterwork painting — not AI-generated, not photo filter; depth and craftsmanship of Old Masters. THE SUBJECT IS A GREEK/ROMAN DEITY OR MUSE. SUBJECT 60-70% of frame. CRITICAL: If [SUBJECT] is an animal: ATTIRE — ANIMALS ONLY — draped linen/silk over shoulders (toga-like), crown (laurel, olive, vine, gold diadem), gold chain with classical medallion (owl, eagle, sun, lyre), on carved marble pedestal with classical relief. If human: vary creatively — toga/chiton/himation (white, cream, ivory), colored accents (terracotta, olive, gold, sage), crown ALWAYS (laurel, olive, gold diadem, vine, myrtle), gold fibula/brooch, gold cuff, signet ring, chain with pendant, classical hair (curls, braids, gold pins); children: white tunic, small wreath, gold pendant. BACKGROUND — PAINTED ROMANTIC LANDSCAPE (Claude Lorrain, Poussin, Thomas Cole style): rolling Tuscan/Greek hills, atmospheric perspective; ancient trees with expressive brushwork; dramatic golden-hour sky (peach, amber, pink); classical ruins (broken column, archway, temple fragment); wild grasses, wildflowers, mossy stone; visible brushstrokes, painterly; atmospheric haze with distance. LIGHTING: warm golden Mediterranean, late afternoon sun, sfumato on skin, warm edge light catching crown/wreath and hair/fur edges creating luminous separation (NOT a religious halo or aureola — purely a rim light technique, NOT a glowing circle). PALETTE: warm gold, ochre, terracotta, olive, cream, marble white, sage, sky blue.`,
  heritage: `[MEDIUM] portrait of [SUBJECT]. Authentic masterwork painting — not AI-generated, not photo filter; depth and craftsmanship of Old Masters. THE SUBJECT IS OLD MONEY ARISTOCRACY. SUBJECT 60-70% of frame. CRITICAL: If [SUBJECT] is an animal: ATTIRE — ANIMALS ONLY — Heritage animals are NOT bare — they have VISIBLE high-quality accessories: collar ALWAYS PRESENT (fine leather oxblood/British tan with brass buckle and engraved crest tag; OR tartan collar Stewart/Blackwatch with gold charm; OR pearl-studded with pendant); additional accessories vary creatively (tweed vest/coat herringbone/houndstooth, cashmere blanket over haunches, silk neckerchief/bow); props nearby (leather-bound book, riding crop, top hat, pocket watch); impeccably groomed to a sheen; positioned as prized estate companion on Persian rug, beside Chesterfield, on tartan blanket. If human: vary creatively — men: frock coat, morning coat, hunting/riding coat, waistcoat, silk cravat/ascot, high-collar shirt; women: high-collar dress, riding habit, tea gown, raw silk, cashmere, taffeta; accessories (cashmere shawl, leather gloves, leather-bound book, pocket watch, cameo, pearls); heirloom jewelry (signet ring, pearl earrings, thin bracelet, pocket watch chain); colors ALWAYS muted (charcoal, camel, hunter green, oxblood, navy, slate, taupe, cream); everything INHERITED; children: Peter Pan collar, sailor suit, pinafore, knee shorts, hair ribbon. BACKGROUND — PAINTED ENGLISH/EUROPEAN SETTING (SECONDARY to subject — all elements SUGGESTED with soft atmospheric brushwork, loose color masses, NOT sharp details; background 2-3 stops DARKER than subject; think Gainsborough/Reynolds): interior (wood-paneled study SOFTLY suggested — books as blurred masses, ancestral portrait barely discernible, fireplace amber glow implied, dark curtain folds, furniture as dark shapes in shadow) OR exterior (overcast atmospheric sky, rolling greens dissolving into mist, stone manor as tiny silhouette); loose brushwork, never competing with subject. LIGHTING: cool natural side light (sash windows), refined; warm amber from fireplace; soft highlights on fabric. PALETTE: charcoal, taupe, hunter green, oxblood, cream, burnished gold, tobacco, slate.`,
};

const SUBJECTS = [
  "a golden retriever dog",
  "a young woman with a warm smile",
  "a family of four",
];

/** From docs/PROMPT-TEMPLATE.md v5.1 — FORMAT & NEGATIVE PROMPT. */
const FORMAT_BLOCK = `

MUSEUM QUALITY: Visible brushstrokes, craquelure, warm varnish sheen; subject 2-3 stops brighter than background — subject GLOWS; rim light on hair/shoulders/fur; Rembrandt triangle on faces. Indistinguishable from a painting in the National Gallery or the Met.

Format — SUBJECT 60-70% & FULL BLEED (artwork covers 100% of surface):
OUTPUT ASPECT RATIO: If the input image is vertical/portrait → 3:4. If horizontal/landscape → 4:3. Always normalize to 3:4 or 4:3.
Artwork fills entire frame edge to edge. All four corners contain painted/drawn content at full density. Image looks like a crop FROM a larger painting. For paper styles: background tones/washes cover entire surface corner to corner. Show ONLY the artwork — no frame, no canvas/paper edge, no wall, no easel. Animals ALERT and DIGNIFIED.

Negative prompt (always apply):
No vignette, no faded edges, no radial gradient, no blank margins, no white borders, no empty corners, no oval fade, no medallion composition, no frames, no mat, no paspatu, no passepartout, no mounting, no canvas/paper edges as border, no easel, no wall, no visible borders, no rounded corners.`;

// ---------- prompt builder (mirrors server buildPrompt logic) ----------

function buildTestPrompt(mood: MoodId, medium: string, subjectIndex: number): string {
  const technique = MEDIUM_TECHNIQUE[medium] || "oil painting";
  const displayName = MEDIUM_DISPLAY[medium] || "Oil Painting";
  const subject = SUBJECTS[subjectIndex % SUBJECTS.length];

  const moodText = MOOD_PROMPTS[mood]
    .replace(/\[MEDIUM\]/g, displayName)
    .replace(/\[SUBJECT\]/g, subject);

  let styleSuffix = ` The result must be a realistic handmade ${technique} using authentic ${technique} techniques.`;
  if (medium === "oil-painting") {
    styleSuffix += " Oil on canvas. Old Masters: Rembrandt, Velázquez, Van Dyck, Reynolds, Gainsborough, Lawrence. Visible impasto on highlights, smooth glazes on shadows. Craquelure aging. Warm amber varnish. Canvas weave in dark areas. Looks like a 200-year-old painting freshly cleaned. Oil paint covers every inch of canvas edge to edge.";
  } else if (medium === "acrylic") {
    styleSuffix += " Acrylic on canvas. Bold saturated color, smooth-to-textured blending, classical composition. Visible brush texture. Paint covers every inch of canvas edge to edge.";
  } else if (medium === "pencil-sketch") {
    styleSuffix += " Graphite on textured paper. FULL COVERAGE: DENSE graphite shading over entire paper to every edge and corner; drawing extends beyond frame as crop from larger sheet; all four corners have graphite tone. No blank paper margin. No white border. Negative: no color, no blank margins, no white borders, no empty corners, no vignette, no oval fade.";
  } else if (medium === "watercolor") {
    styleSuffix += " Watercolor on cold-pressed paper. FULL COVERAGE: ENTIRE paper pre-toned with background wash (mood-appropriate) before subject — wash covers every corner and edge; zero white paper as border. Background wash extends to all edges. Negative: no white paper border, no blank margins, no unpainted edges, no white corners.";
  } else if (medium === "charcoal") {
    styleSuffix += " Charcoal on paper. FULL COVERAGE: Heavy charcoal tones (blacks, grays, smudges) fill entire background to every edge and corner; extends beyond visible frame; all four corners have charcoal tone. No blank paper. No white border. Negative: no color, no blank margins, no white borders, no empty corners, no vignette.";
  } else if (medium === "pastel") {
    styleSuffix += " Soft pastel artwork. Velvety chalky texture, Degas-inspired. Dense pastel pigment covers the ENTIRE image surface — background, subject, every corner and edge. The background is filled with rich, layered pastel strokes in mood-appropriate colors reaching all four edges. There is NO blank area, NO exposed paper edge, NO mat, NO border, NO paspatu anywhere. The image is 100% covered with pastel artwork from edge to edge — as if cropped from a larger pastel painting. Negative: no mat, no paspatu, no border, no paper edge, no white area, no blank margin, no frame, no mounting.";
  }

  return `Create an artwork that fulfills this exact vision: ${moodText}${styleSuffix}${FORMAT_BLOCK}`;
}

// ---------- generation ----------

function extractBase64(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return Buffer.from(match[1], "base64");
}

async function generateImage(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:4" },
    } as any,
  });
  const result = await model.generateContent([{ text: prompt }]);
  const parts = result.response.candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("No image from Gemini");
  for (const part of parts) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data in response");
}

// ---------- CLI args ----------

type Task = { mood: MoodId; medium: string; subjectIndex: number };

function parseTasks(): Task[] {
  const moodArg = process.argv.find((a) => a.startsWith("--mood="))?.slice(7);
  const mediumArg = process.argv.find((a) => a.startsWith("--medium="))?.slice(9);
  const onlyArg = process.argv.find((a) => a.startsWith("--only="))?.slice(7);

  // --only=royal_noble-oil-painting,heritage-pencil-sketch
  if (onlyArg) {
    const tasks: Task[] = [];
    for (const item of onlyArg.split(",").map((s) => s.trim()).filter(Boolean)) {
      for (const mood of MOODS) {
        if (item.startsWith(mood + "-")) {
          const medium = item.slice(mood.length + 1);
          if (MEDIUMS.includes(medium as any)) {
            tasks.push({ mood, medium, subjectIndex: 0 });
          }
        }
      }
      // --only=royal_noble (all mediums for that mood)
      if (MOODS.includes(item as any) && !tasks.some((t) => t.mood === item)) {
        for (const medium of MEDIUMS) {
          tasks.push({ mood: item as MoodId, medium, subjectIndex: 0 });
        }
      }
    }
    return tasks;
  }

  // --mood=royal_noble --medium=oil-painting
  if (moodArg || mediumArg) {
    const moods = moodArg ? [moodArg as MoodId] : [...MOODS];
    const mediums = mediumArg ? [mediumArg] : [...MEDIUMS];
    return moods.flatMap((mood) => mediums.map((medium) => ({ mood, medium, subjectIndex: 0 })));
  }

  // Default: all moods × all mediums (first subject only to keep it manageable)
  return MOODS.flatMap((mood) =>
    MEDIUMS.map((medium) => ({ mood, medium, subjectIndex: 0 }))
  );
}

// ---------- main ----------

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY not set. Add it to .env");
    process.exit(1);
  }

  const tasks = parseTasks();
  console.log("=== Mood × Medium Test Generator ===");
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Tasks:  ${tasks.length} images (${MOODS.length} moods × ${MEDIUMS.length} mediums)`);
  console.log("");

  await mkdir(OUTPUT_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < tasks.length; i++) {
    const { mood, medium, subjectIndex } = tasks[i];
    const filename = `${mood}--${medium}.png`;
    const outputPath = join(OUTPUT_DIR, filename);
    const prompt = buildTestPrompt(mood, medium, subjectIndex);

    console.log(`[${i + 1}/${tasks.length}] ${MOOD_LABELS[mood]} + ${MEDIUM_DISPLAY[medium] || medium}`);
    console.log(`  Prompt: ${prompt.slice(0, 120)}…`);

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const dataUrl = await generateImage(prompt);
        await writeFile(outputPath, extractBase64(dataUrl));
        console.log(`  ✅ ${filename}`);
        ok++;
        success = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt < MAX_RETRIES) {
          console.log(`  ⚠️  Retry ${attempt}/${MAX_RETRIES}: ${msg}`);
          await new Promise((r) => setTimeout(r, DELAY_MS));
        } else {
          console.error(`  ❌ FAILED: ${msg}`);
          fail++;
        }
      }
    }

    if (i < tasks.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("");
  console.log(`Done. ${ok} succeeded, ${fail} failed.`);
  console.log(`Images saved to: ${OUTPUT_DIR}`);

  if (fail > 0) process.exitCode = 1;
}

main();
