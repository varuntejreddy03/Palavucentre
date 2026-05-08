import { createHmac, timingSafeEqual } from "node:crypto";

import { StatusCodes } from "http-status-codes";

import { isRazorpayConfigured, razorpayClient } from "../config/razorpay.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { serializePublicOrder } from "../serializers/order.public.serializer.js";
import { serializePublicRazorpayOrder } from "../serializers/payment.public.serializer.js";
import { ApiError } from "../utils/ApiError.js";
import { paiseToRupees } from "../utils/amounts.js";
import { serializePayment } from "../utils/serializers.js";

const paymentOrderIncludes = {
  user: true,
  address: true,
  promoCodeRef: true,
  items: true,
  payments: {
    orderBy: { createdAt: "desc" },
  },
};

export const MIN_RAZORPAY_AMOUNT_PAISE = 100;

function assertRazorpayConfigured() {
  if (!isRazorpayConfigured || !razorpayClient) {
    throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Razorpay is not configured");
  }
}

export function assertRazorpayPaymentAmount(amountPaise) {
  const normalizedAmountPaise = Number(amountPaise) || 0;

  if (normalizedAmountPaise < MIN_RAZORPAY_AMOUNT_PAISE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Online payment requires at least INR 1 payable. Choose cash at pickup for this order.",
    );
  }
}

function buildRazorpayErrorDetails(error) {
  return {
    provider: "razorpay",
    statusCode: error?.statusCode || error?.status_code || error?.response?.statusCode || null,
    code: error?.error?.code || error?.code || null,
    description: error?.error?.description || error?.description || null,
    reason: error?.error?.reason || error?.reason || null,
  };
}

function toRazorpayGatewayError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    StatusCodes.BAD_GATEWAY,
    "Could not start Razorpay payment. Please retry or choose cash at pickup.",
    buildRazorpayErrorDetails(error),
  );
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

  assertRazorpayPaymentAmount(payment.amountPaise);

  let razorpayOrder;

  try {
    razorpayOrder = await razorpayClient.orders.create({
      amount: payment.amountPaise,
      currency: payment.currency,
      receipt: payment.order.orderNumber,
      notes: {
        orderId: String(payment.orderId),
        orderNumber: payment.order.orderNumber,
        paymentId: String(payment.id),
      },
    });
  } catch (error) {
    throw toRazorpayGatewayError(error);
  }

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

export async function createRazorpayOrderForVerifiedOrder({ orderNumber, phone }) {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      phone,
    },
    include: paymentOrderIncludes,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found for the provided order number and phone");
  }

  if (order.paymentStatus === "paid") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This order is already paid");
  }

  if (order.paymentMethod !== "online") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This order is not configured for online payment");
  }

  assertRazorpayPaymentAmount(order.grandTotalPaise);

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

  return serializePublicRazorpayOrder({
    ...gatewayOrder.razorpay,
    orderNumber: order.orderNumber,
  });
}

export async function verifyRazorpayPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, payload }) {
  assertRazorpayConfigured();

  const payment = await prisma.payment.findFirst({
    where: {
      providerOrderId: razorpayOrderId,
    },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid payment verification payload");
  }

  if (orderId && payment.orderId !== Number(orderId)) {
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
      where: { id: payment.orderId },
      data: {
        paymentStatus: "paid",
        orderStatus: payment.order.orderStatus === "cancelled" ? "cancelled" : "pending",
      },
    });

    return tx.order.findUnique({
      where: { id: payment.orderId },
      include: paymentOrderIncludes,
    });
  });

  return serializePublicOrder(updatedOrder);
}
