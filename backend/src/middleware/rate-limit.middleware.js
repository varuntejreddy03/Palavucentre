import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

function buildLimiter({ windowMs, max, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const resetMs = req.rateLimit?.resetTime ? Number(req.rateLimit.resetTime) - Date.now() : windowMs;
      const retryAfter = Math.max(1, Math.ceil(resetMs / 1000));

      res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        error: "Too many requests",
        retryAfter,
        message,
      });
    },
  });
}

export const authRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts. Please try again later.",
});

export const orderRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many order attempts. Please wait a moment before retrying.",
});

export const orderTrackingRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many tracking attempts. Please wait a moment before retrying.",
});

export const publicFormRateLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many form submissions from this IP. Please try again later.",
});
