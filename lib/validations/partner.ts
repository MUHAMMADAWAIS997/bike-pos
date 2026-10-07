import { z } from "zod";

export const partnerSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Partner Name is required." })
    .min(2, { message: "Partner Name must be at least 2 characters." }),
  mobile: z
    .string()
    .min(1, { message: "Mobile Number is required." })
    .min(7, { message: "Mobile Number must be at least 7 digits." }),
  equityShare: z
    .number()
    .min(0.01, { message: "Investment Equity Share must be greater than 0%." })
    .max(100, { message: "Investment Equity Share cannot exceed 100%." }),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
