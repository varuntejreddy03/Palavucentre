import { z } from "zod";

import { emailSchema, optionalTrimmedString } from "./common.js";

export const adminLoginSchema = {
  body: z.object({
    email: emailSchema.optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    remember: z.boolean().optional(),
    username: optionalTrimmedString,
  }),
};
