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

// #region agent log
pool.on("error", (err) => {
  console.error("[DB Pool] Unhandled pool error (caught, not crashing):", err?.message || err);
  fetch('http://127.0.0.1:7244/ingest/8bafcb4e-d69c-4c68-b1ee-557414709f1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/db.ts:pool.on-error',message:'Pool error caught',data:{error:String(err?.message||err),code:(err as any)?.code},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
});
// #endregion

// Keep-alive: ping the pool every 60s to prevent WebSocket idle disconnects
setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch (err: any) {
    // #region agent log
    console.warn("[DB Pool] Keep-alive ping failed:", err?.message);
    fetch('http://127.0.0.1:7244/ingest/8bafcb4e-d69c-4c68-b1ee-557414709f1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/db.ts:keepalive',message:'Keep-alive ping failed',data:{error:String(err?.message||err)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }
}, 60_000);

export const db = drizzle({ client: pool, schema });
