import { z } from "zod";

export const storeShelfStatusSchema = z.enum(["active", "inactive"]);

export const storeShelfFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Shelf/rack name must be at least 2 characters")
    .max(60, "Shelf/rack name cannot exceed 60 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Shelf code must be at least 2 characters")
    .max(20, "Shelf code cannot exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Shelf code must be uppercase alphanumeric (e.g. STR-PAR-RK01)"),
  storeId: z
    .string()
    .trim()
    .min(1, "Please select a boutique store"),
  zone: z
    .string()
    .trim()
    .min(1, "Please select or specify a display zone"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  status: storeShelfStatusSchema,
});

export type StoreShelfFormValues = z.infer<typeof storeShelfFormSchema>;
