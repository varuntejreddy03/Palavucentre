import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function loginAdmin({ email, username, password }) {
  const identifier = (email || username || "").trim().toLowerCase();

  let admin = identifier
    ? await prisma.admin.findUnique({ where: { email: identifier } })
    : await prisma.admin.findFirst({
        where: { isActive: true },
        orderBy: { id: "asc" },
      });

  if (!admin || !admin.isActive) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    {
      sub: String(admin.id),
      email: admin.email,
      role: "admin",
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      lastLoginAt: admin.lastLoginAt,
    },
  };
}

export async function getAdminProfile(adminId) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      name: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!admin) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
  }

  return admin;
}
