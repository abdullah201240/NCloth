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
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  warehouseFormSchema,
  type WarehouseFormValues,
} from "@/lib/validations/warehouse";
import { Warehouse } from "@/lib/types/warehouse";
import { Building2, User, Phone, MapPin, Mail } from "lucide-react";

interface WarehouseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Warehouse | null;
  onSubmit: (data: WarehouseFormValues, editId?: string) => void;
}

export function WarehouseFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: WarehouseFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      address: initialData?.address || "",
      manager: initialData?.manager || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      imageUrl: initialData?.imageUrl || "",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        address: initialData?.address || "",
        manager: initialData?.manager || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        imageUrl: initialData?.imageUrl || "",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const onFormSubmit = (data: WarehouseFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
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
              <Building2 className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Warehouse Facility" : "New Warehouse Facility"}</span>
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
            Configure logistics hub, facility code, location address, and assigned manager contact.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* 1. Warehouse Name & Code Grid */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warehouse Name *
                </Label>
                <Input
                  placeholder="e.g. Paris Central Atelier & Vault"
                  className="h-8.5 text-sm"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warehouse Code *
                </Label>
                <Input
                  placeholder="e.g. WH-PAR-01"
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
            </div>

            {/* 2. Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                Physical Address *
              </Label>
              <Input
                placeholder="e.g. 14 Rue du Faubourg Saint-Honoré, 75008 Paris, France"
                className="text-sm h-8.5"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* 3. Manager & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Facility Manager *
                </Label>
                <Input
                  placeholder="e.g. Éléonore Moreau"
                  className="text-sm h-8.5"
                  {...form.register("manager")}
                />
                {form.formState.errors.manager && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.manager.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Contact Phone *
                </Label>
                <Input
                  placeholder="e.g. +33 1 42 68 55 00"
                  className="font-mono text-sm h-8.5"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Enterprise Email (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                Enterprise Facility Email
              </Label>
              <Input
                type="email"
                placeholder="e.g. paris.vault@ncloth.studio"
                className="font-mono text-sm h-8.5"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* 5. Facility Image Upload */}
            <div className="space-y-2 border border-border p-3.5 rounded-xs bg-background">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Facility / Depot Photography (Upload)
              </Label>
              <Controller
                name="imageUrl"
                control={form.control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Upload Facility Photo"
                    description="PNG, JPG, WEBP, or AVIF up to 10MB"
                    aspectRatio="video"
                  />
                )}
              />
            </div>

            {/* 6. Status Toggle (Active / Inactive) */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Operational Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Hub is live and active for inventory fulfillment."
                    : "Hub is inactive / offline for order routing."}
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
              {isEditing ? "Update Warehouse" : "Create Warehouse"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
