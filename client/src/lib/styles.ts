import { type ArtStyle, type StyleInfo } from "@shared/schema";
import oilPaintingImage from "@assets/generated_images/Oil_painting_canvas_portrait_67cba1ad.png";
import acrylicImage from "@assets/generated_images/Acrylic_painting_vibrant_portrait_d58c3d71.png";
import pencilSketchImage from "@assets/generated_images/Pencil_sketch_drawing_portrait_48728960.png";
import watercolorImage from "@assets/generated_images/Watercolor_painting_portrait_paper_d68af8c6.png";
import charcoalImage from "@assets/generated_images/Charcoal_drawing_portrait_paper_c319ecda.png";
import pastelImage from "@assets/generated_images/Soft_pastel_artwork_portrait_fe54fec7.png";

export const styleData: Record<ArtStyle, StyleInfo> = {
  "oil-painting": {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Rich, textured brushstrokes with vibrant colors and classic artistic depth",
    image: oilPaintingImage,
  },
  acrylic: {
    id: "acrylic",
    name: "Acrylic",
    description: "Bold, modern strokes with vivid colors and contemporary energy",
    image: acrylicImage,
  },
  "pencil-sketch": {
    id: "pencil-sketch",
    name: "Pencil Sketch",
    description: "Detailed graphite shading with realistic cross-hatching and fine lines",
    image: pencilSketchImage,
  },
  watercolor: {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, flowing colors with translucent washes and delicate blooms",
    image: watercolorImage,
  },
  charcoal: {
    id: "charcoal",
    name: "Charcoal",
    description: "Dramatic contrasts with smoky, expressive shading and bold strokes",
    image: charcoalImage,
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    description: "Soft, chalky texture with gentle blended colors and muted tones",
    image: pastelImage,
  },
};

export const allStyles = Object.values(styleData);

/** Handmade card copy per medium (oil/acrylic = painted; pencil/charcoal = drawn; watercolor/pastel = mixed) */
export const handmadeCardContent: Record<
  ArtStyle,
  { badge: string; tagline: string; bullets: string[] }
> = {
  "oil-painting": {
    badge: "100% HAND-PAINTED",
    tagline: "Real brushstrokes you can feel",
    bullets: ["Painted by master artists", "Oil on Canvas – Hand-Painted", "Museum-grade Oil Painting", "Ready to hang"],
  },
  acrylic: {
    badge: "100% HAND-PAINTED",
    tagline: "Real brushstrokes you can feel",
    bullets: ["Painted by master artists", "Acrylic on Canvas – Hand-Painted", "Museum-grade Acrylic Painting", "Ready to hang"],
  },
  "pencil-sketch": {
    badge: "100% HAND-DRAWN",
    tagline: "Real graphite strokes you can feel",
    bullets: ["Drawn by master artists", "Graphite on Paper – Hand-Drawn", "Museum-grade Pencil Drawing", "Ready to hang"],
  },
  watercolor: {
    badge: "100% HAND-PAINTED",
    tagline: "Real watercolor washes you can feel",
    bullets: ["Painted by master artists", "Watercolor on Paper – Hand-Painted", "Museum-grade Watercolor Painting", "Ready to hang"],
  },
  charcoal: {
    badge: "100% HAND-DRAWN",
    tagline: "Real charcoal strokes you can feel",
    bullets: ["Drawn by master artists", "Charcoal on Paper – Hand-Drawn", "Museum-grade Charcoal Drawing", "Ready to hang"],
  },
  pastel: {
    badge: "100% HAND-CRAFTED",
    tagline: "Real pastel texture you can feel",
    bullets: ["Crafted by master artists", "Pastel on Paper – Hand-Crafted", "Museum-grade Pastel Artwork", "Ready to hang"],
  },
};
