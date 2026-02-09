#!/usr/bin/env tsx
/**
 * Migrate ALL stored base64 transformation images to ImgBB.
 *
 * This script reads every transformation in the art-transform database that has
 * a `transformedImageUrl` starting with "data:image", uploads it to ImgBB, and
 * replaces the column value with the stable ImgBB URL (i.ibb.co/...).
 *
 * After running this script:
 *   - All future checkouts that reference these transformations will get ImgBB URLs
 *   - The /api/transform/:id/image endpoint will redirect to ImgBB instead of
 *     decoding base64 on every request
 *   - Database storage shrinks dramatically (base64 → short URL)
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-imgbb.ts
 *   npx tsx scripts/migrate-images-to-imgbb.ts --dry-run
 *   npx tsx scripts/migrate-images-to-imgbb.ts --limit=50
 *   npx tsx scripts/migrate-images-to-imgbb.ts --id=0f9ce847-ff75-4935-b07c-2e49b57afaca
 *
 * Env:
 *   DATABASE_URL or DATABASE_URL_ART_TRANSFORM  (Neon Postgres)
 *   IMGBB_API_KEY                               (required unless --dry-run)
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { eq, isNotNull, sql, and, not, like } from 'drizzle-orm';
import ws from 'ws';
import * as schema from '../shared/schema';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_ART_TRANSFORM || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL or DATABASE_URL_ART_TRANSFORM must be set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const db = drizzle({ client: pool, schema });

// ─── helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limitVal = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const idArg = process.argv.find((a) => a.startsWith('--id='));
  const singleId = idArg ? idArg.split('=')[1] : undefined;

  if (!process.env.IMGBB_API_KEY && !dryRun) {
    console.error('IMGBB_API_KEY must be set (or use --dry-run).');
    process.exit(1);
  }

  // Lazy-import uploadToImgbb so --dry-run works even without sharp/imgbb deps
  const { uploadToImgbb } = await import('../server/imgbb.js');

  console.log(dryRun ? '--- DRY RUN (no uploads, no DB updates) ---\n' : '');

  // ─── query transformations ─────────────────────────────────────────────────
  let rows: schema.Transformation[];
  if (singleId) {
    const row = await db.select().from(schema.transformations).where(eq(schema.transformations.id, singleId));
    rows = row;
  } else {
    // Only rows that still have base64 data URLs (not yet migrated)
    rows = await db
      .select()
      .from(schema.transformations)
      .where(
        and(
          isNotNull(schema.transformations.transformedImageUrl),
          like(schema.transformations.transformedImageUrl, 'data:image%')
        )
      )
      .orderBy(schema.transformations.createdAt);

    if (limitVal && limitVal > 0) {
      rows = rows.slice(0, limitVal);
    }
  }

  console.log(`Found ${rows.length} transformation(s) with base64 images to migrate.\n`);
  if (rows.length === 0) {
    console.log('Nothing to migrate. All images are already on ImgBB or no transformations found.');
    await pool.end();
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const dataUrl = row.transformedImageUrl;
    if (!dataUrl) {
      skipped++;
      continue;
    }

    // Skip if already an ImgBB URL (safety check)
    if (dataUrl.startsWith('http')) {
      console.log(`  [${row.id}] Already a URL (${dataUrl.slice(0, 60)}…). Skip.`);
      skipped++;
      continue;
    }

    // Extract base64 from data URL
    const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!match) {
      console.warn(`  [${row.id}] Not a valid data URL. Skip.`);
      skipped++;
      continue;
    }

    console.log(`  [${row.id}] style=${row.style} created=${row.createdAt?.toISOString()}`);

    if (dryRun) {
      console.log(`    → (dry-run) would upload ${(match[1].length * 0.75 / 1024).toFixed(0)} KB`);
      migrated++;
      continue;
    }

    try {
      const buffer = Buffer.from(match[1], 'base64');
      const imgbbUrl = await uploadToImgbb(buffer, `transform-${row.id}`);

      // Update the DB row
      await db
        .update(schema.transformations)
        .set({ transformedImageUrl: imgbbUrl })
        .where(eq(schema.transformations.id, row.id));

      console.log(`    ✓ ${imgbbUrl}`);
      migrated++;

      // Small delay to respect ImgBB rate limits (free tier: ~100 uploads/hour)
      await sleep(800);
    } catch (err) {
      console.error(`    ✗ Failed:`, (err as Error).message);
      failed++;
      // Continue with next row
      await sleep(2000);
    }
  }

  console.log(`\n─── Summary ───`);
  console.log(`  Total:    ${rows.length}`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${failed}`);

  if (failed > 0) {
    console.log(`\nRe-run the script to retry failed uploads.`);
  }
  if (migrated > 0 && !dryRun) {
    console.log(`\nDone! The /api/transform/:id/image endpoint will now serve ImgBB redirects for migrated images.`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
