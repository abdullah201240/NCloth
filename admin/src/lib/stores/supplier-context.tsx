"use client";

import * as React from "react";
import { Supplier, SupplierStatus, SupplierStats } from "@/lib/types/supplier";
import { initialSuppliers } from "./supplier-store";
import { SupplierFormValues } from "@/lib/validations/supplier";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface SupplierContextType {
  suppliers: Supplier[];
  stats: SupplierStats;
  addSupplier: (data: SupplierFormValues) => void;
  updateSupplier: (id: string, data: SupplierFormValues) => void;
  toggleStatus: (id: string, newStatus: SupplierStatus) => void;
}

const supplierStore = createSyncedStore<Supplier[]>(
  "ncloth_supplier_store_v1",
  initialSuppliers
);

const SupplierContext = React.createContext<SupplierContextType | null>(null);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = supplierStore.useStore();

  const stats = React.useMemo<SupplierStats>(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    };
  }, [suppliers]);

  const addSupplier = (data: SupplierFormValues) => {
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name,
      code: data.code,
      contactPerson: data.contactPerson || "",
      phone: data.phone,
      email: data.email || "",
      address: data.address || "",
      companyName: data.companyName || "",
      tradeLicense: data.tradeLicense || "",
      paymentTerms: data.paymentTerms || "",
      notes: data.notes || "",
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    setSuppliers((prev) => [newSupplier, ...prev]);
    toast.success("Supplier Partner Created", `${data.name} (${data.code}) registered successfully.`);
  };

  const updateSupplier = (id: string, data: SupplierFormValues) => {
    const now = new Date().toISOString();
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: data.name,
              code: data.code,
              contactPerson: data.contactPerson || "",
              phone: data.phone,
              email: data.email || "",
              address: data.address || "",
              companyName: data.companyName || "",
              tradeLicense: data.tradeLicense || "",
              paymentTerms: data.paymentTerms || "",
              notes: data.notes || "",
              status: data.status,
              updatedAt: now,
            }
          : s
      )
    );
    toast.success("Supplier Updated", `${data.name} (${data.code}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: SupplierStatus) => {
    const now = new Date().toISOString();
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: now } : s))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Supplier Status Changed", `Supplier partner status successfully updated to ${statusLabel}.`);
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        stats,
        addSupplier,
        updateSupplier,
        toggleStatus,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext() {
  const context = React.useContext(SupplierContext);
  if (!context) {
    throw new Error("useSupplierContext must be used within a SupplierProvider");
  }
  return context;
}

export const useSuppliers = useSupplierContext;

