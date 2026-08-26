import { z } from "zod";

export const entityStatusSchema = z.enum(["active", "inactive"]);

export const unifiedCategoryFormSchema = z
  .object({
    level: z.enum(["root", "category", "subcategory"]),
    rootCategoryId: z.string(),
    categoryId: z.string(),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug must be at least 2 characters")
      .max(60, "Slug cannot exceed 60 characters")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    code: z
      .string()
      .trim()
      .min(2, "Code must be at least 2 characters")
      .max(8, "Code cannot exceed 8 characters")
      .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric (e.g. RTW, OTR, CSH)"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
    imageUrl: z.string().optional().or(z.literal("")),
    bannerUrl: z.string().optional().or(z.literal("")),
    displayOrder: z.number().int().min(1, "Display order must be at least 1"),
    status: entityStatusSchema,
  })
  .superRefine((data, ctx) => {
    if (data.level === "category" && (!data.rootCategoryId || data.rootCategoryId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rootCategoryId"],
        message: "Parent Root Category is required for Categories",
      });
    }
    if (data.level === "subcategory") {
      if (!data.rootCategoryId || data.rootCategoryId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rootCategoryId"],
          message: "Root Category is required for Subcategories",
        });
      }
      if (!data.categoryId || data.categoryId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoryId"],
          message: "Parent Category is required for Subcategories",
        });
      }
    }
  });

export type UnifiedCategoryFormValues = z.infer<typeof unifiedCategoryFormSchema>;
