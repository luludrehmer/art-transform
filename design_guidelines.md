# ArtTransform - Comprehensive Design Guidelines

## Design Approach
**Reference-Based + Design System Hybrid**: Drawing inspiration from modern SaaS tools like Linear and Notion for clean workflows, combined with creative portfolio sites like Behance for visual richness. The interface balances professional functionality with artistic presentation, ensuring the tool feels both capable and inspiring.

## Core Design Principles
1. **Visual First**: Photos and artwork are heroes - showcase transformations prominently with ample breathing room
2. **Clarity Through Steps**: Multi-step workflow must feel guided and reassuring, never overwhelming
3. **Artistic but Professional**: Creative flair in branding while maintaining SaaS-level polish and trust
4. **Immediate Value**: Users should understand the product's capabilities within 3 seconds of landing

## Typography System

**Font Families**:
- Display/Headings: Space Grotesk (500, 600, 700 weights)
- Body/UI: Inter (400, 500, 600, 700, 800 weights)

**Hierarchy**:
- Hero Headlines: 4xl-6xl (48-72px), Space Grotesk Bold, tight tracking
- Section Titles: 3xl-4xl (36-48px), Space Grotesk Bold
- Card Titles: lg-xl (18-24px), Space Grotesk Semibold
- Body Text: sm-base (14-16px), Inter Regular/Medium
- UI Labels: xs-sm (12-14px), Inter Medium
- Captions: xs (12px), Inter Regular, muted foreground

## Layout & Spacing

**Tailwind Spacing Primitives**: Use 2, 3, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Tight spacing: p-2, p-3, gap-2
- Component padding: p-4, p-6
- Section padding: py-12, py-16, py-20
- Large sections: py-24, py-32

**Container Strategy**:
- Landing sections: max-w-7xl with px-4
- Dashboard: Full-width with internal max-widths
- Content-heavy: max-w-4xl for readability
- Cards/Forms: max-w-md to max-w-2xl

**Grid Patterns**:
- Tools/Features: 3-column grid on desktop (md:grid-cols-3)
- Testimonials: 2-column tablet, 3-column desktop
- Style presets: Single column sidebar with compact cards

## Component Library

### Navigation
- **Header**: Sticky, backdrop-blur, 64px height, border-bottom
- Logo: Sparkles icon in primary-colored rounded square + wordmark
- Credits display: Prominent with Crown icon, outline button style
- Navigation links: Medium weight, hover to primary color
- CTA buttons: "Get Started" with premium gradient variant

### Cards & Containers
- Border radius: rounded-xl (12px) for cards, rounded-2xl (16px) for hero images
- Borders: 2px on interactive cards, 1px on static
- Hover states: Scale 1.01-1.02, shadow elevation, border color shift to primary
- Active/Selected: Ring-2 or ring-3 with primary color, elevated shadow

### Buttons
- **Primary (Hero)**: Gradient background, white text, prominent shadows
- **Default**: Solid primary background
- **Outline**: Border with transparent background, hover fills
- **Ghost**: No background, hover adds subtle muted background
- **Premium**: Special gradient for pricing/upgrade CTAs
- Icon placement: 16px icons, mr-2 for left, ml-2 for right
- Sizes: sm (h-9), default (h-10), lg (h-11), xl (h-12)

### Progress Stepper
- 4 steps: Upload → Choose Style → Transform → Download
- Active step: Primary background, white text, ring offset
- Completed: Check icon, primary accent, clickable
- Pending: Muted, disabled state
- Connector lines: 2px height between steps

### Badges & Tags
- Rounded-full for pills
- Small icons paired with text
- Color variants: default (primary), secondary, outline
- Use for: status indicators, feature tags, savings labels

### Image Presentation
- Aspect ratios: aspect-video (16:9) for demos, aspect-square for styles
- Overlay gradients: Subtle dark gradients on hover for CTAs
- Comparison layout: Side-by-side grid on result page
- Shadows: shadow-2xl for hero images, shadow-lg for cards

## Images

**Hero Section**: Large artistic transformation example (oil painting or acrylic style), showcasing before/after split or single stunning result. Full-width background with gradient overlay, centered over text.

**Tool Cards**: Square or 4:3 ratio thumbnails for each of the 6 art styles (Oil Painting, Acrylic, Pencil Sketch, Watercolor, Charcoal, Pastel) showing representative transformations.

**Style Pages**: High-quality example images demonstrating each artistic style's characteristics - use real photo-to-art transformations.

**Dashboard Sidebar**: Compact preview images (16:10 aspect ratio) for each style preset with consistent framing.

**Result Page**: Before/after comparison with equal-sized images, professionally showcasing the transformation quality.

**Testimonials**: Circular avatars (40-48px) for customer photos using diverse, professional headshots.

## Interaction Patterns

**Upload Flow**:
- Drag-and-drop zone with dashed border, hover state brightens
- File input hidden, triggered by button
- Image preview with overlay controls on hover
- Remove action clearly visible but not destructive-colored

**Style Selection**:
- Visual grid/list with image previews
- Active state: prominent ring, check indicator, elevated
- Click anywhere on card to select
- Stats display (Intensity, Texture, Detail percentages)

**Transformation Process**:
- Loading state with Sparkles icon animation
- Progress bar with percentage
- Toast notifications for status updates
- Smooth transition to result page

**Result Display**:
- Before/After side-by-side comparison
- Download CTA prominently placed
- Secondary CTA for trying another style
- Hand-painted canvas upgrade prominently featured below digital download

## Animations

**Use Sparingly**:
- Hover scale: scale-[1.01] to scale-[1.02]
- Transitions: transition-all duration-200 or duration-300
- Icon animations: animate-pulse for processing states only
- Page transitions: Smooth, no jarring effects

**Avoid**: Excessive scroll animations, complex entry effects, parallax scrolling

## Accessibility

- Form inputs with clear labels
- Interactive elements: min 44x44px touch targets
- Focus rings: Visible on all interactive elements
- Color contrast: WCAG AA compliant (foreground on backgrounds)
- Toast notifications: Informative without relying on color alone

## Landing Page Structure

**Hero**: Full-width section with gradient glow background, centered headline with gradient text treatment, 3 free credits prominently mentioned, dual CTA buttons (Get Started + See Examples), trust badges row below.

**How It Works**: 3-step process with icons, step numbers, and connecting arrows. Clear, concise explanations.

**Tools Grid**: 3 columns showcasing transformation types with preview images, descriptions, and "Try it now" links.

**Testimonials**: 6 testimonials in 3-column grid, star ratings, customer photos, quotes, and roles.

**Pricing**: 3 tiers (Starter, Popular, Pro) with clear value proposition, feature lists with checkmarks, savings badges, "Most Popular" highlight on middle tier.

**FAQ**: Accordion-style, 8+ questions, rounded containers with hover effects.

**Footer**: Multi-column layout with logo, product links, support links, and copyright.

## Dashboard Interface

**Layout**: Split view - narrow sidebar (256px) for style selection, main canvas area for image upload/preview.

**Sidebar**: Scrollable style preset cards with preview images, labels, check indicators for active selection, compact vertical layout.

**Canvas**: Empty state with upload prompt and icon, populated state shows uploaded image with overlay controls, processing overlay with progress indicator.

**Action Bar**: Fixed or sticky element with Transform button, visually prominent, disabled until image selected and style chosen.

## Result Page

**Header**: Progress stepper showing completion, success badge.

**Comparison**: Side-by-side grid showing original photo and transformed result, equal sizing, clear labels.

**Primary Actions**: Download digital art (prominent), Try another style (secondary).

**Upsell Module**: Hand-painted canvas offer with educational copy, feature grid with checkmarks, trust signals (customer count, ratings), embedded video demonstration, clear CTA to external site.

This comprehensive design creates a visually striking, professional creative tool that balances artistic expression with SaaS-level usability and trust-building elements.