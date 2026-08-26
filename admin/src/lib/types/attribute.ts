export type EntityStatus = "active" | "inactive";

export type AttributeType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "DATETIME"
  | "SELECT"
  | "MULTI_SELECT"
  | "NUMBER_WITH_UNIT"
  | "URL";

export type UnitType =
  | "WEIGHT"
  | "LENGTH"
  | "VOLUME"
  | "DIGITAL"
  | "ELECTRICAL"
  | "AREA"
  | "TEMPERATURE"
  | "TIME"
  | "OTHER";

export interface Unit {
  id: string;
  name: string;      // e.g. Kilogram, Gigabyte, Centimeter
  symbol: string;    // e.g. kg, GB, cm
  code: string;      // e.g. KG, GB, CM
  unitType: UnitType;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeValue {
  id: string;
  attributeId: string;
  name: string;        // e.g. "Noir Black", "16GB", "100% Cashmere"
  code: string;        // e.g. "noir-black", "16gb", "100-cashmere"
  sortOrder: number;
  status: EntityStatus;
  colorHex?: string;   // Optional visual swatch metadata for color-like attributes
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  name: string;        // e.g. "Color", "RAM", "Screen Size", "Fabric"
  code: string;        // e.g. "color", "ram", "screen_size", "fabric"
  type: AttributeType;
  description?: string;
  status: EntityStatus;
  sortOrder: number;
  isRequired: boolean;
  isVariant: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  unitId?: string;     // Reference to Unit if type === "NUMBER_WITH_UNIT"
  createdAt: string;
  updatedAt: string;
}

export interface AttributeSetConfig {
  attributeId: string;
  isRequired: boolean;
  isVariant: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  sortOrder: number;
}

export interface AttributeSet {
  id: string;
  name: string;        // e.g. "Fashion Apparel", "Smartphones & Mobile", "Furniture"
  code: string;        // e.g. "fashion_apparel", "smartphones_mobile", "furniture"
  description?: string;
  status: EntityStatus;
  sortOrder: number;
  attributeConfigs: AttributeSetConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface AttributeModuleStats {
  totalAttributes: number;
  activeAttributes: number;
  totalSets: number;
  totalUnits: number;
  totalValues: number;
}
