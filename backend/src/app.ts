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
import { assignmentsRouter } from "./routes/assignments.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { settingsRouter } from "./routes/settings.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));
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
  app.use("/api/assignments", assignmentsRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/ai", aiRouter);

  // Serve Frontend statically (works regardless of NODE_ENV on Render)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // Catch-all for non-API routes (serves React app)
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist", "index.html"));
  });

  // Any remaining /api/* routes that weren't caught will hit this 404
  app.use("/api", notFound);

  // General 404 for anything else just in case
  app.use(notFound);

  app.use(errorHandler);

  return app;
}
