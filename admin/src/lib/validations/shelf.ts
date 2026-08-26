import { z } from "zod";

export const shelfStatusSchema = z.enum(["active", "inactive"]);

export const shelfFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Shelf name must be at least 2 characters")
    .max(60, "Shelf name cannot exceed 60 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Shelf code must be at least 2 characters")
    .max(16, "Shelf code cannot exceed 16 characters")
    .regex(/^[A-Z0-9-]+$/, "Shelf code must be uppercase alphanumeric (e.g. SH-A01)"),
  warehouseId: z
    .string()
    .trim()
    .min(1, "Please select a warehouse facility"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  status: shelfStatusSchema,
});

export type ShelfFormValues = z.infer<typeof shelfFormSchema>;
