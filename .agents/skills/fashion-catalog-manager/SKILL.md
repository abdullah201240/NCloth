---
name: fashion-catalog-manager
description: >-
  Best practices, data models, and UI patterns for managing fashion & apparel catalogs, SKU variant matrices (sizes, colorways, hex codes), fabric compositions, lookbook galleries, and inventory.
---

# Fashion Catalog & Variant Manager

Use this skill when implementing product creation, variant matrices, visual lookbook merchandising, fabric details, and collection categorization for the NCloth apparel store.

## 1. Fashion Product Data Model Best Practices

A fashion product requires attributes beyond generic e-commerce:

```typescript
export interface FashionProduct {
  id: string;
  name: string; // e.g., "Oversized Cashmere Blazer"
  handle: string; // "oversized-cashmere-blazer"
  collection: "SS26" | "FW26" | "Core" | "Runway" | "Archive";
  category: "Outerwear" | "Knitwear" | "Trousers" | "Footwear" | "Accessories";
  gender: "Unisex" | "Womenswear" | "Menswear";
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  description: string;
  details: {
    composition: string; // "100% Mongolian Cashmere"
    origin: string; // "Made in Italy"
    fit: "Oversized" | "Regular" | "Slim" | "Relaxed";
    careInstructions: string[]; // ["Dry clean only", "Do not bleach"]
  };
  variants: ProductVariant[];
  media: {
    url: string;
    alt: string;
    isCover: boolean;
    colorVariantId?: string;
  }[];
  tags: string[];
  status: "draft" | "active" | "archived";
}

export interface ProductVariant {
  id: string;
  sku: string; // "NCL-FW26-BLZ-BLK-M"
  color: {
    name: string; // "Noir Black", "Oatmeal", "Sage"
    hex: string;  // "#0a0a0a"
  };
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "One Size";
  stock: number;
  lowStockThreshold: number;
  barcode?: string;
  priceDelta?: number;
}
```

---

## 2. Key UI Patterns for Fashion Merchandising

### A. Variant Matrix Grid
* Generate a dynamic 2D or tabular matrix combining selected **Colors** × **Sizes**.
* Provide inline editing for SKU, Stock, and Low Stock Alerts.
* Include quick "Apply to all sizes" action for stock quantity.

### B. High-Resolution Visual Gallery
* Drag-and-drop sortable lookbook layout.
* Allow assigning specific photos to specific Color Variants so the storefront automatically filters images on color switch.
* Ratio presets: Fixed **3:4 portrait crop** indicator for standard fashion editorial display.

### C. Fabric & Sustainability Badges
* Quick-select chips for material tags (`Organic Cotton`, `Recycled Wool`, `GOTS Certified`, `Vegetable Tanned Leather`).
