"use client";

import * as React from "react";
import { Shelf, ShelfStatus, ShelfStats } from "@/lib/types/shelf";
import { initialShelves } from "./shelf-store";
import { ShelfFormValues } from "@/lib/validations/shelf";
import { toast } from "@/components/ui/toast";

interface ShelfContextType {
  shelves: Shelf[];
  stats: ShelfStats;
  addShelf: (data: ShelfFormValues, warehouseName: string) => void;
  updateShelf: (id: string, data: ShelfFormValues, warehouseName: string) => void;
  toggleStatus: (id: string, newStatus: ShelfStatus) => void;
}

const ShelfContext = React.createContext<ShelfContextType | null>(null);

export function ShelfProvider({ children }: { children: React.ReactNode }) {
  const [shelves, setShelves] = React.useState<Shelf[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ncloth_shelf_store_v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialShelves;
  });

  // Local storage persistence
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ncloth_shelf_store_v1", JSON.stringify(shelves));
    }
  }, [shelves]);

  const stats = React.useMemo<ShelfStats>(() => {
    const totalShelves = shelves.length;
    const activeShelves = shelves.filter((s) => s.status === "active").length;
    const inactiveShelves = totalShelves - activeShelves;
    const uniqueWarehouses = new Set(shelves.map((s) => s.warehouseId)).size;

    return {
      totalShelves,
      activeShelves,
      inactiveShelves,
      warehouseCount: uniqueWarehouses,
    };
  }, [shelves]);

  const addShelf = (data: ShelfFormValues, warehouseName: string) => {
    const now = new Date().toISOString();
    const newShelf: Shelf = {
      id: `sh-${Date.now()}`,
      name: data.name,
      code: data.code,
      warehouseId: data.warehouseId,
      warehouseName,
      description: data.description || "",
      status: data.status,
      itemCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setShelves((prev) => [newShelf, ...prev]);
    toast.success("Storage Shelf Created", `${data.name} (${data.code}) registered in ${warehouseName}.`);
  };

  const updateShelf = (id: string, data: ShelfFormValues, warehouseName: string) => {
    const now = new Date().toISOString();
    setShelves((prev) =>
      prev.map((sh) =>
        sh.id === id
          ? {
              ...sh,
              name: data.name,
              code: data.code,
              warehouseId: data.warehouseId,
              warehouseName: warehouseName || sh.warehouseName,
              description: data.description || "",
              status: data.status,
              updatedAt: now,
            }
          : sh
      )
    );
    toast.success("Shelf Updated", `${data.name} (${data.code}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: ShelfStatus) => {
    const now = new Date().toISOString();
    setShelves((prev) =>
      prev.map((sh) => (sh.id === id ? { ...sh, status: newStatus, updatedAt: now } : sh))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Shelf Status Changed", `Shelf status successfully updated to ${statusLabel}.`);
  };

  return (
    <ShelfContext.Provider
      value={{
        shelves,
        stats,
        addShelf,
        updateShelf,
        toggleStatus,
      }}
    >
      {children}
    </ShelfContext.Provider>
  );
}

export function useShelfContext() {
  const context = React.useContext(ShelfContext);
  if (!context) {
    throw new Error("useShelfContext must be used within a ShelfProvider");
  }
  return context;
}
