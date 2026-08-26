"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  unifiedCategoryFormSchema,
  type UnifiedCategoryFormValues,
} from "@/lib/validations/category";
import { RootCategory, HierarchyLevel, EntityStatus } from "@/lib/types/category";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rootCategories: RootCategory[];
  initialData?: {
    id?: string;
    level: HierarchyLevel;
    rootCategoryId?: string;
    categoryId?: string;
    name: string;
    slug: string;
    code: string;
    description?: string;
    displayOrder: number;
    status: EntityStatus;
  } | null;
  onSubmit: (data: UnifiedCategoryFormValues, editId?: string) => void;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  rootCategories,
  initialData,
  onSubmit,
}: CategoryFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<UnifiedCategoryFormValues>({
    resolver: zodResolver(unifiedCategoryFormSchema),
    defaultValues: {
      level: initialData?.level || "root",
      rootCategoryId: initialData?.rootCategoryId || "",
      categoryId: initialData?.categoryId || "",
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      displayOrder: initialData?.displayOrder ?? 1,
      status: initialData?.status || "active",
    },
  });

  const selectedLevel = form.watch("level");
  const selectedRootId = form.watch("rootCategoryId");
  const selectedStatus = form.watch("status");

  // Reset form on open/data change
  React.useEffect(() => {
    if (open) {
      form.reset({
        level: initialData?.level || "root",
        rootCategoryId: initialData?.rootCategoryId || "",
        categoryId: initialData?.categoryId || "",
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        code: initialData?.code || "",
        description: initialData?.description || "",
        displayOrder: initialData?.displayOrder ?? 1,
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  // Selected root's child categories
  const parentCategories = React.useMemo(() => {
    const root = rootCategories.find((r) => r.id === selectedRootId);
    return root ? root.categories : [];
  }, [rootCategories, selectedRootId]);

  // Auto-generate slug from name if empty or creating
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val, { shouldValidate: true });
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  const onFormSubmit = (data: UnifiedCategoryFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-background">
        <SheetHeader className="p-3 px-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-medium tracking-tight">
              {isEditing ? "Edit Hierarchy Node" : "New Hierarchy Node"}
            </SheetTitle>
            <Badge
              variant="outline"
              className="text-[9px] font-mono uppercase tracking-wider border-border px-1 py-0"
            >
              {selectedLevel}
            </Badge>
          </div>
          <SheetDescription className="text-[11px] text-muted-foreground">
            Configure classification level, SKU prefix code, and active visibility state.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-3.5 space-y-3">
            {/* 1. Hierarchy Level Selection */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Hierarchy Level *
              </Label>
              <Controller
                name="level"
                control={form.control}
                render={({ field }) => (
                  <Select
                    disabled={isEditing}
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val as HierarchyLevel);
                        if (val === "root") {
                          form.setValue("rootCategoryId", "");
                          form.setValue("categoryId", "");
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Tier 1 • Root Category (e.g. Ready-to-Wear)</SelectItem>
                      <SelectItem value="category">Tier 2 • Category (e.g. Outerwear)</SelectItem>
                      <SelectItem value="subcategory">Tier 3 • Subcategory (e.g. Trench Coats)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* 2. Parent Root Category (for Category & Subcategory) */}
            {(selectedLevel === "category" || selectedLevel === "subcategory") && (
              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Parent Root Category *
                </Label>
                <Controller
                  name="rootCategoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) => {
                        field.onChange(val || "");
                        form.setValue("categoryId", "");
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select Root Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {rootCategories.map((root) => (
                          <SelectItem key={root.id} value={root.id}>
                            {root.name} ({root.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.rootCategoryId && (
                  <p className="text-[10px] text-destructive">
                    {form.formState.errors.rootCategoryId.message}
                  </p>
                )}
              </div>
            )}

            {/* 3. Parent Category (for Subcategory only) */}
            {selectedLevel === "subcategory" && (
              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Parent Category *
                </Label>
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedRootId || parentCategories.length === 0}
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(val || "")}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue
                          placeholder={
                            !selectedRootId
                              ? "Select Root Category first"
                              : parentCategories.length === 0
                              ? "No categories in selected root"
                              : "Select Category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} ({cat.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-[10px] text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>
            )}

            {/* 4. Name */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Display Name *
              </Label>
              <Input
                placeholder="e.g. Cashmere Knitwear"
                className="h-8 text-xs"
                {...form.register("name")}
                onChange={handleNameChange}
              />
              {form.formState.errors.name && (
                <p className="text-[10px] text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* 5. Slug & SKU Code Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  URL Slug *
                </Label>
                <Input
                  placeholder="cashmere-knitwear"
                  className="font-mono text-xs h-8"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  SKU Code Prefix *
                </Label>
                <Input
                  placeholder="KNT-CSH"
                  className="font-mono text-xs uppercase h-8"
                  {...form.register("code")}
                  onChange={(e) => {
                    form.setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
                {form.formState.errors.code && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            {/* 6. Display Order */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Display Sort Order
              </Label>
              <Input
                type="number"
                min={1}
                className="w-20 font-mono text-xs h-8"
                {...form.register("displayOrder", { valueAsNumber: true })}
              />
              {form.formState.errors.displayOrder && (
                <p className="text-[10px] text-destructive">{form.formState.errors.displayOrder.message}</p>
              )}
            </div>

            {/* 7. Description */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Editorial Description
              </Label>
              <Textarea
                placeholder="Short editorial summary of materials, silhouettes, or collection positioning."
                className="text-xs h-16"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-[10px] text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* 8. Status Toggle (Active / Inactive) */}
            <div className="flex items-center justify-between border border-border p-2.5 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground cursor-pointer">
                  Active Status
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Visible in studio catalog and storefront."
                    : "Inactive: Hidden from storefront navigation."}
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

          <SheetFooter className="p-3 px-4 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-7 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="xs" className="h-7 text-xs">
              {isEditing ? "Update Node" : "Create Node"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
