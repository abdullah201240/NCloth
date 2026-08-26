"use client";

import * as React from "react";
import {
  InventoryLocation,
  InventoryBalance,
  InventoryTransaction,
  InventoryStats,
  LocationType,
} from "@/lib/types/inventory";
import { Batch, Serial } from "@/lib/types/tracking";
import {
  initialInventoryLocations,
  initialInventoryBalances,
  initialInventoryTransactions,
  initialBatches,
  initialSerials,
} from "@/lib/stores/inventory-store";
import { useProducts } from "@/lib/stores/product-context";
import { StockAdjustmentFormValues } from "@/lib/validations/inventory";
import { createSyncedStore } from "./create-synced-store";
import { toast } from "@/components/ui/toast";

export type ScannedCodeResultType =
  | "PRODUCT"
  | "PRODUCT_VARIANT"
  | "BATCH"
  | "SERIAL"
  | "INVENTORY_LOCATION"
  | "UNKNOWN";

export interface ScannedIdentificationResult {
  type: ScannedCodeResultType;
  rawValue: string;
  matchedItem?: {
    id: string;
    name: string;
    code?: string;
    sku?: string;
    barcode?: string;
    productId?: string;
    variantId?: string;
    locationId?: string;
    batchNumber?: string;
    serialNumber?: string;
  };
  details?: Record<string, any>;
}

interface InventoryContextType {
  locations: InventoryLocation[];
  balances: InventoryBalance[];
  transactions: InventoryTransaction[];
  batches: Batch[];
  serials: Serial[];
  stats: InventoryStats;

  // Scanning Identification Engine
  identifyScannedCode: (scannedText: string) => ScannedIdentificationResult;

  // Location Operations
  getLocationById: (id: string) => InventoryLocation | undefined;
  getLocationsByWarehouseId: (warehouseId: string) => InventoryLocation[];
  getLocationsByStoreId: (storeId: string) => InventoryLocation[];
  addLocation: (data: Omit<InventoryLocation, "id" | "createdAt" | "updatedAt">) => InventoryLocation;

  // Stock Adjustment Operations
  adjustStock: (values: StockAdjustmentFormValues, user?: string) => boolean;

  // Balance Queries
  getBalancesByLocationId: (locationId: string) => InventoryBalance[];
  getBalancesByWarehouseId: (warehouseId: string) => InventoryBalance[];
  getBalancesByStoreId: (storeId: string) => InventoryBalance[];
  getBalancesByVariantId: (variantId: string) => InventoryBalance[];
  getGlobalVariantStock: (variantId: string) => {
    onHand: number;
    available: number;
    reserved: number;
    inTransit: number;
    quarantined: number;
    damaged: number;
  };

  // Internal Ledger Mutations
  recordTransaction: (
    txData: Omit<InventoryTransaction, "id" | "txnNumber" | "createdAt">
  ) => InventoryTransaction;

  updateBalance: (
    locationId: string,
    variantId: string,
    delta: {
      onHand?: number;
      available?: number;
      reserved?: number;
      inTransit?: number;
      quarantined?: number;
      damaged?: number;
    }
  ) => void;
}

const locationsStore = createSyncedStore<InventoryLocation[]>(
  "ncloth_inv_locations_v1",
  initialInventoryLocations
);
const balancesStore = createSyncedStore<InventoryBalance[]>(
  "ncloth_inv_balances_v1",
  initialInventoryBalances
);
const transactionsStore = createSyncedStore<InventoryTransaction[]>(
  "ncloth_inv_transactions_v1",
  initialInventoryTransactions
);
const batchesStore = createSyncedStore<Batch[]>(
  "ncloth_inv_batches_v1",
  initialBatches
);
const serialsStore = createSyncedStore<Serial[]>(
  "ncloth_inv_serials_v1",
  initialSerials
);

const InventoryContext = React.createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = locationsStore.useStore();
  const [balances, setBalances] = balancesStore.useStore();
  const [transactions, setTransactions] = transactionsStore.useStore();
  const [batches, setBatches] = batchesStore.useStore();
  const [serials, setSerials] = serialsStore.useStore();
  const { products } = useProducts();

  // 1. Reactive KPI Stats Calculation
  const stats = React.useMemo<InventoryStats>(() => {
    let totalValuationBDT = 0;
    let totalOnHand = 0;
    let totalAvailable = 0;
    let totalInTransit = 0;
    let totalQuarantined = 0;
    let totalDamaged = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const uniqueSkus = new Set<string>();

    balances.forEach((bal) => {
      uniqueSkus.add(bal.sku);
      totalOnHand += bal.onHand;
      totalAvailable += bal.available;
      totalInTransit += bal.inTransit;
      totalQuarantined += bal.quarantined;
      totalDamaged += bal.damaged;
      totalValuationBDT += bal.onHand * bal.unitCost;

      if (bal.available === 0 && bal.onHand === 0) {
        outOfStockCount++;
      } else if (bal.minStockLevel && bal.available <= bal.minStockLevel) {
        lowStockCount++;
      }
    });

    return {
      totalSkus: uniqueSkus.size,
      totalValuationBDT,
      totalOnHand,
      totalAvailable,
      totalInTransit,
      totalQuarantined,
      totalDamaged,
      lowStockCount,
      outOfStockCount,
    };
  }, [balances]);

  // 2. Centralized Scanner Identification Engine
  const identifyScannedCode = React.useCallback(
    (scannedText: string): ScannedIdentificationResult => {
      const code = scannedText.trim();
      if (!code) {
        return { type: "UNKNOWN", rawValue: "" };
      }

      // Check Serial Numbers first
      const matchedSerial = serials.find(
        (s) => s.serialNumber.toLowerCase() === code.toLowerCase()
      );
      if (matchedSerial) {
        return {
          type: "SERIAL",
          rawValue: code,
          matchedItem: {
            id: matchedSerial.id,
            name: `${matchedSerial.productName} (${matchedSerial.serialNumber})`,
            sku: matchedSerial.sku,
            productId: matchedSerial.productId,
            variantId: matchedSerial.variantId,
            locationId: matchedSerial.currentLocationId,
            serialNumber: matchedSerial.serialNumber,
          },
        };
      }

      // Check Batch Numbers
      const matchedBatch = batches.find(
        (b) =>
          b.batchNumber.toLowerCase() === code.toLowerCase() ||
          (b.supplierBatchNo && b.supplierBatchNo.toLowerCase() === code.toLowerCase())
      );
      if (matchedBatch) {
        return {
          type: "BATCH",
          rawValue: code,
          matchedItem: {
            id: matchedBatch.id,
            name: `${matchedBatch.productName} - Batch ${matchedBatch.batchNumber}`,
            sku: matchedBatch.sku,
            productId: matchedBatch.productId,
            variantId: matchedBatch.variantId,
            batchNumber: matchedBatch.batchNumber,
          },
        };
      }

      // Check Inventory Location Codes
      const matchedLocation = locations.find(
        (l) => l.code.toLowerCase() === code.toLowerCase() || l.id.toLowerCase() === code.toLowerCase()
      );
      if (matchedLocation) {
        return {
          type: "INVENTORY_LOCATION",
          rawValue: code,
          matchedItem: {
            id: matchedLocation.id,
            name: matchedLocation.name,
            code: matchedLocation.code,
            locationId: matchedLocation.id,
          },
        };
      }

      // Check Product Variants by Barcode or SKU
      for (const product of products) {
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            if (
              variant.sku.toLowerCase() === code.toLowerCase() ||
              (variant.barcode && variant.barcode.toLowerCase() === code.toLowerCase())
            ) {
              return {
                type: "PRODUCT_VARIANT",
                rawValue: code,
                matchedItem: {
                  id: variant.id,
                  name: `${product.name} (${variant.name})`,
                  sku: variant.sku,
                  barcode: variant.barcode,
                  productId: product.id,
                  variantId: variant.id,
                },
              };
            }
          }
        } else if (product.code.toLowerCase() === code.toLowerCase()) {
          return {
            type: "PRODUCT",
            rawValue: code,
            matchedItem: {
              id: product.id,
              name: product.name,
              code: product.code,
              productId: product.id,
            },
          };
        }
      }

      return {
        type: "UNKNOWN",
        rawValue: code,
      };
    },
    [serials, batches, locations, products]
  );

  // 3. Location Queries
  const getLocationById = React.useCallback(
    (id: string) => locations.find((l) => l.id === id),
    [locations]
  );

  const getLocationsByWarehouseId = React.useCallback(
    (warehouseId: string) => locations.filter((l) => l.warehouseId === warehouseId),
    [locations]
  );

  const getLocationsByStoreId = React.useCallback(
    (storeId: string) => locations.filter((l) => l.storeId === storeId),
    [locations]
  );

  const addLocation = React.useCallback(
    (data: Omit<InventoryLocation, "id" | "createdAt" | "updatedAt">): InventoryLocation => {
      const newLoc: InventoryLocation = {
        ...data,
        id: `loc-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocations((prev) => [newLoc, ...prev]);
      toast.success("Location Added", {
        description: `Location [${newLoc.code}] ${newLoc.name} created.`,
      });
      return newLoc;
    },
    [setLocations]
  );

  // 4. Ledger Transaction Recorder
  const recordTransaction = React.useCallback(
    (txData: Omit<InventoryTransaction, "id" | "txnNumber" | "createdAt">): InventoryTransaction => {
      const count = transactions.length + 1;
      const pad = count.toString().padStart(6, "0");
      const currentYear = new Date().getFullYear();

      const newTx: InventoryTransaction = {
        ...txData,
        id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        txnNumber: `INV-TXN-${currentYear}-${pad}`,
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    },
    [transactions.length, setTransactions]
  );

  // 5. Atomic Balance Mutator
  const updateBalance = React.useCallback(
    (
      locationId: string,
      variantId: string,
      delta: {
        onHand?: number;
        available?: number;
        reserved?: number;
        inTransit?: number;
        quarantined?: number;
        damaged?: number;
      }
    ) => {
      setBalances((prev) => {
        const index = prev.findIndex(
          (b) => b.locationId === locationId && b.variantId === variantId
        );

        if (index >= 0) {
          const item = prev[index];
          const updated: InventoryBalance = {
            ...item,
            onHand: Math.max(0, item.onHand + (delta.onHand || 0)),
            available: Math.max(0, item.available + (delta.available || 0)),
            reserved: Math.max(0, item.reserved + (delta.reserved || 0)),
            inTransit: Math.max(0, item.inTransit + (delta.inTransit || 0)),
            quarantined: Math.max(0, item.quarantined + (delta.quarantined || 0)),
            damaged: Math.max(0, item.damaged + (delta.damaged || 0)),
            updatedAt: new Date().toISOString(),
          };
          const next = [...prev];
          next[index] = updated;
          return next;
        } else {
          // If no existing balance record for this variant at this location, instantiate one
          const location = locations.find((l) => l.id === locationId);
          let prodInfo = {
            productId: "",
            productName: "Inventory Item",
            productCode: "",
            variantName: "",
            sku: "",
            unitCost: 0,
            retailPrice: 0,
            categoryName: "",
            brandName: "",
          };

          for (const p of products) {
            const v = p.variants?.find((varItem) => varItem.id === variantId);
            if (v) {
              prodInfo = {
                productId: p.id,
                productName: p.name,
                productCode: p.code,
                variantName: v.name,
                sku: v.sku,
                unitCost: v.costPrice || p.defaultCostPrice,
                retailPrice: v.sellingPrice || p.defaultSellingPrice,
                categoryName: p.categoryName || "",
                brandName: p.brandName || "",
              };
              break;
            }
          }

          const newBal: InventoryBalance = {
            id: `bal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            locationId,
            locationCode: location?.code || locationId,
            locationName: location?.name || "Location",
            locationType: location?.type || "WAREHOUSE",
            warehouseId: location?.warehouseId,
            warehouseName: location?.warehouseName,
            storeId: location?.storeId,
            storeName: location?.storeName,
            ...prodInfo,
            variantId,
            onHand: Math.max(0, delta.onHand || 0),
            available: Math.max(0, delta.available || 0),
            reserved: Math.max(0, delta.reserved || 0),
            inTransit: Math.max(0, delta.inTransit || 0),
            quarantined: Math.max(0, delta.quarantined || 0),
            damaged: Math.max(0, delta.damaged || 0),
            updatedAt: new Date().toISOString(),
          };

          return [newBal, ...prev];
        }
      });
    },
    [locations, products, setBalances]
  );

  // 6. Manual Stock Adjustment & Damage / Quarantine Logging
  const adjustStock = React.useCallback(
    (values: StockAdjustmentFormValues, user: string = "Inventory Manager"): boolean => {
      const balance = balances.find(
        (b) => b.locationId === values.locationId && b.variantId === values.variantId
      );

      if (!balance && values.adjustmentType !== "INCREASE" && values.adjustmentType !== "SET_QUANTITY") {
        toast.error("Adjustment Failed", {
          description: "No existing stock record at this location to adjust.",
        });
        return false;
      }

      const unitCost = balance?.unitCost || 0;
      let txType: InventoryTransaction["type"] = "MANUAL_ADJUSTMENT";

      if (values.adjustmentType === "MOVE_TO_DAMAGE") {
        txType = "DAMAGE_RECORDED";
        updateBalance(values.locationId, values.variantId, {
          available: -values.quantity,
          damaged: values.quantity,
        });
      } else if (values.adjustmentType === "MOVE_TO_QUARANTINE") {
        txType = "QUARANTINE_MOVE";
        updateBalance(values.locationId, values.variantId, {
          available: -values.quantity,
          quarantined: values.quantity,
        });
      } else if (values.adjustmentType === "RELEASE_QUARANTINE") {
        txType = "RELEASE_FROM_QUARANTINE";
        updateBalance(values.locationId, values.variantId, {
          quarantined: -values.quantity,
          available: values.quantity,
        });
      } else if (values.adjustmentType === "INCREASE") {
        updateBalance(values.locationId, values.variantId, {
          onHand: values.quantity,
          available: values.quantity,
        });
      } else if (values.adjustmentType === "DECREASE") {
        updateBalance(values.locationId, values.variantId, {
          onHand: -values.quantity,
          available: -values.quantity,
        });
      } else if (values.adjustmentType === "SET_QUANTITY") {
        const currentOnHand = balance?.onHand || 0;
        const diff = values.quantity - currentOnHand;
        updateBalance(values.locationId, values.variantId, {
          onHand: diff,
          available: diff,
        });
      }

      recordTransaction({
        type: txType,
        productId: balance?.productId || "",
        productName: balance?.productName || "Product",
        variantId: values.variantId,
        variantName: balance?.variantName || "Variant",
        sku: balance?.sku || "",
        quantity: values.quantity,
        unitCost,
        totalCost: values.quantity * unitCost,
        sourceLocationId: values.locationId,
        sourceLocationCode: balance?.locationCode,
        sourceLocationName: balance?.locationName,
        referenceType: "ADJUSTMENT",
        referenceId: `adj-${Date.now()}`,
        referenceNumber: `ADJ-${new Date().toISOString().slice(0, 10)}`,
        reason: values.reason,
        notes: values.notes || undefined,
        createdBy: user,
      });

      toast.success("Inventory Adjusted", {
        description: `Recorded ${values.adjustmentType} of ${values.quantity} units for ${balance?.sku || values.variantId}.`,
      });

      return true;
    },
    [balances, recordTransaction, updateBalance]
  );

  // 7. Balance Query Helpers
  const getBalancesByLocationId = React.useCallback(
    (locationId: string) => balances.filter((b) => b.locationId === locationId),
    [balances]
  );

  const getBalancesByWarehouseId = React.useCallback(
    (warehouseId: string) => balances.filter((b) => b.warehouseId === warehouseId),
    [balances]
  );

  const getBalancesByStoreId = React.useCallback(
    (storeId: string) => balances.filter((b) => b.storeId === storeId),
    [balances]
  );

  const getBalancesByVariantId = React.useCallback(
    (variantId: string) => balances.filter((b) => b.variantId === variantId),
    [balances]
  );

  const getGlobalVariantStock = React.useCallback(
    (variantId: string) => {
      const items = balances.filter((b) => b.variantId === variantId);
      return items.reduce(
        (acc, curr) => ({
          onHand: acc.onHand + curr.onHand,
          available: acc.available + curr.available,
          reserved: acc.reserved + curr.reserved,
          inTransit: acc.inTransit + curr.inTransit,
          quarantined: acc.quarantined + curr.quarantined,
          damaged: acc.damaged + curr.damaged,
        }),
        { onHand: 0, available: 0, reserved: 0, inTransit: 0, quarantined: 0, damaged: 0 }
      );
    },
    [balances]
  );

  return (
    <InventoryContext.Provider
      value={{
        locations,
        balances,
        transactions,
        batches,
        serials,
        stats,
        identifyScannedCode,
        getLocationById,
        getLocationsByWarehouseId,
        getLocationsByStoreId,
        addLocation,
        adjustStock,
        getBalancesByLocationId,
        getBalancesByWarehouseId,
        getBalancesByStoreId,
        getBalancesByVariantId,
        getGlobalVariantStock,
        recordTransaction,
        updateBalance,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = React.useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
