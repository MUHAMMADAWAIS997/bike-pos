import { z } from "zod";

export const posCustomerSchema = z.object({
  customerName: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "Walk-in Customer")),
  customerMobile: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "03000000000")),
  customerCnic: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  customerAddress: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
});

export const posEbikeCustomerSchema = z.object({
  customerName: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "Walk-in Customer")),
  customerMobile: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "03000000000")),
  customerCnic: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  customerAddress: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  chassisNo: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
  motorNo: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : "N/A")),
});

export type PosCustomerInput = z.infer<typeof posCustomerSchema>;
export type PosEbikeCustomerInput = z.infer<typeof posEbikeCustomerSchema>;

export interface PosValidationData {
  customerName: string;
  customerMobile: string;
  customerCnic?: string;
  customerAddress?: string;
  chassisNo?: string;
  motorNo?: string;
}

export function validatePosCustomer(
  _data: PosValidationData,
  _isEbike: boolean
): { success: boolean; errors?: Record<string, string>; firstError?: string } {
  // All fields are optional with defaults, validation always succeeds without DB/input errors
  return { success: true };
}

