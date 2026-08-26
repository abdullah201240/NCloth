export type SizeStatus = "active" | "inactive";

export type SizeGroup = "Adult" | "Kids" | "Baby" | "Shoes" | "Accessories" | string;

export interface SizeItem {
  id: string;
  name: string;        // e.g. "XS", "S", "M", "L", "XL", "42 EU"
  code: string;        // e.g. "XS", "S", "M", "L", "XL", "EU-42"
  group: string;       // e.g. "Adult", "Kids", "Baby", "Shoes", "Accessories"
  sortOrder: number;   // e.g. 1, 2, 3, 4, 5
  status: SizeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SizeStats {
  totalSizes: number;
  activeSizes: number;
  inactiveSizes: number;
  groupsCount: number;
}
