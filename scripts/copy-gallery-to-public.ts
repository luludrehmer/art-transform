#!/usr/bin/env tsx
/**
 * Copies gallery images from assets to public/gallery/ for stable URLs.
 * These URLs are used by Medusa product images for Google Shopping / Pinterest.
 *
 * Run:  npm run copy-gallery
 * Or:   npx tsx scripts/copy-gallery-to-public.ts
 */

import { copyFile, mkdir, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SOURCES = [
  join(ROOT, "client", "src", "assets", "generated_gallery"),
  join(ROOT, "client", "src", "assets", "mood"),
];
const DEST = join(ROOT, "client", "public", "gallery");

async function main() {
  await mkdir(DEST, { recursive: true });

  let copied = 0;
  for (const srcDir of SOURCES) {
    const files = await readdir(srcDir).catch(() => []);
    const pngFiles = files.filter((f) => f.endsWith(".png"));
    for (const f of pngFiles) {
      await copyFile(join(srcDir, f), join(DEST, f));
      copied++;
    }
  }

  console.log(`✅ Copied ${copied} images to client/public/gallery/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
