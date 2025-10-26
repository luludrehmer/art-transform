import { type User, type InsertUser, type Transformation, type InsertTransformation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: string): Promise<Transformation | undefined>;
  updateTransformation(id: string, updates: Partial<Transformation>): Promise<Transformation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transformations: Map<string, Transformation>;

  constructor() {
    this.users = new Map();
    this.transformations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, credits: 3 };
    this.users.set(id, user);
    return user;
  }

  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const id = randomUUID();
    const transformation: Transformation = {
      ...insertTransformation,
      id,
      createdAt: new Date(),
    };
    this.transformations.set(id, transformation);
    return transformation;
  }

  async getTransformation(id: string): Promise<Transformation | undefined> {
    return this.transformations.get(id);
  }

  async updateTransformation(
    id: string,
    updates: Partial<Transformation>
  ): Promise<Transformation | undefined> {
    const transformation = this.transformations.get(id);
    if (!transformation) return undefined;

    const updated = { ...transformation, ...updates };
    this.transformations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
