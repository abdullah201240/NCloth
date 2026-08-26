import { z } from "zod";

export const stockTransferItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  productName: z.string().min(1),
  productCode: z.string().min(1),
  variantId: z.string().min(1, "Variant is required"),
  variantName: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  unitCost: z.number().min(0),
  requestedQty: z.number().int().min(1, "Requested quantity must be at least 1"),
  approvedQty: z.number().int().min(0).default(0),
  dispatchedQty: z.number().int().min(0).default(0),
  receivedQty: z.number().int().min(0).default(0),
  damagedQty: z.number().int().min(0).default(0),
  shortageQty: z.number().int().min(0).default(0),
  batchId: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const stockTransferSchema = z.object({
  sourceLocationId: z.string().min(1, "Source location is required"),
  destinationLocationId: z.string().min(1, "Destination location is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  driverName: z.string().trim().max(100).optional().nullable(),
  vehicleNumber: z.string().trim().max(50).optional().nullable(),
  courierTrackingNo: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(stockTransferItemSchema).min(1, "At least one item is required for transfer"),
});

export type StockTransferFormValues = z.infer<typeof stockTransferSchema>;

export const stockRequestItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string().min(1),
  productCode: z.string().min(1),
  variantId: z.string().min(1, "Variant is required"),
  variantName: z.string().min(1),
  sku: z.string().min(1),
  currentStoreStock: z.number().min(0),
  requestedQty: z.number().int().min(1, "Requested quantity must be at least 1"),
  notes: z.string().optional(),
});

export const stockRequestSchema = z.object({
  storeId: z.string().min(1, "Store is required"),
  targetWarehouseId: z.string().min(1, "Target warehouse is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(stockRequestItemSchema).min(1, "At least one item is required for replenishment request"),
});

export type StockRequestFormValues = z.infer<typeof stockRequestSchema>;

export const transferReceiveSchema = z.object({
  receivedItems: z.array(
    z.object({
      itemId: z.string().min(1),
      variantId: z.string().min(1),
      dispatchedQty: z.number().int().min(0),
      receivedQty: z.number().int().min(0),
      damagedQty: z.number().int().min(0).default(0),
      reason: z.string().optional(),
    })
  ),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type TransferReceiveFormValues = z.infer<typeof transferReceiveSchema>;
