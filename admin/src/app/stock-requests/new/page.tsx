"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockRequestSchema, StockRequestFormValues } from "@/lib/validations/transfer";
import { useInventory } from "@/lib/stores/inventory-context";
import { useTransfers } from "@/lib/stores/transfer-context";
import { ProductVariantPickerDialog, SelectedVariantPayload } from "@/components/purchases/product-variant-picker-dialog";
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
  Store,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Package,
  Building2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function NewStockRequestPage() {
  const router = useRouter();
  const { locations, balances } = useInventory();
  const { createStockRequest } = useTransfers();
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const storeLocations = locations.filter((l) => l.type === "STORE" || l.type === "STORE_FLOOR");
  const warehouseLocations = locations.filter((l) => l.type === "WAREHOUSE" || l.type === "SHELF");

  const form = useForm<StockRequestFormValues>({
    resolver: zodResolver(stockRequestSchema) as any,
    defaultValues: {
      storeId: storeLocations[0]?.id || "loc-str-01",
      targetWarehouseId: warehouseLocations[0]?.id || "loc-wh-01",
      priority: "NORMAL",
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedStoreId = form.watch("storeId");
  const watchedItems = form.watch("items") || [];

  const handleSelectVariant = (variant: SelectedVariantPayload) => {
    const exists = watchedItems.some((i) => i.variantId === variant.variantId);
    if (exists) {
      toast.info("Variant already added");
      return;
    }

    const currentStoreBal = balances.find(
      (b) => b.locationId === watchedStoreId && b.variantId === variant.variantId
    );

    append({
      productId: variant.productId,
      productName: variant.productName,
      productCode: "",
      variantId: variant.variantId,
      variantName: variant.variantName,
      sku: variant.sku,
      currentStoreStock: currentStoreBal?.available || 0,
      requestedQty: 10,
    });
  };

  const onSubmit = (data: StockRequestFormValues) => {
    if (data.items.length === 0) {
      toast.error("Please add at least one item to request");
      return;
    }

    createStockRequest(data, "Gulshan Store Lead");
    router.push("/stock-requests");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-20 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => router.push("/stock-requests")}
              className="h-7 w-7 p-0 border-border"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Store className="size-5 text-foreground" />
              <span>Create Store Stock Replenishment Request</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Retail Reorder
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            REQUEST STOCK REORDER FROM CENTRAL FULFILLMENT WAREHOUSE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/stock-requests")}
            className="h-8 text-xs border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
          >
            <Save className="size-3.5" /> Submit Replenishment Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border rounded-xs bg-background p-4 space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Requesting Store Location *
          </Label>
          <Select
            value={watchedStoreId}
            onValueChange={(val) => {
              if (val) form.setValue("storeId", val);
            }}
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {storeLocations.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} ({s.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-4 space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Fulfillment Hub *
          </Label>
          <Select
            value={form.watch("targetWarehouseId")}
            onValueChange={(val) => {
              if (val) form.setValue("targetWarehouseId", val);
            }}
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Select Warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouseLocations.map((w) => (
                <SelectItem key={w.id} value={w.id} className="text-xs">
                  {w.name} ({w.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-4 space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Priority
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
        </Card>
      </div>

      {/* Line Items Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold text-foreground">
              Requested Product Variants
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="h-8 text-xs px-3 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5"
          >
            <Plus className="size-3.5" /> Add Product Variant
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {fields.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-muted-foreground">
              <Package className="size-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-mono">No items added to replenishment request.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-8 text-xs font-semibold">Variant</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[140px]">SKU</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[140px]">Current Store Stock</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[140px]">Requested Qty</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[60px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, idx) => (
                  <TableRow key={field.id} className="border-b border-border/60">
                    <TableCell className="py-2.5">
                      <p className="text-xs font-semibold text-foreground">{field.productName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{field.variantName}</p>
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-xs text-foreground">{field.sku}</TableCell>
                    <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                      {field.currentStoreStock} units
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Input
                        type="number"
                        min="1"
                        className="h-7 text-xs font-mono w-24"
                        {...form.register(`items.${idx}.requestedQty`, { valueAsNumber: true })}
                      />
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => remove(idx)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border rounded-xs bg-background p-4 space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Store Requisition Memo
        </Label>
        <Input
          placeholder="e.g. Urgent restock for upcoming festive collection launch."
          className="h-8 text-xs"
          {...form.register("notes")}
        />
      </Card>

      <ProductVariantPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelectVariant={handleSelectVariant}
        alreadySelectedVariantIds={watchedItems.map((i) => i.variantId)}
      />
    </form>
  );
}
