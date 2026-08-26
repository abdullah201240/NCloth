import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  barcode: z.string().trim().min(1, "Barcode is required"),
  combination: z.record(z.string(), z.string()),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  compareAtPrice: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  status: z.enum(["active", "inactive"]),
  imageUrl: z.string().optional(),
});

export const productMediaSchema = z.object({
  id: z.string(),
  url: z.string().min(1, "Image URL is required"),
  isPrimary: z.boolean(),
  alt: z.string().optional(),
  sortOrder: z.number(),
  variantValueId: z.string().optional(),
});

export const productAttributeValueSchema = z.object({
  attributeId: z.string(),
  attributeCode: z.string(),
  attributeName: z.string(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
  unitId: z.string().optional(),
  unitSymbol: z.string().optional(),
});

export const productAdditionalInfoSchema = z.object({
  manufacturer: z.string().max(100).optional().or(z.literal("")),
  originCountry: z.string().max(60).optional().or(z.literal("")),
  warranty: z.string().max(100).optional().or(z.literal("")),
  hsCode: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  externalReference: z.string().max(60).optional().or(z.literal("")),
});

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(150, "Product name cannot exceed 150 characters"),
    code: z
      .string()
      .trim()
      .min(2, "Product code must be at least 2 characters")
      .max(50, "Product code cannot exceed 50 characters")
      .regex(/^[A-Za-z0-9-_]+$/, "Code must contain only letters, numbers, hyphens and underscores"),
    slug: z.string().optional(),
    categoryId: z.string().min(1, "Please select a product category"),
    brandId: z.string().optional().or(z.literal("")),
    attributeSetId: z.string().min(1, "Please select an attribute set"),
    productType: z.enum([
      "STOCKABLE",
      "NON_STOCK",
      "SERVICE",
      "DIGITAL",
      "BUNDLE",
      "COMPOSITE",
    ]),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().or(z.literal("")),
    status: z.enum(["active", "inactive", "draft", "archived"]),
    
    // Pricing
    defaultCostPrice: z.number().min(0, "Default cost price cannot be negative"),
    defaultSellingPrice: z.number().min(0, "Default selling price cannot be negative"),
    compareAtPrice: z.number().min(0).optional(),
    currency: z.string().default("EUR"),

    // Dynamic Attributes & Variants
    hasVariants: z.boolean().default(false),
    variantAttributeIds: z.array(z.string()).default([]),
    attributes: z.array(productAttributeValueSchema).default([]),
    variants: z.array(productVariantSchema).default([]),
    media: z.array(productMediaSchema).default([]),
    additionalInfo: productAdditionalInfoSchema.optional(),
  })
  .refine(
    (data) => {
      // Check for duplicate SKUs among variants
      if (data.variants && data.variants.length > 1) {
        const skus = data.variants.map((v) => v.sku.trim().toLowerCase());
        const uniqueSkus = new Set(skus);
        return uniqueSkus.size === skus.length;
      }
      return true;
    },
    {
      message: "Every variant must have a unique SKU",
      path: ["variants"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate barcodes among variants
      if (data.variants && data.variants.length > 1) {
        const barcodes = data.variants.map((v) => v.barcode.trim().toLowerCase());
        const uniqueBarcodes = new Set(barcodes);
        return uniqueBarcodes.size === barcodes.length;
      }
      return true;
    },
    {
      message: "Every variant must have a unique Barcode",
      path: ["variants"],
    }
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;
