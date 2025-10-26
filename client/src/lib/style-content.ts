import { type ArtStyle } from "@shared/schema";

export interface StyleContent {
  id: ArtStyle;
  seoHeadline: string;
  heroDescription: string;
  benefits: string[];
  useCases: string[];
  metaDescription: string;
}

export const styleContent: Record<ArtStyle, StyleContent> = {
  "oil-painting": {
    id: "oil-painting",
    seoHeadline: "Transform Photos into Oil Paintings Online Free",
    heroDescription: "Turn your photos into stunning oil paintings with AI-powered transformation. Experience rich, textured brushstrokes and vibrant colors that capture the classic beauty of traditional oil painting art.",
    benefits: [
      "Rich, textured brushstrokes create depth and dimension in every transformation",
      "Vibrant color palettes that capture the warmth of classic oil paintings",
      "Professional-quality results perfect for printing and framing",
      "Instant transformations in seconds - no manual painting skills required"
    ],
    useCases: [
      "Create gallery-worthy portraits from family photos",
      "Transform landscape photography into fine art",
      "Design unique wall art for home or office",
      "Generate artistic content for social media and marketing"
    ],
    metaDescription: "Transform your photos into stunning oil paintings online for free. AI-powered tool creates rich, textured brushstrokes with vibrant colors. Professional quality results in seconds."
  },
  "acrylic": {
    id: "acrylic",
    seoHeadline: "Convert Photos to Acrylic Paintings Online Free",
    heroDescription: "Transform your images into bold, modern acrylic paintings. Get contemporary artistic effects with vivid colors and dynamic brushwork that brings energy and life to your photos.",
    benefits: [
      "Bold, contemporary strokes for modern artistic appeal",
      "Vivid color saturation that makes images pop with energy",
      "Perfect balance of detail and artistic abstraction",
      "Fast transformations ideal for creative projects"
    ],
    useCases: [
      "Create modern art for contemporary interior design",
      "Design eye-catching marketing materials and posters",
      "Generate vibrant social media content",
      "Transform product photos into artistic displays"
    ],
    metaDescription: "Convert photos to acrylic paintings online free. Bold, modern strokes with vivid colors and contemporary energy. AI-powered transformation in seconds."
  },
  "pencil-sketch": {
    id: "pencil-sketch",
    seoHeadline: "Turn Photos into Pencil Sketches Online Free",
    heroDescription: "Convert your photos into detailed pencil sketches with realistic graphite shading. Experience the timeless elegance of hand-drawn art with intricate cross-hatching and fine line work.",
    benefits: [
      "Detailed graphite shading with realistic pencil textures",
      "Fine cross-hatching and line work for authentic sketch appearance",
      "Preserves facial features and important details beautifully",
      "Perfect for creating classic, timeless artwork"
    ],
    useCases: [
      "Create elegant portrait sketches from photographs",
      "Design professional profile pictures with artistic flair",
      "Generate illustrations for books and publications",
      "Produce nostalgic, classic-style family portraits"
    ],
    metaDescription: "Turn photos into pencil sketches online free. Detailed graphite shading with realistic cross-hatching and fine lines. Professional quality pencil art in seconds."
  },
  "watercolor": {
    id: "watercolor",
    seoHeadline: "Transform Photos into Watercolor Paintings Free",
    heroDescription: "Create beautiful watercolor paintings from your photos. Enjoy soft, flowing colors with translucent washes and delicate color blooms that capture the gentle beauty of watercolor art.",
    benefits: [
      "Soft, flowing colors with authentic watercolor transparency",
      "Delicate color blooms and natural wash effects",
      "Gentle artistic style perfect for portraits and nature scenes",
      "Creates dreamy, romantic atmosphere in any image"
    ],
    useCases: [
      "Create romantic wedding and engagement artwork",
      "Design beautiful nature and landscape art",
      "Generate soft, elegant social media content",
      "Produce delicate artwork for greeting cards and invitations"
    ],
    metaDescription: "Transform photos into watercolor paintings free. Soft, flowing colors with translucent washes and delicate blooms. Beautiful AI-powered watercolor art instantly."
  },
  "charcoal": {
    id: "charcoal",
    seoHeadline: "Convert Photos to Charcoal Drawings Online Free",
    heroDescription: "Transform your images into dramatic charcoal drawings. Experience bold contrasts, smoky textures, and expressive shading that brings powerful emotion and depth to your photos.",
    benefits: [
      "Dramatic high-contrast effects for striking visual impact",
      "Smoky, expressive shading with authentic charcoal texture",
      "Bold strokes that emphasize form and emotion",
      "Perfect for creating powerful, moody artwork"
    ],
    useCases: [
      "Create dramatic portrait art with emotional depth",
      "Design bold, striking marketing visuals",
      "Generate noir-style artistic content",
      "Produce powerful black and white wall art"
    ],
    metaDescription: "Convert photos to charcoal drawings online free. Dramatic contrasts with smoky, expressive shading and bold strokes. Professional charcoal art in seconds."
  },
  "pastel": {
    id: "pastel",
    seoHeadline: "Turn Photos into Pastel Artwork Online Free",
    heroDescription: "Convert your photos into soft, dreamy pastel artwork. Enjoy gentle blended colors with chalky textures and muted tones that create serene, calming artistic effects.",
    benefits: [
      "Soft, chalky texture with authentic pastel appearance",
      "Gentle color blending for dreamy, serene effects",
      "Muted tones perfect for calming, peaceful artwork",
      "Ideal for creating vintage-inspired artistic content"
    ],
    useCases: [
      "Create soft, calming wall art for bedrooms and nurseries",
      "Design gentle, vintage-style portraits",
      "Generate peaceful nature and landscape art",
      "Produce elegant artwork for lifestyle brands"
    ],
    metaDescription: "Turn photos into pastel artwork online free. Soft, chalky texture with gentle blended colors and muted tones. Beautiful AI-powered pastel art instantly."
  }
};

export const getStyleContent = (styleId: ArtStyle): StyleContent | null => {
  return styleContent[styleId] || null;
};
