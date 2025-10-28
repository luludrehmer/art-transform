import { type ArtStyle } from "./schema";

export interface StyleSEO {
  style: ArtStyle;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2Tagline: string;
  keywords: string[];
  features: Array<{
    title: string;
    description: string;
  }>;
  benefits: string[];
  useCases: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const styleSEOData: Record<ArtStyle, StyleSEO> = {
  "oil-painting": {
    style: "oil-painting",
    slug: "photo-to-oil-painting-converter",
    title: "Free AI Photo to Oil Painting Converter Online | Instant Art Transformation",
    metaDescription: "Transform your photos into stunning oil paintings instantly with our free AI-powered converter. Upload any image and apply realistic brush strokes, canvas texture, and rich colors in seconds. No artistic skills required.",
    h1: "Convert Photo to Oil Painting Online Free",
    h2Tagline: "Turn Your Photos Into Museum-Quality Oil Paintings with AI",
    keywords: [
      "convert photo to oil painting online free",
      "AI photo to oil painting converter",
      "turn photo into oil painting",
      "photo to oil painting filter",
      "free oil painting effect",
      "picture to oil painting converter",
    ],
    features: [
      {
        title: "Authentic Oil Painting Techniques",
        description: "Our AI applies realistic impasto brush strokes, canvas texture, and traditional oil painting characteristics to create authentic-looking artwork.",
      },
      {
        title: "Instant AI Transformation",
        description: "Get your oil painting in seconds. Our advanced AI processes your photo and applies professional oil painting effects automatically.",
      },
      {
        title: "Free & No Watermark",
        description: "Transform up to 3 photos completely free with no watermarks. Perfect for personal use, gifts, or social media.",
      },
      {
        title: "High-Quality Output",
        description: "Download high-resolution oil paintings suitable for printing, framing, or sharing online.",
      },
    ],
    benefits: [
      "No artistic skills or software required",
      "Authentic oil painting look with visible brush strokes",
      "Rich, saturated colors and canvas texture",
      "Perfect for portraits, landscapes, and pets",
      "Ready to print and frame",
    ],
    useCases: [
      "Create custom wall art for home decor",
      "Transform pet photos into artwork",
      "Make unique personalized gifts",
      "Enhance social media profile pictures",
      "Design custom greeting cards",
      "Create NFT-ready digital art",
    ],
    faq: [
      {
        question: "How does the photo to oil painting converter work?",
        answer: "Our AI analyzes your photo and applies authentic oil painting techniques including impasto brush strokes, canvas texture, and traditional oil painting color characteristics. The transformation happens in seconds using advanced image AI technology.",
      },
      {
        question: "Is the oil painting converter really free?",
        answer: "Yes! You get 3 free transformation credits when you sign up with Google. Each transformation is completely free with no watermarks or hidden charges.",
      },
      {
        question: "What types of photos work best for oil painting conversion?",
        answer: "Portraits, landscapes, pets, and still life photos all work beautifully. Photos with good lighting and clear subjects produce the most stunning oil painting effects.",
      },
      {
        question: "Can I use the oil paintings commercially?",
        answer: "The free version is for personal use. For commercial usage, please contact us about licensing options.",
      },
    ],
  },
  acrylic: {
    style: "acrylic",
    slug: "photo-to-acrylic-painting-converter",
    title: "Free Photo to Acrylic Painting Converter | AI Art Generator Online",
    metaDescription: "Transform photos into vibrant acrylic paintings online for free. Our AI creates bold, contemporary artwork with authentic acrylic paint effects, bright colors, and modern brush strokes instantly.",
    h1: "Convert Photo to Acrylic Painting Online Free",
    h2Tagline: "Create Bold, Modern Acrylic Artwork from Your Photos",
    keywords: [
      "photo to acrylic painting online free",
      "AI photo to acrylic painting generator",
      "convert photo to acrylic painting",
      "acrylic painting effect online",
      "picture to acrylic art converter",
      "free acrylic painting filter",
    ],
    features: [
      {
        title: "Modern Acrylic Paint Effects",
        description: "AI generates authentic acrylic painting characteristics with bold brush strokes, vibrant colors, and contemporary painting style.",
      },
      {
        title: "Vibrant Color Enhancement",
        description: "Transform dull photos into eye-catching artwork with bright, saturated acrylic colors and high contrast.",
      },
      {
        title: "Instant Transformation",
        description: "Upload your photo and get professional acrylic painting results in seconds with our advanced AI technology.",
      },
      {
        title: "No Artistic Experience Needed",
        description: "Anyone can create stunning acrylic paintings. No painting skills or expensive software required.",
      },
    ],
    benefits: [
      "Bold, contemporary artistic style",
      "Bright, vivid colors with high impact",
      "Clean, modern aesthetic perfect for contemporary spaces",
      "Authentic acrylic paint texture and brush marks",
      "Great for pop art and urban-style artwork",
    ],
    useCases: [
      "Create modern wall art for contemporary homes",
      "Design eye-catching social media content",
      "Make vibrant album covers or posters",
      "Transform portrait photos into pop art style",
      "Create colorful digital artwork for NFTs",
      "Design bold marketing materials",
    ],
    faq: [
      {
        question: "What's the difference between oil and acrylic painting effects?",
        answer: "Acrylic paintings feature brighter colors, bolder brush strokes, and a more modern, graphic aesthetic compared to the warmer, classical look of oil paintings. Acrylics have clean edges and contemporary energy.",
      },
      {
        question: "How long does it take to convert a photo to acrylic painting?",
        answer: "The AI transformation takes about 10-15 seconds. Simply upload your photo, and our system instantly applies authentic acrylic painting effects.",
      },
      {
        question: "Can I print acrylic painting conversions?",
        answer: "Yes! Our high-resolution outputs are perfect for printing on canvas, paper, or other materials for wall art and decor.",
      },
    ],
  },
  "pencil-sketch": {
    style: "pencil-sketch",
    slug: "photo-to-pencil-sketch-converter",
    title: "Free Photo to Pencil Sketch Converter | AI Drawing Generator Online",
    metaDescription: "Convert photos to realistic pencil sketches online for free. Our AI creates authentic graphite drawings with cross-hatching, shading, and hand-drawn aesthetics instantly. No artistic skills needed.",
    h1: "Convert Photo to Pencil Sketch Online Free",
    h2Tagline: "Transform Photos Into Realistic Graphite Pencil Drawings",
    keywords: [
      "convert photo to pencil sketch online free",
      "turn photo into sketch",
      "photo to sketch converter",
      "pencil sketch from photo",
      "free sketch effect online",
      "picture to pencil drawing",
    ],
    features: [
      {
        title: "Realistic Pencil Techniques",
        description: "AI applies authentic graphite pencil strokes, cross-hatching, and traditional shading techniques for hand-drawn aesthetics.",
      },
      {
        title: "Professional Shading",
        description: "Get realistic tonal ranges with proper highlights, midtones, and shadows just like a skilled artist would create.",
      },
      {
        title: "Paper Texture Details",
        description: "Every sketch includes visible paper texture and natural pencil grain for authentic hand-drawn appearance.",
      },
      {
        title: "Perfect for Portraits",
        description: "Especially effective for portrait photos, capturing facial features and expressions with precise pencil detail.",
      },
    ],
    benefits: [
      "Classical hand-drawn aesthetic",
      "Authentic graphite pencil look",
      "Perfect for portraits and figure drawing",
      "Clean, timeless black and white art",
      "Great for tattoo design inspiration",
    ],
    useCases: [
      "Create portrait sketches for gifts",
      "Design profile pictures with artistic flair",
      "Make memorial artwork from photos",
      "Generate tattoo design references",
      "Create illustration-style social media content",
      "Design artistic book covers or prints",
    ],
    faq: [
      {
        question: "How realistic are the pencil sketches?",
        answer: "Our AI uses advanced techniques to create highly realistic pencil sketches with authentic graphite texture, cross-hatching, proper shading, and paper texture that looks hand-drawn.",
      },
      {
        question: "Can I use pencil sketches for tattoo designs?",
        answer: "Yes! Many users convert photos to pencil sketches as reference material for tattoo designs. The clean lines and shading work perfectly for tattoo art inspiration.",
      },
      {
        question: "What photo types work best for pencil sketch conversion?",
        answer: "Portrait photos with clear facial features work exceptionally well. Photos with good contrast also produce stunning sketch results with defined shading.",
      },
    ],
  },
  watercolor: {
    style: "watercolor",
    slug: "photo-to-watercolor-painting-converter",
    title: "Free Photo to Watercolor Painting Converter | AI Art Generator",
    metaDescription: "Turn photos into beautiful watercolor paintings online for free. Our AI creates soft, flowing artwork with authentic watercolor washes, transparent colors, and delicate brush effects instantly.",
    h1: "Convert Photo to Watercolor Painting Online Free",
    h2Tagline: "Transform Your Photos Into Ethereal Watercolor Art",
    keywords: [
      "convert photo to watercolor painting online free",
      "turn photo into watercolor",
      "photo to watercolor converter",
      "watercolor effect online free",
      "picture to watercolor painting",
      "AI watercolor generator",
    ],
    features: [
      {
        title: "Authentic Watercolor Effects",
        description: "AI creates realistic watercolor characteristics including transparent washes, color bleeds, and soft edges.",
      },
      {
        title: "Soft, Flowing Colors",
        description: "Get beautiful color transitions with natural watercolor blooms and delicate paper texture.",
      },
      {
        title: "Luminous Quality",
        description: "Achieve the signature light, airy feel of traditional watercolor paintings with transparent layering.",
      },
      {
        title: "Instant Processing",
        description: "Transform any photo into watercolor art in seconds with our advanced AI technology.",
      },
    ],
    benefits: [
      "Light, ethereal artistic quality",
      "Soft, romantic aesthetic",
      "Perfect for gentle, dreamy artwork",
      "Authentic watercolor paper texture",
      "Beautiful for landscape and floral photos",
    ],
    useCases: [
      "Create romantic wedding photo art",
      "Transform landscape photos into paintings",
      "Make delicate floral artwork",
      "Design gentle, soft wall decor",
      "Create watercolor-style social media posts",
      "Make artistic greeting cards and invitations",
    ],
    faq: [
      {
        question: "How does AI create watercolor effects?",
        answer: "Our AI analyzes your photo and applies authentic watercolor painting techniques including transparent washes, wet-on-wet bleeding, color blooms, and paper texture to create realistic watercolor artwork.",
      },
      {
        question: "Are watercolor conversions good for printing?",
        answer: "Yes! The high-resolution watercolor outputs print beautifully on various papers and canvas materials, perfect for framing and home decor.",
      },
      {
        question: "What's special about watercolor versus other painting styles?",
        answer: "Watercolor paintings have a unique luminous, transparent quality with soft edges and flowing colors. They're perfect for creating gentle, romantic, and ethereal artwork.",
      },
    ],
  },
  charcoal: {
    style: "charcoal",
    slug: "photo-to-charcoal-drawing-converter",
    title: "Free Photo to Charcoal Drawing Converter | AI Art Generator Online",
    metaDescription: "Convert photos to dramatic charcoal drawings online for free. Our AI creates authentic charcoal art with rich blacks, soft grays, and expressive smudged textures instantly. No drawing skills required.",
    h1: "Convert Photo to Charcoal Drawing Online Free",
    h2Tagline: "Create Dramatic Charcoal Artwork from Your Photos",
    keywords: [
      "photo to charcoal drawing online free",
      "convert photo to charcoal sketch",
      "charcoal effect online",
      "picture to charcoal drawing",
      "AI charcoal converter",
      "free charcoal sketch generator",
    ],
    features: [
      {
        title: "Authentic Charcoal Texture",
        description: "AI applies realistic charcoal marks with proper smudging, blending, and particle texture for genuine charcoal aesthetic.",
      },
      {
        title: "Dramatic Contrast",
        description: "Get rich, velvety blacks and soft grays with bold chiaroscuro lighting for maximum emotional impact.",
      },
      {
        title: "Expressive Strokes",
        description: "Experience gestural, bold charcoal strokes that capture emotion and movement like traditional charcoal drawings.",
      },
      {
        title: "Paper Texture Details",
        description: "Visible paper tooth and charcoal dust effects create authentic hand-drawn appearance.",
      },
    ],
    benefits: [
      "Dramatic, high-impact black and white art",
      "Emotional and expressive aesthetic",
      "Bold contrast perfect for powerful imagery",
      "Classical figure drawing style",
      "Perfect for moody, atmospheric artwork",
    ],
    useCases: [
      "Create powerful portrait artwork",
      "Make dramatic black and white wall art",
      "Design emotional memorial pieces",
      "Transform photos into classical figure drawings",
      "Create moody, atmospheric artwork",
      "Design impactful editorial illustrations",
    ],
    faq: [
      {
        question: "What makes charcoal drawings different from pencil sketches?",
        answer: "Charcoal drawings feature richer blacks, more dramatic contrast, and softer, smudged edges compared to pencil sketches. They have an emotional, expressive quality with bold, gestural marks.",
      },
      {
        question: "What types of photos work best for charcoal conversion?",
        answer: "Photos with strong lighting, clear subjects, and good contrast work exceptionally well. Portrait photos produce particularly dramatic charcoal drawings.",
      },
      {
        question: "Can I use charcoal drawings professionally?",
        answer: "The free version is for personal use. For commercial or professional usage, please contact us about licensing options.",
      },
    ],
  },
  pastel: {
    style: "pastel",
    slug: "photo-to-pastel-painting-converter",
    title: "Free Photo to Pastel Painting Converter | Soft AI Art Generator",
    metaDescription: "Turn photos into soft pastel artwork online for free. Our AI creates dreamy, romantic paintings with authentic chalk texture, muted colors, and gentle blended effects instantly.",
    h1: "Convert Photo to Pastel Painting Online Free",
    h2Tagline: "Transform Photos Into Dreamy Soft Pastel Artwork",
    keywords: [
      "photo to pastel painting online free",
      "convert photo to pastel art",
      "soft pastel effect online",
      "picture to pastel painting",
      "AI pastel converter",
      "free pastel art generator",
    ],
    features: [
      {
        title: "Soft Chalky Texture",
        description: "AI creates authentic soft pastel characteristics with chalky texture, visible pastel strokes, and powdery surface quality.",
      },
      {
        title: "Romantic Color Palette",
        description: "Get muted, dreamy colors with gentle harmonies perfect for ethereal, romantic artwork.",
      },
      {
        title: "Impressionist Style",
        description: "Experience French Impressionist pastel traditions with soft-focus rendering and atmospheric quality.",
      },
      {
        title: "Gentle Blending",
        description: "Beautiful finger-blended effects mixed with visible pastel strokes for authentic pastel artwork appearance.",
      },
    ],
    benefits: [
      "Soft, dreamy aesthetic",
      "Romantic and ethereal quality",
      "Gentle, refined artistic style",
      "Perfect for portraits and gentle scenes",
      "Impressionist-inspired artwork",
    ],
    useCases: [
      "Create romantic portrait artwork",
      "Make soft, dreamy wall decor",
      "Design gentle nursery or children's art",
      "Transform family photos into heirloom artwork",
      "Create elegant, refined social media content",
      "Design soft artistic greeting cards",
    ],
    faq: [
      {
        question: "What are soft pastels and how do they look?",
        answer: "Soft pastels create artwork with a gentle, chalky texture and muted, dreamy colors. They have a romantic, Impressionist quality with soft edges and ethereal atmosphere.",
      },
      {
        question: "What's the difference between pastel and watercolor effects?",
        answer: "Pastels have a chalky, matte texture with muted colors, while watercolors are more transparent and luminous. Pastels feel soft and powdery, watercolors feel fluid and light.",
      },
      {
        question: "Are pastel conversions good for portraits?",
        answer: "Yes! Pastel portraits have a beautiful, romantic quality with soft features and dreamy colors that are very flattering and elegant.",
      },
    ],
  },
};

export const getAllStyleSlugs = (): string[] => {
  return Object.values(styleSEOData).map((seo) => seo.slug);
};

export const getStyleSEOBySlug = (slug: string): StyleSEO | undefined => {
  return Object.values(styleSEOData).find((seo) => seo.slug === slug);
};
