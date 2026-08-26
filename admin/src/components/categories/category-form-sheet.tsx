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
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  unifiedCategoryFormSchema,
  type UnifiedCategoryFormValues,
} from "@/lib/validations/category";
import { RootCategory, HierarchyLevel, EntityStatus } from "@/lib/types/category";
import { ImageIcon, FolderTree, Folder, Tag } from "lucide-react";

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
    imageUrl?: string;
    bannerUrl?: string;
    displayOrder: number;
    status: EntityStatus;
  } | null;
  lockLevel?: boolean;
  onSubmit: (data: UnifiedCategoryFormValues, editId?: string) => void;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  rootCategories,
  initialData,
  lockLevel = false,
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
      imageUrl: initialData?.imageUrl || "",
      bannerUrl: initialData?.bannerUrl || "",
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
        imageUrl: initialData?.imageUrl || "",
        bannerUrl: initialData?.bannerUrl || "",
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

  // Dynamic titles and descriptions per locked tier level
  const getSheetTitle = () => {
    if (selectedLevel === "root") {
      return isEditing ? "Edit Root Category (Tier 1)" : "New Root Category (Tier 1)";
    }
    if (selectedLevel === "category") {
      return isEditing ? "Edit Product Category (Tier 2)" : "New Product Category (Tier 2)";
    }
    return isEditing ? "Edit Subcategory (Tier 3)" : "New Subcategory (Tier 3)";
  };

  const getSheetDescription = () => {
    if (selectedLevel === "root") {
      return "Define high-level departmental classification (Ready-to-Wear, Footwear, Leather Goods) and hero imagery.";
    }
    if (selectedLevel === "category") {
      return "Define product category group (Outerwear, Knitwear, Boots) attached to a parent Root department.";
    }
    return "Define granular subcategory (Overcoats, Chelsea Boots, Crewnecks) for direct SKU mapping.";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 bg-background border-l border-border">
        <SheetHeader className="p-4 px-5 pr-12 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              {selectedLevel === "root" && <FolderTree className="size-4 text-muted-foreground" />}
              {selectedLevel === "category" && <Folder className="size-4 text-muted-foreground" />}
              {selectedLevel === "subcategory" && <Tag className="size-4 text-muted-foreground" />}
              <span>{getSheetTitle()}</span>
            </SheetTitle>
            <Badge
              variant="outline"
              className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 border-border ${
                selectedLevel === "root"
                  ? "bg-foreground text-background font-medium"
                  : selectedLevel === "category"
                  ? "bg-muted text-foreground"
                  : "bg-background text-muted-foreground"
              }`}
            >
              Tier {selectedLevel === "root" ? "1 • Root" : selectedLevel === "category" ? "2 • Category" : "3 • Subcategory"}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            {getSheetDescription()}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* 1. Hierarchy Level Selection (Hidden or Disabled when lockLevel is true) */}
            {!lockLevel ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      <SelectTrigger className="w-full h-8.5 text-sm">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root" className="text-sm">Tier 1 • Root Category (e.g. Ready-to-Wear)</SelectItem>
                        <SelectItem value="category" className="text-sm">Tier 2 • Category (e.g. Outerwear)</SelectItem>
                        <SelectItem value="subcategory" className="text-sm">Tier 3 • Subcategory (e.g. Trench Coats)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            ) : null}

            {/* 2. Parent Root Category (for Category & Subcategory) */}
            {(selectedLevel === "category" || selectedLevel === "subcategory") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parent Department (Root Category) *
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
                      <SelectTrigger className="w-full h-8.5 text-sm">
                        <SelectValue placeholder="Select Root Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {rootCategories.map((root) => (
                          <SelectItem key={root.id} value={root.id} className="text-sm">
                            {root.name} ({root.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.rootCategoryId && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.rootCategoryId.message}
                  </p>
                )}
              </div>
            )}

            {/* 3. Parent Category (for Subcategory only) */}
            {selectedLevel === "subcategory" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parent Category (Tier 2) *
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
                      <SelectTrigger className="w-full h-8.5 text-sm">
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
                          <SelectItem key={cat.id} value={cat.id} className="text-sm">
                            {cat.name} ({cat.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>
            )}

            {/* 4. Display Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedLevel === "root" ? "Root Department Name *" : selectedLevel === "category" ? "Category Name *" : "Subcategory Name *"}
              </Label>
              <Input
                placeholder={selectedLevel === "root" ? "e.g. Ready-To-Wear" : selectedLevel === "category" ? "e.g. Outerwear" : "e.g. Overcoats & Trench"}
                className="h-8.5 text-sm"
                {...form.register("name")}
                onChange={handleNameChange}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* 5. Slug & SKU Code Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  URL Slug *
                </Label>
                <Input
                  placeholder={selectedLevel === "root" ? "ready-to-wear" : selectedLevel === "category" ? "outerwear" : "overcoats-trench"}
                  className="font-mono text-sm h-8.5"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SKU Code Prefix *
                </Label>
                <Input
                  placeholder={selectedLevel === "root" ? "RTW" : selectedLevel === "category" ? "OTR" : "OTR-OVC"}
                  className="font-mono text-sm uppercase h-8.5"
                  {...form.register("code")}
                  onChange={(e) => {
                    form.setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            {/* 6. Editorial Photography Upload Section */}
            <div className="space-y-2 border border-border p-3.5 rounded-xs bg-background">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  Editorial Photography (Upload)
                </Label>
              </div>

              <Controller
                name="imageUrl"
                control={form.control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Upload Editorial Image"
                    description="PNG, JPG, WEBP, or AVIF up to 10MB"
                  />
                )}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}

              {/* Optional Banner Upload for Root Classifications */}
              {selectedLevel === "root" && (
                <div className="pt-3 border-t border-border space-y-2 mt-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lookbook Hero Banner (Upload)
                  </Label>
                  <Controller
                    name="bannerUrl"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUploader
                        value={field.value || ""}
                        onChange={field.onChange}
                        label="Upload Hero Banner"
                        description="Widescreen banner for department lookbooks"
                        aspectRatio="wide"
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {/* 7. Display Order */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display Sort Order
              </Label>
              <Input
                type="number"
                min={1}
                className="w-24 font-mono text-sm h-8.5"
                {...form.register("displayOrder", { valueAsNumber: true })}
              />
              {form.formState.errors.displayOrder && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.displayOrder.message}</p>
              )}
            </div>

            {/* 8. Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Editorial Description
              </Label>
              <Textarea
                placeholder="Short editorial summary of materials, silhouettes, or collection positioning."
                className="text-sm h-16"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* 9. Status Toggle (Active / Inactive) */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
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
              {isEditing ? `Update ${selectedLevel === "root" ? "Root" : selectedLevel === "category" ? "Category" : "Subcategory"}` : `Create ${selectedLevel === "root" ? "Root" : selectedLevel === "category" ? "Category" : "Subcategory"}`}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
