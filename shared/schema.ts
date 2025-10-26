import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const artStyles = {
  oilPainting: "oil-painting",
  acrylic: "acrylic",
  pencilSketch: "pencil-sketch",
  watercolor: "watercolor",
  charcoal: "charcoal",
  pastel: "pastel",
} as const;

export type ArtStyle = typeof artStyles[keyof typeof artStyles];

export const transformations = pgTable("transformations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalImageUrl: text("original_image_url").notNull(),
  transformedImageUrl: text("transformed_image_url"),
  style: varchar("style", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransformationSchema = createInsertSchema(transformations).omit({
  id: true,
  createdAt: true,
});

export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: integer("credits").notNull().default(3),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface StyleInfo {
  id: ArtStyle;
  name: string;
  description: string;
  intensity: number;
  texture: number;
  detail: number;
  image: string;
}
