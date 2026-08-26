"use client";

import * as React from "react";
import {
  ReceivingSession,
  ReceivingSessionStatus,
  ReceivingItem,
  PutawayTask,
  PutawayItem,
} from "@/lib/types/receiving";
import { ReceivingSessionFormValues, PutawayExecutionFormValues } from "@/lib/validations/receiving";
import { usePurchases } from "@/lib/stores/purchase-context";
import { useInventory } from "@/lib/stores/inventory-context";
import { createSyncedStore } from "./create-synced-store";
import { toast } from "@/components/ui/toast";

export const initialReceivingSessions: ReceivingSession[] = [
  {
    id: "rcv-001",
    sessionNumber: "RCV-2026-000001",
    purchaseOrderId: "po-001",
    poNumber: "PO-2026-000001",
    supplierId: "sup-001",
    supplierName: "Milano Sartorial Textiles S.p.A.",
    destinationType: "WAREHOUSE",
    destinationId: "wh-01",
    destinationName: "Tejgaon Central Hub (Warehouse)",
    receivingLocationId: "loc-wh-01-rcv",
    status: "COMPLETED",
    totalOrderedQty: 150,
    totalScannedQty: 150,
    totalAcceptedQty: 150,
    totalDamagedQty: 0,
    hasPutawayCompleted: true,
    putawayTaskId: "ptw-001",
    startedBy: "Inbound Receiving Operator",
    startedAt: "2026-01-10T10:00:00.000Z",
    completedBy: "Inbound Receiving Operator",
    completedAt: "2026-01-10T11:00:00.000Z",
    items: [
      {
        id: "rcvi-001-1",
        purchaseOrderItemId: "poi-001-1",
        productId: "prod-001",
        productName: "Italian Wool Overcoat",
        productCode: "OTR-OVC-001",
        variantId: "var-001-1",
        variantName: "Noir Black / 40R",
        sku: "NC-OW-OVC-BLK-40",
        barcode: "894100100101",
        orderedQty: 150,
        expectedQty: 150,
        scannedQty: 150,
        acceptedQty: 150,
        rejectedQty: 0,
        damagedQty: 0,
        unitCost: 18500,
        batchNumber: "BAT-2026-001",
        qcStatus: "PASSED",
      },
    ],
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T11:00:00.000Z",
  },
  {
    id: "rcv-002",
    sessionNumber: "RCV-2026-000002",
    purchaseOrderId: "po-002",
    poNumber: "PO-2026-000002",
    supplierId: "sup-002",
    supplierName: "Como Silk Weavers Ltd",
    destinationType: "STORE",
    destinationId: "str-01",
    destinationName: "Gulshan Flagship Avenue (Store)",
    receivingLocationId: "loc-str-01",
    status: "IN_PROGRESS",
    totalOrderedQty: 80,
    totalScannedQty: 40,
    totalAcceptedQty: 40,
    totalDamagedQty: 0,
    hasPutawayCompleted: false,
    startedBy: "Gulshan Inbound Lead",
    startedAt: "2026-01-20T14:00:00.000Z",
    items: [
      {
        id: "rcvi-002-1",
        purchaseOrderItemId: "poi-002-1",
        productId: "prod-002",
        productName: "Mulberry Silk Evening Blouse",
        productCode: "TP-BLS-002",
        variantId: "var-002-1",
        variantName: "Champagne Pearl / Small",
        sku: "NC-TP-BLS-PRL-S",
        barcode: "894100200101",
        orderedQty: 80,
        expectedQty: 80,
        scannedQty: 40,
        acceptedQty: 40,
        rejectedQty: 0,
        damagedQty: 0,
        unitCost: 4500,
        batchNumber: "BAT-2026-002",
        qcStatus: "PASSED",
      },
    ],
    createdAt: "2026-01-20T14:00:00.000Z",
    updatedAt: "2026-01-20T14:30:00.000Z",
  },
];

export const initialPutawayTasks: PutawayTask[] = [
  {
    id: "ptw-001",
    taskNumber: "PTW-2026-000001",
    receivingSessionId: "rcv-001",
    receivingSessionNumber: "RCV-2026-000001",
    warehouseId: "wh-01",
    warehouseName: "Central Fulfillment Hub",
    status: "COMPLETED",
    totalUnits: 150,
    completedUnits: 150,
    assignedTo: "Putaway Team A",
    startedAt: "2026-01-10T11:15:00.000Z",
    completedAt: "2026-01-10T11:45:00.000Z",
    items: [
      {
        id: "ptwi-001-1",
        variantId: "var-001-1",
        variantName: "Noir Black / 40R",
        productName: "Italian Wool Overcoat",
        sku: "NC-OW-OVC-BLK-40",
        quantity: 150,
        sourceLocationId: "loc-wh-01-rcv",
        sourceLocationName: "Tejgaon Receiving Dock A",
        suggestedShelfId: "loc-wh-01-sh-a01",
        suggestedShelfName: "Rack A-01 (Outerwear & Suits)",
        actualShelfId: "loc-wh-01-sh-a01",
        actualShelfName: "Rack A-01 (Outerwear & Suits)",
        isConfirmed: true,
      },
    ],
    createdAt: "2026-01-10T11:00:00.000Z",
    updatedAt: "2026-01-10T11:45:00.000Z",
  },
];

interface ReceivingContextType {
  sessions: ReceivingSession[];
  putawayTasks: PutawayTask[];

  // Inbound Session Actions
  startReceivingSession: (values: ReceivingSessionFormValues, user?: string) => ReceivingSession;
  recordItemScan: (
    sessionId: string,
    variantId: string,
    quantity: number,
    isDamaged?: boolean,
    batchNo?: string,
    serial?: string
  ) => boolean;
  completeReceivingSession: (sessionId: string, user?: string) => boolean;
  getSessionById: (id: string) => ReceivingSession | undefined;

  // Putaway Actions
  executePutaway: (values: PutawayExecutionFormValues, user?: string) => boolean;
  getPutawayTaskById: (id: string) => PutawayTask | undefined;
}

const sessionsStore = createSyncedStore<ReceivingSession[]>(
  "ncloth_receiving_sessions_v1",
  initialReceivingSessions
);

const putawaysStore = createSyncedStore<PutawayTask[]>(
  "ncloth_putaway_tasks_v1",
  initialPutawayTasks
);

const ReceivingContext = React.createContext<ReceivingContextType | undefined>(undefined);

export function ReceivingProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = sessionsStore.useStore();
  const [putawayTasks, setPutawayTasks] = putawaysStore.useStore();
  const { purchaseOrders, updatePurchaseStatus } = usePurchases();
  const { locations, updateBalance, recordTransaction } = useInventory();

  // 1. Start Inbound Receiving Session
  const startReceivingSession = React.useCallback(
    (values: ReceivingSessionFormValues, user: string = "Receiving Officer"): ReceivingSession => {
      const po = purchaseOrders.find((p) => p.id === values.purchaseOrderId);
      if (!po) {
        throw new Error("Purchase Order not found");
      }

      const count = sessions.length + 1;
      const pad = count.toString().padStart(6, "0");
      const currentYear = new Date().getFullYear();

      // Determine receiving location
      let receivingLocId = "loc-wh-01-rcv";
      let destName = "Warehouse";

      if (values.destinationType === "STORE") {
        const storeLoc = locations.find((l) => l.storeId === values.destinationId || l.id === values.destinationId);
        receivingLocId = storeLoc?.id || values.destinationId;
        destName = storeLoc?.name || "Store Location";
      } else {
        const whLoc = locations.find((l) => l.warehouseId === values.destinationId || l.id === values.destinationId);
        receivingLocId = whLoc?.id || "loc-wh-01-rcv";
        destName = whLoc?.name || "Warehouse Receiving Dock";
      }

      const items: ReceivingItem[] = po.items.map((item, idx) => ({
        id: `rcvi-${Date.now()}-${idx}`,
        purchaseOrderItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        productCode: "",
        variantId: item.variantId,
        variantName: item.variantName,
        sku: item.sku,
        barcode: item.barcode,
        orderedQty: item.orderedQty,
        expectedQty: item.orderedQty - item.receivedQty,
        scannedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        damagedQty: 0,
        unitCost: item.unitCost,
        qcStatus: "PENDING",
      }));

      const newSession: ReceivingSession = {
        id: `rcv-${Date.now()}`,
        sessionNumber: `RCV-${currentYear}-${pad}`,
        purchaseOrderId: po.id,
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        destinationType: values.destinationType,
        destinationId: values.destinationId,
        destinationName: destName,
        receivingLocationId: receivingLocId,
        status: "IN_PROGRESS",
        items,
        totalOrderedQty: po.items.reduce((acc, curr) => acc + curr.orderedQty, 0),
        totalScannedQty: 0,
        totalAcceptedQty: 0,
        totalDamagedQty: 0,
        hasPutawayCompleted: false,
        startedBy: user,
        startedAt: new Date().toISOString(),
        notes: values.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) => [newSession, ...prev]);

      toast.success("Receiving Session Started", {
        description: `Session [${newSession.sessionNumber}] active for ${po.poNumber}. Ready to scan.`,
      });

      return newSession;
    },
    [purchaseOrders, sessions.length, locations, setSessions]
  );

  // 2. Interactive Barcode Scan Increment
  const recordItemScan = React.useCallback(
    (
      sessionId: string,
      variantId: string,
      quantity: number = 1,
      isDamaged: boolean = false,
      batchNo?: string,
      serial?: string
    ): boolean => {
      let found = false;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            const updatedItems = s.items.map((item) => {
              if (item.variantId === variantId || item.sku === variantId || item.barcode === variantId) {
                found = true;
                const newScanned = item.scannedQty + quantity;
                const newAccepted = isDamaged ? item.acceptedQty : item.acceptedQty + quantity;
                const newDamaged = isDamaged ? item.damagedQty + quantity : item.damagedQty;

                return {
                  ...item,
                  scannedQty: newScanned,
                  acceptedQty: newAccepted,
                  damagedQty: newDamaged,
                  batchNumber: batchNo || item.batchNumber,
                  qcStatus: (isDamaged ? "FAILED" : "PASSED") as ReceivingItem["qcStatus"],
                };
              }
              return item;
            });

            const totalScannedQty = updatedItems.reduce((acc, curr) => acc + curr.scannedQty, 0);
            const totalAcceptedQty = updatedItems.reduce((acc, curr) => acc + curr.acceptedQty, 0);
            const totalDamagedQty = updatedItems.reduce((acc, curr) => acc + curr.damagedQty, 0);

            return {
              ...s,
              items: updatedItems,
              totalScannedQty,
              totalAcceptedQty,
              totalDamagedQty,
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );

      if (found) {
        toast.success(isDamaged ? "Damaged Unit Recorded" : "Item Scanned (+1)", {
          description: `Logged item scan for session ${sessionId}.`,
        });
      } else {
        toast.error("Unexpected Item", {
          description: "Scanned barcode/SKU does not belong to this Purchase Order.",
        });
      }

      return found;
    },
    [setSessions]
  );

  // 3. Complete Inbound Session
  const completeReceivingSession = React.useCallback(
    (sessionId: string, user: string = "Receiving Officer"): boolean => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        toast.error("Session not found");
        return false;
      }

      // Execute inventory deposit & ledger transactions
      session.items.forEach((item) => {
        if (item.acceptedQty > 0) {
          // If Store Direct Receiving, goes straight into Store Available!
          // If Warehouse, goes into WH-RECEIVING area awaiting Putaway!
          updateBalance(session.receivingLocationId, item.variantId, {
            onHand: item.acceptedQty,
            available: session.destinationType === "STORE" ? item.acceptedQty : 0,
          });

          recordTransaction({
            type: "PURCHASE_RECEIPT",
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.acceptedQty,
            unitCost: item.unitCost,
            totalCost: item.acceptedQty * item.unitCost,
            destinationLocationId: session.receivingLocationId,
            destinationLocationCode: session.destinationName,
            destinationLocationName: session.destinationName,
            referenceType: "PURCHASE_ORDER",
            referenceId: session.purchaseOrderId,
            referenceNumber: session.poNumber,
            batchNumber: item.batchNumber,
            createdBy: user,
            notes: `Inbound Receiving via ${session.sessionNumber}.`,
          });
        }

        // Record damaged items into Damage Location if any
        if (item.damagedQty > 0) {
          updateBalance("loc-wh-01-dmg", item.variantId, {
            onHand: item.damagedQty,
            damaged: item.damagedQty,
          });
        }
      });

      // Update PO Status
      const isFullyReceived = session.totalAcceptedQty >= session.totalOrderedQty;
      updatePurchaseStatus(session.purchaseOrderId, isFullyReceived ? "FULLY_RECEIVED" : "PARTIALLY_RECEIVED");

      // If Warehouse destination, automatically spawn Putaway Task!
      let putawayTaskId: string | undefined = undefined;

      if (session.destinationType === "WAREHOUSE" && session.totalAcceptedQty > 0) {
        const count = putawayTasks.length + 1;
        const pad = count.toString().padStart(6, "0");
        const currentYear = new Date().getFullYear();

        const putawayItems: PutawayItem[] = session.items
          .filter((i) => i.acceptedQty > 0)
          .map((i, idx) => ({
            id: `ptwi-${Date.now()}-${idx}`,
            variantId: i.variantId,
            variantName: i.variantName,
            productName: i.productName,
            sku: i.sku,
            quantity: i.acceptedQty,
            sourceLocationId: session.receivingLocationId,
            sourceLocationName: session.destinationName,
            suggestedShelfId: "loc-wh-01-sh-a01",
            suggestedShelfName: "Rack A-01 (Outerwear & Suits)",
            isConfirmed: false,
          }));

        const newTask: PutawayTask = {
          id: `ptw-${Date.now()}`,
          taskNumber: `PTW-${currentYear}-${pad}`,
          receivingSessionId: session.id,
          receivingSessionNumber: session.sessionNumber,
          warehouseId: session.destinationId,
          warehouseName: session.destinationName,
          status: "PENDING",
          items: putawayItems,
          totalUnits: session.totalAcceptedQty,
          completedUnits: 0,
          assignedTo: "Warehouse Putaway Crew",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPutawayTasks((prev) => [newTask, ...prev]);
        putawayTaskId = newTask.id;
      }

      // Mark session as complete
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              status: "COMPLETED",
              hasPutawayCompleted: session.destinationType === "STORE",
              putawayTaskId,
              completedBy: user,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );

      toast.success("Receiving Completed", {
        description: `Verified ${session.totalAcceptedQty} accepted units for ${session.poNumber}. ${
          session.destinationType === "WAREHOUSE" ? "Created Putaway Task." : "Stock is now AVAILABLE in Store."
        }`,
      });

      return true;
    },
    [sessions, updateBalance, recordTransaction, updatePurchaseStatus, putawayTasks.length, setPutawayTasks, setSessions]
  );

  // 4. Execute Warehouse Putaway
  const executePutaway = React.useCallback(
    (values: PutawayExecutionFormValues, user: string = "Putaway Operator"): boolean => {
      const task = putawayTasks.find((t) => t.id === values.taskId);
      if (!task) {
        toast.error("Putaway task not found");
        return false;
      }

      values.items.forEach((execItem) => {
        const itemDef = task.items.find((i) => i.id === execItem.itemId || i.variantId === execItem.variantId);
        if (!itemDef) return;

        const destShelf = locations.find((l) => l.id === execItem.destinationShelfId);

        // Move from WH Receiving Area -> Final Storage Shelf Available!
        updateBalance(itemDef.sourceLocationId, itemDef.variantId, {
          onHand: -execItem.quantity,
        });

        updateBalance(execItem.destinationShelfId, itemDef.variantId, {
          onHand: execItem.quantity,
          available: execItem.quantity,
        });

        // Record Putaway Ledger Transaction
        recordTransaction({
          type: "PUTAWAY",
          productId: "",
          productName: itemDef.productName,
          variantId: itemDef.variantId,
          variantName: itemDef.variantName,
          sku: itemDef.sku,
          quantity: execItem.quantity,
          unitCost: 18500,
          totalCost: execItem.quantity * 18500,
          sourceLocationId: itemDef.sourceLocationId,
          sourceLocationName: itemDef.sourceLocationName,
          destinationLocationId: execItem.destinationShelfId,
          destinationLocationCode: destShelf?.code || execItem.destinationShelfId,
          destinationLocationName: destShelf?.name || "Storage Shelf",
          referenceType: "PUTAWAY_TASK",
          referenceId: task.id,
          referenceNumber: task.taskNumber,
          createdBy: user,
          notes: values.notes || undefined,
        });
      });

      // Mark task as completed
      setPutawayTasks((prev) =>
        prev.map((t) => {
          if (t.id === values.taskId) {
            return {
              ...t,
              status: "COMPLETED",
              completedUnits: t.totalUnits,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      toast.success("Putaway Confirmed", {
        description: `Moved stock to designated shelves. Inventory is now available for sales & transfers.`,
      });

      return true;
    },
    [putawayTasks, locations, updateBalance, recordTransaction, setPutawayTasks]
  );

  const getSessionById = React.useCallback((id: string) => sessions.find((s) => s.id === id), [sessions]);
  const getPutawayTaskById = React.useCallback((id: string) => putawayTasks.find((t) => t.id === id), [putawayTasks]);

  return (
    <ReceivingContext.Provider
      value={{
        sessions,
        putawayTasks,
        startReceivingSession,
        recordItemScan,
        completeReceivingSession,
        getSessionById,
        executePutaway,
        getPutawayTaskById,
      }}
    >
      {children}
    </ReceivingContext.Provider>
  );
}

export function useReceiving() {
  const context = React.useContext(ReceivingContext);
  if (!context) {
    throw new Error("useReceiving must be used within a ReceivingProvider");
  }
  return context;
}
