import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(3, "Address must be at least 3 characters")
    .max(200, "Address cannot exceed 200 characters"),
  cnic: z
    .string()
    .min(1, "CNIC number is required")
    .regex(
      /^\d{5}-\d{7}-\d{1}$|^\d{13}$/,
      "CNIC must be 13 digits (e.g. 42101-1234567-1 or 4210112345671)"
    ),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(
      /^(\+92|0)?3\d{9}$|^\d{10,15}$/,
      "Enter a valid mobile number (e.g. 03001234567)"
    ),
});

export type CustomerInput = z.infer<typeof customerSchema>;
