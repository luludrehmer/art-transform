import { type ArtStyle, type StyleInfo } from "@shared/schema";
import oilPaintingImage from "@assets/generated_images/Oil_painting_art_style_ff5c24d6.png";
import acrylicImage from "@assets/generated_images/Acrylic_painting_art_style_640f19a2.png";
import pencilSketchImage from "@assets/generated_images/Pencil_sketch_art_style_3e1a2515.png";
import watercolorImage from "@assets/generated_images/Watercolor_painting_art_style_424e0327.png";
import charcoalImage from "@assets/generated_images/Charcoal_drawing_art_style_2afde6f5.png";
import pastelImage from "@assets/generated_images/Pastel_art_style_6075c646.png";

export const styleData: Record<ArtStyle, StyleInfo> = {
  "oil-painting": {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Rich, textured brushstrokes with vibrant colors and classic artistic depth",
    intensity: 95,
    texture: 90,
    detail: 85,
    image: oilPaintingImage,
  },
  acrylic: {
    id: "acrylic",
    name: "Acrylic",
    description: "Bold, modern strokes with vivid colors and contemporary energy",
    intensity: 90,
    texture: 85,
    detail: 80,
    image: acrylicImage,
  },
  "pencil-sketch": {
    id: "pencil-sketch",
    name: "Pencil Sketch",
    description: "Detailed graphite shading with realistic cross-hatching and fine lines",
    intensity: 70,
    texture: 60,
    detail: 95,
    image: pencilSketchImage,
  },
  watercolor: {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, flowing colors with translucent washes and delicate blooms",
    intensity: 75,
    texture: 70,
    detail: 65,
    image: watercolorImage,
  },
  charcoal: {
    id: "charcoal",
    name: "Charcoal",
    description: "Dramatic contrasts with smoky, expressive shading and bold strokes",
    intensity: 85,
    texture: 75,
    detail: 80,
    image: charcoalImage,
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    description: "Soft, chalky texture with gentle blended colors and muted tones",
    intensity: 65,
    texture: 80,
    detail: 70,
    image: pastelImage,
  },
};

export const allStyles = Object.values(styleData);
