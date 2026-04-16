import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(error, req, res, _next) {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let details = null;
  const errorMessage = String(error?.message || "");

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed";
    details = error.flatten();
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = StatusCodes.CONFLICT;
      message = "A record with the same unique value already exists";
      details = error.meta;
    } else if (error.code === "P2025") {
      statusCode = StatusCodes.NOT_FOUND;
      message = "Requested record was not found";
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = "Database is unavailable. Check DATABASE_URL and make sure the database server is reachable.";
    details = env.isProduction
      ? null
      : {
          prismaMessage: error.message,
        };
  } else if (
    errorMessage.includes("Can't reach database server") ||
    errorMessage.includes("can-connect-to-database") ||
    errorMessage.includes("ECONNREFUSED")
  ) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = "Database is unavailable. Check DATABASE_URL and make sure the database server is reachable.";
    details = env.isProduction
      ? null
      : {
          prismaMessage: errorMessage,
        };
  }

  req.log?.error(
    {
      err: error,
      statusCode,
      details,
    },
    message,
  );

  res.status(statusCode).json({
    success: false,
    error: message,
    message,
    details,
    ...(env.isProduction ? {} : { stack: error.stack }),
  });
}
