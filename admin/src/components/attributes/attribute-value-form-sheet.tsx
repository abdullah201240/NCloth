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
  attributeValueFormSchema,
  type AttributeValueFormValues,
} from "@/lib/validations/attribute";
import { Attribute, AttributeValue } from "@/lib/types/attribute";
import { Tag, Hash, ArrowUpDown, Palette } from "lucide-react";

interface AttributeValueFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AttributeValue | null;
  selectedAttributeId?: string;
  selectAttributes: Attribute[];
  suggestedSortOrder?: number;
  onSubmit: (data: AttributeValueFormValues, editId?: string) => void;
}

export function AttributeValueFormSheet({
  open,
  onOpenChange,
  initialData,
  selectedAttributeId,
  selectAttributes,
  suggestedSortOrder = 1,
  onSubmit,
}: AttributeValueFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<AttributeValueFormValues>({
    resolver: zodResolver(attributeValueFormSchema),
    defaultValues: {
      attributeId: initialData?.attributeId || selectedAttributeId || selectAttributes[0]?.id || "",
      name: initialData?.name || "",
      code: initialData?.code || "",
      sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
      status: initialData?.status || "active",
      colorHex: initialData?.colorHex || "",
    },
  });

  const selectedStatus = form.watch("status");
  const selectedAttrId = form.watch("attributeId");
  const selectedColorHex = form.watch("colorHex");

  React.useEffect(() => {
    if (open) {
      form.reset({
        attributeId: initialData?.attributeId || selectedAttributeId || selectAttributes[0]?.id || "",
        name: initialData?.name || "",
        code: initialData?.code || "",
        sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
        status: initialData?.status || "active",
        colorHex: initialData?.colorHex || "",
      });
    }
  }, [open, initialData, selectedAttributeId, selectAttributes, suggestedSortOrder, form]);

  const onFormSubmit = (data: AttributeValueFormValues) => {
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

  const currentAttr = selectAttributes.find((a) => a.id === selectedAttrId);
  const isColorLike = currentAttr?.code.toLowerCase().includes("color") || currentAttr?.name.toLowerCase().includes("color");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 pr-12 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Attribute Value" : "Create Attribute Value"}</span>
            </SheetTitle>
            <Badge
              variant="outline"
              className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 ${
                selectedStatus === "active"
                  ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                  : "border-zinc-500/40 text-zinc-500 bg-zinc-500/10"
              }`}
            >
              {selectedStatus}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Configure discrete option value, code identifier, and optional visual color metadata.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Target Attribute Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Parent Attribute *
              </Label>
              <Select
                value={selectedAttrId}
                onValueChange={(val) => {
                  if (val) form.setValue("attributeId", val, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-8.5 text-sm">
                  <SelectValue placeholder="Select target attribute..." />
                </SelectTrigger>
                <SelectContent>
                  {selectAttributes.map((attr) => (
                    <SelectItem key={attr.id} value={attr.id} className="text-xs">
                      <span className="font-medium text-foreground">{attr.name}</span>{" "}
                      <span className="font-mono text-muted-foreground">({attr.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.attributeId && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.attributeId.message}
                </p>
              )}
            </div>

            {/* Value Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Value Display Name *
              </Label>
              <Input
                placeholder="e.g. Midnight Navy, 16GB, Titanium, Solid Oak"
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
                  Value Code *
                </Label>
                <Input
                  placeholder="e.g. midnight_navy, 16gb"
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

            {/* Optional Color Hex Swatch */}
            {isColorLike && (
              <div className="space-y-1.5 border border-border p-3 rounded-xs bg-muted/10">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Palette className="size-3 text-muted-foreground" />
                  Color Hex Swatch (Optional Visual Metadata)
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-xs border border-border shrink-0 shadow-xs"
                    style={{ backgroundColor: selectedColorHex || "#09090B" }}
                  />
                  <Input
                    placeholder="e.g. #0F172A"
                    className="font-mono text-sm uppercase h-8.5 flex-1"
                    {...form.register("colorHex")}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && !val.startsWith("#")) val = `#${val}`;
                      form.setValue("colorHex", val.toUpperCase());
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Value Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Value is active and available in SKU matrix options."
                    : "Value is inactive / archived."}
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
              {isEditing ? "Update Value" : "Create Value"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
