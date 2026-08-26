"use client";

import * as React from "react";
import {
  Unit,
  Attribute,
  AttributeValue,
  AttributeSet,
  AttributeSetConfig,
  EntityStatus,
  AttributeModuleStats,
} from "@/lib/types/attribute";
import {
  initialUnits,
  initialAttributes,
  initialAttributeValues,
  initialAttributeSets,
} from "./attribute-store";
import {
  UnitFormValues,
  AttributeFormValues,
  AttributeValueFormValues,
  AttributeSetFormValues,
} from "@/lib/validations/attribute";
import { toast } from "@/components/ui/toast";
import { createSyncedStore } from "./create-synced-store";

interface AttributeContextType {
  units: Unit[];
  attributes: Attribute[];
  attributeValues: AttributeValue[];
  attributeSets: AttributeSet[];
  stats: AttributeModuleStats;

  // Unit Mutations
  addUnit: (data: UnitFormValues) => void;
  updateUnit: (id: string, data: UnitFormValues) => void;
  toggleUnitStatus: (id: string, newStatus: EntityStatus) => void;

  // Attribute Mutations
  addAttribute: (data: AttributeFormValues) => Attribute;
  updateAttribute: (id: string, data: AttributeFormValues) => void;
  toggleAttributeStatus: (id: string, newStatus: EntityStatus) => void;

  // Attribute Value Mutations
  addAttributeValue: (data: AttributeValueFormValues) => void;
  updateAttributeValue: (id: string, data: AttributeValueFormValues) => void;
  toggleAttributeValueStatus: (id: string, newStatus: EntityStatus) => void;

  // Attribute Set Mutations
  addAttributeSet: (data: AttributeSetFormValues, initialConfigs?: AttributeSetConfig[]) => AttributeSet;
  updateAttributeSet: (id: string, data: AttributeSetFormValues) => void;
  updateSetAttributeConfigs: (setId: string, configs: AttributeSetConfig[]) => void;
  toggleAttributeSetStatus: (id: string, newStatus: EntityStatus) => void;

  // Helpers
  getUnitById: (unitId?: string) => Unit | undefined;
  getValuesByAttributeId: (attributeId: string) => AttributeValue[];
  getSetsUsingAttribute: (attributeId: string) => AttributeSet[];
}

const unitStore = createSyncedStore<Unit[]>("ncloth_units_v1", initialUnits);
const attributeStore = createSyncedStore<Attribute[]>("ncloth_attributes_v1", initialAttributes);
const valueStore = createSyncedStore<AttributeValue[]>("ncloth_attribute_values_v1", initialAttributeValues);
const setStore = createSyncedStore<AttributeSet[]>("ncloth_attribute_sets_v1", initialAttributeSets);

const AttributeContext = React.createContext<AttributeContextType | null>(null);

export function AttributeProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = unitStore.useStore();
  const [attributes, setAttributes] = attributeStore.useStore();
  const [attributeValues, setAttributeValues] = valueStore.useStore();
  const [attributeSets, setAttributeSets] = setStore.useStore();

  const stats = React.useMemo<AttributeModuleStats>(() => {
    return {
      totalAttributes: attributes.length,
      activeAttributes: attributes.filter((a) => a.status === "active").length,
      totalSets: attributeSets.length,
      totalUnits: units.length,
      totalValues: attributeValues.length,
    };
  }, [attributes, attributeSets, units, attributeValues]);

  // Unit Actions
  const addUnit = (data: UnitFormValues) => {
    const now = new Date().toISOString();
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      name: data.name,
      symbol: data.symbol,
      code: data.code.toUpperCase(),
      unitType: data.unitType,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    setUnits((prev) => [...prev, newUnit]);
    toast.success("Measurement Unit Created", `${data.name} (${data.symbol}) added to standard library.`);
  };

  const updateUnit = (id: string, data: UnitFormValues) => {
    const now = new Date().toISOString();
    setUnits((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              name: data.name,
              symbol: data.symbol,
              code: data.code.toUpperCase(),
              unitType: data.unitType,
              status: data.status,
              updatedAt: now,
            }
          : u
      )
    );
    toast.success("Unit Updated", `${data.name} (${data.symbol}) updated successfully.`);
  };

  const toggleUnitStatus = (id: string, newStatus: EntityStatus) => {
    const now = new Date().toISOString();
    // Safety check: is unit currently referenced in active NUMBER_WITH_UNIT attributes?
    if (newStatus === "inactive") {
      const referenced = attributes.filter((a) => a.unitId === id && a.status === "active");
      if (referenced.length > 0) {
        toast.warning(
          "Unit in Active Use",
          `Unit is referenced by ${referenced.length} active attribute(s) (${referenced.map((a) => a.name).join(", ")}).`
        );
      }
    }
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus, updatedAt: now } : u))
    );
    const label = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Unit Status Changed", `Unit status updated to ${label}.`);
  };

  // Attribute Actions
  const addAttribute = (data: AttributeFormValues): Attribute => {
    const now = new Date().toISOString();
    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: data.name,
      code: data.code.toLowerCase(),
      type: data.type,
      description: data.description || "",
      status: data.status,
      sortOrder: data.sortOrder,
      isRequired: data.isRequired,
      isVariant: data.isVariant,
      isFilterable: data.isFilterable,
      isSearchable: data.isSearchable,
      isComparable: data.isComparable,
      unitId: data.type === "NUMBER_WITH_UNIT" ? data.unitId : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setAttributes((prev) => [...prev, newAttr]);
    toast.success("Attribute Created", `${data.name} [${data.type}] registered successfully.`);
    return newAttr;
  };

  const updateAttribute = (id: string, data: AttributeFormValues) => {
    const now = new Date().toISOString();
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              name: data.name,
              code: data.code.toLowerCase(),
              type: data.type,
              description: data.description || "",
              status: data.status,
              sortOrder: data.sortOrder,
              isRequired: data.isRequired,
              isVariant: data.isVariant,
              isFilterable: data.isFilterable,
              isSearchable: data.isSearchable,
              isComparable: data.isComparable,
              unitId: data.type === "NUMBER_WITH_UNIT" ? data.unitId : undefined,
              updatedAt: now,
            }
          : a
      )
    );
    toast.success("Attribute Updated", `${data.name} specifications updated successfully.`);
  };

  const toggleAttributeStatus = (id: string, newStatus: EntityStatus) => {
    const now = new Date().toISOString();
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus, updatedAt: now } : a))
    );
    const label = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Attribute Status Changed", `Attribute status updated to ${label}.`);
  };

  // Attribute Value Actions
  const addAttributeValue = (data: AttributeValueFormValues) => {
    const now = new Date().toISOString();
    const newVal: AttributeValue = {
      id: `val-${Date.now()}`,
      attributeId: data.attributeId,
      name: data.name,
      code: data.code.toLowerCase(),
      sortOrder: data.sortOrder,
      status: data.status,
      colorHex: data.colorHex || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setAttributeValues((prev) => [...prev, newVal]);
    toast.success("Attribute Value Created", `Value "${data.name}" added to attribute option list.`);
  };

  const updateAttributeValue = (id: string, data: AttributeValueFormValues) => {
    const now = new Date().toISOString();
    setAttributeValues((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              attributeId: data.attributeId,
              name: data.name,
              code: data.code.toLowerCase(),
              sortOrder: data.sortOrder,
              status: data.status,
              colorHex: data.colorHex || undefined,
              updatedAt: now,
            }
          : v
      )
    );
    toast.success("Attribute Value Updated", `Value "${data.name}" updated successfully.`);
  };

  const toggleAttributeValueStatus = (id: string, newStatus: EntityStatus) => {
    const now = new Date().toISOString();
    setAttributeValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus, updatedAt: now } : v))
    );
    const label = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Value Status Changed", `Attribute value status updated to ${label}.`);
  };

  // Attribute Set Actions
  const addAttributeSet = (
    data: AttributeSetFormValues,
    initialConfigs: AttributeSetConfig[] = []
  ): AttributeSet => {
    const now = new Date().toISOString();
    const newSet: AttributeSet = {
      id: `set-${Date.now()}`,
      name: data.name,
      code: data.code.toLowerCase(),
      description: data.description || "",
      status: data.status,
      sortOrder: data.sortOrder,
      attributeConfigs: initialConfigs,
      createdAt: now,
      updatedAt: now,
    };
    setAttributeSets((prev) => [...prev, newSet]);
    toast.success("Attribute Set Created", `${data.name} bundle created with ${initialConfigs.length} attribute(s).`);
    return newSet;
  };

  const updateAttributeSet = (id: string, data: AttributeSetFormValues) => {
    const now = new Date().toISOString();
    setAttributeSets((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: data.name,
              code: data.code.toLowerCase(),
              description: data.description || "",
              status: data.status,
              sortOrder: data.sortOrder,
              updatedAt: now,
            }
          : s
      )
    );
    toast.success("Attribute Set Updated", `${data.name} updated successfully.`);
  };

  const updateSetAttributeConfigs = (setId: string, configs: AttributeSetConfig[]) => {
    const now = new Date().toISOString();
    setAttributeSets((prev) =>
      prev.map((s) =>
        s.id === setId
          ? {
              ...s,
              attributeConfigs: configs,
              updatedAt: now,
            }
          : s
      )
    );
    toast.success("Set Matrix Updated", `Configured ${configs.length} attribute properties for this set.`);
  };

  const toggleAttributeSetStatus = (id: string, newStatus: EntityStatus) => {
    const now = new Date().toISOString();
    setAttributeSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: now } : s))
    );
    const label = newStatus === "active" ? "ACTIVE" : "INACTIVE";
    toast.info("Attribute Set Status Changed", `Set status updated to ${label}.`);
  };

  // Helper Functions
  const getUnitById = React.useCallback(
    (unitId?: string) => {
      if (!unitId) return undefined;
      return units.find((u) => u.id === unitId);
    },
    [units]
  );

  const getValuesByAttributeId = React.useCallback(
    (attributeId: string) => {
      return attributeValues
        .filter((v) => v.attributeId === attributeId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [attributeValues]
  );

  const getSetsUsingAttribute = React.useCallback(
    (attributeId: string) => {
      return attributeSets.filter((s) =>
        s.attributeConfigs.some((cfg) => cfg.attributeId === attributeId)
      );
    },
    [attributeSets]
  );

  return (
    <AttributeContext.Provider
      value={{
        units,
        attributes,
        attributeValues,
        attributeSets,
        stats,
        addUnit,
        updateUnit,
        toggleUnitStatus,
        addAttribute,
        updateAttribute,
        toggleAttributeStatus,
        addAttributeValue,
        updateAttributeValue,
        toggleAttributeValueStatus,
        addAttributeSet,
        updateAttributeSet,
        updateSetAttributeConfigs,
        toggleAttributeSetStatus,
        getUnitById,
        getValuesByAttributeId,
        getSetsUsingAttribute,
      }}
    >
      {children}
    </AttributeContext.Provider>
  );
}

export function useAttributeContext() {
  const context = React.useContext(AttributeContext);
  if (!context) {
    throw new Error("useAttributeContext must be used within an AttributeProvider");
  }
  return context;
}
