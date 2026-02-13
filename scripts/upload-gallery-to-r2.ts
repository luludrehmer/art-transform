#!/usr/bin/env tsx
/**
 * Uploads gallery images to R2 for stable Medusa product URLs.
 * Use when ai.art-and-see.com/gallery/ returns 404 (e.g. hosting limits).
 *
 * Run:  npm run copy-gallery   (ensures client/public/gallery/ has all images)
 *       npm run upload-gallery-to-r2
 *
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE
 *
 * After upload, set ART_TRANSFORM_GALLERY_BASE_URL in .env for medusa-inject-images:
 *   ART_TRANSFORM_GALLERY_BASE_URL=https://pub-xxx.r2.dev/art-transform-gallery
 */

import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const R2_FOLDER = "art-transform-gallery";
const GALLERY_SOURCES = [
  join(ROOT, "client", "src", "assets", "generated_gallery"),
  join(ROOT, "client", "src", "assets", "mood"),
];
const GALLERY_PUBLIC = join(ROOT, "client", "public", "gallery");

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBase = process.env.R2_PUBLIC_BASE;

  if (!accountId || !accessKey || !secretKey || !bucket || !publicBase) {
    console.error(
      "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE"
    );
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const baseUrl = publicBase.startsWith("http")
    ? publicBase.replace(/\/$/, "")
    : `https://${publicBase.replace(/\/$/, "")}`;
  const galleryBaseUrl = `${baseUrl}/${R2_FOLDER}`;

  const files: { path: string; name: string }[] = [];
  for (const src of GALLERY_SOURCES) {
    const list = await readdir(src).catch(() => []);
    for (const f of list) {
      if (f.endsWith(".png")) files.push({ path: join(src, f), name: f });
    }
  }

  if (files.length === 0) {
    console.error("No PNG files in generated_gallery or mood. Run npm run copy-gallery first.");
    process.exit(1);
  }

  console.log(`Uploading ${files.length} images to R2/${R2_FOLDER}/...`);

  let uploaded = 0;
  for (const { path: filePath, name } of files) {
    const body = await readFile(filePath);
    const key = `${R2_FOLDER}/${name}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000",
      })
    );
    uploaded++;
    if (uploaded % 50 === 0) console.log(`  ${uploaded}/${files.length}`);
  }

  console.log(`\n✅ Uploaded ${uploaded} images to R2`);
  console.log(`\nSet in .env for medusa-inject-images:`);
  console.log(`  ART_TRANSFORM_GALLERY_BASE_URL=${galleryBaseUrl}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
