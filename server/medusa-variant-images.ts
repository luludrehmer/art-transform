/**
 * Mapping (category, style, mood) → 3 image URLs for Medusa product/variant images.
 * Used by medusa-inject-variant-images script for Google Shopping / Pinterest.
 *
 * galleryBaseUrl: full base including path, e.g.:
 *   - https://ai.art-and-see.com/gallery (local deploy)
 *   - https://pub-xxx.r2.dev/art-transform-gallery (R2 after upload-gallery-to-r2)
 */

export type Category = "pets" | "family" | "kids" | "couples" | "self-portrait";
export type ArtStyle = "oil-painting" | "acrylic" | "pencil-sketch" | "watercolor" | "charcoal" | "pastel";
export type Mood = "classic" | "royal_noble" | "neoclassical" | "heritage";

const CATEGORIES: Category[] = ["pets", "family", "kids", "couples", "self-portrait"];
const STYLES: ArtStyle[] = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"];
const MOODS: Mood[] = ["classic", "royal_noble", "neoclassical", "heritage"];

/**
 * Returns the 3 image URLs for a given (category, style, mood) combo.
 * - classic: base gallery (e.g. pets-oil-painting-1.png)
 * - royal_noble, neoclassical, heritage: mood gallery (e.g. royal_noble--pets-oil-painting-1.png)
 */
export function getVariantImageUrls(
  galleryBaseUrl: string,
  category: Category,
  style: ArtStyle,
  mood: Mood
): [string, string, string] {
  const base = galleryBaseUrl.replace(/\/$/, "");
  const prefix = mood === "classic" ? "" : `${mood}--`;
  const name = `${prefix}${category}-${style}`;
  return [`${base}/${name}-1.png`, `${base}/${name}-2.png`, `${base}/${name}-3.png`];
}

/**
 * Returns all (category, style, mood) combos that have gallery images.
 */
export function getAllVariantKeys(): Array<{ category: Category; style: ArtStyle; mood: Mood }> {
  const result: Array<{ category: Category; style: ArtStyle; mood: Mood }> = [];
  for (const category of CATEGORIES) {
    for (const style of STYLES) {
      for (const mood of MOODS) {
        result.push({ category, style, mood });
      }
    }
  }
  return result;
}

/**
 * Returns 3 image URLs for a product (category). Uses classic + oil-painting as default.
 */
export function getProductImageUrls(galleryBaseUrl: string, category: Category): [string, string, string] {
  return getVariantImageUrls(galleryBaseUrl, category, "oil-painting", "classic");
}
