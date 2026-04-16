import { Router } from "express";

import { createOrderHandler, getOrderHandler, trackOrderHandler } from "../../controllers/order.controller.js";
import { orderRateLimiter, orderTrackingRateLimiter } from "../../middleware/rate-limit.middleware.js";
import { attachOptionalUser } from "../../middleware/user-auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createOrderSchema, orderIdParamSchema, trackOrderSchema } from "../../validators/order.validator.js";

const router = Router();

router.post("/", attachOptionalUser, orderRateLimiter, validate(createOrderSchema), asyncHandler(createOrderHandler));
router.get("/:id", validate(orderIdParamSchema), asyncHandler(getOrderHandler));
router.post("/track", orderTrackingRateLimiter, validate(trackOrderSchema), asyncHandler(trackOrderHandler));

export { router as publicOrderRoutes };
