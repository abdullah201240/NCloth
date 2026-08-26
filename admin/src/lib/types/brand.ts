export interface Brand {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  website?: string;
  originCountry?: string;
  description?: string;
  isFeatured: boolean;
  sortOrder: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  countriesCount: number;
}
