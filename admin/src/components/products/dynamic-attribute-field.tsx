"use client";

import * as React from "react";
import { Attribute, AttributeValue, Unit } from "@/lib/types/attribute";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface DynamicAttributeFieldProps {
  attribute: Attribute;
  values: AttributeValue[];
  units: Unit[];
  currentValue: any;
  currentUnitId?: string;
  onChange: (value: any, unitId?: string, unitSymbol?: string) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicAttributeField({
  attribute,
  values,
  units,
  currentValue,
  currentUnitId,
  onChange,
  error,
  disabled = false,
}: DynamicAttributeFieldProps) {
  // Find associated unit if NUMBER_WITH_UNIT
  const defaultUnit = units.find((u) => u.id === (currentUnitId || attribute.unitId));

  // 1. TEXT
  if (attribute.type === "TEXT") {
    return (
      <div className="space-y-1.5">
        <Input
          type="text"
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter ${attribute.name.toLowerCase()}...`}
          className="h-8.5 text-sm"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 2. LONG_TEXT
  if (attribute.type === "LONG_TEXT") {
    return (
      <div className="space-y-1.5">
        <Textarea
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter detailed ${attribute.name.toLowerCase()}...`}
          className="min-h-[70px] text-xs resize-none"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 3. NUMBER
  if (attribute.type === "NUMBER") {
    return (
      <div className="space-y-1.5">
        <Input
          type="number"
          step="any"
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
          disabled={disabled}
          placeholder="0"
          className="h-8.5 text-sm font-mono"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 4. BOOLEAN
  if (attribute.type === "BOOLEAN") {
    const isChecked = Boolean(currentValue);
    return (
      <div className="flex items-center justify-between h-8.5 border border-border px-3 rounded-xs bg-background">
        <span className="text-xs text-muted-foreground font-mono">
          {isChecked ? "Yes (Enabled)" : "No (Disabled)"}
        </span>
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={disabled}
        />
      </div>
    );
  }

  // 5. DATE
  if (attribute.type === "DATE") {
    return (
      <div className="space-y-1.5">
        <Input
          type="date"
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-8.5 text-sm font-mono"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 6. DATETIME
  if (attribute.type === "DATETIME") {
    return (
      <div className="space-y-1.5">
        <Input
          type="datetime-local"
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-8.5 text-sm font-mono"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 7. SELECT
  if (attribute.type === "SELECT") {
    return (
      <div className="space-y-1.5">
        <Select
          value={currentValue ? String(currentValue) : ""}
          onValueChange={(val) => onChange(val)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8.5 text-sm w-full">
            <SelectValue placeholder={`Select ${attribute.name}...`} />
          </SelectTrigger>
          <SelectContent>
            {values.map((v) => (
              <SelectItem key={v.id} value={v.id} className="text-sm">
                <div className="flex items-center gap-2">
                  {v.colorHex && (
                    <span
                      className="size-3 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: v.colorHex }}
                    />
                  )}
                  <span>{v.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 8. MULTI_SELECT
  if (attribute.type === "MULTI_SELECT") {
    const selectedArray: string[] = Array.isArray(currentValue) ? currentValue : [];

    const toggleItem = (valId: string) => {
      if (selectedArray.includes(valId)) {
        onChange(selectedArray.filter((id) => id !== valId));
      } else {
        onChange([...selectedArray, valId]);
      }
    };

    return (
      <div className="space-y-2 border border-border p-2.5 rounded-xs bg-background">
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {values.map((v) => {
            const isSelected = selectedArray.includes(v.id);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleItem(v.id)}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-xs border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-background border-foreground font-medium"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {v.colorHex && (
                  <span
                    className="size-2.5 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: v.colorHex }}
                  />
                )}
                <span>{v.name}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 9. NUMBER_WITH_UNIT
  if (attribute.type === "NUMBER_WITH_UNIT") {
    const activeUnitId = currentUnitId || attribute.unitId || units[0]?.id;
    const activeUnit = units.find((u) => u.id === activeUnitId);

    return (
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <Input
            type="number"
            step="any"
            value={currentValue ?? ""}
            onChange={(e) =>
              onChange(
                e.target.value === "" ? null : parseFloat(e.target.value),
                activeUnitId,
                activeUnit?.symbol
              )
            }
            disabled={disabled}
            placeholder="0.00"
            className="h-8.5 text-sm font-mono flex-1"
          />
          <Select
            value={activeUnitId}
            onValueChange={(unitId) => {
              if (!unitId) return;
              const unit = units.find((u) => u.id === unitId);
              onChange(currentValue, unitId, unit?.symbol);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-8.5 text-xs font-mono w-28 shrink-0">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs font-mono">
                  {u.symbol} ({u.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  // 10. URL
  if (attribute.type === "URL") {
    return (
      <div className="space-y-1.5">
        <Input
          type="url"
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://..."
          className="h-8.5 text-sm font-mono"
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    );
  }

  return null;
}
