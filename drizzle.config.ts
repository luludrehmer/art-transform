import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL_ART_TRANSFORM || process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL or DATABASE_URL_ART_TRANSFORM required");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
