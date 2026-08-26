import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, "Product reference is required"),
  variantId: z.string().min(1, "Variant reference is required"),
  productName: z.string().min(1, "Product name is required"),
  variantName: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  orderedQty: z.number().min(1, "Quantity must be at least 1"),
  receivedQty: z.number().min(0).default(0),
  unitCost: z.number().min(0, "Unit cost cannot be negative"),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).default(0),
  lineTotal: z.number().min(0),
  notes: z.string().max(200).optional().or(z.literal("")),
});

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  warehouseId: z.string().min(1, "Please select a destination warehouse"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  expectedDeliveryDate: z.string().optional().or(z.literal("")),
  referenceNumber: z.string().max(50).optional().or(z.literal("")),
  currency: z.string().default("BDT"),
  status: z.enum([
    "DRAFT",
    "ORDERED",
    "PARTIALLY_RECEIVED",
    "FULLY_RECEIVED",
    "CLOSED",
    "CANCELLED",
  ]).default("ORDERED"),
  paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID"]).default("UNPAID"),
  paymentMethod: z.enum([
    "BANK_TRANSFER",
    "LETTER_OF_CREDIT",
    "CASH_ON_DELIVERY",
    "CHEQUE",
    "BKASH_NAGAD",
    "CORPORATE_CARD",
  ]).optional(),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  shippingCharges: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  notes: z.string().max(1000).optional().or(z.literal("")),
  items: z.array(purchaseOrderItemSchema).min(1, "Please add at least one product variant line item"),
});

export const goodsReceiptItemSchema = z.object({
  itemId: z.string().min(1),
  variantId: z.string().min(1),
  sku: z.string().min(1),
  receivedQty: z.number().min(0),
  rejectedQty: z.number().min(0).default(0),
  remarks: z.string().max(200).optional().or(z.literal("")),
});

export const goodsReceiptSchema = z.object({
  receivedDate: z.string().min(1, "Receipt date is required"),
  receivedBy: z.string().min(1, "Receiver name is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
  items: z.array(goodsReceiptItemSchema).refine(
    (items) => items.some((item) => item.receivedQty > 0),
    { message: "You must receive at least 1 unit across line items" }
  ),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;
export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;
