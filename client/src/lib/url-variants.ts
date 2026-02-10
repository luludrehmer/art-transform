import type { StylePresetId } from "@/lib/style-presets";
import type { ArtStyle } from "@shared/schema";

/** Moods that get a URL segment. Classic (none) and Smart pick (intelligent) are neutral — no segment. */
export const MOOD_SLUGS = ["royal", "neoclassical", "heritage"] as const;
export type MoodSlug = (typeof MOOD_SLUGS)[number];

/** Map URL slug → preset ID. Only moods with a segment (no classic/smart-pick). */
export const MOOD_SLUG_TO_ID: Record<MoodSlug, StylePresetId> = {
  royal: "royal_noble",
  neoclassical: "neoclassical",
  heritage: "heritage",
};

/** Map preset ID → URL slug. Only for presets that have a URL segment. */
export const MOOD_ID_TO_SLUG: Partial<Record<StylePresetId, MoodSlug>> = {
  royal_noble: "royal",
  neoclassical: "neoclassical",
  heritage: "heritage",
};

/** Presets that are "neutral" — no third segment in URL (classic, smart-pick). */
export function isNeutralMood(presetId: StylePresetId): boolean {
  return presetId === "none" || presetId === "intelligent";
}

/** Returns mood slug for URL only when preset has one (royal, neoclassical, heritage). */
export function getMoodSlugForUrl(presetId: StylePresetId): string | null {
  return MOOD_ID_TO_SLUG[presetId] ?? null;
}

export function isValidMoodSlug(slug: string): slug is MoodSlug {
  return MOOD_SLUGS.includes(slug as MoodSlug);
}

export const VALID_STYLE_IDS: ArtStyle[] = [
  "oil-painting",
  "acrylic",
  "pencil-sketch",
  "watercolor",
  "charcoal",
  "pastel",
];

export function isValidStyleId(style: string): style is ArtStyle {
  return VALID_STYLE_IDS.includes(style as ArtStyle);
}
