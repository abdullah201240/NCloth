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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  storeShelfFormSchema,
  type StoreShelfFormValues,
} from "@/lib/validations/store-shelf";
import { StoreShelf, StoreShelfZone } from "@/lib/types/store-shelf";
import { Store } from "@/lib/types/store";
import { Store as StoreIcon, Grid, AlignLeft, Hash, MapPin, Sparkles } from "lucide-react";

interface StoreShelfFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  initialData?: StoreShelf | null;
  onSubmit: (data: StoreShelfFormValues, storeName: string, editId?: string) => void;
}

const ZONE_PRESETS: StoreShelfZone[] = [
  "Sales Floor",
  "Window Display",
  "VIP Lounge",
  "Backroom Stock",
  "Accessories Island",
  "Fitting Suite",
  "Cash Wrap",
];

export function StoreShelfFormSheet({
  open,
  onOpenChange,
  stores,
  initialData,
  onSubmit,
}: StoreShelfFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<StoreShelfFormValues>({
    resolver: zodResolver(storeShelfFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      storeId: initialData?.storeId || (stores[0]?.id || ""),
      zone: initialData?.zone || "Sales Floor",
      description: initialData?.description || "",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        storeId: initialData?.storeId || (stores[0]?.id || ""),
        zone: initialData?.zone || "Sales Floor",
        description: initialData?.description || "",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, stores, form]);

  const onFormSubmit = (data: StoreShelfFormValues) => {
    const selectedStore = stores.find((s) => s.id === data.storeId);
    const storeName = selectedStore ? selectedStore.name : "Unassigned Boutique";
    onSubmit(data, storeName, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 pr-12 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Grid className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Boutique Shelf & Rack" : "New Boutique Shelf & Rack"}</span>
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
            Configure retail display racks, VIP wardrobes, accessories islands, and backroom storage.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* 1. Parent Boutique Store Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <StoreIcon className="size-3.5 text-muted-foreground" />
                Boutique Location *
              </Label>
              <Controller
                name="storeId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8.5 text-sm w-full">
                      <SelectValue placeholder="Select Boutique" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((str) => (
                        <SelectItem key={str.id} value={str.id} className="text-sm">
                          {str.name} ({str.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.storeId && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.storeId.message}
                </p>
              )}
            </div>

            {/* 2. Shelf / Display Rack Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Grid className="size-3.5 text-muted-foreground" />
                Shelf / Rack Name *
              </Label>
              <Input
                placeholder="e.g. Main Runway Showcase Rack A1"
                className="h-8.5 text-sm"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* 3. Shelf Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Hash className="size-3.5 text-muted-foreground" />
                Shelf Code *
              </Label>
              <Input
                placeholder="e.g. STR-PAR-RK01"
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

            {/* 4. Display Zone / Area */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                Store Area / Zone *
              </Label>
              <Controller
                name="zone"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8.5 text-sm w-full">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_PRESETS.map((zone) => (
                        <SelectItem key={zone} value={zone} className="text-sm">
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.zone && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.zone.message}
                </p>
              )}
            </div>

            {/* 5. Description (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlignLeft className="size-3.5 text-muted-foreground" />
                Description (Optional)
              </Label>
              <Textarea
                placeholder="e.g. Front window display rack featuring seasonal outerwear and hero runway looks..."
                className="text-xs min-h-[80px] resize-none"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* 6. Status Toggle (Active / Inactive) */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Display Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Unit is active and available for retail stock & visual merchandising."
                    : "Unit is offline / under maintenance."}
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
              {isEditing ? "Update Shelf" : "Create Shelf"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
