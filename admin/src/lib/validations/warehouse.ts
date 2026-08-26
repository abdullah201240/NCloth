import { z } from "zod";

export const warehouseStatusSchema = z.enum(["active", "inactive"]);

export const warehouseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Warehouse name must be at least 2 characters")
    .max(80, "Warehouse name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Warehouse code must be at least 2 characters")
    .max(16, "Warehouse code cannot exceed 16 characters")
    .regex(/^[A-Z0-9-]+$/, "Warehouse code must be uppercase alphanumeric (e.g. WH-PAR-01)"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  manager: z
    .string()
    .trim()
    .min(2, "Manager name must be at least 2 characters")
    .max(60, "Manager name cannot exceed 60 characters"),
  phone: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(30, "Phone number cannot exceed 30 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid facility email address")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  status: warehouseStatusSchema,
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
