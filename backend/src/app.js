import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { uploadsRootDir } from "./config/paths.js";
import { doubleCsrfProtection } from "./middleware/csrf.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { securityHeaders, sanitizeResponses, apiAbuseProtection } from "./middleware/security.middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  mkdirSync(uploadsRootDir, { recursive: true });

  app.use(
    pinoHttp({
      logger,
      genReqId(req) {
        return req.headers["x-request-id"] || randomUUID();
      },
      autoLogging: {
        ignore(req) {
          return req.url === "/" || req.url === "/api/health" || req.url.startsWith("/uploads/");
        },
      },
      customLogLevel(req, res, error) {
        if (error || res.statusCode >= 500) {
          return "error";
        }

        if (res.statusCode >= 400) {
          return "warn";
        }

        if (res.statusCode === 304) {
          return "silent";
        }

        return "info";
      },
    }),
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use((_req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "accelerometer=(), ambient-light-sensor=(), gyroscope=(), magnetometer=()",
    );
    next();
  });
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(securityHeaders);
  app.use(sanitizeResponses);
  app.use(apiAbuseProtection);
  app.use(
    "/uploads",
    express.static(uploadsRootDir, {
      maxAge: env.isProduction ? "7d" : 0,
    }),
  );

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "RajaMahendravaram PalavuCentre backend is running",
    });
  });

  app.use(doubleCsrfProtection);
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
