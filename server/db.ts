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

const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
