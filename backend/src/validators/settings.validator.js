import { z } from "zod";

import { assetUrlSchema, optionalAssetUrlSchema, optionalTrimmedString } from "./common.js";

const heroMediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  url: assetUrlSchema,
  poster: optionalAssetUrlSchema,
});

const socialLinkSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  platform: z.enum(["whatsapp", "instagram", "facebook", "linkedin", "youtube"]),
  label: z.string().trim().min(2).max(40),
  url: z.string().trim().url(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0).optional(),
});

export const updateSiteSettingsSchema = {
  body: z.object({
    restaurantName: z.string().trim().min(2).max(120).optional(),
    tagline: optionalTrimmedString,
    restaurantDescription: optionalTrimmedString,
    logoUrl: optionalAssetUrlSchema,
    heroMedia: z.array(heroMediaItemSchema).optional(),
    primaryCtaLabel: optionalTrimmedString,
    primaryCtaHref: optionalTrimmedString,
    secondaryCtaLabel: optionalTrimmedString,
    secondaryCtaHref: optionalTrimmedString,
    addressText: optionalTrimmedString,
    mapEmbedUrl: optionalTrimmedString,
    mapLink: optionalTrimmedString,
    phone: z.string().trim().min(10).max(16).optional(),
    email: z.string().trim().email().optional(),
    hoursText: optionalTrimmedString,
    whatsappNumber: z.string().trim().min(10).max(16).optional(),
    floatingWhatsappEnabled: z.boolean().optional(),
    cuisineType: optionalTrimmedString,
    city: optionalTrimmedString,
    areaKeywords: z.array(z.string().trim().min(1)).optional(),
    metaTitle: optionalTrimmedString,
    metaDescription: optionalTrimmedString,
    metaKeywords: z.array(z.string().trim().min(1)).optional(),
    googleReviewUrl: optionalTrimmedString,
    orderTaxPercent: z.coerce.number().min(0).max(100).optional(),
    currency: z.string().trim().min(3).max(5).optional(),
    socialLinks: z.array(socialLinkSchema).optional(),
  }),
};
