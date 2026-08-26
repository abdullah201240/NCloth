import { z } from "zod";

export const colorStatusSchema = z.enum(["active", "inactive"]);

export const colorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Color name must be at least 2 characters")
    .max(60, "Color name cannot exceed 60 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Color code/slug must be at least 2 characters")
    .max(40, "Color code/slug cannot exceed 40 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Code/slug must contain only alphanumeric characters, dashes, or underscores"),
  hex: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color code (e.g. #09090B or #FFFFFF)"),
  status: colorStatusSchema,
});

export type ColorFormValues = z.infer<typeof colorFormSchema>;
