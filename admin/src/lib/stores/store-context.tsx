"use client";

import * as React from "react";
import { Store, StoreStatus, StoreStats } from "@/lib/types/store";
import { initialStores } from "./store-data";
import { StoreFormValues } from "@/lib/validations/store";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface StoreContextType {
  stores: Store[];
  stats: StoreStats;
  addStore: (data: StoreFormValues) => void;
  updateStore: (id: string, data: StoreFormValues) => void;
  toggleStatus: (id: string, newStatus: StoreStatus) => void;
}

const storeDataStore = createSyncedStore<Store[]>(
  "ncloth_store_store_v1",
  initialStores
);

const StoreContext = React.createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = storeDataStore.useStore();

  const stats = React.useMemo<StoreStats>(() => {
    const totalStores = stores.length;
    const activeStores = stores.filter((s) => s.status === "active").length;
    const inactiveStores = totalStores - activeStores;

    return {
      totalStores,
      activeStores,
      inactiveStores,
    };
  }, [stores]);

  const addStore = (data: StoreFormValues) => {
    const now = new Date().toISOString();
    const newStore: Store = {
      id: `str-${Date.now()}`,
      name: data.name,
      code: data.code,
      address: data.address || "",
      phone: data.phone || "",
      manager: data.manager || "",
      email: data.email || "",
      imageUrl: data.imageUrl || "",
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    setStores((prev) => [newStore, ...prev]);
    toast.success("Store Boutique Created", `${data.name} (${data.code}) registered successfully.`);
  };

  const updateStore = (id: string, data: StoreFormValues) => {
    const now = new Date().toISOString();
    setStores((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: data.name,
              code: data.code,
              address: data.address || "",
              phone: data.phone || "",
              manager: data.manager || "",
              email: data.email || "",
              imageUrl: data.imageUrl || "",
              status: data.status,
              updatedAt: now,
            }
          : s
      )
    );
    toast.success("Store Updated", `${data.name} (${data.code}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: StoreStatus) => {
    const now = new Date().toISOString();
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: now } : s))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Store Status Changed", `Store status successfully updated to ${statusLabel}.`);
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        stats,
        addStore,
        updateStore,
        toggleStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
}

export const useStores = useStoreContext;
