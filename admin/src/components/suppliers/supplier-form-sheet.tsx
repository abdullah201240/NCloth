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
import { Textarea } from "@/components/ui/textarea";
import {
  supplierFormSchema,
  type SupplierFormValues,
} from "@/lib/validations/supplier";
import { Supplier } from "@/lib/types/supplier";
import {
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  AlignLeft,
  Truck,
  Hash,
} from "lucide-react";

interface SupplierFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Supplier | null;
  onSubmit: (data: SupplierFormValues, editId?: string) => void;
}

export function SupplierFormSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: SupplierFormSheetProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      contactPerson: initialData?.contactPerson || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      companyName: initialData?.companyName || "",
      tradeLicense: initialData?.tradeLicense || "",
      paymentTerms: initialData?.paymentTerms || "",
      notes: initialData?.notes || "",
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        contactPerson: initialData?.contactPerson || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        address: initialData?.address || "",
        companyName: initialData?.companyName || "",
        tradeLicense: initialData?.tradeLicense || "",
        paymentTerms: initialData?.paymentTerms || "",
        notes: initialData?.notes || "",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const onFormSubmit = (data: SupplierFormValues) => {
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
              <Truck className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Supplier Partner" : "Create Supplier Partner"}</span>
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
            Manage fabric mills, atelier partners, contact details, payment terms, and trade credentials.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-5">
            {/* 1. BASIC INFORMATION SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
                <Building className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Basic Information
                </span>
              </div>

              {/* Supplier Name */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">
                  Supplier Name *
                </Label>
                <Input
                  placeholder="e.g. Biella Cashmere & Wool Mill"
                  className="h-8.5 text-sm"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Supplier Code & Contact Person (2-column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Hash className="size-3 text-muted-foreground" />
                    Supplier Code *
                  </Label>
                  <Input
                    placeholder="e.g. SUP-MIL-01"
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

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                    <User className="size-3 text-muted-foreground" />
                    Contact Person
                  </Label>
                  <Input
                    placeholder="e.g. Matteo Baroni"
                    className="h-8.5 text-sm"
                    {...form.register("contactPerson")}
                  />
                  {form.formState.errors.contactPerson && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.contactPerson.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Email (2-column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Phone className="size-3 text-muted-foreground" />
                    Phone *
                  </Label>
                  <Input
                    placeholder="e.g. +39 015 849 2200"
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
                    <Mail className="size-3 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. sourcing@biellamill.it"
                    className="h-8.5 text-sm"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  Address
                </Label>
                <Input
                  placeholder="e.g. Via Valle Cervo 14, 13900 Biella BI, Italy"
                  className="h-8.5 text-sm"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* 2. BUSINESS INFORMATION SECTION */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Business Information
                </span>
              </div>

              {/* Company Name & Trade License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    Company Name
                  </Label>
                  <Input
                    placeholder="e.g. Lanificio Biella S.p.A."
                    className="h-8.5 text-sm"
                    {...form.register("companyName")}
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    Trade License / Reg No.
                  </Label>
                  <Input
                    placeholder="e.g. IT-VAT-998822100"
                    className="h-8.5 text-sm font-mono uppercase"
                    {...form.register("tradeLicense")}
                  />
                  {form.formState.errors.tradeLicense && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.tradeLicense.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Terms */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <CreditCard className="size-3 text-muted-foreground" />
                  Payment Terms
                </Label>
                <Input
                  placeholder="e.g. Net 30 Days, 50% Advance / 50% on Delivery, Immediate Wire"
                  className="h-8.5 text-sm"
                  {...form.register("paymentTerms")}
                />
                {form.formState.errors.paymentTerms && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.paymentTerms.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <AlignLeft className="size-3 text-muted-foreground" />
                  Notes & Specializations
                </Label>
                <Textarea
                  placeholder="e.g. Primary fabric mill for SS26 Mongolian cashmere knitwear, super 160s wool suits..."
                  className="text-xs min-h-[75px] resize-none"
                  {...form.register("notes")}
                />
                {form.formState.errors.notes && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </div>

            {/* 3. STATUS SECTION */}
            <div className="pt-1">
              <div className="flex items-center justify-between border border-border p-3 rounded-xs">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground cursor-pointer">
                    Active Supplier Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {selectedStatus === "active"
                      ? "Supplier is active and eligible for purchase orders & fabric sourcing."
                      : "Supplier is paused / inactive for new procurement."}
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
              {isEditing ? "Update Supplier" : "Create Supplier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
