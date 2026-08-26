"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  unitFormSchema,
  type UnitFormValues,
} from "@/lib/validations/attribute";
import { Unit, UnitType } from "@/lib/types/attribute";
import { Scale, Hash, Tag } from "lucide-react";

interface UnitFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Unit | null;
  onSubmit: (data: UnitFormValues, editId?: string) => void;
}

const UNIT_TYPES: { label: string; value: UnitType }[] = [
  { label: "Weight & Mass (e.g. kg, g, lb)", value: "WEIGHT" },
  { label: "Length & Distance (e.g. cm, m, in, mm)", value: "LENGTH" },
  { label: "Volume & Liquid (e.g. L, ml, gal)", value: "VOLUME" },
  { label: "Digital Storage (e.g. GB, TB, MB)", value: "DIGITAL" },
  { label: "Electrical & Power (e.g. V, W, mAh, A)", value: "ELECTRICAL" },
  { label: "Area & Surface (e.g. sq ft, sq m)", value: "AREA" },
  { label: "Temperature (e.g. °C, °F)", value: "TEMPERATURE" },
  { label: "Time & Duration (e.g. hrs, mins, days)", value: "TIME" },
  { label: "Other / Generic Dimension", value: "OTHER" },
];

export function UnitFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: UnitFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      symbol: initialData?.symbol || "",
      code: initialData?.code || "",
      unitType: initialData?.unitType || "WEIGHT",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");
  const selectedType = form.watch("unitType");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        symbol: initialData?.symbol || "",
        code: initialData?.code || "",
        unitType: initialData?.unitType || "WEIGHT",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const onFormSubmit = (data: UnitFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("symbol", val, { shouldValidate: true });
    if (!isEditing && !form.getValues("code")) {
      form.setValue("code", val.toUpperCase().replace(/[^A-Z0-9_-]/g, ""), { shouldValidate: false });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Scale className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Measurement Unit" : "Create Measurement Unit"}</span>
            </SheetTitle>
            <Badge
              variant="outline"
              className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 ${
                selectedStatus === "active"
                  ? "border-emerald-500/40 text-emerald-500"
                  : "border-zinc-500/40 text-zinc-500"
              }`}
            >
              {selectedStatus}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Define standard unit symbol, system code, and classification type for numeric attributes.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Unit Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Unit Full Name *
              </Label>
              <Input
                placeholder="e.g. Kilogram, Gigabyte, Centimeter"
                className="h-8.5 text-sm"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Symbol & Code (2-column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Tag className="size-3 text-muted-foreground" />
                  Symbol *
                </Label>
                <Input
                  placeholder="e.g. kg, GB, cm"
                  className="font-mono text-sm h-8.5"
                  {...form.register("symbol")}
                  onChange={handleSymbolChange}
                />
                {form.formState.errors.symbol && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.symbol.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  Unit Code *
                </Label>
                <Input
                  placeholder="e.g. KG, GB, CM"
                  className="font-mono text-sm uppercase h-8.5"
                  {...form.register("code")}
                  onChange={(e) => {
                    form.setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>
            </div>

            {/* Unit Type Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Unit Classification Type *
              </Label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  if (val) form.setValue("unitType", val as UnitType, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-8.5 text-sm">
                  <SelectValue placeholder="Select classification..." />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.unitType && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.unitType.message}
                </p>
              )}
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Measurement Unit
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Unit is active and available in attribute forms."
                    : "Unit is inactive / archived."}
                </p>
              </div>
              <Switch
                checked={selectedStatus === "active"}
                onCheckedChange={(checked) =>
                  form.setValue("status", checked ? "active" : "inactive")
                }
              />
            </div>
          </div>

          <SheetFooter className="p-4 px-5 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm px-3"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-sm px-3">
              {isEditing ? "Update Unit" : "Create Unit"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
