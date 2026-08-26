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
  colorFormSchema,
  type ColorFormValues,
} from "@/lib/validations/color";
import { ColorItem } from "@/lib/types/color";
import { Palette, Hash, Sparkles } from "lucide-react";

interface ColorFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ColorItem | null;
  onSubmit: (data: ColorFormValues, editId?: string) => void;
}

const LUXURY_PRESETS = [
  { name: "Noir Black", hex: "#09090B", slug: "noir-black" },
  { name: "Raw Ecru", hex: "#F5F2EB", slug: "raw-ecru" },
  { name: "Midnight Navy", hex: "#0F172A", slug: "midnight-navy" },
  { name: "Slate Grey", hex: "#334155", slug: "slate-grey" },
  { name: "Camel Tan", hex: "#C19A6B", slug: "camel-tan" },
  { name: "Dark Espresso", hex: "#2B1B17", slug: "dark-espresso" },
  { name: "Burgundy Wine", hex: "#4A0E17", slug: "burgundy-wine" },
  { name: "Sage Green", hex: "#4D5D4E", slug: "sage-green" },
  { name: "Crisp White", hex: "#FFFFFF", slug: "crisp-white" },
  { name: "Cognac Amber", hex: "#8B4513", slug: "cognac-amber" },
];

export function ColorFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ColorFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      hex: initialData?.hex || "#09090B",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");
  const currentHex = form.watch("hex") || "#09090B";

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        hex: initialData?.hex || "#09090B",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const onFormSubmit = (data: ColorFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val, { shouldValidate: true });
    // Auto-generate code/slug if not editing
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("code", generatedSlug, { shouldValidate: false });
    }
  };

  const handleApplyPreset = (preset: { name: string; hex: string; slug: string }) => {
    form.setValue("name", preset.name, { shouldValidate: true });
    form.setValue("code", preset.slug, { shouldValidate: true });
    form.setValue("hex", preset.hex, { shouldValidate: true });
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
              <Palette className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Color Swatch" : "Create Color Swatch"}</span>
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
            Define apparel color names, slug identifiers, hex values, and active palette state.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Live Color Swatch Banner */}
            <div className="border border-border p-3.5 rounded-xs flex items-center justify-between gap-3 bg-muted/10">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xs border border-border shadow-xs shrink-0 transition-colors"
                  style={{ backgroundColor: currentHex.startsWith("#") ? currentHex : "#09090B" }}
                />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Active Swatch Preview
                  </span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    {currentHex.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="relative size-8 overflow-hidden rounded-xs border border-border shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={currentHex.startsWith("#") && currentHex.length === 7 ? currentHex : "#09090B"}
                  onChange={(e) => form.setValue("hex", e.target.value.toUpperCase(), { shouldValidate: true })}
                  className="absolute -top-2 -left-2 size-12 cursor-pointer opacity-0"
                  title="Pick Color"
                />
                <div
                  className="size-full flex items-center justify-center pointer-events-none"
                  style={{ backgroundColor: currentHex.startsWith("#") ? currentHex : "#09090B" }}
                />
              </div>
            </div>

            {/* Quick Luxury Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Quick Studio Presets:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LUXURY_PRESETS.map((preset) => (
                  <button
                    key={preset.slug}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xs border border-border bg-background hover:bg-muted text-xs text-foreground transition-colors cursor-pointer"
                  >
                    <span
                      className="size-2.5 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Color Name *
              </Label>
              <Input
                placeholder="e.g. Noir Jet Black, Raw Ecru Linen"
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

            {/* Color Code / Slug */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Hash className="size-3 text-muted-foreground" />
                Color Code / Slug *
              </Label>
              <Input
                placeholder="e.g. noir-jet-black, CLR-BLK-01"
                className="font-mono text-sm h-8.5"
                {...form.register("code")}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* Color Hex Input */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Palette className="size-3 text-muted-foreground" />
                Color Hex Code *
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. #09090B"
                  className="font-mono text-sm uppercase h-8.5 flex-1"
                  {...form.register("hex")}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith("#") && val.length > 0) {
                      val = `#${val}`;
                    }
                    form.setValue("hex", val.toUpperCase(), { shouldValidate: true });
                  }}
                />
              </div>
              {form.formState.errors.hex && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.hex.message}
                </p>
              )}
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Color Swatch
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Color is active and available for product SKU variants."
                    : "Color is archived / inactive."}
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
              {isEditing ? "Update Color" : "Create Color"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
