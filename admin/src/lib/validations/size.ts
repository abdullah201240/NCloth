import { z } from "zod";

export const sizeStatusSchema = z.enum(["active", "inactive"]);

export const sizeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Size name is required")
    .max(30, "Size name cannot exceed 30 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Size code is required")
    .max(30, "Size code cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Size code must contain alphanumeric characters, hyphens, or dots"),
  group: z
    .string()
    .trim()
    .min(1, "Size group is required")
    .max(50, "Size group cannot exceed 50 characters"),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order cannot be negative")
    .max(999, "Sort order must be less than 1000"),
  status: sizeStatusSchema,
});

export type SizeFormValues = z.infer<typeof sizeFormSchema>;
