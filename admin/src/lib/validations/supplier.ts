import { z } from "zod";

export const supplierStatusSchema = z.enum(["active", "inactive"]);

export const supplierFormSchema = z.object({
  // Basic Information
  name: z
    .string()
    .trim()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name cannot exceed 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Supplier code must be at least 2 characters")
    .max(20, "Supplier code cannot exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Supplier code must be uppercase alphanumeric (e.g. SUP-MIL-01)"),
  contactPerson: z
    .string()
    .trim()
    .max(80, "Contact person name cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(3, "Phone number is required")
    .max(30, "Phone number cannot exceed 30 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(250, "Address cannot exceed 250 characters")
    .optional()
    .or(z.literal("")),

  // Business Information
  companyName: z
    .string()
    .trim()
    .max(120, "Company name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  tradeLicense: z
    .string()
    .trim()
    .max(80, "Trade license / registration cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),
  paymentTerms: z
    .string()
    .trim()
    .max(80, "Payment terms cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  // Status
  status: supplierStatusSchema,
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
