"use client";

import * as React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseOrder } from "@/lib/types/purchase";
import { goodsReceiptSchema, type GoodsReceiptFormValues } from "@/lib/validations/purchase";
import { usePurchases } from "@/lib/stores/purchase-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, CheckCircle2, AlertCircle, PackageCheck, Building2 } from "lucide-react";

interface GoodsReceiptDialogProps {
  purchaseOrder: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoodsReceiptDialog({
  purchaseOrder,
  open,
  onOpenChange,
}: GoodsReceiptDialogProps) {
  const { recordGoodsReceipt } = usePurchases();

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema) as any,
    defaultValues: {
      receivedDate: new Date().toISOString().split("T")[0],
      receivedBy: "Alexander Sterling (Merchandising Lead)",
      notes: "",
      items: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  React.useEffect(() => {
    if (purchaseOrder && open) {
      const initialItems = purchaseOrder.items.map((item) => {
        const remaining = Math.max(0, item.orderedQty - (item.receivedQty || 0));
        return {
          itemId: item.id,
          variantId: item.variantId,
          sku: item.sku,
          receivedQty: remaining, // Pre-fill with remaining needed
          rejectedQty: 0,
          remarks: "",
        };
      });

      form.reset({
        receivedDate: new Date().toISOString().split("T")[0],
        receivedBy: "Alexander Sterling (Merchandising Lead)",
        notes: "",
        items: initialItems,
      });
      replace(initialItems);
    }
  }, [purchaseOrder, open, form, replace]);

  if (!purchaseOrder) return null;

  const onSubmit = (data: GoodsReceiptFormValues) => {
    const grn = recordGoodsReceipt(purchaseOrder.id, data);
    if (grn) {
      onOpenChange(false);
    }
  };

  const setAllRemaining = () => {
    const updated = purchaseOrder.items.map((item) => ({
      itemId: item.id,
      variantId: item.variantId,
      sku: item.sku,
      receivedQty: Math.max(0, item.orderedQty - (item.receivedQty || 0)),
      rejectedQty: 0,
      remarks: "Full remaining quantity received",
    }));
    replace(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-xs p-0 gap-0 overflow-hidden bg-background">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Truck className="size-4 text-muted-foreground" />
                  <span>Receive Goods • {purchaseOrder.poNumber}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record delivered quantities at <strong>{purchaseOrder.warehouseName}</strong> from <strong>{purchaseOrder.supplierName}</strong>.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-border">
                {purchaseOrder.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Header Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border p-3 rounded-xs bg-muted/10">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Receipt Date *
                </Label>
                <Input
                  type="date"
                  className="h-8 text-xs font-mono bg-background"
                  {...form.register("receivedDate")}
                />
                {form.formState.errors.receivedDate && (
                  <p className="text-xs text-destructive">{form.formState.errors.receivedDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Received & Inspected By *
                </Label>
                <Input
                  className="h-8 text-xs bg-background"
                  placeholder="e.g. Warehouse Staff Name"
                  {...form.register("receivedBy")}
                />
                {form.formState.errors.receivedBy && (
                  <p className="text-xs text-destructive">{form.formState.errors.receivedBy.message}</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Line Items
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={setAllRemaining}
                  className="h-6.5 text-[11px] font-mono border-border"
                >
                  Receive All Remaining
                </Button>
              </div>

              <div className="border border-border rounded-xs overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-background">
                      <TableHead className="h-8 text-xs">Variant Item</TableHead>
                      <TableHead className="h-8 text-xs w-[110px]">SKU</TableHead>
                      <TableHead className="h-8 text-xs w-[80px] text-center">Ordered</TableHead>
                      <TableHead className="h-8 text-xs w-[80px] text-center">Received</TableHead>
                      <TableHead className="h-8 text-xs w-[80px] text-center">Pending</TableHead>
                      <TableHead className="h-8 text-xs w-[110px]">Receiving *</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map((poi, idx) => {
                      const remaining = Math.max(0, poi.orderedQty - (poi.receivedQty || 0));

                      return (
                        <TableRow key={poi.id} className="border-b border-border/60 hover:bg-muted/20">
                          <TableCell className="py-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-foreground">{poi.productName}</p>
                              <p className="text-[11px] font-mono text-muted-foreground">{poi.variantName}</p>
                            </div>
                          </TableCell>

                          <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                            {poi.sku}
                          </TableCell>

                          <TableCell className="py-2 font-mono text-xs text-center font-medium text-foreground">
                            {poi.orderedQty}
                          </TableCell>

                          <TableCell className="py-2 font-mono text-xs text-center text-emerald-500">
                            {poi.receivedQty || 0}
                          </TableCell>

                          <TableCell className="py-2 font-mono text-xs text-center text-amber-500">
                            {remaining}
                          </TableCell>

                          <TableCell className="py-2">
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              className="h-7 text-xs font-mono text-right w-20"
                              {...form.register(`items.${idx}.receivedQty`, { valueAsNumber: true })}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inspection Remarks & Delivery Notes
              </Label>
              <Textarea
                placeholder="Condition of boxes, QC inspection remarks, courier reference..."
                className="text-xs min-h-[60px] resize-none"
                {...form.register("notes")}
              />
            </div>
          </div>

          <DialogFooter className="p-3 px-4 border-t border-border bg-background flex items-center justify-between">
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
              className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-medium"
            >
              <PackageCheck className="size-3.5" /> Record Receipt & Issue GRN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
