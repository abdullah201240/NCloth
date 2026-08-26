import { z } from "zod";

export const entityStatusSchema = z.enum(["active", "inactive"]);

export const attributeTypeSchema = z.enum([
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "SELECT",
  "MULTI_SELECT",
  "NUMBER_WITH_UNIT",
  "URL",
]);

export const unitTypeSchema = z.enum([
  "WEIGHT",
  "LENGTH",
  "VOLUME",
  "DIGITAL",
  "ELECTRICAL",
  "AREA",
  "TEMPERATURE",
  "TIME",
  "OTHER",
]);

// Unit Form Schema
export const unitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Unit name is required")
    .max(50, "Unit name cannot exceed 50 characters"),
  symbol: z
    .string()
    .trim()
    .min(1, "Unit symbol is required")
    .max(15, "Unit symbol cannot exceed 15 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Unit code is required")
    .max(20, "Unit code cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Code must contain alphanumeric characters, hyphens, or underscores"),
  unitType: unitTypeSchema,
  status: entityStatusSchema,
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

// Attribute Form Schema
export const attributeFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Attribute name must be at least 2 characters")
      .max(60, "Attribute name cannot exceed 60 characters"),
    code: z
      .string()
      .trim()
      .min(2, "Attribute code must be at least 2 characters")
      .max(40, "Attribute code cannot exceed 40 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores"),
    type: attributeTypeSchema,
    description: z
      .string()
      .trim()
      .max(250, "Description cannot exceed 250 characters")
      .optional()
      .or(z.literal("")),
    status: entityStatusSchema,
    sortOrder: z
      .number()
      .int()
      .min(0, "Sort order must be 0 or greater")
      .max(999, "Sort order cannot exceed 999"),
    isRequired: z.boolean(),
    isVariant: z.boolean(),
    isFilterable: z.boolean(),
    isSearchable: z.boolean(),
    isComparable: z.boolean(),
    unitId: z
      .string()
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.type === "NUMBER_WITH_UNIT" && !data.unitId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a standard measurement unit for NUMBER_WITH_UNIT attribute",
      path: ["unitId"],
    }
  );

export type AttributeFormValues = z.infer<typeof attributeFormSchema>;

// Attribute Value Form Schema
export const attributeValueFormSchema = z.object({
  attributeId: z.string().min(1, "Attribute selection is required"),
  name: z
    .string()
    .trim()
    .min(1, "Value name is required")
    .max(80, "Value name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Value code is required")
    .max(60, "Value code cannot exceed 60 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Code must contain alphanumeric characters, hyphens, or underscores"),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be 0 or greater")
    .max(999, "Sort order cannot exceed 999"),
  status: entityStatusSchema,
  colorHex: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type AttributeValueFormValues = z.infer<typeof attributeValueFormSchema>;

// Attribute Set Form Schema
export const attributeSetFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Attribute set name must be at least 2 characters")
    .max(80, "Attribute set name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Attribute set code must be at least 2 characters")
    .max(50, "Attribute set code cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  status: entityStatusSchema,
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be 0 or greater")
    .max(999, "Sort order cannot exceed 999"),
});

export type AttributeSetFormValues = z.infer<typeof attributeSetFormSchema>;

// Attribute Set Config Item Schema
export const attributeSetConfigItemSchema = z.object({
  attributeId: z.string().min(1, "Attribute ID is required"),
  isRequired: z.boolean(),
  isVariant: z.boolean(),
  isFilterable: z.boolean(),
  isSearchable: z.boolean(),
  isComparable: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

export type AttributeSetConfigItemValues = z.infer<typeof attributeSetConfigItemSchema>;
