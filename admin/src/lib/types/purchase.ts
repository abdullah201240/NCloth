export type PurchaseOrderStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "FULLY_RECEIVED"
  | "CLOSED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "LETTER_OF_CREDIT"
  | "CASH_ON_DELIVERY"
  | "CHEQUE"
  | "BKASH_NAGAD"
  | "CORPORATE_CARD";

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId?: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  barcode?: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  discount: number; // Flat discount per line or percentage
  taxRate: number; // e.g. 5% or 0%
  lineTotal: number;
  notes?: string;
}

export interface GoodsReceiptItem {
  itemId: string; // Refers to PurchaseOrderItem id
  variantId: string;
  sku: string;
  receivedQty: number;
  rejectedQty?: number;
  remarks?: string;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-00001"
  purchaseOrderId: string;
  receivedDate: string;
  receivedBy: string;
  warehouseId: string;
  warehouseName: string;
  items: GoodsReceiptItem[];
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-000001"
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  referenceNumber?: string;
  currency: string; // Defaults to "BDT"
  status: PurchaseOrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  // Financials
  subtotal: number;
  discount: number;
  tax: number;
  shippingCharges: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;

  notes?: string;
  items: PurchaseOrderItem[];
  receipts: GoodsReceipt[];

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseStats {
  totalOrders: number;
  orderedCount: number;
  partiallyReceivedCount: number;
  fullyReceivedCount: number;
  totalProcurementValuation: number;
  totalDueAmount: number;
}
