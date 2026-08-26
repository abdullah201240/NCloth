export type WarehouseStatus = "active" | "inactive";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  manager: string;
  phone: string;
  email?: string;
  imageUrl?: string;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
}
