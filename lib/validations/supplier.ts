import { z } from "zod";

export const supplierSchema = z.object({
  company: z
    .string()
    .min(1, "Company / Supplier name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(
      /^(\+92|0)?3\d{9}$|^\d{10,15}$/,
      "Enter a valid mobile number (e.g. 03001234567)"
    ),
  address: z
    .string()
    .nullable()
    .optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
