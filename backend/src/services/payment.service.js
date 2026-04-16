import { createHmac, timingSafeEqual } from "node:crypto";

import { StatusCodes } from "http-status-codes";

import { isRazorpayConfigured, razorpayClient } from "../config/razorpay.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { paiseToRupees } from "../utils/amounts.js";
import { serializeOrder, serializePayment } from "../utils/serializers.js";

const paymentOrderIncludes = {
  user: true,
  address: true,
  promoCodeRef: true,
  items: true,
  payments: {
    orderBy: { createdAt: "desc" },
  },
};

function assertRazorpayConfigured() {
  if (!isRazorpayConfigured || !razorpayClient) {
    throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Razorpay is not configured");
  }
}

function compareSignatures(expected, actual) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function createRazorpayOrderForPayment(paymentId) {
  assertRazorpayConfigured();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment record not found");
  }

  const razorpayOrder = await razorpayClient.orders.create({
    amount: payment.amountPaise,
    currency: payment.currency,
    receipt: payment.order.orderNumber,
    notes: {
      orderId: String(payment.orderId),
      orderNumber: payment.order.orderNumber,
      paymentId: String(payment.id),
    },
  });

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerOrderId: razorpayOrder.id,
      gatewayResponse: razorpayOrder,
    },
  });

  return {
    payment: serializePayment(updatedPayment),
    razorpay: {
      keyId: env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: paiseToRupees(payment.amountPaise),
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      receipt: payment.order.orderNumber,
    },
  };
}

export async function createRazorpayOrderForExistingOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: paymentOrderIncludes,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if (order.paymentStatus === "paid") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This order is already paid");
  }

  const reusablePayment = order.payments.find((payment) => payment.status === "pending" && !payment.providerOrderId);
  const payment =
    reusablePayment ||
    (await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "razorpay",
        status: "pending",
        amountPaise: order.grandTotalPaise,
        currency: order.currency,
      },
    }));

  const gatewayOrder = await createRazorpayOrderForPayment(payment.id);

  return {
    id: gatewayOrder.razorpay.orderId,
    order: serializeOrder(order),
    ...gatewayOrder,
  };
}

export async function verifyRazorpayPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, payload }) {
  assertRazorpayConfigured();

  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      providerOrderId: razorpayOrderId,
    },
    include: {
      order: {
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid payment verification payload");
  }

  const expectedSignature = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!compareSignatures(expectedSignature, razorpaySignature)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "failed",
        providerPaymentId: razorpayPaymentId,
        failureReason: "Signature verification failed",
        gatewayResponse: payload ?? { razorpayOrderId, razorpayPaymentId },
      },
    });

    throw new ApiError(StatusCodes.BAD_REQUEST, "Razorpay signature verification failed");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "paid",
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
        gatewayResponse: payload ?? { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        paidAt: new Date(),
        failureReason: null,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        orderStatus: payment.order.orderStatus === "cancelled" ? "cancelled" : "pending",
      },
    });

    return tx.order.findUnique({
      where: { id: orderId },
      include: paymentOrderIncludes,
    });
  });

  return serializeOrder(updatedOrder);
}
