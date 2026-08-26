"use client";

import * as React from "react";
import { SizeItem, SizeStatus, SizeStats } from "@/lib/types/size";
import { initialSizes } from "./size-store";
import { SizeFormValues } from "@/lib/validations/size";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface SizeContextType {
  sizes: SizeItem[];
  stats: SizeStats;
  groups: string[];
  addSize: (data: SizeFormValues) => void;
  updateSize: (id: string, data: SizeFormValues) => void;
  toggleStatus: (id: string, newStatus: SizeStatus) => void;
}

const sizeDataStore = createSyncedStore<SizeItem[]>(
  "ncloth_size_store_v1",
  initialSizes
);

const SizeContext = React.createContext<SizeContextType | null>(null);

export function SizeProvider({ children }: { children: React.ReactNode }) {
  const [sizes, setSizes] = sizeDataStore.useStore();

  const groups = React.useMemo(() => {
    const unique = Array.from(new Set(sizes.map((s) => s.group))).filter(Boolean);
    return unique.length > 0 ? unique : ["Adult", "Kids", "Baby", "Shoes", "Accessories"];
  }, [sizes]);

  const stats = React.useMemo<SizeStats>(() => {
    const totalSizes = sizes.length;
    const activeSizes = sizes.filter((s) => s.status === "active").length;
    const inactiveSizes = totalSizes - activeSizes;
    const groupsCount = groups.length;

    return {
      totalSizes,
      activeSizes,
      inactiveSizes,
      groupsCount,
    };
  }, [sizes, groups]);

  const addSize = (data: SizeFormValues) => {
    const now = new Date().toISOString();
    const newSize: SizeItem = {
      id: `sz-${Date.now()}`,
      name: data.name,
      code: data.code,
      group: data.group,
      sortOrder: data.sortOrder,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    setSizes((prev) => [...prev, newSize]);
    toast.success("Size Standard Created", `${data.name} (${data.group}) registered with Order ${data.sortOrder}.`);
  };

  const updateSize = (id: string, data: SizeFormValues) => {
    const now = new Date().toISOString();
    setSizes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: data.name,
              code: data.code,
              group: data.group,
              sortOrder: data.sortOrder,
              status: data.status,
              updatedAt: now,
            }
          : s
      )
    );
    toast.success("Size Standard Updated", `${data.name} (${data.group}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: SizeStatus) => {
    const now = new Date().toISOString();
    setSizes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: now } : s))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Size Status Changed", `Size status successfully updated to ${statusLabel}.`);
  };

  return (
    <SizeContext.Provider
      value={{
        sizes,
        stats,
        groups,
        addSize,
        updateSize,
        toggleStatus,
      }}
    >
      {children}
    </SizeContext.Provider>
  );
}

export function useSizeContext() {
  const context = React.useContext(SizeContext);
  if (!context) {
    throw new Error("useSizeContext must be used within a SizeProvider");
  }
  return context;
}
