import pino from "pino";

import { env } from "./env.js";

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  transport: env.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-razorpay-signature']",
      "res.headers['set-cookie']",
      "body.password",
      "body.code",
      "body.razorpaySignature",
    ],
    censor: "[Redacted]",
  },
});
