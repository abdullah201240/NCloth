"use client";

import * as React from "react";
import { Warehouse, WarehouseStatus, WarehouseStats } from "@/lib/types/warehouse";
import { initialWarehouses } from "./warehouse-store";
import { WarehouseFormValues } from "@/lib/validations/warehouse";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface WarehouseContextType {
  warehouses: Warehouse[];
  stats: WarehouseStats;
  addWarehouse: (data: WarehouseFormValues) => void;
  updateWarehouse: (id: string, data: WarehouseFormValues) => void;
  toggleStatus: (id: string, newStatus: WarehouseStatus) => void;
}

const warehouseStore = createSyncedStore<Warehouse[]>(
  "ncloth_warehouse_store_v4",
  initialWarehouses
);

const WarehouseContext = React.createContext<WarehouseContextType | null>(null);

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const [warehouses, setWarehouses] = warehouseStore.useStore();

  const stats = React.useMemo<WarehouseStats>(() => {
    const totalWarehouses = warehouses.length;
    const activeWarehouses = warehouses.filter((w) => w.status === "active").length;
    const inactiveWarehouses = totalWarehouses - activeWarehouses;

    return {
      totalWarehouses,
      activeWarehouses,
      inactiveWarehouses,
    };
  }, [warehouses]);

  const addWarehouse = (data: WarehouseFormValues) => {
    const now = new Date().toISOString();
    const newWarehouse: Warehouse = {
      id: `wh-${Date.now()}`,
      name: data.name,
      code: data.code,
      address: data.address,
      manager: data.manager,
      phone: data.phone,
      email: data.email || "",
      imageUrl: data.imageUrl || "",
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    setWarehouses((prev) => [newWarehouse, ...prev]);
    toast.success("Warehouse Facility Created", `${data.name} (${data.code}) is now registered.`);
  };

  const updateWarehouse = (id: string, data: WarehouseFormValues) => {
    const now = new Date().toISOString();
    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.id === id
          ? {
              ...wh,
              name: data.name,
              code: data.code,
              address: data.address,
              manager: data.manager,
              phone: data.phone,
              email: data.email || "",
              imageUrl: data.imageUrl || "",
              status: data.status,
              updatedAt: now,
            }
          : wh
      )
    );
    toast.success("Warehouse Updated", `${data.name} (${data.code}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: WarehouseStatus) => {
    const now = new Date().toISOString();
    setWarehouses((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, status: newStatus, updatedAt: now } : wh))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Warehouse Status Changed", `Facility status successfully updated to ${statusLabel}.`);
  };

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        stats,
        addWarehouse,
        updateWarehouse,
        toggleStatus,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouseContext() {
  const context = React.useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouseContext must be used within a WarehouseProvider");
  }
  return context;
}
