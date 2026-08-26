import { z } from "zod";

export const storeStatusSchema = z.enum(["active", "inactive"]);

export const storeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(80, "Store name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Store code must be at least 2 characters")
    .max(20, "Store code cannot exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Store code must be uppercase alphanumeric (e.g. STR-PAR-01)"),
  address: z
    .string()
    .trim()
    .max(250, "Address cannot exceed 250 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  manager: z
    .string()
    .trim()
    .max(80, "Manager name cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal("")),
  status: storeStatusSchema,
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
