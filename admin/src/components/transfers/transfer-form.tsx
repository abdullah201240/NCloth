"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockTransferSchema,
  StockTransferFormValues,
} from "@/lib/validations/transfer";
import { useInventory } from "@/lib/stores/inventory-context";
import { useTransfers } from "@/lib/stores/transfer-context";
import { ProductVariantPickerDialog, SelectedVariantPayload } from "@/components/purchases/product-variant-picker-dialog";
import { LocationBadge } from "@/components/inventory/location-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Truck,
  Building2,
  Store,
  Plus,
  Trash2,
  Save,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function TransferForm() {
  const router = useRouter();
  const { locations, balances } = useInventory();
  const { createTransfer } = useTransfers();
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const form = useForm<StockTransferFormValues>({
    resolver: zodResolver(stockTransferSchema) as any,
    defaultValues: {
      sourceLocationId: "loc-wh-01-sh-a01",
      destinationLocationId: "loc-str-01-flr",
      priority: "NORMAL",
      driverName: "",
      vehicleNumber: "",
      courierTrackingNo: "",
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedSourceId = form.watch("sourceLocationId");
  const watchedDestId = form.watch("destinationLocationId");
  const watchedItems = form.watch("items") || [];

  // Totals calculations
  const totalUnits = watchedItems.reduce((acc, curr) => acc + (Number(curr.requestedQty) || 0), 0);
  const totalValuationBDT = watchedItems.reduce(
    (acc, curr) => acc + (Number(curr.requestedQty) || 0) * (Number(curr.unitCost) || 0),
    0
  );

  const handleSelectVariant = (variant: SelectedVariantPayload) => {
    // Check if already added
    const exists = watchedItems.some((i) => i.variantId === variant.variantId);
    if (exists) {
      toast.info("Item already added", {
        description: `${variant.productName} (${variant.variantName}) is already in the transfer manifest.`,
      });
      return;
    }

    // Get source balance for this variant
    const sourceBal = balances.find(
      (b) => b.locationId === watchedSourceId && b.variantId === variant.variantId
    );
    const availableQty = sourceBal?.available || 0;

    append({
      productId: variant.productId,
      productName: variant.productName,
      productCode: "",
      variantId: variant.variantId,
      variantName: variant.variantName,
      sku: variant.sku,
      barcode: variant.barcode,
      unitCost: variant.unitCost,
      requestedQty: availableQty > 0 ? Math.min(10, availableQty) : 1,
      approvedQty: availableQty > 0 ? Math.min(10, availableQty) : 1,
      dispatchedQty: 0,
      receivedQty: 0,
      damagedQty: 0,
      shortageQty: 0,
    });

    toast.success("Variant Added to Transfer", {
      description: `${variant.productName} (${variant.variantName}) added.`,
    });
  };

  const onSubmit = (data: StockTransferFormValues) => {
    if (data.sourceLocationId === data.destinationLocationId) {
      toast.error("Invalid Transfer Route", {
        description: "Source and Destination locations cannot be the same.",
      });
      return;
    }

    if (data.items.length === 0) {
      toast.error("Empty Transfer", {
        description: "Please add at least one product variant to transfer.",
      });
      return;
    }

    const transfer = createTransfer(data, "Alexander S. (Admin)");
    router.push(`/transfers/${transfer.id}`);
  };

  const sourceLoc = locations.find((l) => l.id === watchedSourceId);
  const destLoc = locations.find((l) => l.id === watchedDestId);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-20 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => router.push("/transfers")}
              className="h-7 w-7 p-0 border-border"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="size-5 text-muted-foreground" />
              <span>Create Stock Transfer</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Multi-Location Movement
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            WAREHOUSE ⇄ STORE ⇄ STORE REALLOCATION WITH STRICT IN-TRANSIT LEDGER TRACKING
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/transfers")}
            className="h-8 text-xs border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
          >
            <Save className="size-3.5" /> Issue Transfer Order
          </Button>
        </div>
      </div>

      {/* 1. Transfer Route & Priority Setup */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Building2 className="size-4 text-muted-foreground" />
            <span>1. Location Routing & Logistics Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Source Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Source Location (From) *
              </Label>
              <Select
                value={watchedSourceId}
                onValueChange={(val) => {
                  if (val) form.setValue("sourceLocationId", val);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select Source Location" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id} className="text-xs">
                      [{loc.type}] {loc.name} ({loc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceLoc && (
                <LocationBadge type={sourceLoc.type} code={sourceLoc.code} name={sourceLoc.name} />
              )}
            </div>

            {/* Direction Arrow */}
            <div className="hidden md:flex flex-col items-center justify-center pt-5 text-muted-foreground">
              <ArrowRight className="size-6 text-muted-foreground/60 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
                Transit Vector
              </span>
            </div>

            {/* Destination Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination Location (To) *
              </Label>
              <Select
                value={watchedDestId}
                onValueChange={(val) => {
                  if (val) form.setValue("destinationLocationId", val);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select Destination Location" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id} className="text-xs">
                      [{loc.type}] {loc.name} ({loc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {destLoc && (
                <LocationBadge type={destLoc.type} code={destLoc.code} name={destLoc.name} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority Level
              </Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(val: any) => {
                  if (val) form.setValue("priority", val);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW" className="text-xs">LOW</SelectItem>
                  <SelectItem value="NORMAL" className="text-xs">NORMAL</SelectItem>
                  <SelectItem value="HIGH" className="text-xs">HIGH</SelectItem>
                  <SelectItem value="URGENT" className="text-xs font-semibold text-destructive">URGENT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Driver Name
              </Label>
              <Input
                placeholder="e.g. Kalam Mia"
                className="h-8 text-xs"
                {...form.register("driverName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle Plate / Courier Ref
              </Label>
              <Input
                placeholder="e.g. DHAKA-METRO-TA-11-8842"
                className="h-8 text-xs font-mono"
                {...form.register("vehicleNumber")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Transfer Items Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Package className="size-4 text-muted-foreground" />
              <span>2. Transfer Manifest & Variant Allocation</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Allocate exact SKUs and requested transfer quantities
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="h-8 text-xs px-3 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" /> Add Product Variant
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {fields.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-muted-foreground">
              <Package className="size-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs font-mono">No product variants added to transfer manifest yet.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="h-8 text-xs border-border"
              >
                Open Variant Catalog Picker
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-8 text-xs font-semibold">Product & Variant</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[150px]">SKU</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[120px]">Source Stock</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[140px]">Transfer Qty</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Unit Cost</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Line Valuation</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[60px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const sourceBal = balances.find(
                    (b) => b.locationId === watchedSourceId && b.variantId === field.variantId
                  );
                  const availableQty = sourceBal?.available || 0;
                  const currentQty = form.watch(`items.${index}.requestedQty`) || 0;
                  const lineVal = currentQty * (field.unitCost || 0);
                  const isInsufficient = currentQty > availableQty;

                  return (
                    <TableRow key={field.id} className="border-b border-border/60 hover:bg-muted/10">
                      <TableCell className="py-2.5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {field.productName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {field.variantName}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-foreground">
                        <span className="bg-muted/40 px-1.5 py-0.5 rounded-xs border border-border/40">
                          {field.sku}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs">
                        <span
                          className={`font-semibold ${
                            availableQty === 0
                              ? "text-destructive"
                              : availableQty < 10
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {availableQty} Avail
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="1"
                            max={availableQty > 0 ? availableQty : undefined}
                            className={`h-7 text-xs font-mono w-24 ${
                              isInsufficient ? "border-destructive text-destructive font-bold" : ""
                            }`}
                            {...form.register(`items.${index}.requestedQty`, { valueAsNumber: true })}
                          />
                          {isInsufficient && (
                            <span className="text-[10px] text-destructive flex items-center gap-1 font-mono">
                              <AlertCircle className="size-3" /> Exceeds Avail ({availableQty})
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground text-right">
                        ৳{(field.unitCost || 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-foreground font-semibold text-right">
                        ৳{lineVal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => remove(index)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 3. Operational Notes */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <FileText className="size-4 text-muted-foreground" />
            <span>3. Transfer Instructions & Courier Memos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Input
            placeholder="e.g. Fragile silk garments on hangers. Ensure temperature controlled transit vehicle."
            className="text-xs h-9"
            {...form.register("notes")}
          />
        </CardContent>
      </Card>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-20 -mx-3 md:-mx-4 -mb-3 md:-mb-4 p-3 px-4 bg-background/98 backdrop-blur-sm border-t border-border flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/transfers")}
            className="h-8 text-xs border-border"
          >
            Cancel
          </Button>
          {watchedItems.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
              {fields.length} variants • <strong>{totalUnits} Total Units</strong> • Valuation:{" "}
              <strong className="text-foreground">
                ৳{totalValuationBDT.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs px-5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
          >
            <Truck className="size-3.5" /> Issue Transfer Order
          </Button>
        </div>
      </div>

      {/* Product Variant Picker Dialog */}
      <ProductVariantPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelectVariant={handleSelectVariant}
        alreadySelectedVariantIds={watchedItems.map((i) => i.variantId)}
      />
    </form>
  );
}
