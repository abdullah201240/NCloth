export type LocationType =
  | "WAREHOUSE"
  | "STORE"
  | "RECEIVING"
  | "STAGING"
  | "SHELF"
  | "BIN"
  | "STORE_BACKROOM"
  | "STORE_FLOOR"
  | "QC"
  | "QUARANTINE"
  | "DAMAGE"
  | "RETURN"
  | "IN_TRANSIT";

export type InventoryLocationStatus = "active" | "inactive" | "archived";

export interface InventoryLocation {
  id: string;
  code: string; // e.g. "LOC-WH-MAIN-A01", "LOC-STR-GLS-FLR"
  name: string;
  type: LocationType;
  warehouseId?: string;
  warehouseName?: string;
  storeId?: string;
  storeName?: string;
  parentLocationId?: string;
  parentLocationName?: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  isInventoryEnabled: boolean;
  isSellable: boolean;
  isReceivingLocation: boolean;
  isQuarantineLocation: boolean;
  isDamageLocation: boolean;
  status: InventoryLocationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBalance {
  id: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  locationType: LocationType;
  warehouseId?: string;
  warehouseName?: string;
  storeId?: string;
  storeName?: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId: string;
  variantName: string;
  sku: string;
  barcode?: string;
  unitCost: number;
  retailPrice: number;
  categoryName?: string;
  brandName?: string;

  // Quantity Breakdown
  onHand: number;
  reserved: number;
  available: number;
  inTransit: number;
  quarantined: number;
  damaged: number;

  // Optional Tracking Attachments
  batchId?: string;
  batchNumber?: string;
  serialNumber?: string;

  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;

  updatedAt: string;
}

export type InventoryTransactionType =
  | "PURCHASE_RECEIPT"
  | "PUTAWAY"
  | "TRANSFER_DISPATCH"
  | "TRANSFER_RECEIPT"
  | "TRANSFER_DISCREPANCY"
  | "DAMAGE_RECORDED"
  | "QUARANTINE_MOVE"
  | "RELEASE_FROM_QUARANTINE"
  | "MANUAL_ADJUSTMENT"
  | "STORE_RETURN"
  | "CYCLE_COUNT";

export interface InventoryTransaction {
  id: string;
  txnNumber: string; // e.g. "INV-TXN-2026-000001"
  type: InventoryTransactionType;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;

  sourceLocationId?: string;
  sourceLocationCode?: string;
  sourceLocationName?: string;

  destinationLocationId?: string;
  destinationLocationCode?: string;
  destinationLocationName?: string;

  batchId?: string;
  batchNumber?: string;
  serialNumber?: string;

  referenceType: "PURCHASE_ORDER" | "STOCK_TRANSFER" | "PUTAWAY_TASK" | "ADJUSTMENT" | "RETURN";
  referenceId: string;
  referenceNumber: string;

  reason?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryStats {
  totalSkus: number;
  totalValuationBDT: number;
  totalOnHand: number;
  totalAvailable: number;
  totalInTransit: number;
  totalQuarantined: number;
  totalDamaged: number;
  lowStockCount: number;
  outOfStockCount: number;
}
