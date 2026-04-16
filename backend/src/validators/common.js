import { z } from "zod";

const emptyStringToUndefined = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const optionalTrimmedString = z.preprocess(emptyStringToUndefined, z.string().trim().optional());

const normalizePhone = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  return String(value)
    .trim()
    .replace(/\D/g, "");
};

export const phoneSchema = z.preprocess(
  normalizePhone,
  z.string().regex(/^\d{10,12}$/, "Phone number must be 10 to 12 digits"),
);

export const emailSchema = z.string().trim().email("A valid email address is required");
export const optionalEmailSchema = z.preprocess(emptyStringToUndefined, emailSchema.optional());

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  search: optionalTrimmedString,
});

export const booleanishSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const urlSchema = z.string().trim().url();

export const optionalUrlSchema = z.preprocess(emptyStringToUndefined, z.string().trim().url().optional());

const isAssetUrl = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  return z.string().url().safeParse(trimmed).success;
};

export const assetUrlSchema = z
  .string()
  .trim()
  .refine(isAssetUrl, "A valid asset URL or root-relative asset path is required");

export const optionalAssetUrlSchema = z.preprocess(emptyStringToUndefined, assetUrlSchema.optional());
