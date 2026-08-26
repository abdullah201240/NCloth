import { z } from "zod";

export const locationTypeEnum = z.enum([
  "WAREHOUSE",
  "STORE",
  "RECEIVING",
  "STAGING",
  "SHELF",
  "BIN",
  "STORE_BACKROOM",
  "STORE_FLOOR",
  "QC",
  "QUARANTINE",
  "DAMAGE",
  "RETURN",
  "IN_TRANSIT",
]);

export const inventoryLocationSchema = z.object({
  name: z.string().trim().min(2, "Location name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  type: locationTypeEnum,
  warehouseId: z.string().optional().nullable(),
  storeId: z.string().optional().nullable(),
  parentLocationId: z.string().optional().nullable(),
  zone: z.string().trim().optional().nullable(),
  aisle: z.string().trim().optional().nullable(),
  rack: z.string().trim().optional().nullable(),
  shelf: z.string().trim().optional().nullable(),
  bin: z.string().trim().optional().nullable(),
  isInventoryEnabled: z.boolean().default(true),
  isSellable: z.boolean().default(true),
  isReceivingLocation: z.boolean().default(false),
  isQuarantineLocation: z.boolean().default(false),
  isDamageLocation: z.boolean().default(false),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type InventoryLocationFormValues = z.infer<typeof inventoryLocationSchema>;

export const stockAdjustmentSchema = z.object({
  locationId: z.string().min(1, "Location is required"),
  variantId: z.string().min(1, "Product variant is required"),
  adjustmentType: z.enum(["SET_QUANTITY", "INCREASE", "DECREASE", "MOVE_TO_DAMAGE", "MOVE_TO_QUARANTINE", "RELEASE_QUARANTINE"]),
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  reason: z.string().trim().min(3, "Please provide a reason for the adjustment").max(300),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
