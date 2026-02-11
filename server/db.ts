import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_ART_TRANSFORM || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL or DATABASE_URL_ART_TRANSFORM must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString,
  // Keep connections alive during long Gemini processing (up to 3 min)
  idleTimeoutMillis: 300_000, // 5 min idle before closing
  connectionTimeoutMillis: 10_000,
  max: 10,
});

// Keep-alive: ping the pool every 60s to prevent WebSocket idle disconnects
setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch {
    // Silently ignore — pool will reconnect on next real query
  }
}, 60_000);

export const db = drizzle({ client: pool, schema });
