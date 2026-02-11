/**
 * Builds generation prompt segments from the canonical prompt-template.json (v8.6).
 * Single source of truth: shared/prompt-template.json.
 * Used by server (routes) and client (style-presets).
 */

import raw from "./prompt-template.json";

type MoodId = "royal_noble" | "neoclassical" | "heritage";

const t = raw as unknown as {
  IDENTITY_LOCK: {
    _priority: string;
    face: { preserve: string; never: string };
    expression: { preserve: string; never: string };
    hair: { preserve: string; headpieces: string; never: string };
    animals: { preserve: string };
  };
  system: {
    role: string;
    you_change: string;
    you_never_change: string;
    quality: string;
    hierarchy: string;
    attention: string;
    lighting_and_atmosphere: string;
    user_intent_detection: string;
  };
  subject_analysis: { detect: string[]; never: string };
  composition: { rule: string; extension: string; groups: string; format_for_groups: string };
  moods: Record<
    MoodId,
    {
      id: string;
      label: string;
      vibe: string;
      attire: { vibe: string; never?: string };
      attire_animals: { vibe: string };
      background: { vibe: string; never?: string };
      lighting: string;
      palette_color: string;
      palette_monochrome: string;
    }
  >;
  styles: Record<
    string,
    {
      id?: string;
      label?: string;
      is_color?: boolean;
      vibe?: string;
      face?: string;
      everything_else?: string;
      surface?: string;
      lighting?: string;
      coverage?: string;
      palette_handling?: string;
      never?: string;
      // universal keys
      marks?: string;
      masters_note?: string;
      ornament_rule?: string;
    }
  >;
  format: {
    aspect_ratio: { vertical: string; horizontal: string; rule: string; group_override: string };
    full_bleed: string;
    never: string;
  };
  multi_photo_intelligence: {
    _description: string;
    analysis: string;
    same_person_multiple_angles: string;
    different_people: string;
    mixed_scenario: string;
    group_composition: string;
    single_photo_fallback: string;
    never: string;
  };
  identity_negative_prompt: string;
  ornament_negative_prompt: string;
  critical_rules: string[];
};

const MULTI_PERSON_CATEGORIES = ["family", "kids", "couples"];

/** Identity anchor — concise identity preservation statement. */
export function getIdentityAnchor(category?: string): string {
  const isPet = category === "pets";
  const isMulti = category ? MULTI_PERSON_CATEGORIES.includes(category) : false;
  if (isPet) {
    return `CRITICAL IDENTITY RULE: ${t.IDENTITY_LOCK.animals.preserve} Do NOT alter, idealize, or stylize any physical feature.`;
  }
  const subjectRef = isMulti ? "EVERY person" : "every subject";
  const faceRef = isMulti ? "Each face" : "Each face";
  return `CRITICAL IDENTITY RULE: Preserve ${subjectRef}'s EXACT likeness — ${t.IDENTITY_LOCK.face.preserve} ${t.IDENTITY_LOCK.expression.preserve} ${t.IDENTITY_LOCK.hair.preserve} ${faceRef} in the output must be recognizable as the SAME person from the reference. ${t.IDENTITY_LOCK.face.never} ${t.IDENTITY_LOCK.expression.never} Include ALL unique people from the reference photo(s) — do NOT drop, merge, or omit anyone.`;
}

/**
 * Strong identity guard — placed at the START of prompts to prevent the model
 * from altering faces, hair, or expressions. Most assertive statement.
 */
export function getIdentityGuard(category?: string): string {
  const isPet = category === "pets";
  const isMulti = category ? MULTI_PERSON_CATEGORIES.includes(category) : false;
  if (isPet) {
    return `ABSOLUTE RULE — DO NOT MODIFY THE SUBJECT'S APPEARANCE: ${t.IDENTITY_LOCK._priority} ${t.IDENTITY_LOCK.animals.preserve} Change ONLY the art medium, background, lighting, and any requested attire/accessories. The subject's physical appearance is LOCKED.`;
  }
  if (isMulti) {
    return `ABSOLUTE RULE — INCLUDE EVERY PERSON FROM THE PHOTOS AND DO NOT MODIFY ANYONE'S FACE, HAIR, OR EXPRESSION: ${t.IDENTITY_LOCK._priority} Count every unique person across ALL input photos and include ALL of them in the output — same number, same relationships. ${t.IDENTITY_LOCK.face.preserve} ${t.IDENTITY_LOCK.hair.preserve} ${t.IDENTITY_LOCK.expression.preserve} Change ONLY the art medium, clothing/attire, background, and lighting. Every face and hairstyle is LOCKED.`;
  }
  return `ABSOLUTE RULE — DO NOT MODIFY THE SUBJECT(S) FACE, HAIR, OR EXPRESSION: ${t.IDENTITY_LOCK._priority} ${t.IDENTITY_LOCK.face.preserve} ${t.IDENTITY_LOCK.hair.preserve} ${t.IDENTITY_LOCK.expression.preserve} Change ONLY the art medium, clothing/attire, background, and lighting. If multiple reference photos are provided, detect whether they show the SAME person (use all for accuracy) or DIFFERENT people (include all in the portrait). Every face and hairstyle is LOCKED — treat them as a sacred reference that cannot be altered, idealized, or stylized in any way.`;
}

/**
 * Multi-photo intelligence instruction — appended to the prompt when
 * the user provides more than one reference photo.
 * Tells the model to act as a smart portrait wizard: analyze all photos,
 * detect same-person vs different-people, and compose accordingly.
 */
export function getMultiPhotoInstruction(photoCount: number): string {
  if (photoCount <= 1) return "";
  const mpi = t.multi_photo_intelligence;
  return `

MULTI-PHOTO INTELLIGENCE — ${photoCount} REFERENCE PHOTOS PROVIDED:
STEP 1: LOOK AT EVERY PHOTO. Count how many UNIQUE people appear across all ${photoCount} photos. Some photos may show the same person from different angles — use facial features to match them. List the unique individuals mentally before proceeding.
STEP 2: ${mpi.analysis}
STEP 3: ${mpi.same_person_multiple_angles}
STEP 4: ${mpi.different_people}
STEP 5: ${mpi.mixed_scenario}
STEP 6: ${mpi.group_composition}

CRITICAL OUTPUT RULE: The final portrait MUST contain ALL unique people you identified in Step 1. If you counted 4 unique people, the output MUST show exactly 4 people. If you counted 2, show exactly 2. NEVER drop anyone. NEVER show fewer people than you identified.

FORMAT FOR GROUPS: If 3+ unique people will be in the portrait, use HORIZONTAL/LANDSCAPE composition so everyone fits comfortably with full faces visible. Do not cram many people into a narrow vertical frame.

${mpi.never}`;
}

/** Format block — format rules + critical rules + negative prompts from JSON. */
export function getFormatBlock(): string {
  return `

${t.system.attention}
${t.system.lighting_and_atmosphere}

USER INTENT DETECTION:
${t.system.user_intent_detection}

Format — FULL BLEED:
${t.format.full_bleed}
${t.format.aspect_ratio.group_override}
${t.composition.format_for_groups}

Negative prompt (always apply):
${t.format.never}
${t.identity_negative_prompt}
${t.ornament_negative_prompt}`;
}

/** Style block — styles[id] from JSON: vibe + face + surface + coverage + never. */
export function getStyleBlock(styleId: string): string {
  const s = t.styles[styleId];
  if (!s) return "";
  const universal = t.styles.universal;
  const parts: string[] = [];
  if (s.vibe) parts.push(s.vibe);
  if (s.face) parts.push(`Face: ${s.face}`);
  if (s.everything_else) parts.push(s.everything_else);
  if (s.surface) parts.push(`Surface: ${s.surface}`);
  if (s.coverage) parts.push(`Coverage: ${s.coverage}`);
  if (s.palette_handling) parts.push(s.palette_handling);
  if (s.lighting) parts.push(`Lighting: ${s.lighting}`);
  if (s.never) parts.push(`NEVER: ${s.never}`);
  if (universal?.ornament_rule) parts.push(universal.ornament_rule);
  if (universal?.marks) parts.push(`Marks: ${universal.marks}`);
  return ` ${parts.join(". ")}.`;
}

/**
 * Builds the mood preset prompt from JSON. Returns string with [MEDIUM] and [SUBJECT] placeholders;
 * caller (e.g. style-presets resolveStylePresetPrompt) replaces them.
 * COMPACT version — keeps prompt focused to prevent identity dilution.
 */
export function buildMoodPrompt(moodId: MoodId): string {
  const m = t.moods[moodId];
  if (!m) return "";

  const parts: string[] = [];

  parts.push(`[MEDIUM] portrait of [SUBJECT]. ${t.system.quality}`);
  parts.push(m.vibe);

  // Attire
  parts.push(`Attire: ${m.attire.vibe}`);
  if (m.attire.never) parts.push(m.attire.never);
  // Hair protection reminder — prevents mood attire (crowns, headpieces) from reshaping hair
  parts.push(`HAIR REMINDER: ${t.IDENTITY_LOCK.hair.preserve} ${t.IDENTITY_LOCK.hair.headpieces} ${t.IDENTITY_LOCK.hair.never}`);
  parts.push(`If animal: ${m.attire_animals.vibe}`);

  // Background
  parts.push(`BACKGROUND: ${m.background.vibe}`);
  if (m.background.never) parts.push(m.background.never);

  // Lighting & palette
  parts.push(`LIGHTING: ${m.lighting}`);
  parts.push(`PALETTE (color): ${m.palette_color}`);
  parts.push(`PALETTE (monochrome): ${m.palette_monochrome}`);

  return parts.join(" ");
}
