export type ReceivingSessionStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "AWAITING_QC"
  | "AWAITING_PUTAWAY"
  | "COMPLETED"
  | "CANCELLED";

export interface ReceivingItem {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId: string;
  variantName: string;
  sku: string;
  barcode?: string;
  orderedQty: number;
  expectedQty: number;
  scannedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  damagedQty: number;
  unitCost: number;

  batchNumber?: string;
  expiryDate?: string;
  serialNumbers?: string[];

  qcStatus: "PASSED" | "FAILED" | "PENDING" | "SKIPPED";
  qcRemarks?: string;
  notes?: string;
}

export interface ReceivingSession {
  id: string;
  sessionNumber: string; // e.g. "RCV-2026-000001"
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;

  destinationType: "WAREHOUSE" | "STORE";
  destinationId: string; // warehouseId or storeId
  destinationName: string;
  receivingLocationId: string; // e.g. "LOC-WH-MAIN-RCV"

  status: ReceivingSessionStatus;
  items: ReceivingItem[];

  totalOrderedQty: number;
  totalScannedQty: number;
  totalAcceptedQty: number;
  totalDamagedQty: number;

  hasPutawayCompleted: boolean;
  putawayTaskId?: string;

  startedBy: string;
  startedAt: string;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PutawayTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface PutawayItem {
  id: string;
  variantId: string;
  variantName: string;
  productName: string;
  sku: string;
  quantity: number;
  sourceLocationId: string;
  sourceLocationName: string;
  suggestedShelfId: string;
  suggestedShelfName: string;
  actualShelfId?: string;
  actualShelfName?: string;
  isConfirmed: boolean;
}

export interface PutawayTask {
  id: string;
  taskNumber: string; // e.g. "PTW-2026-000001"
  receivingSessionId: string;
  receivingSessionNumber: string;
  warehouseId: string;
  warehouseName: string;
  status: PutawayTaskStatus;
  items: PutawayItem[];
  totalUnits: number;
  completedUnits: number;
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
