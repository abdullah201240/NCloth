"use client";

import * as React from "react";
import { ColorItem, ColorStatus, ColorStats } from "@/lib/types/color";
import { initialColors } from "./color-store";
import { ColorFormValues } from "@/lib/validations/color";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface ColorContextType {
  colors: ColorItem[];
  stats: ColorStats;
  addColor: (data: ColorFormValues) => void;
  updateColor: (id: string, data: ColorFormValues) => void;
  toggleStatus: (id: string, newStatus: ColorStatus) => void;
}

const colorDataStore = createSyncedStore<ColorItem[]>(
  "ncloth_color_store_v1",
  initialColors
);

const ColorContext = React.createContext<ColorContextType | null>(null);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = colorDataStore.useStore();

  const stats = React.useMemo<ColorStats>(() => {
    const totalColors = colors.length;
    const activeColors = colors.filter((c) => c.status === "active").length;
    const inactiveColors = totalColors - activeColors;

    return {
      totalColors,
      activeColors,
      inactiveColors,
    };
  }, [colors]);

  const addColor = (data: ColorFormValues) => {
    const now = new Date().toISOString();
    const newColor: ColorItem = {
      id: `clr-${Date.now()}`,
      name: data.name,
      code: data.code,
      hex: data.hex.toUpperCase(),
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    setColors((prev) => [newColor, ...prev]);
    toast.success("Color Swatch Created", `${data.name} (${data.hex.toUpperCase()}) registered to palette.`);
  };

  const updateColor = (id: string, data: ColorFormValues) => {
    const now = new Date().toISOString();
    setColors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: data.name,
              code: data.code,
              hex: data.hex.toUpperCase(),
              status: data.status,
              updatedAt: now,
            }
          : c
      )
    );
    toast.success("Color Updated", `${data.name} (${data.hex.toUpperCase()}) updated successfully.`);
  };

  const toggleStatus = (id: string, newStatus: ColorStatus) => {
    const now = new Date().toISOString();
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: now } : c))
    );
    const statusLabel = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Color Status Changed", `Color swatch status successfully updated to ${statusLabel}.`);
  };

  return (
    <ColorContext.Provider
      value={{
        colors,
        stats,
        addColor,
        updateColor,
        toggleStatus,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColorContext() {
  const context = React.useContext(ColorContext);
  if (!context) {
    throw new Error("useColorContext must be used within a ColorProvider");
  }
  return context;
}
