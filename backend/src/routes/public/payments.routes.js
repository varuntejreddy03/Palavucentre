import { Router } from "express";

import {
  createRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
} from "../../controllers/payment.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from "../../validators/payment.validator.js";

const router = Router();

router.post("/razorpay/order", validate(createRazorpayOrderSchema), asyncHandler(createRazorpayOrderHandler));
router.post("/razorpay/verify", validate(verifyRazorpayPaymentSchema), asyncHandler(verifyRazorpayPaymentHandler));

export { router as publicPaymentRoutes };
