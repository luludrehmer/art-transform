import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// #region agent log
// Prevent Neon DB connection drops from crashing the process
process.on("unhandledRejection", (reason, promise) => {
  console.error("[PROCESS] Unhandled rejection (caught, not crashing):", reason);
  fetch('http://127.0.0.1:7244/ingest/8bafcb4e-d69c-4c68-b1ee-557414709f1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.ts:unhandledRejection',message:'Unhandled rejection caught',data:{reason:String(reason)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
});
process.on("uncaughtException", (err) => {
  console.error("[PROCESS] Uncaught exception (caught, not crashing):", err?.message || err);
  fetch('http://127.0.0.1:7244/ingest/8bafcb4e-d69c-4c68-b1ee-557414709f1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.ts:uncaughtException',message:'Uncaught exception caught',data:{error:String(err?.message||err),code:(err as any)?.code},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
});
// #endregion

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: '100mb', // Increased for multi-photo uploads (up to 14 images)
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '100mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  const host = process.env.HOST || (app.get("env") === "development" ? "127.0.0.1" : "0.0.0.0");
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
