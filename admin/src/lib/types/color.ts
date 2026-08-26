export type ColorStatus = "active" | "inactive";

export interface ColorItem {
  id: string;
  name: string;
  code: string; // Slug or Color Code (e.g. noir-jet-black, CLR-BLK-01)
  hex: string;  // Hex color code (e.g. #09090b)
  status: ColorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ColorStats {
  totalColors: number;
  activeColors: number;
  inactiveColors: number;
}
