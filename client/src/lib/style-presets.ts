import { buildMoodPrompt } from "@shared/build-prompt-from-template";

/**
 * Top-level art style presets. Combined with the selected medium (Oil, Acrylic, etc.)
 * when sending the transform prompt. Mood text comes from prompt-template.json (v8.6).
 */
export type StylePresetId = "none" | "intelligent" | "neoclassical" | "royal_noble" | "heritage";

export const STYLE_PRESET_LABELS: Record<StylePresetId, string> = {
  none: "Classic",
  intelligent: "Smart pick",
  neoclassical: "Neoclassical",
  royal_noble: "Royal",
  heritage: "Heritage",
};

/** Short UX copy for each preset (shown under the label). */
export const STYLE_PRESET_DESCRIPTIONS: Record<StylePresetId, string> = {
  none: "No extra mood — just your chosen medium",
  intelligent: "AI picks the best look from your photo",
  neoclassical: "Clean Greco-Roman, marble, sculptural",
  royal_noble: "Baroque palace, throne, crowns, ermine",
  heritage: "Old money, library, country mansion, tweed",
};

const CATEGORY_SUBJECT: Record<string, string> = {
  pets: "the subject",
  family: "ALL subjects (every person visible in the photo)",
  kids: "ALL subjects (every child visible in the photo)",
  couples: "BOTH subjects (the couple in the photo)",
  "self-portrait": "the subject",
};

/**
 * Returns the dynamic prompt for the given preset from prompt-template.json.
 * [MEDIUM] and [SUBJECT] are replaced; identity anchor is appended.
 * Returns null for none/intelligent (no extra prompt).
 */
export function resolveStylePresetPrompt(
  presetId: StylePresetId,
  mediumName: string,
  category: string
): string | null {
  if (presetId === "none" || presetId === "intelligent") return null;
  const moodId = presetId as "royal_noble" | "neoclassical" | "heritage";
  const template = buildMoodPrompt(moodId);
  if (!template) return null;
  const subject = CATEGORY_SUBJECT[category] ?? "the subject";
  // Identity anchor is already added by buildPrompt (server) — do NOT duplicate here
  const filled = template.replace(/\[MEDIUM\]/g, mediumName).replace(/\[SUBJECT\]/g, subject);
  return filled.replace(/\s+/g, " ").trim();
}
