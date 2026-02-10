/**
 * Builds generation prompt segments from the canonical prompt-template.json (v5.1).
 * Single source of truth: docs/prompt-template.json is copied to shared/prompt-template.json.
 * Used by server (routes) and client (style-presets).
 */

import raw from "./prompt-template.json";

type MoodId = "royal_noble" | "neoclassical" | "heritage";

const t = raw as unknown as {
  identity: { humans: string; animals: string };
  format: {
    full_bleed: { rule: string; paper_styles: string };
    negative_prompt: string;
  };
  critical_rules: string[];
  moods: Record<
    MoodId,
    {
      concept: string;
      attire_humans: Record<string, unknown>;
      attire_animals: Record<string, unknown>;
      background: Record<string, unknown>;
      lighting: string;
      palette: string[];
    }
  >;
  styles: Record<
    string,
    {
      medium?: string;
      technique?: string;
      coverage?: string;
      full_coverage?: string;
      negative_prompt?: string;
    }
  >;
};

/** Identity anchor — format.identity from JSON. */
export function getIdentityAnchor(category?: string): string {
  const isPet = category === "pets";
  if (isPet) {
    return `CRITICAL IDENTITY RULE: Preserve the subject's exact breed, fur color/pattern, markings, ear shape, eye color, body proportions, and facial expression from the original photo. Do NOT alter, idealize, or stylize any physical feature.`;
  }
  return `CRITICAL IDENTITY RULE: Preserve the subject's EXACT facial features, face shape, bone structure, eye color, eye shape, nose shape, lip shape, skin tone, skin texture, facial hair (beard, mustache, stubble — keep or remove NOTHING), hairstyle, hair color, hair length, and facial expression from the original photo. The face in the output must be recognizable as the SAME person. Do NOT alter, idealize, beautify, age, de-age, or stylize ANY facial or hair feature. The expression must match the original photo exactly — do not make the subject smile, look serious, or change their gaze direction.`;
}

/**
 * Strong identity guard — placed at the START of prompts to prevent the model
 * from altering faces, hair, or expressions. More assertive than the anchor.
 */
export function getIdentityGuard(category?: string): string {
  const isPet = category === "pets";
  if (isPet) {
    return `ABSOLUTE RULE — DO NOT MODIFY THE SUBJECT'S APPEARANCE: The animal's face, body, breed, fur, markings, ear shape, eye color, and expression must be pixel-level faithful to the input photo. Change ONLY the art medium, background, lighting, and any requested attire/accessories. The subject's physical appearance is LOCKED.`;
  }
  return `ABSOLUTE RULE — DO NOT MODIFY THE SUBJECT'S FACE, HAIR, OR EXPRESSION: The person's facial features, face shape, skin tone, facial hair, hairstyle, hair color, and facial expression must be pixel-level faithful to the input photo. Change ONLY the art medium, clothing/attire, background, and lighting. The subject's face and hair are LOCKED — treat them as a sacred reference that cannot be altered, idealized, or stylized in any way.`;
}

/** Format block — format.full_bleed + critical_rules (museum) + format.negative_prompt from JSON. */
export function getFormatBlock(): string {
  const museum = t.critical_rules[0] ?? "MUSEUM QUALITY — every output must look like it belongs in a national gallery";
  const subjectStar = t.critical_rules[1] ?? "THE SUBJECT IS THE STAR — 60-70% of frame, sharpest detail, brightest light";
  return `

${museum}: Visible brushstrokes, craquelure, warm varnish sheen; ${subjectStar} — subject GLOWS; rim light on hair/shoulders/fur; Rembrandt triangle on faces. Indistinguishable from a painting in the National Gallery or the Met.

Format — SUBJECT 60-70% & FULL BLEED (artwork covers 100% of surface):
${t.format.full_bleed.rule} ${t.format.full_bleed.paper_styles} Show ONLY the artwork — no frame, no canvas/paper edge, no wall, no easel. Animals ALERT and DIGNIFIED.

Negative prompt (always apply):
${t.format.negative_prompt}
No altered facial features, no changed facial expression, no changed hairstyle, no added or removed facial hair, no idealized or beautified face, no aged or de-aged face, no changed skin tone, no changed eye color, no changed nose shape, no changed lip shape.`;
}

/** Style block — styles[id] from JSON: medium + technique + coverage + negative_prompt. */
export function getStyleBlock(styleId: string): string {
  const s = t.styles[styleId];
  if (!s) return "";
  const coverage = s.full_coverage ?? s.coverage ?? "";
  const neg = s.negative_prompt ? ` Negative: ${s.negative_prompt}.` : "";
  return ` ${s.medium}. ${s.technique}. ${coverage}.${neg}`;
}

function flattenAttire(obj: Record<string, unknown> | null | undefined): string[] {
  if (!obj || typeof obj !== "object") return [];
  const out: string[] = [];
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) out.push(v.map(String).join(", "));
    else if (typeof v === "string" && v.trim()) out.push(v.trim());
  }
  return out;
}

/**
 * Builds the mood preset prompt from JSON. Returns string with [MEDIUM] and [SUBJECT] placeholders;
 * caller (e.g. style-presets resolveStylePresetPrompt) replaces them.
 * Output is clear, punctuated, and safe for the model (no raw objects or run-on text).
 */
export function buildMoodPrompt(moodId: MoodId): string {
  const m = t.moods[moodId];
  if (!m) return "";

  const parts: string[] = [];

  parts.push("[MEDIUM] portrait of [SUBJECT]. Authentic masterwork painting — not AI-generated, not photo filter; depth and craftsmanship of Old Masters.");
  parts.push(m.concept);
  parts.push("SUBJECT 60-70% of frame.");

  const animalBits = flattenAttire(m.attire_animals as Record<string, unknown>);
  if (animalBits.length) {
    parts.push(`If [SUBJECT] is an animal: ATTIRE — ANIMALS ONLY — ${animalBits.join(". ")}.`);
  }

  const humanBits = flattenAttire(m.attire_humans as Record<string, unknown>);
  if (humanBits.length) {
    parts.push(`If human: vary creatively — ${humanBits.join("; ")}.`);
  }

  const bg = m.background as {
    type?: string;
    description?: string;
    elements?: string[];
    technique?: string;
    priority?: string;
    interior?: { label?: string; elements?: string[] };
    exterior?: { label?: string; elements?: string[] };
    brightness?: string;
    style_reference?: string;
    narrative?: string;
    atmosphere?: string;
  } | null;
  if (bg?.type) {
    let bgLine = `BACKGROUND — ${bg.type}`;
    if (bg.description) bgLine += `: ${bg.description}`;
    if (Array.isArray(bg.elements) && bg.elements.length) bgLine += ` ${bg.elements.join("; ")}`;
    if (bg.priority) bgLine += `. ${bg.priority}`;
    if (bg.interior) {
      const el = bg.interior.elements;
      if (Array.isArray(el) && el.length) bgLine += ` Interior: ${el.join("; ")}`;
    }
    if (bg.exterior) {
      const el = bg.exterior.elements;
      if (Array.isArray(el) && el.length) bgLine += ` Exterior: ${el.join("; ")}`;
    }
    if (bg.technique) bgLine += ` ${bg.technique}`;
    if (bg.style_reference) bgLine += ` (${bg.style_reference})`;
    if (bg.narrative) bgLine += ` ${bg.narrative}`;
    if (bg.atmosphere) bgLine += ` ${bg.atmosphere}`;
    if (bg.brightness) bgLine += ` ${bg.brightness}`;
    parts.push(bgLine.trim() + ".");
  }

  parts.push(`LIGHTING: ${m.lighting}`);
  parts.push(`PALETTE: ${m.palette.join(", ")}.`);

  return parts.join(" ");
}
