import { z } from "zod";

export const receivingItemScanSchema = z.object({
  purchaseOrderItemId: z.string().min(1),
  variantId: z.string().min(1),
  scannedQty: z.number().int().min(1),
  acceptedQty: z.number().int().min(0),
  rejectedQty: z.number().int().min(0).default(0),
  damagedQty: z.number().int().min(0).default(0),
  batchNumber: z.string().trim().optional(),
  expiryDate: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  qcRemarks: z.string().optional(),
});

export const receivingSessionSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase Order is required"),
  destinationType: z.enum(["WAREHOUSE", "STORE"]),
  destinationId: z.string().min(1, "Destination entity is required"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type ReceivingSessionFormValues = z.infer<typeof receivingSessionSchema>;

export const putawayExecutionSchema = z.object({
  taskId: z.string().min(1),
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      variantId: z.string().min(1),
      destinationShelfId: z.string().min(1, "Storage shelf is required"),
      quantity: z.number().int().min(1),
    })
  ),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type PutawayExecutionFormValues = z.infer<typeof putawayExecutionSchema>;
