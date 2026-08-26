export type TrackingMode = "NONE" | "BATCH" | "SERIAL" | "BATCH_AND_SERIAL";

export type BatchStatus = "ACTIVE" | "QUARANTINED" | "EXPIRED" | "RECALLED" | "DEPLETED";

export interface Batch {
  id: string;
  batchNumber: string; // e.g. "BAT-2026-001"
  supplierBatchNo?: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  initialQuantity: number;
  currentQuantity: number;
  mfgDate?: string;
  expiryDate?: string;
  receivedDate: string;
  status: BatchStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SerialStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "IN_TRANSIT"
  | "SOLD"
  | "DEFECTIVE"
  | "QUARANTINED";

export interface Serial {
  id: string;
  serialNumber: string; // e.g. "SN-NC-2026-000842"
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentLocationId: string;
  currentLocationCode: string;
  currentLocationName: string;
  batchId?: string;
  batchNumber?: string;
  status: SerialStatus;
  receivedDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
