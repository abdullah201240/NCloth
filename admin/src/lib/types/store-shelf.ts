export type StoreShelfStatus = "active" | "inactive";

export type StoreShelfZone =
  | "Sales Floor"
  | "Window Display"
  | "VIP Lounge"
  | "Backroom Stock"
  | "Accessories Island"
  | "Fitting Suite"
  | "Cash Wrap";

export interface StoreShelf {
  id: string;
  name: string;
  code: string;
  storeId: string;
  storeName: string;
  zone: string;
  description?: string;
  status: StoreShelfStatus;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreShelfStats {
  totalShelves: number;
  activeShelves: number;
  inactiveShelves: number;
  storeCount: number;
}
