export type StoreStatus = "active" | "inactive";

export interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  manager?: string;
  email?: string;
  imageUrl?: string;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
}
