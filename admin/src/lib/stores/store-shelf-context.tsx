"use client";

import * as React from "react";
import { StoreShelf, StoreShelfStats } from "@/lib/types/store-shelf";
import { StoreShelfFormValues } from "@/lib/validations/store-shelf";
import { initialStoreShelves } from "@/lib/stores/store-shelf-store";
import { createSyncedStore } from "./create-synced-store";
import { toast } from "@/components/ui/toast";

interface StoreShelfContextType {
  shelves: StoreShelf[];
  stats: StoreShelfStats;
  addStoreShelf: (data: StoreShelfFormValues, storeName: string) => void;
  updateStoreShelf: (id: string, data: StoreShelfFormValues, storeName: string) => void;
  toggleStoreShelfStatus: (id: string) => void;
  getShelfById: (id: string) => StoreShelf | undefined;
  getShelvesByStoreId: (storeId: string) => StoreShelf[];
}

const storeShelfStore = createSyncedStore<StoreShelf[]>(
  "ncloth_store_shelves_v1",
  initialStoreShelves
);

const StoreShelfContext = React.createContext<StoreShelfContextType | undefined>(undefined);

export function StoreShelfProvider({ children }: { children: React.ReactNode }) {
  const [shelves, setShelves] = storeShelfStore.useStore();

  const stats = React.useMemo<StoreShelfStats>(() => {
    const totalShelves = shelves.length;
    const activeShelves = shelves.filter((s) => s.status === "active").length;
    const inactiveShelves = totalShelves - activeShelves;
    const storeCount = new Set(shelves.map((s) => s.storeId)).size;

    return {
      totalShelves,
      activeShelves,
      inactiveShelves,
      storeCount,
    };
  }, [shelves]);

  const addStoreShelf = React.useCallback(
    (data: StoreShelfFormValues, storeName: string) => {
      const newShelf: StoreShelf = {
        id: `str-sh-${Date.now().toString(36)}`,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        storeId: data.storeId,
        storeName,
        zone: data.zone,
        description: data.description?.trim() || undefined,
        status: data.status,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setShelves((prev) => [newShelf, ...prev]);
      toast.success(
        "Boutique Shelf Created",
        `"${newShelf.name}" (${newShelf.code}) registered under ${storeName}.`
      );
    },
    []
  );

  const updateStoreShelf = React.useCallback(
    (id: string, data: StoreShelfFormValues, storeName: string) => {
      setShelves((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: data.name.trim(),
                code: data.code.trim().toUpperCase(),
                storeId: data.storeId,
                storeName,
                zone: data.zone,
                description: data.description?.trim() || undefined,
                status: data.status,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
      toast.success(
        "Boutique Shelf Updated",
        `Changes saved for "${data.name}" (${data.code.toUpperCase()}).`
      );
    },
    []
  );

  const toggleStoreShelfStatus = React.useCallback(
    (id: string) => {
      const target = shelves.find((s) => s.id === id);
      if (!target) return;

      const newStatus = target.status === "active" ? "inactive" : "active";

      setShelves((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );

      if (newStatus === "active") {
        toast.success(
          "Shelf Activated",
          `"${target.name}" is now online and available for retail stock.`
        );
      } else {
        toast.info(
          "Shelf Deactivated",
          `"${target.name}" has been marked inactive (Zero-Delete preserved).`
        );
      }
    },
    [shelves]
  );

  const getShelfById = React.useCallback(
    (id: string) => shelves.find((s) => s.id === id),
    [shelves]
  );

  const getShelvesByStoreId = React.useCallback(
    (storeId: string) => shelves.filter((s) => s.storeId === storeId),
    [shelves]
  );

  return (
    <StoreShelfContext.Provider
      value={{
        shelves,
        stats,
        addStoreShelf,
        updateStoreShelf,
        toggleStoreShelfStatus,
        getShelfById,
        getShelvesByStoreId,
      }}
    >
      {children}
    </StoreShelfContext.Provider>
  );
}

export function useStoreShelves() {
  const context = React.useContext(StoreShelfContext);
  if (!context) {
    throw new Error("useStoreShelves must be used within a StoreShelfProvider");
  }
  return context;
}
