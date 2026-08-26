import { LocationType } from "./inventory";

export type StockTransferStatus =
  | "DRAFT"
  | "REQUESTED"
  | "APPROVED"
  | "PICKING"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "PARTIALLY_RECEIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface StockTransferItem {
  id: string;
  transferId?: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId: string;
  variantName: string;
  sku: string;
  barcode?: string;
  unitCost: number;

  requestedQty: number;
  approvedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  damagedQty: number;
  shortageQty: number;

  batchId?: string;
  batchNumber?: string;
  serialNumbers?: string[];

  notes?: string;
}

export interface DiscrepancyReport {
  id: string;
  transferId: string;
  itemId: string;
  sku: string;
  expectedQty: number;
  receivedQty: number;
  discrepancyType: "SHORTAGE" | "OVERAGE" | "DAMAGED_IN_TRANSIT" | "WRONG_ITEM";
  differenceQty: number;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  resolutionStatus: "PENDING_INVESTIGATION" | "ADJUSTED_AND_CLOSED" | "RETURN_TO_SOURCE";
  resolutionNotes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string; // e.g. "ST-2026-000001"
  stockRequestId?: string; // If originated from a store stock request

  sourceLocationId: string;
  sourceLocationCode: string;
  sourceLocationName: string;
  sourceType: LocationType;

  destinationLocationId: string;
  destinationLocationCode: string;
  destinationLocationName: string;
  destinationType: LocationType;

  status: StockTransferStatus;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";

  items: StockTransferItem[];
  discrepancies?: DiscrepancyReport[];

  totalRequestedQty: number;
  totalDispatchedQty: number;
  totalReceivedQty: number;
  totalValuationBDT: number;

  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  dispatchedBy?: string;
  dispatchedDate?: string;
  receivedBy?: string;
  receivedDate?: string;

  driverName?: string;
  vehicleNumber?: string;
  courierTrackingNo?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED"
  | "CANCELLED";

export interface StockRequestItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStoreStock: number;
  requestedQty: number;
  approvedQty?: number;
  notes?: string;
}

export interface StockRequest {
  id: string;
  requestNumber: string; // e.g. "SR-2026-000001"
  storeId: string;
  storeName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: StockRequestStatus;
  items: StockRequestItem[];
  totalRequestedQty: number;
  stockTransferId?: string; // Created once approved
  notes?: string;
  requestedBy: string;
  requestedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferStats {
  totalTransfers: number;
  draftCount: number;
  requestedCount: number;
  approvedCount: number;
  inTransitCount: number;
  completedCount: number;
  discrepancyCount: number;
}
