#!/usr/bin/env tsx
/**
 * Direct DB injection of SEO metadata — bypasses Medusa API entirely.
 * Updates variant metadata + SKU and product metadata directly in PostgreSQL.
 * Takes seconds instead of hours. No OOM risk.
 *
 * After running, trigger MeiliSearch re-index via Medusa admin or API.
 *
 * Run:  npm run medusa-inject-seo-db
 *       npm run medusa-inject-seo-db -- --dry-run
 *
 * Requires: MEDUSA_DB_URL (public Railway Postgres URL) in .env
 *           or pass via --db-url=postgresql://...
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import pg from "pg";

const { Client } = pg;

const DRY_RUN = process.argv.includes("--dry-run");
const INPUT_FILE =
  process.argv.find((a) => a.startsWith("--file="))?.split("=")[1] ||
  "art-transform-seo-metadata.json";

const DB_URL =
  process.argv.find((a) => a.startsWith("--db-url="))?.split("=").slice(1).join("=") ||
  process.env.MEDUSA_DB_URL ||
  "";

interface SeoData {
  generatedAt: string;
  products: { id: string; handle: string; metadata: Record<string, string> }[];
  variants: {
    productId: string;
    variantId: string;
    sku: string;
    metadata: Record<string, unknown>;
  }[];
}

async function main() {
  if (!DB_URL) {
    console.error("Set MEDUSA_DB_URL in .env or pass --db-url=postgresql://...");
    console.error("Railway public URL: postgresql://postgres:PASSWORD@metro.proxy.rlwy.net:PORT/railway");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), INPUT_FILE);
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    console.error("Run first: npm run medusa-generate-seo");
    process.exit(1);
  }

  const data: SeoData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log("=== Medusa Inject SEO (Direct DB) ===");
  console.log(`Input: ${data.products.length} products, ${data.variants.length} variants`);
  console.log(`Dry run: ${DRY_RUN}\n`);

  const client = new Client({ connectionString: DB_URL, ssl: false });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected.\n");

    // Check tables exist
    const tableCheck = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name IN ('product', 'product_variant') AND table_schema = 'public'`
    );
    const tables = tableCheck.rows.map((r: any) => r.table_name);
    console.log(`Tables found: ${tables.join(", ")}`);

    if (!tables.includes("product") || !tables.includes("product_variant")) {
      console.error("Missing required tables. Checking all tables...");
      const allTables = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
      );
      console.log("Available tables:", allTables.rows.map((r: any) => r.table_name).join(", "));
      process.exit(1);
    }

    // Check current state
    const countResult = await client.query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN metadata->>'seo_title' IS NOT NULL THEN 1 END) as with_seo FROM product_variant`
    );
    const { total, with_seo } = countResult.rows[0];
    console.log(`Variants in DB: ${total} total, ${with_seo} already have seo_title\n`);

    if (DRY_RUN) {
      console.log("=== DRY RUN — no changes made ===");
      console.log(`Would update: ${data.products.length} products, ${data.variants.length} variants`);
      // Show sample
      if (data.variants.length > 0) {
        const sample = data.variants[0];
        console.log("\nSample variant update:");
        console.log(`  ID: ${sample.variantId}`);
        console.log(`  SKU: ${sample.sku}`);
        console.log(`  seo_title: ${(sample.metadata as any).seo_title}`);
      }
      return;
    }

    // === Update Products ===
    console.log("--- Updating products ---");
    let prodOk = 0;
    let prodFail = 0;
    for (const p of data.products) {
      try {
        const result = await client.query(
          `UPDATE product SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb WHERE id = $2`,
          [JSON.stringify(p.metadata), p.id]
        );
        if (result.rowCount && result.rowCount > 0) {
          prodOk++;
          console.log(`  ✅ ${p.handle}`);
        } else {
          prodFail++;
          console.log(`  ⚠ ${p.handle}: not found (id=${p.id})`);
        }
      } catch (err: any) {
        prodFail++;
        console.error(`  ❌ ${p.handle}: ${err.message}`);
      }
    }
    console.log(`  Products: ${prodOk} ok, ${prodFail} failed\n`);

    // === Update Variants (batch) ===
    console.log("--- Updating variants ---");
    const BATCH = 50;
    let varOk = 0;
    let varFail = 0;
    const startTime = Date.now();

    for (let i = 0; i < data.variants.length; i += BATCH) {
      const batch = data.variants.slice(i, i + BATCH);

      // Build batch update using a CTE
      const values: string[] = [];
      const params: any[] = [];
      for (let j = 0; j < batch.length; j++) {
        const v = batch[j];
        const paramIdx = j * 3;
        values.push(`($${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}::jsonb)`);
        params.push(v.variantId, v.sku, JSON.stringify(v.metadata));
      }

      const sql = `
        UPDATE product_variant AS pv
        SET
          sku = vals.new_sku,
          metadata = vals.new_metadata
        FROM (VALUES ${values.join(",")}) AS vals(vid, new_sku, new_metadata)
        WHERE pv.id = vals.vid
      `;

      try {
        const result = await client.query(sql, params);
        varOk += result.rowCount || 0;
        const done = Math.min(i + BATCH, data.variants.length);
        const pct = Math.round((done / data.variants.length) * 100);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  [${done}/${data.variants.length}] ${pct}% | ${varOk} updated | ${elapsed}s`);
      } catch (err: any) {
        varFail += batch.length;
        console.error(`  ❌ Batch at ${i}: ${err.message}`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== Done ===`);
    console.log(`Products: ${prodOk} ok, ${prodFail} failed`);
    console.log(`Variants: ${varOk} updated, ${varFail} failed (of ${data.variants.length})`);
    console.log(`Time: ${elapsed}s`);
    console.log(`\nNext: trigger MeiliSearch re-index via Medusa Admin or restart the backend service.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
