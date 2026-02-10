# Master Prompt Template v5 (Mood + Style)

Single source of truth for all image-generation prompts. Transforms a user-uploaded photo into a museum-quality fine art portrait with a chosen **mood** and **style**.

Placeholders: `{MOOD}`, `{STYLE}`, `{MOOD_SURFACE}` — injected at runtime.

---

<s>
You are transforming a user-uploaded photo into a {MOOD} portrait, rendered in {STYLE}.

This must look like an authentic masterwork painting — not AI-generated, not a photo filter. It must have the depth, drama, and craftsmanship of a commissioned portrait by a celebrated Old Masters painter. Every element — brushwork, light, fabric, background — must feel hand-painted with mastery.

The SUBJECT dominates 60-70% of the frame. The background is a PAINTED SCENE — artistically rendered with visible brushwork, not blurred like a photograph.
</s>

<subject_analysis>
Analyze the uploaded photo and detect:
- Number of subjects (1, 2, 3+)
- Type of each subject (human adult, human child, dog, cat, horse, other animal)
- Distinctive features to preserve (hair color/style, fur color/pattern, breed, facial features, eye color)
- Natural grouping/relationships visible in the photo

CRITICAL SUBJECT SEPARATION:
- ONLY animals → PET portrait. No human elements.
- ONLY humans → HUMAN portrait. No animal elements unless in source.
- BOTH → MIXED portrait. Each keeps its nature.
- NEVER add subjects not in the original photo.
- NEVER blend attributes between subject types.
</subject_analysis>

<composition>
DYNAMIC COMPOSITION — vary the pose and framing based on the subject and mood. Do NOT default to the same composition every time.

For single subjects, choose dynamically from:
- Intimate bust: head and shoulders, close crop, intense eye contact
- Classic three-quarter: head to waist, slight body angle, one hand visible
- Seated full: full body seated on throne/chair/cushion/pedestal, regal posture
- Standing grand: full body standing, one hand on hip or holding prop, commanding presence
- Reclining noble: lounging gracefully on surface, relaxed authority

For couples:
- Intimate close: faces near each other, tender gesture, tight crop
- Formal paired: seated together, slight height difference, one behind the other
- Dynamic interaction: one standing, one seated, looking at each other or at viewer

For groups (3+):
- Pyramidal classical: tallest center, others flanking, arranged on different levels
- Conversational: grouped naturally as if mid-moment, some looking at viewer, some at each other
- Tiered: seated in front, standing behind, creating depth layers

For pets alone:
- Noble seated: upright on cushion/pedestal, frontal, dignified gaze
- Reclining lord: lying gracefully, head raised, alert expression
- Standing proud: four legs planted, slight turn, noble bearing

For mixed (human + pet):
- The pet is held, at feet, or beside — integrated as a beloved companion
- Both looking at viewer, or human looking at pet with affection

Camera angle: at eye level or SLIGHTLY BELOW the subject — never looking down. This gives the subject authority and grandeur.
</composition>

<painting_quality>
MUSEUM-QUALITY PAINTING STANDARDS — apply to ALL outputs:

BRUSHWORK & TEXTURE:
- Visible, confident brushstrokes throughout — impasto on highlights, smooth glazes on skin/fur
- Canvas texture subtly visible in darker areas
- Paint has PHYSICAL DEPTH — you can almost feel the layers
- Craquelure aging on the surface — fine network of cracks suggesting centuries of age
- Slight warm varnish sheen — the amber glow of aged oil varnish
- Edges of the canvas show slight wear, paint chips, or darkened patina

SKIN & FUR RENDERING:
- Skin has translucent luminosity — light passes through the surface layers (subsurface scattering)
- Subtle color variations in skin: warm pinks, cool blues in shadows, golden highlights
- Fur rendered hair-by-hair in highlights, softer in shadow areas — individual strands catch the light
- Eyes are the sharpest point in the painting — crystalline detail, catchlight, depth

FABRIC & MATERIAL:
- Velvet has WEIGHT and DEPTH — you feel the pile, the way light dies into it
- Silk catches light in sharp white highlights against deep color
- Lace is intricate and delicate — each thread suggested, not just textured
- Fur trim has individual hairs, spotted pattern, softness
- Gold embroidery catches light on raised threads
- Fabric DRAPES realistically — follows gravity, bunches at joints, pools on surfaces

LIGHTING — DRAMATIC AND THEATRICAL:
- Primary warm light source from upper-left — strong, directional, like a torch or high window
- Rembrandt triangle on human faces — the classic diamond of light on the shadow-side cheek
- Strong chiaroscuro — deep blacks meet luminous highlights with rich midtone transitions
- Rim light / edge light separating subject from background — especially on hair, shoulders, fur edges
- Secondary cooler fill light barely visible from opposite side — just enough to reveal shadow detail
- Golden warmth on all lit surfaces — the amber quality of candlelight or late afternoon sun
- Specular highlights on jewelry, eyes, wet surfaces — small, bright, sharp
- Light on the subject is 2-3 stops brighter than the background — the subject GLOWS against the dark

OVERALL FEEL:
- This should be indistinguishable from a painting hanging in the National Gallery or the Met
- The painting looks like it has HISTORY — aged, varnished, slightly darkened with time
- It has the gravitas and skill of Thomas Lawrence, Joshua Reynolds, Thomas Gainsborough, Élisabeth Vigée Le Brun, Rembrandt, Velázquez, Anthony van Dyck
</painting_quality>

---

## MOODS

### royal (code: royal_noble)

THE SUBJECT IS A MONARCH. Absolute royalty in every detail.

ATTIRE — HUMANS ONLY:
Luxurious royal garments — vary the combination creatively each time from:
- Heavy robes, capes, mantles in jewel tones — burgundy, plum, navy, emerald, royal purple, crimson, midnight blue
- Fur trim — ermine with black spots, sable, mink, white fox — prominent and luxurious
- Rich embroidery — gold/silver thread, heraldic motifs, floral patterns, royal crests, lions, eagles, fleur-de-lis, thistles
- Lace — Belgian, Venetian, French — on collar, cuffs, décolletage
- Royal headpiece — ALWAYS PRESENT: crown, tiara, diadem, coronet, jeweled circlet
- Jewelry — layer multiple pieces: necklaces, pendants, brooches, rings, chains of office, medallions, chokers with gemstones. Mix gold, pearls, rubies, sapphires, emeralds
- Hand props — vary: scepter, orb, royal flower, jeweled fan, sealed letter, velvet glove, small portrait miniature
- Fabrics — velvet, silk brocade, damask, satin, taffeta — mix textures
- Children: miniature royal — small crown, scaled robe, delicate jewelry

ATTIRE — ANIMALS ONLY:
- Heavy mantle/cape — vary color, fabric, trim each time
- Royal headpiece — small crown, coronet, circlet, tiara
- Neck adornment — jeweled collar, gold chain with medallion, chain of office, pearl strand
- Heraldic embroidery on mantle — lions, eagles, crowns, crests
- Fur trim — ermine, sable, white fur edging
- On ornate cushion — vary damask, velvet, silk; vary colors; with tassels or fringe

BACKGROUND — PAINTED OLD MASTERS SCENE:
- Deep, rich darkness — but NOT flat black. The background is a PAINTED environment:
- Heavy velvet curtains with visible fabric folds, pulled to one side, catching dim light
- Glimpse of a darkened palace interior — column, archway, distant window with faint light
- OR: dramatic clouded sky visible through an opening — stormy, moody, Turner-esque
- Background painted with visible brushstrokes — loose, atmospheric, suggestive
- Background is DARKER than the subject but has DETAIL and DEPTH — it's a painted scene, not a void
- Rich color in the shadows — deep navy, umber, warm black, hints of burgundy

LIGHTING: Intense theatrical Caravaggio-level chiaroscuro. Strong warm upper-left source. Subject glows against deep shadow. Dramatic and powerful.

PALETTE: burgundy, navy, gold, ivory, ermine white, deep purple, crimson, black — rich and saturated

---

### neoclassical (code: neoclassical)

THE SUBJECT IS A GREEK/ROMAN DEITY OR MUSE. Timeless classical beauty.

ATTIRE — HUMANS ONLY:
Classical garments — vary creatively from:
- Toga, chiton, himation, peplos, stola — white, cream, ivory with colored accents
- Colored accents — terracotta, olive, gold, dusty rose, Tyrian purple, sage sash/stole
- Crown — ALWAYS PRESENT: laurel wreath, olive crown, gold diadem, vine crown, myrtle wreath, golden stephane
- Clasps — gold fibula, ornate brooch, lion-head pin, cameo, serpent pin
- Jewelry — gold cuff, arm band, signet ring, chain with pendant (owl, lyre, sun, dolphin, eagle), anklet
- Hair — classical: loose curls with gold pins, braided updo, ribboned plaits, jeweled headband
- Children: white tunic, small wreath or floral crown, gold pendant

ATTIRE — ANIMALS ONLY:
- Draped linen/silk — loosely over shoulders, toga-like but natural
- Crown — laurel, olive branch, vine, small gold diadem
- Neck — gold chain with classical medallion (owl, eagle, sun, lyre), woven cord, pearl strand
- On carved marble pedestal with classical relief

BACKGROUND — PAINTED ROMANTIC LANDSCAPE:
- This is NOT a flat backdrop. It's a fully painted Arcadian/Romantic landscape in the style of Claude Lorrain, Nicolas Poussin, or Thomas Cole:
- Rolling Tuscan/Greek hills receding into atmospheric perspective — multiple depth layers
- Ancient trees with gnarled trunks and wind-swept canopies — painted with expressive brushwork
- Dramatic sky — golden hour clouds lit from below, warm peach and amber tones, touches of pink
- Classical ruins integrated into the landscape — broken column, crumbling archway, temple fragment on a distant hill
- Soft ground — wild grasses, scattered wildflowers, mossy stone
- The landscape tells a story of a golden age — idyllic, timeless, mythical
- Background rendered with VISIBLE BRUSHSTROKES — painterly, not photographic
- Atmospheric haze increases with distance — foreground detailed, far background dissolved into light

LIGHTING: Warm golden Mediterranean light. Late afternoon sun. Sfumato on skin. Warm edge light catching the crown/wreath and hair/fur edges — creating a luminous separation from the background (NOT a religious halo or aureola — this is a lighting technique: a bright warm rim of light on top and edges of the subject, not a glowing circle). Luminous and divine.

PALETTE: warm gold, ochre, terracotta, olive, cream, marble white, sage, sky blue — sun-drenched

---

### heritage (code: heritage)

THE SUBJECT IS OLD MONEY ARISTOCRACY. Understated generational wealth.

ATTIRE — HUMANS ONLY:
Impeccably tailored period clothing — vary creatively from:
- Men: frock coat, morning coat, hunting jacket, Norfolk jacket, riding coat, double-breasted blazer; waistcoat in subtle pattern; silk cravat, ascot, bow tie with pin; crisp high-collar shirt
- Women: structured high-collar dress, riding habit, tea gown, tailored jacket, draped shawl; raw silk, fine wool, cashmere, taffeta, subtle brocade
- Accessories — vary: cashmere shawl, fur stole, leather gloves, riding crop, leather-bound book, pocket watch, lorgnette, cameo brooch, pearls, ivory fan, lace handkerchief
- Jewelry — understated heirlooms: signet ring, pearl earrings, thin gold bracelet, brooch, pocket watch chain, tie pin, cufflinks
- Colors — ALWAYS muted: charcoal, camel, hunter green, oxblood, navy, slate, dusty rose, taupe, cream
- Everything INHERITED — patina of generations, not new
- Children: Peter Pan collar, sailor suit, pinafore, knee shorts, smocked dress, hair ribbon

ATTIRE — ANIMALS ONLY:
Heritage animals are NOT bare — they have VISIBLE, high-quality accessories that communicate old-money refinement:
- Collar — ALWAYS PRESENT and prominent: fine leather collar (oxblood, British tan, dark brown) with polished brass buckle and engraved family crest tag; OR tartan collar (Stewart, Blackwatch, hunting tartan) with gold crest charm; OR pearl-studded collar with pendant
- Additional accessories — vary creatively: tweed vest or coat (herringbone, houndstooth); cashmere blanket draped over back/haunches; silk neckerchief or bow in muted tones
- Props nearby — leather-bound book, riding crop, top hat, pocket watch on chain, worn leather gloves — items that suggest the owner's world
- Impeccably groomed to a sheen — coat brushed, ears clean, nails trimmed
- Positioned as prized estate companion — on Persian rug, beside Chesterfield, on leather armchair, on tartan blanket

BACKGROUND — PAINTED ENGLISH/EUROPEAN SETTING:
IMPORTANT: Background is SECONDARY to the subject. All background elements are SUGGESTED with soft, atmospheric brushwork — painted as loose color masses and implied shapes, NOT sharp details. The background should feel 3-4 feet behind the subject, softer and darker. Think: how Gainsborough or Reynolds painted backgrounds — impressionistic, moody, atmospheric.
- Interior: Dark wood-paneled study or library — SOFTLY suggested:
  - Leather-bound books — blurred color masses on shelves, not individually readable
  - Ancestral portrait — a dim shape in a gilt frame, barely discernible
  - Fireplace — warm amber glow from below, suggested, not rendered
  - Heavy curtains — dark fabric folds, loose brushwork
  - Persian rug — muted pattern underfoot, soft focus
  - Furniture shapes — dark masses in shadow, implied not defined
- OR Exterior: English/Scottish countryside — ATMOSPHERIC:
  - Overcast sky, soft cloud formations
  - Rolling greens dissolving into mist, distant trees as soft shapes
  - Stone manor as a tiny atmospheric silhouette, far away
- The background is 2-3 stops DARKER than the subject — subject pops forward
- Painted with loose, atmospheric Old Masters brushwork — never competing with the subject

LIGHTING: Cool natural side light from tall sash windows. Even, refined, sophisticated. Warm amber undertone from fireplace. Gentle but with enough contrast to sculpt the face. Soft highlights on fabric texture.

PALETTE: charcoal, taupe, hunter green, oxblood, cream, burnished gold, tobacco, slate — desaturated, layered, rich

---

## STYLES (medium / technique)

{STYLE} controls HOW it's rendered. Mood controls WHAT is depicted.

UNIVERSAL RULE: The artwork covers 100% of the image surface. All four corners and edges have artwork content. Zero bare surface as border.

### oil-painting (Oil Painting)

Oil on canvas. Old Masters technique: Rembrandt, Velázquez, Van Dyck, Reynolds, Gainsborough, Lawrence. Visible impasto brushstrokes on highlights, smooth glazes on shadows. Craquelure aging. Warm amber varnish. Canvas weave texture in dark areas. This looks like a 200-year-old painting freshly cleaned and exhibited. Oil paint covers every inch of canvas edge to edge.

### acrylic (Acrylic)

Acrylic on canvas. Bold saturated color, smooth-to-textured blending, contemporary realism with classical composition. Visible brush texture. Paint covers every inch of canvas edge to edge.

### pencil-sketch (Pencil Sketch)

Graphite pencil on textured paper. Fine hatching, cross-hatching, tonal gradations. Paper grain visible throughout.

FULL COVERAGE: The background is rendered with DENSE graphite shading — heavy dark tones covering the entire paper surface to every edge and corner. The drawing extends beyond the visible frame as if this is a crop from a larger sheet. All four corners have graphite tone. No blank paper margin. No white border. The darkest background tones reach every edge.

Negative prompt: no color, no blank margins, no white borders, no empty corners, no vignette, no oval fade

### watercolor (Watercolor)

Watercolor on cold-pressed paper. Soft wet edges, transparent washes, paper grain, Turner-inspired luminosity.

FULL COVERAGE: The ENTIRE paper is pre-toned with a background wash in mood-appropriate colors BEFORE the subject is painted. This wash covers every corner and edge — there is zero white paper showing as border anywhere. The background wash extends fully to all edges. Think: the artist wet the entire sheet and laid in a toned ground first.

Negative prompt: no white paper border, no blank margins, no unpainted edges, no white corners

### charcoal (Charcoal)

Charcoal on paper. Deep blacks, dramatic contrast, smudged tones, expressive marks.

FULL COVERAGE: Heavy charcoal tones — blacks, grays, atmospheric smudges — fill the entire background to every edge and corner. The charcoal work extends beyond the visible frame. All four corners have charcoal tone. No blank paper. No white border.

Negative prompt: no color, no blank margins, no white borders, no empty corners, no vignette

### pastel (Pastel)

Soft pastel artwork. Velvety chalky texture, rich pigment, Degas-inspired, luminous finish.

FULL COVERAGE — CRITICAL: Dense pastel pigment covers the ENTIRE image surface — background, subject, every corner and edge. The background is filled with rich, layered pastel strokes in mood-appropriate colors reaching all four edges and corners. There is NO blank area, NO exposed paper edge, NO mat, NO border, NO paspatu anywhere. The image is 100% covered with pastel artwork from edge to edge — as if cropped from a larger pastel painting. Every pixel shows pastel color.

Negative prompt: no mat, no paspatu, no passepartout, no border, no paper edge, no white area, no blank margin, no frame, no mounting

---

## FORMAT & FRAMING

OUTPUT ASPECT RATIO — DYNAMIC RULE:
- If the input image is taller than wide (portrait / vertical orientation) → output **3:4**
- If the input image is wider than tall (landscape / horizontal orientation) → output **4:3**
- This applies regardless of the input's exact dimensions — always normalize to 3:4 or 4:3.

SUBJECT SIZE: 60-70% of image area.

FULL BLEED:
- Artwork fills entire frame edge to edge.
- All four corners contain painted/drawn content at full density.
- Image looks like a crop FROM a larger painting.
- For paper styles: background tones/washes cover entire surface corner to corner.

NEGATIVE PROMPT (ALWAYS APPLY):
No vignette, no faded edges, no radial gradient, no blank margins, no white borders, no empty corners, no oval fade, no medallion composition, no frames, no mat, no paspatu, no passepartout, no mounting, no canvas edges as border, no paper edges as border, no easel, no wall, no visible borders, no rounded corners.

---

## IDENTITY

Preserve the subject's exact facial features, face shape, eye color, skin tone, hairstyle and hair color from the original photo — do not alter or idealize.

For animals: preserve exact breed, fur color/pattern, markings, ear shape, eye color, body proportions.

---

## CRITICAL RULES

- MUSEUM QUALITY — every output must look like it belongs in a national gallery
- THE SUBJECT IS THE STAR — 60-70% of frame, sharpest detail, brightest light
- ATTIRE is richly detailed, varied creatively each generation — never the same combination twice
- BACKGROUND is a PAINTED SCENE with depth and narrative — not flat, not blurred like a photo, but painterly with visible brushwork and atmospheric perspective
- DRAMATIC LIGHTING — theatrical chiaroscuro, the subject glows against rich shadow
- AUTHENTIC PAINTING TEXTURE — visible brushstrokes, craquelure, canvas grain, varnish patina
- PRESERVE exact likeness from uploaded photo
- Never modernize
- Animals keep natural pose but look ALERT and DIGNIFIED
- Never cross-contaminate subject types
- {MOOD} controls: attire, background scene, lighting mood, palette
- {STYLE} controls: medium, technique, brushwork, texture, finish
- FULL BLEED — artwork covers 100% of surface

---

## Reference: Code IDs

| Code ID       | UI label     |
|--------------|--------------|
| royal_noble  | Royal        |
| neoclassical | Neoclassical |
| heritage     | Heritage     |

| Style ID      | Display name   |
|---------------|----------------|
| oil-painting  | Oil Painting   |
| acrylic       | Acrylic        |
| pencil-sketch | Pencil Sketch  |
| watercolor    | Watercolor     |
| charcoal      | Charcoal       |
| pastel        | Pastel         |
