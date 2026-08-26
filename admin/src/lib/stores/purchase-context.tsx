"use client";

import * as React from "react";
import {
  PurchaseOrder,
  PurchaseStats,
  PurchaseOrderStatus,
  PaymentStatus,
  GoodsReceipt,
} from "@/lib/types/purchase";
import { PurchaseOrderFormValues, GoodsReceiptFormValues } from "@/lib/validations/purchase";
import { initialPurchaseOrders } from "@/lib/stores/purchase-store";
import { useSuppliers } from "@/lib/stores/supplier-context";
import { useWarehouses } from "@/lib/stores/warehouse-context";
import { createSyncedStore } from "./create-synced-store";
import { toast } from "@/components/ui/toast";

interface PurchaseContextType {
  purchaseOrders: PurchaseOrder[];
  stats: PurchaseStats;
  createPurchaseOrder: (values: PurchaseOrderFormValues) => PurchaseOrder;
  updatePurchaseOrder: (id: string, values: PurchaseOrderFormValues) => boolean;
  recordGoodsReceipt: (poId: string, values: GoodsReceiptFormValues) => GoodsReceipt | null;
  updatePurchaseStatus: (id: string, status: PurchaseOrderStatus) => void;
  recordPayment: (id: string, amount: number) => void;
  cancelPurchaseOrder: (id: string, reason?: string) => void;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
}

const purchaseStore = createSyncedStore<PurchaseOrder[]>(
  "ncloth_purchase_orders_catalog_v1",
  initialPurchaseOrders
);

const PurchaseContext = React.createContext<PurchaseContextType | undefined>(undefined);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { suppliers } = useSuppliers();
  const { warehouses } = useWarehouses();
  const [purchaseOrders, setPurchaseOrders] = purchaseStore.useStore();

  // Reactive KPI Statistics
  const stats = React.useMemo<PurchaseStats>(() => {
    let orderedCount = 0;
    let partiallyReceivedCount = 0;
    let fullyReceivedCount = 0;
    let totalValuation = 0;
    let totalDue = 0;

    purchaseOrders.forEach((po) => {
      if (po.status === "ORDERED") orderedCount++;
      if (po.status === "PARTIALLY_RECEIVED") partiallyReceivedCount++;
      if (po.status === "FULLY_RECEIVED" || po.status === "CLOSED") fullyReceivedCount++;

      if (po.status !== "CANCELLED") {
        totalValuation += po.grandTotal;
        totalDue += po.dueAmount;
      }
    });

    return {
      totalOrders: purchaseOrders.length,
      orderedCount,
      partiallyReceivedCount,
      fullyReceivedCount,
      totalProcurementValuation: totalValuation,
      totalDueAmount: totalDue,
    };
  }, [purchaseOrders]);

  const createPurchaseOrder = React.useCallback(
    (values: PurchaseOrderFormValues): PurchaseOrder => {
      const now = new Date().toISOString();
      const currentYear = new Date().getFullYear();
      const nextSequence = String(purchaseOrders.length + 1).padStart(6, "0");
      const poNumber = `PO-${currentYear}-${nextSequence}`;
      const newId = `po-${Date.now().toString(36)}`;

      const supplier = suppliers.find((s) => s.id === values.supplierId);
      const warehouse = warehouses.find((w) => w.id === values.warehouseId);

      // Compute Subtotal & Totals
      const subtotal = values.items.reduce((acc, item) => acc + (item.lineTotal || item.orderedQty * item.unitCost), 0);
      const grandTotal = Math.max(0, subtotal - (values.discount || 0) + (values.tax || 0) + (values.shippingCharges || 0));
      const paidAmount = Math.min(grandTotal, values.paidAmount || 0);
      const dueAmount = Math.max(0, grandTotal - paidAmount);

      let paymentStatus: PaymentStatus = "UNPAID";
      if (paidAmount >= grandTotal && grandTotal > 0) {
        paymentStatus = "PAID";
      } else if (paidAmount > 0) {
        paymentStatus = "PARTIALLY_PAID";
      }

      const newPo: PurchaseOrder = {
        id: newId,
        poNumber,
        supplierId: values.supplierId,
        supplierName: supplier?.name || "Supplier Partner",
        supplierCode: supplier?.code || "SUP-00",
        warehouseId: values.warehouseId,
        warehouseName: warehouse?.name || "Central Warehouse",
        warehouseCode: warehouse?.code || "WH-00",
        purchaseDate: values.purchaseDate,
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        referenceNumber: values.referenceNumber || undefined,
        currency: values.currency || "BDT",
        status: values.status || "ORDERED",
        paymentStatus,
        paymentMethod: values.paymentMethod,
        subtotal,
        discount: values.discount || 0,
        tax: values.tax || 0,
        shippingCharges: values.shippingCharges || 0,
        grandTotal,
        paidAmount,
        dueAmount,
        notes: values.notes || undefined,
        items: values.items.map((item, idx) => ({
          ...item,
          id: item.id || `poi-${newId}-${idx}`,
          purchaseOrderId: newId,
          receivedQty: 0,
        })),
        receipts: [],
        createdBy: "Alexander Sterling",
        createdAt: now,
        updatedAt: now,
      };

      setPurchaseOrders((prev) => [newPo, ...prev]);

      toast.success(
        "Purchase Order Created",
        `${poNumber} for "${newPo.supplierName}" with ${newPo.items.length} line item(s) created.`
      );

      return newPo;
    },
    [purchaseOrders.length, suppliers, warehouses]
  );

  const updatePurchaseOrder = React.useCallback(
    (id: string, values: PurchaseOrderFormValues): boolean => {
      const now = new Date().toISOString();
      let updated = false;

      const supplier = suppliers.find((s) => s.id === values.supplierId);
      const warehouse = warehouses.find((w) => w.id === values.warehouseId);

      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === id) {
            updated = true;

            const subtotal = values.items.reduce((acc, item) => acc + (item.lineTotal || item.orderedQty * item.unitCost), 0);
            const grandTotal = Math.max(0, subtotal - (values.discount || 0) + (values.tax || 0) + (values.shippingCharges || 0));
            const paidAmount = Math.min(grandTotal, values.paidAmount || 0);
            const dueAmount = Math.max(0, grandTotal - paidAmount);

            let paymentStatus: PaymentStatus = "UNPAID";
            if (paidAmount >= grandTotal && grandTotal > 0) {
              paymentStatus = "PAID";
            } else if (paidAmount > 0) {
              paymentStatus = "PARTIALLY_PAID";
            }

            return {
              ...po,
              supplierId: values.supplierId,
              supplierName: supplier?.name || po.supplierName,
              supplierCode: supplier?.code || po.supplierCode,
              warehouseId: values.warehouseId,
              warehouseName: warehouse?.name || po.warehouseName,
              warehouseCode: warehouse?.code || po.warehouseCode,
              purchaseDate: values.purchaseDate,
              expectedDeliveryDate: values.expectedDeliveryDate || undefined,
              referenceNumber: values.referenceNumber || undefined,
              currency: values.currency || po.currency,
              status: values.status || po.status,
              paymentStatus,
              paymentMethod: values.paymentMethod || po.paymentMethod,
              subtotal,
              discount: values.discount || 0,
              tax: values.tax || 0,
              shippingCharges: values.shippingCharges || 0,
              grandTotal,
              paidAmount,
              dueAmount,
              notes: values.notes || undefined,
              items: values.items.map((item, idx) => ({
                ...item,
                id: item.id || `poi-${id}-${idx}`,
                purchaseOrderId: id,
                receivedQty: item.receivedQty || 0,
              })),
              updatedAt: now,
            };
          }
          return po;
        })
      );

      if (updated) {
        toast.success("Purchase Order Updated", `Changes to PO #${id} have been saved.`);
      }
      return updated;
    },
    [suppliers, warehouses]
  );

  const recordGoodsReceipt = React.useCallback(
    (poId: string, values: GoodsReceiptFormValues): GoodsReceipt | null => {
      const targetPo = purchaseOrders.find((p) => p.id === poId);
      if (!targetPo) {
        toast.error("Error", "Purchase Order not found.");
        return null;
      }

      const now = new Date().toISOString();
      const currentYear = new Date().getFullYear();
      const grnSequence = String(
        purchaseOrders.reduce((acc, p) => acc + (p.receipts?.length || 0), 0) + 1
      ).padStart(6, "0");
      const grnNumber = `GRN-${currentYear}-${grnSequence}`;
      const grnId = `grn-${Date.now().toString(36)}`;

      const newGrn: GoodsReceipt = {
        id: grnId,
        grnNumber,
        purchaseOrderId: poId,
        receivedDate: values.receivedDate,
        receivedBy: values.receivedBy,
        warehouseId: targetPo.warehouseId,
        warehouseName: targetPo.warehouseName,
        notes: values.notes || undefined,
        createdAt: now,
        items: values.items.map((item) => ({
          itemId: item.itemId,
          variantId: item.variantId,
          sku: item.sku,
          receivedQty: item.receivedQty,
          rejectedQty: item.rejectedQty || 0,
          remarks: item.remarks || undefined,
        })),
      };

      // Update PO items received quantities and overall PO status
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            const updatedItems = po.items.map((poi) => {
              const matchingGrnItem = values.items.find((gi) => gi.itemId === poi.id);
              const newlyReceived = matchingGrnItem ? matchingGrnItem.receivedQty : 0;
              const totalReceived = Math.min(poi.orderedQty, (poi.receivedQty || 0) + newlyReceived);
              return {
                ...poi,
                receivedQty: totalReceived,
              };
            });

            // Calculate overall delivery state
            const allOrdered = updatedItems.reduce((acc, i) => acc + i.orderedQty, 0);
            const allReceived = updatedItems.reduce((acc, i) => acc + i.receivedQty, 0);

            let nextStatus: PurchaseOrderStatus = po.status;
            if (allReceived >= allOrdered && allOrdered > 0) {
              nextStatus = "FULLY_RECEIVED";
            } else if (allReceived > 0) {
              nextStatus = "PARTIALLY_RECEIVED";
            }

            return {
              ...po,
              status: nextStatus,
              items: updatedItems,
              receipts: [newGrn, ...(po.receipts || [])],
              updatedAt: now,
            };
          }
          return po;
        })
      );

      const totalReceivedCount = values.items.reduce((acc, i) => acc + i.receivedQty, 0);
      toast.success(
        "Goods Receipt Recorded",
        `${grnNumber}: Received ${totalReceivedCount} units at ${targetPo.warehouseName}.`
      );

      return newGrn;
    },
    [purchaseOrders]
  );

  const updatePurchaseStatus = React.useCallback((id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          toast.info("Status Transition", `PO ${po.poNumber} transitioned to ${status}.`);
          return {
            ...po,
            status,
            updatedAt: new Date().toISOString(),
          };
        }
        return po;
      })
    );
  }, []);

  const recordPayment = React.useCallback((id: string, amount: number) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          const newPaid = Math.min(po.grandTotal, po.paidAmount + amount);
          const newDue = Math.max(0, po.grandTotal - newPaid);
          const paymentStatus: PaymentStatus =
            newPaid >= po.grandTotal ? "PAID" : newPaid > 0 ? "PARTIALLY_PAID" : "UNPAID";

          toast.success(
            "Payment Recorded",
            `Received ৳${amount.toLocaleString()} for PO ${po.poNumber}. Balance due: ৳${newDue.toLocaleString()}.`
          );

          return {
            ...po,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return po;
      })
    );
  }, []);

  const cancelPurchaseOrder = React.useCallback((id: string, reason?: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          toast.warning("Purchase Order Cancelled", `PO ${po.poNumber} has been marked as Cancelled.`);
          return {
            ...po,
            status: "CANCELLED",
            notes: reason ? `${po.notes ? po.notes + " | " : ""}Cancellation: ${reason}` : po.notes,
            updatedAt: new Date().toISOString(),
          };
        }
        return po;
      })
    );
  }, []);

  const getPurchaseOrderById = React.useCallback(
    (id: string) => {
      return purchaseOrders.find((p) => p.id === id);
    },
    [purchaseOrders]
  );

  return (
    <PurchaseContext.Provider
      value={{
        purchaseOrders,
        stats,
        createPurchaseOrder,
        updatePurchaseOrder,
        recordGoodsReceipt,
        updatePurchaseStatus,
        recordPayment,
        cancelPurchaseOrder,
        getPurchaseOrderById,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchases() {
  const context = React.useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchases must be used within a PurchaseProvider");
  }
  return context;
}
