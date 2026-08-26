export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  // Basic Information
  name: string;
  code: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;

  // Business Information
  companyName?: string;
  tradeLicense?: string;
  paymentTerms?: string;
  notes?: string;

  // Status & Metadata
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
}
