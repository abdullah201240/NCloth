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

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [rootCategories, setRootCategories] = React.useState<RootCategory[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ncloth_category_store_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialRootCategories;
  });

  // Save to local storage for persistent experience across separate pages
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ncloth_category_store_v2", JSON.stringify(rootCategories));
    }
  }, [rootCategories]);

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
