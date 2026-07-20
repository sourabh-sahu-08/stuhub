import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { pyqRouter } from "./routes/pyq.routes.js";
import { pyqAnalyzerRouter } from "./routes/pyq-analyzer.routes.js";
import { notesRouter } from "./routes/notes.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "stuhub-api" }));
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/pyq", pyqRouter);
  app.use("/api/pyq-analyzer", pyqAnalyzerRouter);
  app.use("/api/notes", notesRouter);
  
  // Stubs for features to be rebuilt from scratch
  app.use("/api/dashboard/:role", (_req, res) => res.json({ metrics: {}, notices: [] }));
  app.use("/api/ai/chat", (_req, res) => res.json({ answer: "AI Studio is currently offline. Ready to be built from scratch." }));
  app.get([
    "/api/assignments"
  ], (_req, res) => res.json([]));

  // Serve Frontend in Production
  if (env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Serve static files from frontend/dist
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));

    // Handle React Router catch-all
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "../../frontend/dist", "index.html"));
    });
  } else {
    app.use(notFound);
  }

  app.use(errorHandler);

  return app;
}
