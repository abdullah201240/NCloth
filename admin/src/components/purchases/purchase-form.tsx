"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
} from "@/lib/validations/purchase";
import { PurchaseOrder, PaymentMethod, PurchaseOrderStatus } from "@/lib/types/purchase";
import { usePurchases } from "@/lib/stores/purchase-context";
import { useSuppliers } from "@/lib/stores/supplier-context";
import { useWarehouses } from "@/lib/stores/warehouse-context";
import { ProductVariantPickerDialog, SelectedVariantPayload } from "./product-variant-picker-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Warehouse,
  Calendar,
  Package,
  Plus,
  Trash2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface PurchaseFormProps {
  initialData?: PurchaseOrder;
  mode?: "create" | "edit";
}

export function PurchaseForm({ initialData, mode = "create" }: PurchaseFormProps) {
  const router = useRouter();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchases();
  const { suppliers } = useSuppliers();
  const { warehouses } = useWarehouses();

  // Collapsible section state
  const [openSections, setOpenSections] = React.useState({
    supplier: true,
    products: true,
    financials: true,
    notes: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Product Variant Picker Dialog State
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema) as any,
    defaultValues: initialData
      ? {
          supplierId: initialData.supplierId,
          warehouseId: initialData.warehouseId,
          purchaseDate: initialData.purchaseDate,
          expectedDeliveryDate: initialData.expectedDeliveryDate || "",
          referenceNumber: initialData.referenceNumber || "",
          currency: initialData.currency || "BDT",
          status: initialData.status,
          paymentStatus: initialData.paymentStatus,
          paymentMethod: initialData.paymentMethod,
          discount: initialData.discount,
          tax: initialData.tax,
          shippingCharges: initialData.shippingCharges,
          paidAmount: initialData.paidAmount,
          notes: initialData.notes || "",
          items: initialData.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            variantName: i.variantName,
            sku: i.sku,
            barcode: i.barcode,
            orderedQty: i.orderedQty,
            receivedQty: i.receivedQty || 0,
            unitCost: i.unitCost,
            discount: i.discount || 0,
            taxRate: i.taxRate || 0,
            lineTotal: i.lineTotal,
            notes: i.notes || "",
          })),
        }
      : {
          supplierId: suppliers[0]?.id || "",
          warehouseId: warehouses[0]?.id || "",
          purchaseDate: new Date().toISOString().split("T")[0],
          expectedDeliveryDate: "",
          referenceNumber: "",
          currency: "BDT",
          status: "ORDERED",
          paymentStatus: "UNPAID",
          paymentMethod: "BANK_TRANSFER",
          discount: 0,
          tax: 0,
          shippingCharges: 0,
          paidAmount: 0,
          notes: "",
          items: [],
        },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch form values for live calculation
  const watchedItems = form.watch("items") || [];
  const watchedDiscount = form.watch("discount") || 0;
  const watchedTax = form.watch("tax") || 0;
  const watchedShipping = form.watch("shippingCharges") || 0;
  const watchedPaidAmount = form.watch("paidAmount") || 0;
  const watchedSupplierId = form.watch("supplierId");

  const selectedSupplier = suppliers.find((s) => s.id === watchedSupplierId);

  // Calculate live financials
  const computedSubtotal = React.useMemo(() => {
    return watchedItems.reduce((acc, item) => {
      const qty = Number(item.orderedQty) || 0;
      const cost = Number(item.unitCost) || 0;
      const lineDisc = Number(item.discount) || 0;
      return acc + Math.max(0, qty * cost - lineDisc);
    }, 0);
  }, [watchedItems]);

  const computedGrandTotal = Math.max(
    0,
    computedSubtotal - (Number(watchedDiscount) || 0) + (Number(watchedTax) || 0) + (Number(watchedShipping) || 0)
  );

  const computedDueAmount = Math.max(0, computedGrandTotal - (Number(watchedPaidAmount) || 0));

  const totalUnitsOrdered = watchedItems.reduce((acc, i) => acc + (Number(i.orderedQty) || 0), 0);

  // Variant addition handler from Picker
  const handleSelectVariant = (variant: SelectedVariantPayload) => {
    const existingIndex = watchedItems.findIndex((i) => i.variantId === variant.variantId);
    if (existingIndex >= 0) {
      // Increase qty by 1
      const current = watchedItems[existingIndex];
      const newQty = (current.orderedQty || 1) + 1;
      const lineTotal = newQty * current.unitCost;
      update(existingIndex, {
        ...current,
        orderedQty: newQty,
        lineTotal,
      });
    } else {
      append({
        id: `poi-${Date.now()}-${fields.length}`,
        productId: variant.productId,
        variantId: variant.variantId,
        productName: variant.productName,
        variantName: variant.variantName,
        sku: variant.sku,
        barcode: variant.barcode,
        orderedQty: 10,
        receivedQty: 0,
        unitCost: variant.unitCost,
        discount: 0,
        taxRate: 0,
        lineTotal: 10 * variant.unitCost,
        notes: "",
      });
    }
  };

  // Inline line item field update
  const handleItemQtyChange = (index: number, newQty: number) => {
    const item = watchedItems[index];
    if (!item) return;
    const qty = Math.max(1, newQty);
    const lineTotal = Math.max(0, qty * item.unitCost - (item.discount || 0));
    update(index, {
      ...item,
      orderedQty: qty,
      lineTotal,
    });
  };

  const handleItemCostChange = (index: number, newCost: number) => {
    const item = watchedItems[index];
    if (!item) return;
    const cost = Math.max(0, newCost);
    const lineTotal = Math.max(0, (item.orderedQty || 1) * cost - (item.discount || 0));
    update(index, {
      ...item,
      unitCost: cost,
      lineTotal,
    });
  };

  const onSubmit = (data: PurchaseOrderFormValues) => {
    if (mode === "create") {
      const created = createPurchaseOrder(data);
      if (created) {
        router.push("/purchases");
      }
    } else if (initialData) {
      const ok = updatePurchaseOrder(initialData.id, data);
      if (ok) {
        router.push(`/purchases/${initialData.id}`);
      }
    }
  };

  const handleSaveAsDraft = () => {
    form.setValue("status", "DRAFT");
    form.handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-20">
      {/* 1. Supplier & Destination Warehouse Section */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          className="p-3.5 flex flex-row items-center justify-between cursor-pointer border-b border-border/60 hover:bg-muted/10 transition-colors"
          onClick={() => toggleSection("supplier")}
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Building2 className="size-4 text-muted-foreground" />
              <span>1. Supplier & Order Information</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Source supplier partner, receiving logistics facility & schedule
            </p>
          </div>
          <Button type="button" variant="ghost" size="xs" className="h-6 w-6 p-0">
            {openSections.supplier ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CardHeader>

        {openSections.supplier && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supplier Partner *
                </Label>
                <Controller
                  name="supplierId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => { if (val) field.onChange(val); }}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-1">[{s.code}]</span> {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.supplierId && (
                  <p className="text-xs text-destructive">{form.formState.errors.supplierId.message}</p>
                )}
                {selectedSupplier && (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Contact: {selectedSupplier.contactPerson || "N/A"} • {selectedSupplier.email || "No email"}
                  </p>
                )}
              </div>

              {/* Destination Warehouse */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination Warehouse *
                </Label>
                <Controller
                  name="warehouseId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => { if (val) field.onChange(val); }}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Destination Warehouse" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id} className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-1">[{w.code}]</span> {w.name} ({w.address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.warehouseId && (
                  <p className="text-xs text-destructive">{form.formState.errors.warehouseId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Purchase Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Purchase Date *
                </Label>
                <Input
                  type="date"
                  className="h-8.5 text-sm font-mono"
                  {...form.register("purchaseDate")}
                />
                {form.formState.errors.purchaseDate && (
                  <p className="text-xs text-destructive">{form.formState.errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Expected Delivery Date
                </Label>
                <Input
                  type="date"
                  className="h-8.5 text-sm font-mono"
                  {...form.register("expectedDeliveryDate")}
                />
              </div>

              {/* Reference Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supplier Ref / Quote #
                </Label>
                <Input
                  placeholder="e.g. QUOTE-2026-99"
                  className="h-8.5 text-sm font-mono uppercase"
                  {...form.register("referenceNumber")}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 2. Product Line Items Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          className="p-3.5 flex flex-row items-center justify-between cursor-pointer border-b border-border/60 hover:bg-muted/10 transition-colors"
          onClick={() => toggleSection("products")}
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Package className="size-4 text-muted-foreground" />
              <span>2. Product Variant Line Items</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Add exact sellable product variants with purchase cost and quantities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen(true);
              }}
              className="h-7 text-xs border-border gap-1.5"
            >
              <Plus className="size-3.5" /> Add Product Variant
            </Button>
            <Button type="button" variant="ghost" size="xs" className="h-6 w-6 p-0">
              {openSections.products ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </CardHeader>

        {openSections.products && (
          <CardContent className="p-4 space-y-4">
            {watchedItems.length === 0 ? (
              <div className="border border-dashed border-border rounded-xs p-8 text-center space-y-2">
                <Package className="size-8 mx-auto text-muted-foreground/60" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">No Products Selected</p>
                  <p className="text-[11px] text-muted-foreground">
                    Click the &quot;Add Product Variant&quot; button above to search the catalog and attach line items.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  className="h-8 text-xs border-border gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Product Variant
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-border rounded-xs overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border bg-background">
                        <TableHead className="h-8 text-xs min-w-[220px]">Product / Variant</TableHead>
                        <TableHead className="h-8 text-xs w-[140px]">SKU</TableHead>
                        <TableHead className="h-8 text-xs w-[110px] text-right">Quantity *</TableHead>
                        <TableHead className="h-8 text-xs w-[130px] text-right">Unit Cost (৳) *</TableHead>
                        <TableHead className="h-8 text-xs w-[130px] text-right">Line Total (৳)</TableHead>
                        <TableHead className="h-8 text-xs w-[50px] text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchedItems.map((item, idx) => {
                        const lineTotal = Math.max(0, (item.orderedQty || 1) * (item.unitCost || 0));

                        return (
                          <TableRow key={item.variantId || idx} className="border-b border-border/60 hover:bg-muted/20">
                            <TableCell className="py-2.5">
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-foreground">{item.productName}</p>
                                <p className="text-[11px] font-mono text-muted-foreground">{item.variantName}</p>
                              </div>
                            </TableCell>

                            <TableCell className="py-2.5 font-mono text-xs text-foreground">
                              {item.sku}
                            </TableCell>

                            <TableCell className="py-2.5 text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.orderedQty}
                                onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value) || 1)}
                                className="h-7 text-xs font-mono text-right w-24 ml-auto"
                              />
                            </TableCell>

                            <TableCell className="py-2.5 text-right">
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                value={item.unitCost}
                                onChange={(e) => handleItemCostChange(idx, parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs font-mono text-right w-28 ml-auto"
                              />
                            </TableCell>

                            <TableCell className="py-2.5 font-mono text-xs text-right font-semibold text-foreground">
                              ৳{lineTotal.toLocaleString()}
                            </TableCell>

                            <TableCell className="py-2.5 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => remove(idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Subtotal & Units Counter Bar */}
                <div className="flex items-center justify-between text-xs font-mono p-2.5 px-3 border border-border rounded-xs bg-muted/10">
                  <span className="text-muted-foreground">
                    Total Line Items: <strong className="text-foreground">{watchedItems.length}</strong> • Units: <strong className="text-foreground">{totalUnitsOrdered}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Items Subtotal: <strong className="text-foreground text-sm">৳{computedSubtotal.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            )}
            {form.formState.errors.items && (
              <p className="text-xs text-destructive font-medium">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* 3. Financial & Payment Summary Section */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          className="p-3.5 flex flex-row items-center justify-between cursor-pointer border-b border-border/60 hover:bg-muted/10 transition-colors"
          onClick={() => toggleSection("financials")}
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <DollarSign className="size-4 text-muted-foreground" />
              <span>3. Financial & Payment Breakdown</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Commercial discounts, tax duties, logistics freight & initial payment
            </p>
          </div>
          <Button type="button" variant="ghost" size="xs" className="h-6 w-6 p-0">
            {openSections.financials ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CardHeader>

        {openSections.financials && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Commercial Adjustments */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order Discount (৳)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="h-8 text-xs font-mono"
                    {...form.register("discount", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tax / VAT Duties (৳)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="h-8 text-xs font-mono"
                    {...form.register("tax", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Freight & Shipping Charges (৳)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="h-8 text-xs font-mono"
                    {...form.register("shippingCharges", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Right Column: Payment Terms & Summary */}
              <div className="space-y-3 border border-border p-4 rounded-xs bg-muted/10">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Method
                  </Label>
                  <Controller
                    name="paymentMethod"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(val) => { if (val) field.onChange(val); }}>
                        <SelectTrigger className="h-8 text-xs w-full bg-background">
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK_TRANSFER" className="text-xs">Bank Transfer (Swift / Wire)</SelectItem>
                          <SelectItem value="LETTER_OF_CREDIT" className="text-xs">Letter of Credit (LC)</SelectItem>
                          <SelectItem value="CASH_ON_DELIVERY" className="text-xs">Cash on Delivery (COD)</SelectItem>
                          <SelectItem value="CHEQUE" className="text-xs">Corporate Cheque</SelectItem>
                          <SelectItem value="BKASH_NAGAD" className="text-xs">bKash / Nagad Corporate</SelectItem>
                          <SelectItem value="CORPORATE_CARD" className="text-xs">Corporate Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Initial Paid Amount (৳)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    max={computedGrandTotal}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono bg-background"
                    {...form.register("paidAmount", { valueAsNumber: true })}
                  />
                </div>

                {/* Live Financial Totals Box */}
                <div className="pt-3 border-t border-border/80 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳{computedSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>-৳{(Number(watchedDiscount) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax + Shipping</span>
                    <span>+৳{((Number(watchedTax) || 0) + (Number(watchedShipping) || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border font-semibold text-sm text-foreground">
                    <span>Grand Total</span>
                    <span>৳{computedGrandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-500 font-medium">Paid</span>
                    <span className="text-emerald-500 font-medium">৳{(Number(watchedPaidAmount) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-500 font-medium">Balance Due</span>
                    <span className="text-amber-500 font-medium">৳{computedDueAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 4. Notes & Order Memo Section */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          className="p-3.5 flex flex-row items-center justify-between cursor-pointer border-b border-border/60 hover:bg-muted/10 transition-colors"
          onClick={() => toggleSection("notes")}
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              <span>4. Order Instructions & Logistics Notes</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Internal procurement memo, packaging requirements, or courier instructions
            </p>
          </div>
          <Button type="button" variant="ghost" size="xs" className="h-6 w-6 p-0">
            {openSections.notes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CardHeader>

        {openSections.notes && (
          <CardContent className="p-4">
            <Textarea
              placeholder="e.g. Urgent production restock. Ensure humidity-controlled garment bags during shipping."
              className="text-xs min-h-[70px] resize-none"
              {...form.register("notes")}
            />
          </CardContent>
        )}
      </Card>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-20 -mx-3 md:-mx-4 -mb-3 md:-mb-4 p-3 px-4 bg-background/98 backdrop-blur-sm border-t border-border flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/purchases")}
            className="h-8 text-xs border-border"
          >
            Cancel
          </Button>
          {watchedItems.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
              {watchedItems.length} line items • Grand Total: <strong className="text-foreground">৳{computedGrandTotal.toLocaleString()}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mode === "create" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveAsDraft}
              className="h-8 text-xs border-border"
            >
              Save as Draft
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            {mode === "create" ? "Create Purchase Order" : "Update Purchase Order"}
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
