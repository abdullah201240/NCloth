"use client";

import * as React from "react";
import { Product, ProductStats } from "@/lib/types/product";
import { ProductFormValues } from "@/lib/validations/product";
import { initialProducts } from "@/lib/stores/product-store";
import { toast } from "@/components/ui/toast";

interface ProductContextType {
  products: Product[];
  stats: ProductStats;
  addProduct: (values: ProductFormValues) => Product;
  updateProduct: (id: string, values: ProductFormValues) => boolean;
  toggleProductStatus: (id: string) => void;
  duplicateProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  isSkuAvailable: (sku: string, excludeProductId?: string, excludeVariantId?: string) => boolean;
  isBarcodeAvailable: (barcode: string, excludeProductId?: string, excludeVariantId?: string) => boolean;
}

const STORAGE_KEY = "ncloth_products_catalog_v1";

const ProductContext = React.createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return initialProducts;
        }
      }
    }
    return initialProducts;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  // Reactive Stats Calculation
  const stats = React.useMemo<ProductStats>(() => {
    let totalVariants = 0;
    let totalValuation = 0;
    let activeProducts = 0;
    let draftProducts = 0;

    products.forEach((p) => {
      if (p.status === "active") activeProducts++;
      if (p.status === "draft") draftProducts++;

      const variantCount = p.variants?.length || 1;
      totalVariants += variantCount;

      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          totalValuation += (v.sellingPrice || p.defaultSellingPrice || 0);
        });
      } else {
        totalValuation += p.defaultSellingPrice || 0;
      }
    });

    return {
      totalProducts: products.length,
      activeProducts,
      totalVariants,
      draftProducts,
      totalInventoryValuation: totalValuation,
    };
  }, [products]);

  const isSkuAvailable = React.useCallback(
    (sku: string, excludeProductId?: string, excludeVariantId?: string): boolean => {
      const cleanSku = sku.trim().toLowerCase();
      if (!cleanSku) return true;

      for (const prod of products) {
        if (excludeProductId && prod.id === excludeProductId) continue;
        for (const variant of prod.variants) {
          if (excludeVariantId && variant.id === excludeVariantId) continue;
          if (variant.sku.trim().toLowerCase() === cleanSku) {
            return false;
          }
        }
      }
      return true;
    },
    [products]
  );

  const isBarcodeAvailable = React.useCallback(
    (barcode: string, excludeProductId?: string, excludeVariantId?: string): boolean => {
      const cleanBarcode = barcode.trim().toLowerCase();
      if (!cleanBarcode) return true;

      for (const prod of products) {
        if (excludeProductId && prod.id === excludeProductId) continue;
        for (const variant of prod.variants) {
          if (excludeVariantId && variant.id === excludeVariantId) continue;
          if (variant.barcode.trim().toLowerCase() === cleanBarcode) {
            return false;
          }
        }
      }
      return true;
    },
    [products]
  );

  const addProduct = React.useCallback(
    (values: ProductFormValues): Product => {
      const now = new Date().toISOString();
      const newId = `prod-${Date.now().toString(36)}`;
      const slug =
        values.slug ||
        values.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const createdProduct: Product = {
        id: newId,
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        slug,
        categoryId: values.categoryId,
        brandId: values.brandId || undefined,
        attributeSetId: values.attributeSetId,
        productType: values.productType,
        description: values.description?.trim() || undefined,
        status: values.status,
        defaultCostPrice: values.defaultCostPrice,
        defaultSellingPrice: values.defaultSellingPrice,
        compareAtPrice: values.compareAtPrice,
        currency: values.currency || "EUR",
        hasVariants: values.hasVariants,
        variantAttributeIds: values.variantAttributeIds || [],
        attributes: values.attributes || [],
        variants: values.variants || [],
        media: values.media || [],
        additionalInfo: values.additionalInfo,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [createdProduct, ...prev]);

      toast.success(
        "Product Created Successfully",
        `"${createdProduct.name}" (${createdProduct.code}) with ${createdProduct.variants.length} variant(s) saved.`
      );

      return createdProduct;
    },
    []
  );

  const updateProduct = React.useCallback(
    (id: string, values: ProductFormValues): boolean => {
      const now = new Date().toISOString();
      let updated = false;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            updated = true;
            return {
              ...p,
              name: values.name.trim(),
              code: values.code.trim().toUpperCase(),
              slug:
                values.slug ||
                values.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              categoryId: values.categoryId,
              brandId: values.brandId || undefined,
              attributeSetId: values.attributeSetId,
              productType: values.productType,
              description: values.description?.trim() || undefined,
              status: values.status,
              defaultCostPrice: values.defaultCostPrice,
              defaultSellingPrice: values.defaultSellingPrice,
              compareAtPrice: values.compareAtPrice,
              currency: values.currency || "EUR",
              hasVariants: values.hasVariants,
              variantAttributeIds: values.variantAttributeIds || [],
              attributes: values.attributes || [],
              variants: values.variants || [],
              media: values.media || [],
              additionalInfo: values.additionalInfo,
              updatedAt: now,
            };
          }
          return p;
        })
      );

      if (updated) {
        toast.success(
          "Product Updated",
          `Changes to "${values.name}" have been saved.`
        );
      }
      return updated;
    },
    []
  );

  const toggleProductStatus = React.useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "active" ? "inactive" : "active";
          toast.info(
            `Product Set to ${nextStatus === "active" ? "Active" : "Inactive"}`,
            `"${p.name}" status updated.`
          );
          return {
            ...p,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  const duplicateProduct = React.useCallback(
    (id: string) => {
      const original = products.find((p) => p.id === id);
      if (!original) return;

      const now = new Date().toISOString();
      const newId = `prod-${Date.now().toString(36)}`;
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newCode = `${original.code}-CPY${randomSuffix}`;
      const newName = `${original.name} (Copy)`;

      const duplicatedVariants = (original.variants || []).map((v, idx) => ({
        ...v,
        id: `var-${Date.now().toString(36)}-${idx}`,
        sku: `${v.sku}-CPY${randomSuffix}`,
        barcode: `${Math.floor(3000000000000 + Math.random() * 900000000000)}`,
      }));

      const duplicatedProduct: Product = {
        ...original,
        id: newId,
        name: newName,
        code: newCode,
        slug: `${original.slug}-copy-${randomSuffix}`,
        status: "draft",
        variants: duplicatedVariants,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [duplicatedProduct, ...prev]);

      toast.success(
        "Product Duplicated",
        `Created draft copy "${newName}" (${newCode}).`
      );
    },
    [products]
  );

  const getProductById = React.useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        stats,
        addProduct,
        updateProduct,
        toggleProductStatus,
        duplicateProduct,
        getProductById,
        isSkuAvailable,
        isBarcodeAvailable,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = React.useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
