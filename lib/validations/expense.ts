import { z } from "zod";

export const expenseCategories = [
  "Stock Purchase",
  "Utilities",
  "Rent",
  "Salaries",
  "Maintenance",
  "Marketing",
  "Office Supplies",
  "Transportation",
  "Miscellaneous",
] as const;

export const expenseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  amount: z
    .number()
    .min(0.01, "Amount must be greater than zero"),
  paymentMethod: z
    .string()
    .min(1, "Payment method is required"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
