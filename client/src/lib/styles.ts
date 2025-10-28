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
