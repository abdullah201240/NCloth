import { z } from "zod";

export const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters")
    .max(80, "Brand name must not exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Brand code must be at least 2 characters")
    .max(60, "Brand code must not exceed 60 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Code must contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  logoUrl: z.string().optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        try {
          new URL(val.startsWith("http") ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL" }
    ),
  originCountry: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  isFeatured: z.boolean(),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order cannot be negative")
    .max(999, "Sort order must not exceed 999"),
  status: z.enum(["active", "inactive"]),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
