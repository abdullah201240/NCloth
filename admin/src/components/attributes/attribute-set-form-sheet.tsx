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
import { Checkbox } from "@/components/ui/checkbox";
import {
  attributeSetFormSchema,
  type AttributeSetFormValues,
} from "@/lib/validations/attribute";
import { AttributeSet, Attribute, AttributeSetConfig } from "@/lib/types/attribute";
import { Layers, Hash, ArrowUpDown, CheckSquare } from "lucide-react";

interface AttributeSetFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AttributeSet | null;
  availableAttributes: Attribute[];
  suggestedSortOrder?: number;
  onSubmit: (data: AttributeSetFormValues, initialConfigs?: AttributeSetConfig[], editId?: string) => void;
}

export function AttributeSetFormSheet({
  open,
  onOpenChange,
  initialData,
  availableAttributes,
  suggestedSortOrder = 1,
  onSubmit,
}: AttributeSetFormSheetProps) {
  const isEditing = !!initialData?.id;

  const [selectedAttrIds, setSelectedAttrIds] = React.useState<string[]>([]);

  const form = useForm<AttributeSetFormValues>({
    resolver: zodResolver(attributeSetFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
      sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
    },
  });

  const selectedStatus = form.watch("status");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        description: initialData?.description || "",
        status: initialData?.status || "active",
        sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
      });

      if (initialData?.attributeConfigs) {
        setSelectedAttrIds(initialData.attributeConfigs.map((c) => c.attributeId));
      } else {
        setSelectedAttrIds([]);
      }
    }
  }, [open, initialData, suggestedSortOrder, form]);

  const onFormSubmit = (data: AttributeSetFormValues) => {
    // Generate default configs for newly selected attributes
    const configs: AttributeSetConfig[] = selectedAttrIds.map((attrId, idx) => {
      const existing = initialData?.attributeConfigs?.find((c) => c.attributeId === attrId);
      if (existing) return existing;

      const attrObj = availableAttributes.find((a) => a.id === attrId);
      return {
        attributeId: attrId,
        isRequired: attrObj?.isRequired ?? false,
        isVariant: attrObj?.isVariant ?? false,
        isFilterable: attrObj?.isFilterable ?? true,
        isSearchable: attrObj?.isSearchable ?? true,
        isComparable: attrObj?.isComparable ?? true,
        sortOrder: idx + 1,
      };
    });

    onSubmit(data, configs, initialData?.id);
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

  const toggleAttributeSelection = (attrId: string) => {
    setSelectedAttrIds((prev) =>
      prev.includes(attrId) ? prev.filter((id) => id !== attrId) : [...prev, attrId]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 pr-12 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Attribute Set" : "Create Attribute Set"}</span>
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
            Define reusable attribute group templates tailored to specific product categories or industries.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Set Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Set Name *
              </Label>
              <Input
                placeholder="e.g. Fashion & Apparel, Smartphones & Mobile, Living Furniture"
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
                  Set Code *
                </Label>
                <Input
                  placeholder="e.g. fashion_apparel, smartphones_mobile"
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

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Description (Optional)
              </Label>
              <Textarea
                placeholder="Industry purpose, supported merchandise types, or category scope..."
                className="text-xs resize-none h-16"
                {...form.register("description")}
              />
            </div>

            {/* Included Attributes Checklist */}
            <div className="space-y-2 border border-border p-3 rounded-xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="size-3.5" />
                  Included Attributes ({selectedAttrIds.length} Selected)
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Detailed matrix overrides available after creation
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                {availableAttributes.map((attr) => {
                  const isChecked = selectedAttrIds.includes(attr.id);

                  return (
                    <div
                      key={attr.id}
                      onClick={() => toggleAttributeSelection(attr.id)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-xs hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleAttributeSelection(attr.id)}
                        />
                        <span className="text-xs font-medium text-foreground truncate">
                          {attr.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          ({attr.code})
                        </span>
                      </div>

                      <Badge variant="outline" className="text-[10px] font-mono py-0 shrink-0">
                        {attr.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Set Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Set is active and available for product category assignment."
                    : "Set is inactive / archived."}
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
              {isEditing ? "Update Set" : "Create Set"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
