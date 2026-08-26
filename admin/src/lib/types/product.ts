export type ProductType =
  | "STOCKABLE"
  | "NON_STOCK"
  | "SERVICE"
  | "DIGITAL"
  | "BUNDLE"
  | "COMPOSITE";

export type ProductStatus = "active" | "inactive" | "draft" | "archived";

export interface ProductAttributeValue {
  attributeId: string;
  attributeCode: string;
  attributeName: string;
  value: string | number | boolean | string[] | null;
  unitId?: string;
  unitSymbol?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Noir Black / Medium" or "Titanium / 16GB / 512GB"
  sku: string;
  barcode: string;
  combination: Record<string, string>; // { "attr-color": "val-col-01", "attr-size": "val-sz-03" }
  costPrice: number;
  sellingPrice: number;
  compareAtPrice?: number;
  weight?: number;
  status: "active" | "inactive";
  imageUrl?: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  isPrimary: boolean;
  alt?: string;
  sortOrder: number;
  variantValueId?: string; // Optional link to specific color/variant
}

export interface ProductAdditionalInfo {
  manufacturer?: string;
  originCountry?: string;
  warranty?: string;
  hsCode?: string; // Harmonized System tariff code
  notes?: string;
  externalReference?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string; // e.g. "OTR-OVC-001"
  slug: string;
  categoryId: string; // Category or Subcategory ID
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  attributeSetId: string;
  attributeSetName?: string;
  productType: ProductType;
  description?: string;
  status: ProductStatus;
  
  // Pricing summary
  defaultCostPrice: number;
  defaultSellingPrice: number;
  compareAtPrice?: number;
  currency: string;

  // Dynamic Attributes & Variants
  hasVariants: boolean;
  variantAttributeIds: string[]; // Attribute IDs participating in variants
  attributes: ProductAttributeValue[];
  variants: ProductVariant[];
  media: ProductMedia[];
  additionalInfo?: ProductAdditionalInfo;

  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalVariants: number;
  draftProducts: number;
  totalInventoryValuation: number;
}
