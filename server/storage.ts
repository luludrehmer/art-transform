import { 
  users, 
  transformations,
  type User, 
  type UpsertUser, 
  type Transformation, 
  type InsertTransformation 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Credit operations
  getUserCredits(userId: string): Promise<number>;
  deductCredits(userId: string, amount: number): Promise<boolean>;
  
  // Transformation operations
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: string): Promise<Transformation | undefined>;
  updateTransformation(id: string, updates: Partial<Transformation>): Promise<Transformation | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Credit operations
  async getUserCredits(userId: string): Promise<number> {
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));
    return user?.credits ?? 0;
  }

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.credits < amount) {
      return false;
    }

    const [updated] = await db
      .update(users)
      .set({ 
        credits: user.credits - amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updated !== undefined;
  }

  // Transformation operations
  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const [transformation] = await db
      .insert(transformations)
      .values(insertTransformation)
      .returning();
    return transformation;
  }

  async getTransformation(id: string): Promise<Transformation | undefined> {
    const [transformation] = await db
      .select()
      .from(transformations)
      .where(eq(transformations.id, id));
    return transformation;
  }

  async updateTransformation(
    id: string,
    updates: Partial<Transformation>
  ): Promise<Transformation | undefined> {
    const [updated] = await db
      .update(transformations)
      .set(updates)
      .where(eq(transformations.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
