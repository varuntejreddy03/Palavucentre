import { StatusCodes } from "http-status-codes";

import {
  createRazorpayOrderForVerifiedOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";

export async function createRazorpayOrderHandler(req, res) {
  const data = await createRazorpayOrderForVerifiedOrder(req.body);

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
