import { z } from "zod";

export const productSchema = z.object({
  model: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "Unnamed Product")),
  category: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "General")),
  color: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  batteryType: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  volt: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  manufacturingYear: z
    .number()
    .optional()
    .transform((val) => (val && val > 0 ? val : new Date().getFullYear())),
  retailPrice: z
    .number()
    .optional()
    .transform((val) => (val && val >= 0 ? val : 0)),
  costPrice: z
    .number()
    .optional()
    .transform((val) => (val && val >= 0 ? val : 0)),
  incentive: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val != null && val >= 0 ? val : null)),
  others: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
});

export type ProductInput = z.infer<typeof productSchema>;

