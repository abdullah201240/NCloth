export type HierarchyLevel = "root" | "category" | "subcategory";

export type EntityStatus = "active" | "inactive";

export interface Subcategory {
  id: string;
  categoryId: string;
  rootCategoryId: string;
  name: string;
  slug: string;
  code: string; // e.g. "OVC", "TRN", "CSH"
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  displayOrder: number;
  status: EntityStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  rootCategoryId: string;
  name: string;
  slug: string;
  code: string; // e.g. "OTR", "KNT", "TLS"
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  displayOrder: number;
  status: EntityStatus;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface RootCategory {
  id: string;
  name: string;
  slug: string;
  code: string; // e.g. "RTW", "FTW", "ACC"
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  displayOrder: number;
  status: EntityStatus;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFlatItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  level: HierarchyLevel;
  imageUrl?: string;
  bannerUrl?: string;
  description?: string;
  parentName?: string;
  parentId?: string;
  rootName?: string;
  rootId?: string;
  displayOrder: number;
  status: EntityStatus;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}
