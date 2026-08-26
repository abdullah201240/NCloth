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
import { ImageIcon, X, Sparkles, ExternalLink } from "lucide-react";

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
  onSubmit: (data: UnifiedCategoryFormValues, editId?: string) => void;
}

const sampleFashionImages = [
  {
    label: "Editorial Trench",
    url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Cashmere Sweater",
    url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Calfskin Boots",
    url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Leather Tote",
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Runway Silhouette",
    url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
  },
];

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
      imageUrl: initialData?.imageUrl || "",
      bannerUrl: initialData?.bannerUrl || "",
      displayOrder: initialData?.displayOrder ?? 1,
      status: initialData?.status || "active",
    },
  });

  const selectedLevel = form.watch("level");
  const selectedRootId = form.watch("rootCategoryId");
  const selectedStatus = form.watch("status");
  const currentImageUrl = form.watch("imageUrl");

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 bg-background border-l border-border">
        <SheetHeader className="p-4 px-5 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit Hierarchy Node" : "New Hierarchy Node"}
            </SheetTitle>
            <Badge
              variant="outline"
              className="text-xs font-mono uppercase tracking-wider border-border px-2 py-0.5"
            >
              {selectedLevel}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Configure classification level, editorial photography, SKU prefix code, and active visibility state.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* 1. Hierarchy Level Selection */}
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

            {/* 2. Parent Root Category (for Category & Subcategory) */}
            {(selectedLevel === "category" || selectedLevel === "subcategory") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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

            {/* 4. Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display Name *
              </Label>
              <Input
                placeholder="e.g. Cashmere Knitwear"
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
                  placeholder="cashmere-knitwear"
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
                  placeholder="KNT-CSH"
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

            {/* 6. Image Management Section */}
            <div className="space-y-2 border border-border p-3 rounded-xs bg-background">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  Category Editorial Image
                </Label>
                <span className="text-xs text-muted-foreground font-mono">Storefront & Lookbook</span>
              </div>

              <div className="flex gap-3 items-start">
                {/* Thumbnail Preview Box */}
                <div className="relative size-20 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                  {currentImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentImageUrl}
                      alt="Category Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-1 text-center">
                      <ImageIcon className="size-5 stroke-1 mb-1" />
                      <span className="text-[10px] font-mono leading-tight">No image</span>
                    </div>
                  )}

                  {currentImageUrl && (
                    <button
                      type="button"
                      onClick={() => form.setValue("imageUrl", "", { shouldValidate: true })}
                      title="Clear image URL"
                      className="absolute top-1 right-1 size-4 rounded-xs bg-background/90 text-foreground border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                    >
                      <X className="size-2.5" />
                    </button>
                  )}
                </div>

                {/* URL Input & Quick Fill */}
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    className="font-mono text-xs h-8"
                    {...form.register("imageUrl")}
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.imageUrl.message}
                    </p>
                  )}

                  {/* Preset Quick Chooser */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Sparkles className="size-2.5" /> Quick Fashion Presets:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sampleFashionImages.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => form.setValue("imageUrl", img.url, { shouldValidate: true })}
                          className="text-[11px] font-mono px-1.5 py-0.5 border border-border rounded-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Banner URL */}
              <div className="pt-2 border-t border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                    Header Banner URL (Optional)
                  </Label>
                  {form.watch("bannerUrl") && (
                    <a
                      href={form.watch("bannerUrl")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                    >
                      View <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
                <Input
                  placeholder="https://images.unsplash.com/banner-photo-..."
                  className="font-mono text-xs h-7.5"
                  {...form.register("bannerUrl")}
                />
              </div>
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
              {isEditing ? "Update Node" : "Create Node"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
