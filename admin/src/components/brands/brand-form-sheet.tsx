"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brand } from "@/lib/types/brand";
import { brandFormSchema, BrandFormValues } from "@/lib/validations/brand";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Sparkles, Globe, Award } from "lucide-react";

interface BrandFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BrandFormValues, id?: string) => void;
  initialData?: Brand | null;
  suggestedSortOrder?: number;
}

export function BrandFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  suggestedSortOrder = 1,
}: BrandFormSheetProps) {
  const isEditing = !!initialData;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      code: "",
      logoUrl: "",
      website: "",
      originCountry: "",
      description: "",
      isFeatured: false,
      sortOrder: suggestedSortOrder,
      status: "active",
    },
  });

  const selectedStatus = form.watch("status");
  const isFeatured = form.watch("isFeatured");
  const currentLogo = form.watch("logoUrl");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        logoUrl: initialData?.logoUrl || "",
        website: initialData?.website || "",
        originCountry: initialData?.originCountry || "",
        description: initialData?.description || "",
        isFeatured: initialData?.isFeatured ?? false,
        sortOrder: initialData?.sortOrder ?? suggestedSortOrder,
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, suggestedSortOrder, form]);

  const onFormSubmit = (data: BrandFormValues) => {
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
        <SheetHeader className="p-4 px-5 pr-12 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Award className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Brand House" : "Register New Brand"}</span>
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
            {isFeatured && (
              <Badge
                variant="outline"
                className="text-xs font-mono px-2 py-0.5 border-amber-500/40 text-amber-500 bg-amber-500/10 flex items-center gap-1"
              >
                <Sparkles className="size-3" /> Featured
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Configure luxury brand profile, origin country, official website, logo identity, and spotlight status.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Brand Logo Upload */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Brand Logo & Identity
              </Label>
              <ImageUploader
                value={currentLogo}
                onChange={(val) => form.setValue("logoUrl", val, { shouldValidate: true })}
                label="Click or drag brand logo"
                description="Square transparent PNG or SVG recommended"
                aspectRatio="square"
              />
            </div>

            {/* Brand Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Brand Name *
              </Label>
              <Input
                placeholder="e.g. Acne Studios, Apple, Lemaire, Sony"
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

            {/* Code and Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">
                  Brand Slug / Code *
                </Label>
                <Input
                  placeholder="e.g. acne_studios"
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
                <Label className="text-xs font-medium text-foreground">
                  Sort Sequence *
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

            {/* Origin Country & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Globe className="size-3.5 text-muted-foreground" />
                  Origin Country
                </Label>
                <Input
                  placeholder="e.g. Sweden, France, Japan, USA"
                  className="h-8.5 text-sm"
                  {...form.register("originCountry")}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">
                  Official Website
                </Label>
                <Input
                  placeholder="e.g. https://acnestudios.com"
                  className="h-8.5 text-sm font-mono"
                  {...form.register("website")}
                />
                {form.formState.errors.website && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Brand Description & Editorial Heritage
              </Label>
              <Textarea
                placeholder="Brief summary of brand ethos, manufacturing standards, or product specialties..."
                rows={3}
                className="text-xs resize-none"
                {...form.register("description")}
              />
            </div>

            {/* Featured / Spotlight Brand Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs bg-background">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <Label className="text-xs font-medium text-foreground cursor-pointer">
                    Featured Spotlight Brand
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Highlight this brand on storefront homepage spotlights and top filter bars.
                </p>
              </div>
              <Switch
                checked={isFeatured}
                onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
              />
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs bg-background">
              <div className="space-y-0.5 pr-2">
                <Label className="text-xs font-medium text-foreground cursor-pointer">
                  Brand Catalog Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Active brands are available for product assignment and public storefront browsing.
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

          <div className="p-4 px-5 border-t border-border flex items-center justify-end gap-2 bg-background">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium px-4"
            >
              {isEditing ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
