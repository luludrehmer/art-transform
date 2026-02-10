#!/usr/bin/env tsx
/**
 * Regenerates gallery images with mood × category × medium × variant.
 *
 * Run:  npm run regenerate-gallery -- --standalone
 * Filter: npm run regenerate-gallery -- --standalone --mood=royal_noble
 *         npm run regenerate-gallery -- --standalone --mood=royal_noble --category=pets
 *         npm run regenerate-gallery -- --standalone --mood=royal_noble --style=oil-painting
 *         npm run regenerate-gallery -- --standalone --only=royal_noble--pets-oil-painting-1
 *
 * Without --standalone: calls /api/generate on the dev server (must be running).
 */

import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_URL = process.env.API_URL || "http://127.0.0.1:5001";
const DELAY_BETWEEN_REQUESTS_MS = 2000;
const MAX_RETRIES = 2;

const MOODS = ["royal_noble", "neoclassical", "heritage"] as const;
const CATEGORIES = ["pets", "family", "kids", "couples", "self-portrait"] as const;
const STYLES = ["oil-painting", "acrylic", "pencil-sketch", "watercolor", "charcoal", "pastel"] as const;
const IMAGES_PER_COMBO = 3;

const OUTPUT_DIR = join(ROOT, "client", "src", "assets", "mood");

type MoodId = (typeof MOODS)[number];

const MOOD_LABELS: Record<MoodId, string> = {
  royal_noble: "Royal",
  neoclassical: "Neoclassical",
  heritage: "Heritage",
};

type ImageSpec = { mood: MoodId; category: string; style: string; imgIndex: number };

// ---------- CLI parsing ----------

function getCliArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg?.slice(`--${name}=`.length);
}

function parseOnlyArg(arg: string): ImageSpec[] {
  const items = arg.split(",").map((s) => s.trim()).filter(Boolean);
  const result: ImageSpec[] = [];
  for (const item of items) {
    // Format: mood--category-style-index  e.g. royal_noble--pets-oil-painting-1
    for (const mood of MOODS) {
      const prefix = `${mood}--`;
      if (!item.startsWith(prefix)) continue;
      const rest = item.slice(prefix.length);
      for (const style of STYLES) {
        for (let idx = 1; idx <= IMAGES_PER_COMBO; idx++) {
          const suffix = `-${style}-${idx}`;
          if (rest.endsWith(suffix)) {
            const category = rest.slice(0, -suffix.length);
            if (CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
              result.push({ mood, category, style, imgIndex: idx });
            }
          }
        }
      }
    }
  }
  return result;
}

function buildTaskList(): ImageSpec[] {
  const onlyArg = getCliArg("only");
  if (onlyArg) {
    const list = parseOnlyArg(onlyArg);
    if (list.length > 0) return list;
    console.warn("Warning: --only did not match any valid specs, running full generation.");
  }

  const moodFilter = getCliArg("mood") as MoodId | undefined;
  const catFilter = getCliArg("category");
  const styleFilter = getCliArg("style");

  const moods = moodFilter ? [moodFilter] : [...MOODS];
  const cats = catFilter ? [catFilter] : [...CATEGORIES];
  const styles = styleFilter ? [styleFilter] : [...STYLES];

  const list: ImageSpec[] = [];
  for (const mood of moods) {
    for (const category of cats) {
      for (const style of styles) {
        for (let imgIndex = 1; imgIndex <= IMAGES_PER_COMBO; imgIndex++) {
          list.push({ mood: mood as MoodId, category, style, imgIndex });
        }
      }
    }
  }
  return list;
}

function isStandalone(): boolean {
  return process.argv.includes("--standalone");
}

// ---------- generation ----------

async function checkApiReachable(): Promise<void> {
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(5000) });
    if (res.status < 500) return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot reach API at ${API_URL}. ${msg}. Ensure the dev server is running: npm run dev`
    );
  }
}

async function generateImageStandalone(spec: ImageSpec): Promise<string> {
  const { generateGalleryImage } = await import("../server/generate-gallery");
  return generateGalleryImage(spec.style, spec.category, spec.imgIndex, spec.mood);
}

async function generateImageViaApi(spec: ImageSpec): Promise<string> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style: spec.style, category: spec.category, imgIndex: spec.imgIndex, mood: spec.mood }),
  });
  const text = await res.text();
  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Unexpected response (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(`Generate failed: ${JSON.stringify(data)}`);
  if (!data.imageUrl) throw new Error("No imageUrl in response");
  return data.imageUrl;
}

async function generateImage(spec: ImageSpec, standalone: boolean): Promise<string> {
  return standalone ? generateImageStandalone(spec) : generateImageViaApi(spec);
}

function extractBase64FromDataUrl(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format");
  return Buffer.from(match[1], "base64");
}

function specToFilename(spec: ImageSpec): string {
  return `${spec.mood}--${spec.category}-${spec.style}-${spec.imgIndex}.png`;
}

// ---------- main ----------

async function main() {
  const tasks = buildTaskList();
  const standalone = isStandalone();

  const moodCount = new Set(tasks.map((t) => t.mood)).size;
  const catCount = new Set(tasks.map((t) => t.category)).size;
  const styleCount = new Set(tasks.map((t) => t.style)).size;

  console.log("=== Mood × Category × Medium Gallery Generator ===");
  console.log(`Mode: ${standalone ? "standalone (Gemini API direct)" : `API (${API_URL})`}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Tasks: ${tasks.length} images (${moodCount} moods × ${catCount} categories × ${styleCount} mediums × ${IMAGES_PER_COMBO} variants)`);
  console.log("");

  if (!standalone) {
    await checkApiReachable();
  }
  await mkdir(OUTPUT_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < tasks.length; i++) {
    const spec = tasks[i];
    const filename = specToFilename(spec);
    const outputPath = join(OUTPUT_DIR, filename);

    const label = `${MOOD_LABELS[spec.mood]} / ${spec.category} / ${spec.style} #${spec.imgIndex}`;
    console.log(`[${i + 1}/${tasks.length}] ${label}`);

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const imageUrl = await generateImage(spec, standalone);
        const buffer = extractBase64FromDataUrl(imageUrl);
        await writeFile(outputPath, buffer);
        console.log(`  ✅ ${filename}`);
        ok++;
        success = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt < MAX_RETRIES) {
          console.log(`  ⚠️  Retry ${attempt}/${MAX_RETRIES}: ${msg}`);
          await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS_MS));
        } else {
          console.error(`  ❌ FAILED: ${msg}`);
          fail++;
        }
      }
    }

    if (i < tasks.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS_MS));
    }
  }

  console.log("");
  console.log(`Done. ${ok} succeeded, ${fail} failed.`);
  console.log(`Images saved to: ${OUTPUT_DIR}`);

  if (fail > 0) process.exitCode = 1;
}

main();
