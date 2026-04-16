import { StatusCodes } from "http-status-codes";

import {
  createRazorpayOrderForExistingOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";

export async function createRazorpayOrderHandler(req, res) {
  const data = await createRazorpayOrderForExistingOrder(req.body.orderId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Razorpay order created",
    data,
  });
}

export async function verifyRazorpayPaymentHandler(req, res) {
  const data = await verifyRazorpayPayment(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payment verified successfully",
    data,
  });
}
