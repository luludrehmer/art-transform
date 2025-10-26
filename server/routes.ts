import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTransformationSchema } from "@shared/schema";

const simulateTransformation = async (originalImageUrl: string, style: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return originalImageUrl;
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/transform", async (req, res) => {
    try {
      const validatedData = insertTransformationSchema.parse(req.body);
      
      if (!validatedData.originalImageUrl || validatedData.originalImageUrl.length === 0) {
        res.status(400).json({ error: "Original image is required" });
        return;
      }

      const transformation = await storage.createTransformation({
        ...validatedData,
        status: "processing",
      });

      (async () => {
        try {
          const transformedImageUrl = await simulateTransformation(
            validatedData.originalImageUrl,
            validatedData.style
          );
          
          await storage.updateTransformation(transformation.id, {
            status: "completed",
            transformedImageUrl,
          });
        } catch (error) {
          console.error("Transformation processing error:", error);
          await storage.updateTransformation(transformation.id, {
            status: "failed",
          });
        }
      })();

      res.json({ 
        success: true, 
        transformationId: transformation.id,
        transformation 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transformation" });
      }
    }
  });

  app.get("/api/transform/:id", async (req, res) => {
    try {
      const transformation = await storage.getTransformation(req.params.id);
      
      if (!transformation) {
        res.status(404).json({ error: "Transformation not found" });
        return;
      }

      res.json(transformation);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transformation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
