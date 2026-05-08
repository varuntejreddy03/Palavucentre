import { Router } from "express";

import {
  createRazorpayOrderHandler,
  razorpayWebhookHandler,
  verifyRazorpayPaymentHandler,
} from "../../controllers/payment.controller.js";
import { requireUserAuth } from "../../middleware/user-auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from "../../validators/payment.validator.js";

const router = Router();

router.post("/razorpay/webhook", asyncHandler(razorpayWebhookHandler));

router.use(requireUserAuth);

router.post("/razorpay/order", validate(createRazorpayOrderSchema), asyncHandler(createRazorpayOrderHandler));
router.post("/razorpay/verify", validate(verifyRazorpayPaymentSchema), asyncHandler(verifyRazorpayPaymentHandler));

export { router as publicPaymentRoutes };
