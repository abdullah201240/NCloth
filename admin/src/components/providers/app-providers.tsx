"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CategoryProvider } from "@/lib/stores/category-context";
import { WarehouseProvider } from "@/lib/stores/warehouse-context";
import { ShelfProvider } from "@/lib/stores/shelf-context";
import { SupplierProvider } from "@/lib/stores/supplier-context";
import { StoreProvider } from "@/lib/stores/store-context";
import { StoreShelfProvider } from "@/lib/stores/store-shelf-context";
import { AttributeProvider } from "@/lib/stores/attribute-context";
import { BrandProvider } from "@/lib/stores/brand-context";
import { ProductProvider } from "@/lib/stores/product-context";
import { PurchaseProvider } from "@/lib/stores/purchase-context";
import { InventoryProvider } from "@/lib/stores/inventory-context";
import { TransferProvider } from "@/lib/stores/transfer-context";
import { ReceivingProvider } from "@/lib/stores/receiving-context";
import { ProfileProvider } from "@/lib/stores/profile-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Composition helper to cleanly compose multiple providers without 16-level deep nesting
const providers: React.ComponentType<{ children: React.ReactNode }>[] = [
  CategoryProvider,
  WarehouseProvider,
  ShelfProvider,
  SupplierProvider,
  StoreProvider,
  StoreShelfProvider,
  AttributeProvider,
  BrandProvider,
  ProductProvider,
  PurchaseProvider,
  InventoryProvider,
  TransferProvider,
  ReceivingProvider,
  ProfileProvider,
];

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ async: true }}
    >
      <TooltipProvider delay={100}>
        <ErrorBoundary>
          {providers.reduceRight(
            (acc, Provider) => (
              <Provider>{acc}</Provider>
            ),
            <>
              {children}
              <Toaster />
            </>
          )}
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  );
}
