#!/usr/bin/env tsx
/**
 * Regenerates gallery images (text-only, no source image).
 * Run with: npm run regenerate-gallery
 * Optional: npm run regenerate-gallery -- --only=family-oil-painting-1,family-oil-painting-2,...
 * Or: npm run regenerate-gallery -- --rejected  (regenerates only the rejected images list)
 *
 * Modes:
 * - Default: calls /api/generate on http://127.0.0.1:5001 (requires dev server)
 * - --standalone: calls Gemini API directly (no dev server needed)
 */

import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_URL = process.env.API_URL || "http://127.0.0.1:5001";
const DELAY_BETWEEN_REQUESTS_MS = 1500;

const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;
const IMAGES_PER_CATEGORY = 3;

const OUTPUT_DIR = join(ROOT, "client", "src", "assets", "generated_gallery");

type ImageSpec = { category: string; style: string; imgIndex: number };

function parseOnlyArg(arg: string): ImageSpec[] {
  const items = arg.split(",").map((s) => s.trim()).filter(Boolean);
  const result: ImageSpec[] = [];
  for (const item of items) {
    let found = false;
    for (const style of STYLES) {
      for (let imgIndex = 1; imgIndex <= IMAGES_PER_CATEGORY; imgIndex++) {
        const suffix = `-${style}-${imgIndex}`;
        if (item.endsWith(suffix)) {
          const category = item.slice(0, -suffix.length);
          if (CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
            result.push({ category, style, imgIndex });
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
  }
  return result;
}

// Rejected this round: repetitive, sad, illustration-like, same gender bias
const REJECTED_IMAGES = [
  "couples-pencil-sketch-2", "couples-watercolor-1", "couples-watercolor-2",
  "family-charcoal-3", "family-oil-painting-3", "family-pencil-sketch-2",
  "self-portrait-acrylic-2", "self-portrait-charcoal-3",
  "self-portrait-oil-painting-1", "self-portrait-oil-painting-2", "self-portrait-oil-painting-3",
  "self-portrait-pastel-1",
];

function getOnlyList(): ImageSpec[] | null {
  if (process.argv.includes("--rejected")) {
    return parseOnlyArg(REJECTED_IMAGES.join(","));
  }
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  const value = arg.slice("--only=".length);
  const list = parseOnlyArg(value);
  return list.length > 0 ? list : null;
}

function isStandalone(): boolean {
  return process.argv.includes("--standalone");
}

async function checkApiReachable(): Promise<void> {
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(5000) });
    if (res.status < 500) return; // Server is up
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause.message : "";
    throw new Error(
      `Cannot reach API at ${API_URL}. ${msg}${cause ? ` (${cause})` : ""}. ` +
      `Ensure the dev server is running: npm run dev`
    );
  }
}

async function generateImageViaApi(
  style: string,
  category: string,
  imgIndex: number
): Promise<string> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style, category, imgIndex }),
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
      throw new Error(
        `Server returned HTML instead of JSON. Restart the dev server (npm run dev) to pick up the /api/generate route, then try again.`
      );
    }
    throw new Error(`Unexpected response (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = JSON.parse(text);
  if (!res.ok) {
    throw new Error(`Generate failed: ${JSON.stringify(data)}`);
  }
  if (!data.imageUrl) {
    throw new Error("No imageUrl in response");
  }
  return data.imageUrl;
}

async function generateImage(
  style: string,
  category: string,
  imgIndex: number,
  standalone: boolean
): Promise<string> {
  if (standalone) {
    const { generateGalleryImage } = await import("../server/generate-gallery");
    return generateGalleryImage(style, category, imgIndex);
  }
  return generateImageViaApi(style, category, imgIndex);
}

function extractBase64FromDataUrl(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  return Buffer.from(match[1], "base64");
}

async function main() {
  const onlyList = getOnlyList();
  const tasks: ImageSpec[] = onlyList ?? (() => {
    const list: ImageSpec[] = [];
    for (const category of CATEGORIES) {
      for (const style of STYLES) {
        for (let imgIndex = 1; imgIndex <= IMAGES_PER_CATEGORY; imgIndex++) {
          list.push({ category, style, imgIndex });
        }
      }
    }
    return list;
  })();

  const standalone = isStandalone();
  console.log("Gallery regeneration script (text-only generation, no source images)");
  console.log("Mode:", standalone ? "standalone (Gemini API direct)" : `API (${API_URL})`);
  console.log("Output:", OUTPUT_DIR);
  console.log("Total images:", tasks.length, onlyList ? "(selected only)" : "");
  console.log("");

  if (!standalone) {
    await checkApiReachable();
  }
  await mkdir(OUTPUT_DIR, { recursive: true });

  let completed = 0;
  let failed = 0;
  const total = tasks.length;

  for (const { category, style, imgIndex } of tasks) {
    const outputFilename = `${category}-${style}-${imgIndex}.png`;
    const outputPath = join(OUTPUT_DIR, outputFilename);

    try {
      console.log(`[${completed + 1}/${total}] ${outputFilename}...`);
      const imageUrl = await generateImage(style, category, imgIndex, standalone);
      const buffer = extractBase64FromDataUrl(imageUrl);
      await writeFile(outputPath, buffer);
      console.log(`  OK`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const hint = msg.includes("fetch failed") || msg.includes("ECONNREFUSED")
        ? " (Is the dev server running? Try: npm run dev)"
        : "";
      console.error(`  FAILED:`, msg + hint);
      failed++;
      process.exitCode = 1;
    }

    completed++;
    if (completed < total) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS_MS));
    }
  }

  console.log("");
  console.log(`Done. ${completed - failed} images written, ${failed} failed.`);

  if (failed > 0) {
    console.log("Skipping gallery-images.ts generation due to failures.");
    return;
  }

  // Generate gallery-images.ts
  const galleryImagesPath = join(ROOT, "client", "src", "lib", "gallery-images.ts");
  const lines: string[] = [
    'import type { Category } from "@/lib/category-context";',
    'import type { ArtStyle } from "@shared/schema";',
    "",
    "// Auto-generated by scripts/regenerate-gallery.ts",
    "",
  ];

  const importVars: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    for (const style of STYLES) {
      for (let n = 1; n <= IMAGES_PER_CATEGORY; n++) {
        const varName = `${cat.replace(/-/g, "_")}_${style.replace(/-/g, "_")}_${n}`;
        const filename = `${cat}-${style}-${n}.png`;
        importVars[`${cat}-${style}-${n}`] = varName;
        lines.push(`import ${varName} from "@/assets/generated_gallery/${filename}";`);
      }
    }
  }

  lines.push("");
  lines.push("export const galleryImages: Record<Category, Record<ArtStyle, [string, string, string]>> = {");

  for (const cat of CATEGORIES) {
    lines.push(`  "${cat}": {`);
    for (const style of STYLES) {
      const imgs = [1, 2, 3].map((n) => importVars[`${cat}-${style}-${n}`]).join(", ");
      lines.push(`    "${style}": [${imgs}],`);
    }
    lines.push("  },");
  }

  lines.push("};");

  await writeFile(galleryImagesPath, lines.join("\n"));
  console.log(`Generated ${galleryImagesPath}`);
}

main();
