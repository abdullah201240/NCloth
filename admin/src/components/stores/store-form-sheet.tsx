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
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  storeFormSchema,
  type StoreFormValues,
} from "@/lib/validations/store";
import { Store } from "@/lib/types/store";
import {
  Store as StoreIcon,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
} from "lucide-react";

interface StoreFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Store | null;
  onSubmit: (data: StoreFormValues, editId?: string) => void;
}

export function StoreFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: StoreFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      manager: initialData?.manager || "",
      email: initialData?.email || "",
      imageUrl: initialData?.imageUrl || "",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");
  const selectedImageUrl = form.watch("imageUrl");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        manager: initialData?.manager || "",
        email: initialData?.email || "",
        imageUrl: initialData?.imageUrl || "",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const onFormSubmit = (data: StoreFormValues) => {
    onSubmit(data, initialData?.id);
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
              <StoreIcon className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Store Boutique" : "Create Store Boutique"}</span>
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
            Configure retail boutique location, contact credentials, store manager, and operating status.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Store Photo Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Storefront Photography
              </Label>
              <ImageUploader
                value={selectedImageUrl}
                onChange={(url) => form.setValue("imageUrl", url, { shouldValidate: true })}
              />
            </div>

            {/* Store Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Store Name *
              </Label>
              <Input
                placeholder="e.g. Paris Flagship Boutique"
                className="h-8.5 text-sm"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Store Code */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Hash className="size-3 text-muted-foreground" />
                Store Code *
              </Label>
              <Input
                placeholder="e.g. STR-PAR-01"
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

            {/* Address */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground" />
                Address
              </Label>
              <Input
                placeholder="e.g. 22 Avenue Montaigne, 75008 Paris, France"
                className="h-8.5 text-sm"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* Phone & Manager (2-column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Phone className="size-3 text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  placeholder="e.g. +33 1 53 93 90 00"
                  className="h-8.5 text-sm font-mono"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Manager
                </Label>
                <Input
                  placeholder="e.g. Claire Delacroix"
                  className="h-8.5 text-sm"
                  {...form.register("manager")}
                />
                {form.formState.errors.manager && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.manager.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Mail className="size-3 text-muted-foreground" />
                Email (Optional)
              </Label>
              <Input
                type="email"
                placeholder="e.g. paris.flagship@ncloth.studio"
                className="h-8.5 text-sm"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Store Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Boutique is open and actively accepting client sales."
                    : "Boutique is closed / under renovation."}
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
              {isEditing ? "Update Store" : "Create Store"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
