import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "college-os-api" }));
  app.use("/api/auth", authRouter);
  
  // Stubs for features to be rebuilt from scratch
  app.use("/api/dashboard/:role", (_req, res) => res.json({ metrics: {}, notices: [] }));
  app.use("/api/ai/chat", (_req, res) => res.json({ answer: "AI Studio is currently offline. Ready to be built from scratch." }));
  app.get([
    "/api/assignments",
    "/api/library"
  ], (_req, res) => res.json([]));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
