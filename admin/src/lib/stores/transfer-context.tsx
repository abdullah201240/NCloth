"use client";

import * as React from "react";
import {
  StockTransfer,
  StockTransferStatus,
  StockRequest,
  StockRequestStatus,
  TransferStats,
  DiscrepancyReport,
} from "@/lib/types/transfer";
import {
  initialStockTransfers,
  initialStockRequests,
} from "@/lib/stores/transfer-store";
import { StockTransferFormValues, StockRequestFormValues, TransferReceiveFormValues } from "@/lib/validations/transfer";
import { useInventory } from "@/lib/stores/inventory-context";
import { createSyncedStore } from "./create-synced-store";
import { toast } from "@/components/ui/toast";

interface TransferContextType {
  transfers: StockTransfer[];
  stockRequests: StockRequest[];
  stats: TransferStats;

  // Stock Transfer Operations
  createTransfer: (values: StockTransferFormValues, user?: string) => StockTransfer;
  approveTransfer: (id: string, user?: string) => boolean;
  dispatchTransfer: (
    id: string,
    payload: {
      driverName?: string;
      vehicleNumber?: string;
      courierTrackingNo?: string;
      notes?: string;
    },
    user?: string
  ) => boolean;
  receiveTransfer: (id: string, values: TransferReceiveFormValues, user?: string) => boolean;
  cancelTransfer: (id: string, reason?: string) => boolean;
  getTransferById: (id: string) => StockTransfer | undefined;

  // Store Stock Request Operations
  createStockRequest: (values: StockRequestFormValues, user?: string) => StockRequest;
  approveStockRequest: (id: string, user?: string) => StockTransfer | null;
  rejectStockRequest: (id: string, reason: string, user?: string) => boolean;
  getStockRequestById: (id: string) => StockRequest | undefined;
}

const transfersStore = createSyncedStore<StockTransfer[]>(
  "ncloth_stock_transfers_v1",
  initialStockTransfers
);

const requestsStore = createSyncedStore<StockRequest[]>(
  "ncloth_stock_requests_v1",
  initialStockRequests
);

const TransferContext = React.createContext<TransferContextType | undefined>(undefined);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const [transfers, setTransfers] = transfersStore.useStore();
  const [stockRequests, setStockRequests] = requestsStore.useStore();
  const { locations, updateBalance, recordTransaction } = useInventory();

  // 1. KPI Stats Calculation
  const stats = React.useMemo<TransferStats>(() => {
    let draftCount = 0;
    let requestedCount = 0;
    let approvedCount = 0;
    let inTransitCount = 0;
    let completedCount = 0;
    let discrepancyCount = 0;

    transfers.forEach((t) => {
      if (t.status === "DRAFT") draftCount++;
      if (t.status === "REQUESTED") requestedCount++;
      if (t.status === "APPROVED" || t.status === "PICKING") approvedCount++;
      if (t.status === "IN_TRANSIT" || t.status === "DISPATCHED") inTransitCount++;
      if (t.status === "COMPLETED") completedCount++;
      if (t.discrepancies && t.discrepancies.length > 0) discrepancyCount++;
    });

    return {
      totalTransfers: transfers.length,
      draftCount,
      requestedCount,
      approvedCount,
      inTransitCount,
      completedCount,
      discrepancyCount,
    };
  }, [transfers]);

  // 2. Create Stock Transfer Document
  const createTransfer = React.useCallback(
    (values: StockTransferFormValues, user: string = "Admin User"): StockTransfer => {
      const sourceLoc = locations.find((l) => l.id === values.sourceLocationId);
      const destLoc = locations.find((l) => l.id === values.destinationLocationId);

      const count = transfers.length + 1;
      const pad = count.toString().padStart(6, "0");
      const currentYear = new Date().getFullYear();

      let totalRequestedQty = 0;
      let totalValuationBDT = 0;

      const items = values.items.map((item, idx) => {
        totalRequestedQty += item.requestedQty;
        totalValuationBDT += item.requestedQty * item.unitCost;
        return {
          ...item,
          id: `sti-${Date.now()}-${idx}`,
          approvedQty: item.requestedQty,
          dispatchedQty: 0,
          receivedQty: 0,
          damagedQty: 0,
          shortageQty: 0,
        };
      });

      const newTransfer: StockTransfer = {
        id: `st-${Date.now()}`,
        transferNumber: `ST-${currentYear}-${pad}`,
        sourceLocationId: values.sourceLocationId,
        sourceLocationCode: sourceLoc?.code || values.sourceLocationId,
        sourceLocationName: sourceLoc?.name || "Source Location",
        sourceType: sourceLoc?.type || "WAREHOUSE",
        destinationLocationId: values.destinationLocationId,
        destinationLocationCode: destLoc?.code || values.destinationLocationId,
        destinationLocationName: destLoc?.name || "Destination Location",
        destinationType: destLoc?.type || "STORE",
        status: "APPROVED", // Default to approved ready for dispatch
        priority: values.priority,
        items,
        totalRequestedQty,
        totalDispatchedQty: 0,
        totalReceivedQty: 0,
        totalValuationBDT,
        requestedBy: user,
        requestedDate: new Date().toISOString(),
        approvedBy: user,
        approvedDate: new Date().toISOString(),
        driverName: values.driverName || undefined,
        vehicleNumber: values.vehicleNumber || undefined,
        courierTrackingNo: values.courierTrackingNo || undefined,
        notes: values.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) => [newTransfer, ...prev]);

      toast.success("Stock Transfer Created", {
        description: `Transfer [${newTransfer.transferNumber}] created from ${newTransfer.sourceLocationName} to ${newTransfer.destinationLocationName}.`,
      });

      return newTransfer;
    },
    [locations, transfers.length, setTransfers]
  );

  // 3. Approve Transfer
  const approveTransfer = React.useCallback(
    (id: string, user: string = "Alexander S. (Admin)"): boolean => {
      let found = false;
      setTransfers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            found = true;
            return {
              ...t,
              status: "APPROVED",
              approvedBy: user,
              approvedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      if (found) {
        toast.success("Transfer Approved", {
          description: "Transfer is approved and ready for picking & dispatch.",
        });
      }
      return found;
    },
    [setTransfers]
  );

  // 4. Dispatch Transfer (Moves Stock from Source Available -> IN_TRANSIT)
  const dispatchTransfer = React.useCallback(
    (
      id: string,
      payload: {
        driverName?: string;
        vehicleNumber?: string;
        courierTrackingNo?: string;
        notes?: string;
      },
      user: string = "Warehouse Dispatcher"
    ): boolean => {
      const transfer = transfers.find((t) => t.id === id);
      if (!transfer) {
        toast.error("Transfer not found");
        return false;
      }

      if (transfer.status !== "APPROVED" && transfer.status !== "PICKING") {
        toast.error("Cannot Dispatch", {
          description: `Transfer status is ${transfer.status}. Must be APPROVED to dispatch.`,
        });
        return false;
      }

      // Execute inventory movement: Source Available decreases -> In-Transit increases
      transfer.items.forEach((item) => {
        const qtyToDispatch = item.approvedQty || item.requestedQty;

        // Reduce available at source
        updateBalance(transfer.sourceLocationId, item.variantId, {
          onHand: -qtyToDispatch,
          available: -qtyToDispatch,
        });

        // Increase in-transit holding balance
        updateBalance("loc-transit-global", item.variantId, {
          onHand: qtyToDispatch,
          inTransit: qtyToDispatch,
        });

        // Record immutable ledger movement
        recordTransaction({
          type: "TRANSFER_DISPATCH",
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          variantName: item.variantName,
          sku: item.sku,
          quantity: qtyToDispatch,
          unitCost: item.unitCost,
          totalCost: qtyToDispatch * item.unitCost,
          sourceLocationId: transfer.sourceLocationId,
          sourceLocationCode: transfer.sourceLocationCode,
          sourceLocationName: transfer.sourceLocationName,
          destinationLocationId: "loc-transit-global",
          destinationLocationCode: "LOC-IN-TRANSIT",
          destinationLocationName: "Global Fleet Logistics In-Transit",
          referenceType: "STOCK_TRANSFER",
          referenceId: transfer.id,
          referenceNumber: transfer.transferNumber,
          createdBy: user,
          notes: payload.notes || transfer.notes,
        });
      });

      // Update transfer record
      setTransfers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedItems = t.items.map((item) => ({
              ...item,
              dispatchedQty: item.approvedQty || item.requestedQty,
            }));
            const totalDispatchedQty = updatedItems.reduce((acc, curr) => acc + curr.dispatchedQty, 0);

            return {
              ...t,
              status: "IN_TRANSIT",
              items: updatedItems,
              totalDispatchedQty,
              dispatchedBy: user,
              dispatchedDate: new Date().toISOString(),
              driverName: payload.driverName || t.driverName,
              vehicleNumber: payload.vehicleNumber || t.vehicleNumber,
              courierTrackingNo: payload.courierTrackingNo || t.courierTrackingNo,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      toast.success("Transfer Dispatched", {
        description: `Dispatched ${transfer.totalRequestedQty} units. Stock is now marked IN_TRANSIT.`,
      });

      return true;
    },
    [transfers, updateBalance, recordTransaction, setTransfers]
  );

  // 5. Receive Transfer at Destination (Moves Stock from IN_TRANSIT -> Destination Available)
  const receiveTransfer = React.useCallback(
    (id: string, values: TransferReceiveFormValues, user: string = "Store Receiver"): boolean => {
      const transfer = transfers.find((t) => t.id === id);
      if (!transfer) {
        toast.error("Transfer not found");
        return false;
      }

      if (transfer.status !== "IN_TRANSIT" && transfer.status !== "PARTIALLY_RECEIVED") {
        toast.error("Cannot Receive", {
          description: `Transfer status is ${transfer.status}. Must be IN_TRANSIT to receive.`,
        });
        return false;
      }

      const discrepancies: DiscrepancyReport[] = [];
      let totalReceivedQty = 0;
      let hasShortageOrDamage = false;

      values.receivedItems.forEach((recvItem) => {
        const itemDef = transfer.items.find((i) => i.id === recvItem.itemId || i.variantId === recvItem.variantId);
        if (!itemDef) return;

        const dispatched = recvItem.dispatchedQty;
        const received = recvItem.receivedQty;
        const damaged = recvItem.damagedQty || 0;
        const shortage = Math.max(0, dispatched - (received + damaged));

        totalReceivedQty += received;

        // 1. Remove from IN_TRANSIT holding balance
        updateBalance("loc-transit-global", itemDef.variantId, {
          onHand: -dispatched,
          inTransit: -dispatched,
        });

        // 2. Add accepted sound stock to Destination Location Available
        if (received > 0) {
          updateBalance(transfer.destinationLocationId, itemDef.variantId, {
            onHand: received,
            available: received,
          });

          // Record ledger transaction
          recordTransaction({
            type: "TRANSFER_RECEIPT",
            productId: itemDef.productId,
            productName: itemDef.productName,
            variantId: itemDef.variantId,
            variantName: itemDef.variantName,
            sku: itemDef.sku,
            quantity: received,
            unitCost: itemDef.unitCost,
            totalCost: received * itemDef.unitCost,
            sourceLocationId: "loc-transit-global",
            sourceLocationCode: "LOC-IN-TRANSIT",
            sourceLocationName: "Global Fleet Logistics In-Transit",
            destinationLocationId: transfer.destinationLocationId,
            destinationLocationCode: transfer.destinationLocationCode,
            destinationLocationName: transfer.destinationLocationName,
            referenceType: "STOCK_TRANSFER",
            referenceId: transfer.id,
            referenceNumber: transfer.transferNumber,
            createdBy: user,
            notes: values.notes || undefined,
          });
        }

        // 3. Handle Damaged Stock during transit
        if (damaged > 0) {
          hasShortageOrDamage = true;
          updateBalance(transfer.destinationLocationId, itemDef.variantId, {
            onHand: damaged,
            damaged: damaged,
          });

          discrepancies.push({
            id: `disc-${Date.now()}-${itemDef.variantId}`,
            transferId: transfer.id,
            itemId: itemDef.id,
            sku: itemDef.sku,
            expectedQty: dispatched,
            receivedQty: received,
            discrepancyType: "DAMAGED_IN_TRANSIT",
            differenceQty: damaged,
            reason: recvItem.reason || "Damaged during fleet transit.",
            reportedBy: user,
            reportedAt: new Date().toISOString(),
            resolutionStatus: "PENDING_INVESTIGATION",
          });
        }

        // 4. Handle Shortage / Missing units
        if (shortage > 0) {
          hasShortageOrDamage = true;
          discrepancies.push({
            id: `disc-${Date.now()}-${itemDef.variantId}-short`,
            transferId: transfer.id,
            itemId: itemDef.id,
            sku: itemDef.sku,
            expectedQty: dispatched,
            receivedQty: received,
            discrepancyType: "SHORTAGE",
            differenceQty: shortage,
            reason: recvItem.reason || "Package seal intact but missing internal units.",
            reportedBy: user,
            reportedAt: new Date().toISOString(),
            resolutionStatus: "PENDING_INVESTIGATION",
          });
        }
      });

      const newStatus: StockTransferStatus =
        totalReceivedQty >= transfer.totalDispatchedQty && !hasShortageOrDamage
          ? "COMPLETED"
          : "PARTIALLY_RECEIVED";

      setTransfers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedItems = t.items.map((item) => {
              const matched = values.receivedItems.find((r) => r.itemId === item.id || r.variantId === item.variantId);
              if (!matched) return item;
              return {
                ...item,
                receivedQty: item.receivedQty + matched.receivedQty,
                damagedQty: item.damagedQty + (matched.damagedQty || 0),
                shortageQty: Math.max(0, item.dispatchedQty - (matched.receivedQty + (matched.damagedQty || 0))),
              };
            });

            return {
              ...t,
              status: newStatus,
              items: updatedItems,
              totalReceivedQty: t.totalReceivedQty + totalReceivedQty,
              discrepancies: [...(t.discrepancies || []), ...discrepancies],
              receivedBy: user,
              receivedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      toast.success("Transfer Received", {
        description: `Successfully received ${totalReceivedQty} units at ${transfer.destinationLocationName}. Status: ${newStatus}.`,
      });

      return true;
    },
    [transfers, updateBalance, recordTransaction, setTransfers]
  );

  // 6. Cancel Transfer
  const cancelTransfer = React.useCallback(
    (id: string, reason: string = "Cancelled by user"): boolean => {
      let found = false;
      setTransfers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            if (t.status === "IN_TRANSIT" || t.status === "COMPLETED") {
              toast.error("Cannot Cancel", {
                description: `Transfers in ${t.status} state cannot be cancelled.`,
              });
              return t;
            }
            found = true;
            return {
              ...t,
              status: "CANCELLED",
              notes: `${t.notes ? t.notes + " • " : ""}Cancellation Reason: ${reason}`,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      if (found) {
        toast.info("Transfer Cancelled", {
          description: `Transfer order cancelled.`,
        });
      }
      return found;
    },
    [setTransfers]
  );

  // 7. Store Stock Replenishment Requests
  const createStockRequest = React.useCallback(
    (values: StockRequestFormValues, user: string = "Store Manager"): StockRequest => {
      const count = stockRequests.length + 1;
      const pad = count.toString().padStart(6, "0");
      const currentYear = new Date().getFullYear();

      let totalRequestedQty = 0;
      const items = values.items.map((item, idx) => {
        totalRequestedQty += item.requestedQty;
        return {
          ...item,
          id: `sri-${Date.now()}-${idx}`,
          approvedQty: item.requestedQty,
        };
      });

      const newRequest: StockRequest = {
        id: `sr-${Date.now()}`,
        requestNumber: `SR-${currentYear}-${pad}`,
        storeId: values.storeId,
        storeName: locations.find((l) => l.storeId === values.storeId || l.id === values.storeId)?.name || "Store",
        targetWarehouseId: values.targetWarehouseId,
        targetWarehouseName: locations.find((l) => l.warehouseId === values.targetWarehouseId || l.id === values.targetWarehouseId)?.name || "Warehouse",
        priority: values.priority,
        status: "SUBMITTED",
        items,
        totalRequestedQty,
        notes: values.notes || undefined,
        requestedBy: user,
        requestedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStockRequests((prev) => [newRequest, ...prev]);

      toast.success("Replenishment Request Submitted", {
        description: `Request [${newRequest.requestNumber}] for ${totalRequestedQty} units sent to ${newRequest.targetWarehouseName}.`,
      });

      return newRequest;
    },
    [locations, stockRequests.length, setStockRequests]
  );

  const approveStockRequest = React.useCallback(
    (id: string, user: string = "Alexander S. (Director)"): StockTransfer | null => {
      const request = stockRequests.find((r) => r.id === id);
      if (!request) {
        toast.error("Request not found");
        return null;
      }

      // Convert request into StockTransfer
      const transferValues: StockTransferFormValues = {
        sourceLocationId: request.targetWarehouseId,
        destinationLocationId: request.storeId,
        priority: request.priority,
        notes: `Originating from Replenishment Request ${request.requestNumber}. ${request.notes || ""}`,
        items: request.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productCode: i.productCode,
          variantId: i.variantId,
          variantName: i.variantName,
          sku: i.sku,
          unitCost: 1000,
          requestedQty: i.requestedQty,
          approvedQty: i.approvedQty || i.requestedQty,
          dispatchedQty: 0,
          receivedQty: 0,
          damagedQty: 0,
          shortageQty: 0,
        })),
      };

      const transfer = createTransfer(transferValues, user);

      // Link request to transfer
      setStockRequests((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              status: "APPROVED",
              stockTransferId: transfer.id,
              reviewedBy: user,
              reviewedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return r;
        })
      );

      toast.success("Stock Request Approved", {
        description: `Created Stock Transfer [${transfer.transferNumber}] for fulfillment.`,
      });

      return transfer;
    },
    [stockRequests, createTransfer, setStockRequests]
  );

  const rejectStockRequest = React.useCallback(
    (id: string, reason: string, user: string = "Alexander S. (Director)"): boolean => {
      let found = false;
      setStockRequests((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            found = true;
            return {
              ...r,
              status: "REJECTED",
              rejectionReason: reason,
              reviewedBy: user,
              reviewedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return r;
        })
      );

      if (found) {
        toast.info("Stock Request Rejected", {
          description: `Reason: ${reason}`,
        });
      }
      return found;
    },
    [setStockRequests]
  );

  const getTransferById = React.useCallback((id: string) => transfers.find((t) => t.id === id), [transfers]);
  const getStockRequestById = React.useCallback((id: string) => stockRequests.find((r) => r.id === id), [stockRequests]);

  return (
    <TransferContext.Provider
      value={{
        transfers,
        stockRequests,
        stats,
        createTransfer,
        approveTransfer,
        dispatchTransfer,
        receiveTransfer,
        cancelTransfer,
        getTransferById,
        createStockRequest,
        approveStockRequest,
        rejectStockRequest,
        getStockRequestById,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfers() {
  const context = React.useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfers must be used within a TransferProvider");
  }
  return context;
}
