"use client";

import * as React from "react";
import {
  RootCategory,
  Category,
  Subcategory,
  CategoryFlatItem,
  HierarchyLevel,
  EntityStatus,
} from "@/lib/types/category";
import { initialRootCategories, flattenHierarchy } from "./category-store";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface CategoryContextType {
  rootCategories: RootCategory[];
  flatItems: CategoryFlatItem[];
  stats: {
    totalRoots: number;
    activeRoots: number;
    totalCats: number;
    activeCats: number;
    totalSubs: number;
    activeSubs: number;
    totalSkus: number;
  };
  addRootCategory: (data: UnifiedCategoryFormValues) => void;
  updateRootCategory: (id: string, data: UnifiedCategoryFormValues) => void;
  addCategory: (data: UnifiedCategoryFormValues) => void;
  updateCategory: (id: string, data: UnifiedCategoryFormValues) => void;
  addSubcategory: (data: UnifiedCategoryFormValues) => void;
  updateSubcategory: (id: string, data: UnifiedCategoryFormValues) => void;
  toggleStatus: (id: string, newStatus: EntityStatus, level: HierarchyLevel) => void;
}

const CategoryContext = React.createContext<CategoryContextType | null>(null);

const categoryStore = createSyncedStore<RootCategory[]>(
  "ncloth_category_store_v4",
  initialRootCategories
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [rootCategories, setRootCategories] = categoryStore.useStore();

  const flatItems = React.useMemo(() => {
    return flattenHierarchy(rootCategories);
  }, [rootCategories]);

  const stats = React.useMemo(() => {
    const totalRoots = rootCategories.length;
    const activeRoots = rootCategories.filter((r) => r.status === "active").length;

    let totalCats = 0;
    let activeCats = 0;
    let totalSubs = 0;
    let activeSubs = 0;
    let totalSkus = 0;

    rootCategories.forEach((r) => {
      totalCats += r.categories.length;
      activeCats += r.categories.filter((c) => c.status === "active").length;
      r.categories.forEach((c) => {
        totalSubs += c.subcategories.length;
        activeSubs += c.subcategories.filter((s) => s.status === "active").length;
        c.subcategories.forEach((s) => {
          totalSkus += s.productCount;
        });
      });
    });

    return {
      totalRoots,
      activeRoots,
      totalCats,
      activeCats,
      totalSubs,
      activeSubs,
      totalSkus,
    };
  }, [rootCategories]);

  const addRootCategory = (data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    const newRoot: RootCategory = {
      id: `root-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      code: data.code,
      description: data.description,
      imageUrl: data.imageUrl,
      bannerUrl: data.bannerUrl,
      displayOrder: data.displayOrder,
      status: data.status,
      categories: [],
      createdAt: now,
      updatedAt: now,
    };
    setRootCategories((prev) => [...prev, newRoot]);
    toast.success("Root Category Created", `${data.name} (${data.code}) is now active.`);
  };

  const updateRootCategory = (id: string, data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    setRootCategories((prev) =>
      prev.map((root) =>
        root.id === id
          ? {
              ...root,
              name: data.name,
              slug: data.slug,
              code: data.code,
              description: data.description,
              imageUrl: data.imageUrl,
              bannerUrl: data.bannerUrl,
              displayOrder: data.displayOrder,
              status: data.status,
              updatedAt: now,
            }
          : root
      )
    );
    toast.success("Root Category Updated", `${data.name} (${data.code}) has been updated.`);
  };

  const addCategory = (data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      rootCategoryId: data.rootCategoryId,
      name: data.name,
      slug: data.slug,
      code: data.code,
      description: data.description,
      imageUrl: data.imageUrl,
      bannerUrl: data.bannerUrl,
      displayOrder: data.displayOrder,
      status: data.status,
      subcategories: [],
      createdAt: now,
      updatedAt: now,
    };
    setRootCategories((prev) =>
      prev.map((root) =>
        root.id === data.rootCategoryId
          ? { ...root, categories: [...root.categories, newCat] }
          : root
      )
    );
    toast.success("Product Category Created", `${data.name} (${data.code}) is now active.`);
  };

  const updateCategory = (id: string, data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    setRootCategories((prev) =>
      prev.map((root) => ({
        ...root,
        categories: root.categories.map((cat) =>
          cat.id === id
            ? {
                ...cat,
                name: data.name,
                slug: data.slug,
                code: data.code,
                description: data.description,
                imageUrl: data.imageUrl,
                bannerUrl: data.bannerUrl,
                displayOrder: data.displayOrder,
                status: data.status,
                updatedAt: now,
              }
            : cat
        ),
      }))
    );
    toast.success("Product Category Updated", `${data.name} (${data.code}) has been updated.`);
  };

  const addSubcategory = (data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    const newSub: Subcategory = {
      id: `sub-${Date.now()}`,
      categoryId: data.categoryId,
      rootCategoryId: data.rootCategoryId,
      name: data.name,
      slug: data.slug,
      code: data.code,
      description: data.description,
      imageUrl: data.imageUrl,
      bannerUrl: data.bannerUrl,
      displayOrder: data.displayOrder,
      status: data.status,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setRootCategories((prev) =>
      prev.map((root) => ({
        ...root,
        categories: root.categories.map((cat) =>
          cat.id === data.categoryId
            ? { ...cat, subcategories: [...cat.subcategories, newSub] }
            : cat
        ),
      }))
    );
    toast.success("Subcategory Created", `${data.name} (${data.code}) is now active.`);
  };

  const updateSubcategory = (id: string, data: UnifiedCategoryFormValues) => {
    const now = new Date().toISOString();
    setRootCategories((prev) =>
      prev.map((root) => ({
        ...root,
        categories: root.categories.map((cat) => ({
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === id
              ? {
                  ...sub,
                  name: data.name,
                  slug: data.slug,
                  code: data.code,
                  description: data.description,
                  imageUrl: data.imageUrl,
                  bannerUrl: data.bannerUrl,
                  displayOrder: data.displayOrder,
                  status: data.status,
                  updatedAt: now,
                }
              : sub
          ),
        })),
      }))
    );
    toast.success("Subcategory Updated", `${data.name} (${data.code}) has been updated.`);
  };

  const toggleStatus = (id: string, newStatus: EntityStatus, level: HierarchyLevel) => {
    const now = new Date().toISOString();
    setRootCategories((prev) => {
      if (level === "root") {
        return prev.map((root) =>
          root.id === id ? { ...root, status: newStatus, updatedAt: now } : root
        );
      }
      if (level === "category") {
        return prev.map((root) => ({
          ...root,
          categories: root.categories.map((cat) =>
            cat.id === id ? { ...cat, status: newStatus, updatedAt: now } : cat
          ),
        }));
      }
      if (level === "subcategory") {
        return prev.map((root) => ({
          ...root,
          categories: root.categories.map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.map((sub) =>
              sub.id === id ? { ...sub, status: newStatus, updatedAt: now } : sub
            ),
          })),
        }));
      }
      return prev;
    });

    const statusLabel = newStatus === "active" ? "Active" : "Inactive";
    toast.info("Status Changed", `Entity status successfully set to ${statusLabel}.`);
  };

  return (
    <CategoryContext.Provider
      value={{
        rootCategories,
        flatItems,
        stats,
        addRootCategory,
        updateRootCategory,
        addCategory,
        updateCategory,
        addSubcategory,
        updateSubcategory,
        toggleStatus,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const context = React.useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return context;
}
