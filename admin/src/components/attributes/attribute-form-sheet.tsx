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
import { Textarea } from "@/components/ui/textarea";
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
  attributeFormSchema,
  type AttributeFormValues,
} from "@/lib/validations/attribute";
import { Attribute, AttributeType, Unit } from "@/lib/types/attribute";
import {
  Sliders,
  Hash,
  Scale,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";

interface AttributeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Attribute | null;
  availableUnits: Unit[];
  suggestedSortOrder?: number;
  onSubmit: (data: AttributeFormValues, editId?: string) => void;
}

const ATTRIBUTE_TYPES: { label: string; value: AttributeType; description: string }[] = [
  { label: "SELECT (Single Choice)", value: "SELECT", description: "List of predefined values (e.g. Color, Size, Material)" },
  { label: "MULTI_SELECT (Multiple Choices)", value: "MULTI_SELECT", description: "Multiple selectable tags/options" },
  { label: "NUMBER_WITH_UNIT (Measurement)", value: "NUMBER_WITH_UNIT", description: "Numeric value bound to standard unit (e.g. Weight, RAM, Screen Size)" },
  { label: "TEXT (Short String)", value: "TEXT", description: "Single-line plain text (e.g. Model, Warranty, Origin)" },
  { label: "LONG_TEXT (Rich / Paragraph)", value: "LONG_TEXT", description: "Multi-line text or detailed specifications" },
  { label: "NUMBER (Raw Integer / Float)", value: "NUMBER", description: "Plain numeric quantity without specific unit" },
  { label: "BOOLEAN (Yes / No Toggle)", value: "BOOLEAN", description: "True/False switch (e.g. Waterproof, Organic, Bluetooth)" },
  { label: "DATE (Calendar Date)", value: "DATE", description: "Date selector (e.g. Expiry Date, Release Date)" },
  { label: "DATETIME (Timestamp)", value: "DATETIME", description: "Precise date and time stamp" },
  { label: "URL (Web Link)", value: "URL", description: "Web address / manual link" },
];

export function AttributeFormSheet({
  open,
  onOpenChange,
  initialData,
  availableUnits,
  suggestedSortOrder = 1,
  onSubmit,
}: AttributeFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      type: initialData?.type || "SELECT",
      description: initialData?.description || "",
      status: initialData?.status || "active",
      sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
      isRequired: initialData?.isRequired ?? false,
      isVariant: initialData?.isVariant ?? false,
      isFilterable: initialData?.isFilterable ?? true,
      isSearchable: initialData?.isSearchable ?? true,
      isComparable: initialData?.isComparable ?? true,
      unitId: initialData?.unitId || "",
    },
  });

  const selectedStatus = form.watch("status");
  const selectedType = form.watch("type");
  const selectedUnitId = form.watch("unitId");
  const isRequired = form.watch("isRequired");
  const isVariant = form.watch("isVariant");
  const isFilterable = form.watch("isFilterable");
  const isSearchable = form.watch("isSearchable");
  const isComparable = form.watch("isComparable");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        type: initialData?.type || "SELECT",
        description: initialData?.description || "",
        status: initialData?.status || "active",
        sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
        isRequired: initialData?.isRequired ?? false,
        isVariant: initialData?.isVariant ?? false,
        isFilterable: initialData?.isFilterable ?? true,
        isSearchable: initialData?.isSearchable ?? true,
        isComparable: initialData?.isComparable ?? true,
        unitId: initialData?.unitId || "",
      });
    }
  }, [open, initialData, suggestedSortOrder, form]);

  const onFormSubmit = (data: AttributeFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val, { shouldValidate: true });
    if (!isEditing && !form.getValues("code")) {
      const generatedCode = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^_|_$)/g, "");
      form.setValue("code", generatedCode, { shouldValidate: false });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sliders className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Attribute Property" : "Create Attribute Property"}</span>
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
            Configure dynamic property definition, data type, measurement binding, and storefront indexing rules.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Attribute Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Attribute Name *
              </Label>
              <Input
                placeholder="e.g. Color, RAM Memory, Screen Size, Item Weight"
                className="h-8.5 text-sm"
                {...form.register("name")}
                onChange={handleNameChange}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Code & Sort Order (2-column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  Attribute Code *
                </Label>
                <Input
                  placeholder="e.g. color, ram_memory"
                  className="font-mono text-sm h-8.5"
                  {...form.register("code")}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                  Sort Order *
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={999}
                  className="font-mono text-sm h-8.5"
                  {...form.register("sortOrder", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Attribute Type Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Data Type *
              </Label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  if (val) {
                    form.setValue("type", val as AttributeType, { shouldValidate: true });
                    if (val !== "NUMBER_WITH_UNIT") {
                      form.setValue("unitId", "");
                    }
                  }
                }}
              >
                <SelectTrigger className="h-8.5 text-sm font-mono">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {ATTRIBUTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs py-1.5">
                      <span className="font-semibold text-foreground font-mono">{t.value}</span>
                      <span className="block text-[11px] text-muted-foreground">{t.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Section: NUMBER_WITH_UNIT -> Unit Selector */}
            {selectedType === "NUMBER_WITH_UNIT" && (
              <div className="border border-border p-3 rounded-xs space-y-2 bg-muted/10">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Scale className="size-3.5 text-primary" />
                  Measurement Unit * (Required for NUMBER_WITH_UNIT)
                </Label>
                <Select
                  value={selectedUnitId}
                  onValueChange={(val) => {
                    form.setValue("unitId", val || "", { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="h-8.5 text-sm bg-background">
                    <SelectValue placeholder="Select standard unit (e.g. kg, GB, in, W)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        <span className="font-medium text-foreground">{u.name}</span>{" "}
                        <span className="font-mono text-muted-foreground">({u.symbol})</span>{" "}
                        <Badge variant="outline" className="text-[10px] ml-1.5 font-mono py-0">
                          {u.unitType}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.unitId && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.unitId.message}
                  </p>
                )}
              </div>
            )}

            {/* Dynamic Section: SELECT / MULTI_SELECT Helper Note */}
            {(selectedType === "SELECT" || selectedType === "MULTI_SELECT") && (
              <div className="border border-border p-2.5 rounded-xs bg-muted/15 flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-foreground shrink-0 mt-0.5" />
                <span>
                  Option values for <strong>{form.getValues("name") || "this attribute"}</strong> can be added and managed under the dedicated <strong>Attribute Values</strong> interface.
                </span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Description (Optional)
              </Label>
              <Textarea
                placeholder="Brief purpose, technical specs, or merchandising guidelines..."
                className="text-xs resize-none h-16"
                {...form.register("description")}
              />
            </div>

            {/* Advanced Configuration Checklist */}
            <div className="space-y-2 border border-border p-3 rounded-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Default Indexing & Behavior Rules
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                  <Switch
                    checked={isRequired}
                    onCheckedChange={(c) => form.setValue("isRequired", c)}
                  />
                  <span>Required by Default</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                  <Switch
                    checked={isVariant}
                    onCheckedChange={(c) => form.setValue("isVariant", c)}
                  />
                  <span>Variant Attribute (SKU)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                  <Switch
                    checked={isFilterable}
                    onCheckedChange={(c) => form.setValue("isFilterable", c)}
                  />
                  <span>Filterable in Facets</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                  <Switch
                    checked={isSearchable}
                    onCheckedChange={(c) => form.setValue("isSearchable", c)}
                  />
                  <span>Searchable Keyword</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground sm:col-span-2">
                  <Switch
                    checked={isComparable}
                    onCheckedChange={(c) => form.setValue("isComparable", c)}
                  />
                  <span>Comparable in Specs Matrix</span>
                </label>
              </div>
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Attribute Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Attribute is active and usable across all industry sets."
                    : "Attribute is inactive / archived."}
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
              {isEditing ? "Update Attribute" : "Create Attribute"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
