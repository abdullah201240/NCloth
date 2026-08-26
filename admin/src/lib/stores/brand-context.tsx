"use client";

import * as React from "react";
import { Brand, BrandStats } from "@/lib/types/brand";
import { BrandFormValues } from "@/lib/validations/brand";
import { brandStore } from "./brand-store";
import { toast } from "@/components/ui/toast";

interface BrandContextType {
  brands: Brand[];
  stats: BrandStats;
  addBrand: (data: BrandFormValues) => Brand;
  updateBrand: (id: string, data: BrandFormValues) => void;
  toggleBrandStatus: (id: string) => void;
  toggleBrandFeatured: (id: string) => void;
  getBrandById: (id: string) => Brand | undefined;
}

const BrandContext = React.createContext<BrandContextType | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = brandStore.useStore();

  const stats = React.useMemo<BrandStats>(() => {
    const total = brands.length;
    const active = brands.filter((b: Brand) => b.status === "active").length;
    const inactive = brands.filter((b: Brand) => b.status === "inactive").length;
    const featured = brands.filter((b: Brand) => b.isFeatured && b.status === "active").length;
    const countries = new Set(brands.map((b: Brand) => b.originCountry).filter(Boolean)).size;

    return {
      total,
      active,
      inactive,
      featured,
      countriesCount: countries,
    };
  }, [brands]);

  const addBrand = React.useCallback(
    (data: BrandFormValues): Brand => {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        name: data.name.trim(),
        code: data.code.trim().toLowerCase(),
        logoUrl: data.logoUrl || undefined,
        website: data.website?.trim() || undefined,
        originCountry: data.originCountry?.trim() || undefined,
        description: data.description?.trim() || undefined,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? brands.length + 1,
        status: data.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBrands([...brands, newBrand]);
      toast.success("Brand Registered", `"${newBrand.name}" has been added to the Brand Registry.`);
      return newBrand;
    },
    [brands, setBrands]
  );

  const updateBrand = React.useCallback(
    (id: string, data: BrandFormValues) => {
      const existing = brands.find((b: Brand) => b.id === id);
      if (!existing) {
        toast.error("Brand Not Found", "Unable to find the requested brand to update.");
        return;
      }

      const updatedBrands = brands.map((b: Brand) => {
        if (b.id === id) {
          return {
            ...b,
            name: data.name.trim(),
            code: data.code.trim().toLowerCase(),
            logoUrl: data.logoUrl || undefined,
            website: data.website?.trim() || undefined,
            originCountry: data.originCountry?.trim() || undefined,
            description: data.description?.trim() || undefined,
            isFeatured: data.isFeatured ?? b.isFeatured,
            sortOrder: data.sortOrder ?? b.sortOrder,
            status: data.status || b.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      setBrands(updatedBrands);
      toast.success("Brand Updated", `Changes to "${data.name}" have been saved successfully.`);
    },
    [brands, setBrands]
  );

  const toggleBrandStatus = React.useCallback(
    (id: string) => {
      const target = brands.find((b: Brand) => b.id === id);
      if (!target) return;

      const newStatus = target.status === "active" ? "inactive" : "active";
      const updated = brands.map((b: Brand) =>
        b.id === id ? { ...b, status: newStatus as "active" | "inactive", updatedAt: new Date().toISOString() } : b
      );

      setBrands(updated);
      if (newStatus === "active") {
        toast.success("Brand Activated", `"${target.name}" is now active in the catalog.`);
      } else {
        toast.info("Brand Deactivated", `"${target.name}" has been set to inactive.`);
      }
    },
    [brands, setBrands]
  );

  const toggleBrandFeatured = React.useCallback(
    (id: string) => {
      const target = brands.find((b: Brand) => b.id === id);
      if (!target) return;

      const nextFeatured = !target.isFeatured;
      const updated = brands.map((b: Brand) =>
        b.id === id ? { ...b, isFeatured: nextFeatured, updatedAt: new Date().toISOString() } : b
      );

      setBrands(updated);
      if (nextFeatured) {
        toast.success("Spotlight Added", `"${target.name}" marked as a Featured Brand.`);
      } else {
        toast.info("Spotlight Removed", `"${target.name}" un-marked from Featured.`);
      }
    },
    [brands, setBrands]
  );

  const getBrandById = React.useCallback(
    (id: string) => brands.find((b: Brand) => b.id === id),
    [brands]
  );

  return (
    <BrandContext.Provider
      value={{
        brands,
        stats,
        addBrand,
        updateBrand,
        toggleBrandStatus,
        toggleBrandFeatured,
        getBrandById,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = React.useContext(BrandContext);
  if (!context) {
    throw new Error("useBrands must be used within a BrandProvider");
  }
  return context;
}
