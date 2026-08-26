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
  shelfFormSchema,
  type ShelfFormValues,
} from "@/lib/validations/shelf";
import { Shelf } from "@/lib/types/shelf";
import { Warehouse } from "@/lib/types/warehouse";
import { Grid, Building2, AlignLeft, Hash } from "lucide-react";

interface ShelfFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  initialData?: Shelf | null;
  onSubmit: (data: ShelfFormValues, warehouseName: string, editId?: string) => void;
}

export function ShelfFormSheet({
  open,
  onOpenChange,
  warehouses,
  initialData,
  onSubmit,
}: ShelfFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<ShelfFormValues>({
    resolver: zodResolver(shelfFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      warehouseId: initialData?.warehouseId || (warehouses[0]?.id || ""),
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
        warehouseId: initialData?.warehouseId || (warehouses[0]?.id || ""),
        description: initialData?.description || "",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, warehouses, form]);

  const onFormSubmit = (data: ShelfFormValues) => {
    const selectedWh = warehouses.find((w) => w.id === data.warehouseId);
    const warehouseName = selectedWh ? selectedWh.name : "Unassigned Warehouse";
    onSubmit(data, warehouseName, initialData?.id);
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
              <span>{isEditing ? "Edit Storage Shelf" : "New Storage Shelf"}</span>
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
            Configure shelf name, unique code, parent warehouse facility, and optional notes.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* 1. Parent Warehouse Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-muted-foreground" />
                Warehouse Facility *
              </Label>
              <Controller
                name="warehouseId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8.5 text-sm w-full">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id} className="text-sm">
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.warehouseId && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.warehouseId.message}
                </p>
              )}
            </div>

            {/* 2. Shelf Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Grid className="size-3.5 text-muted-foreground" />
                Shelf Name *
              </Label>
              <Input
                placeholder="e.g. Shelf A01"
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
                placeholder="e.g. SH-A01"
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

            {/* 4. Description (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlignLeft className="size-3.5 text-muted-foreground" />
                Description (Optional)
              </Label>
              <Textarea
                placeholder="e.g. Upper rack for tailored garments, cashmere knitwear, or silk collections..."
                className="text-xs min-h-[80px] resize-none"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* 5. Status Toggle (Active / Inactive) */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Shelf Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Shelf is available for immediate SKU allocation."
                    : "Shelf is offline / inactive."}
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
