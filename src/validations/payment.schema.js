import { z } from "zod";
import { OFFLINE_PAYMENT_MODE, PAYMENT_RULES } from "@/constants/payment.constants";

export const offlinePaymentSchema = z.object({
  amount: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z
      .number({ error: "Enter the amount received" })
      .min(0, "Amount can't be negative")
      .max(PAYMENT_RULES.MAX_OFFLINE_AMOUNT, "Amount is too large")
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
        "Use at most 2 decimals",
      ),
  ),
  mode: z.enum(OFFLINE_PAYMENT_MODE, { error: "Choose how the team paid" }),
  reference: z
    .string()
    .trim()
    .max(PAYMENT_RULES.REFERENCE_MAX_LENGTH)
    .transform((value) => value || undefined)
    .optional(),
});
