export type ShelfStatus = "active" | "inactive";

export interface Shelf {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  warehouseName: string;
  description?: string;
  status: ShelfStatus;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfStats {
  totalShelves: number;
  activeShelves: number;
  inactiveShelves: number;
  warehouseCount: number;
}
