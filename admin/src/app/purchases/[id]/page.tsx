"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { usePurchases } from "@/lib/stores/purchase-context";
import { GoodsReceiptDialog } from "@/components/purchases/goods-receipt-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Warehouse,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  PackageCheck,
  CreditCard,
  FileText,
  Printer,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function PurchaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getPurchaseOrderById,
    updatePurchaseStatus,
    recordPayment,
    cancelPurchaseOrder,
  } = usePurchases();

  const purchaseOrder = getPurchaseOrderById(params.id);

  // Modal dialog states
  const [grnDialogOpen, setGrnDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = React.useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  if (!purchaseOrder) {
    return (
      <AdminShell>
        <div className="text-center py-20 space-y-3">
          <ShoppingCart className="size-10 mx-auto text-muted-foreground/60" />
          <h2 className="text-base font-semibold text-foreground">Purchase Order Not Found</h2>
          <p className="text-xs text-muted-foreground font-mono">
            The requested PO ID &quot;{params.id}&quot; does not exist or has been removed.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/purchases")}
            className="h-8 text-xs border-border mt-2"
          >
            <ArrowLeft className="size-3.5 mr-1.5" /> Return to Purchase Orders
          </Button>
        </div>
      </AdminShell>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDERED":
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs font-mono">
            <Clock className="size-3 mr-1" /> ORDERED
          </Badge>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs font-mono">
            <Truck className="size-3 mr-1" /> PARTIAL RECEIPT
          </Badge>
        );
      case "FULLY_RECEIVED":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-mono">
            <CheckCircle2 className="size-3 mr-1" /> FULLY RECEIVED
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge variant="outline" className="border-zinc-500/30 text-zinc-400 bg-zinc-500/10 text-xs font-mono">
            CLOSED
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-xs font-mono">
            <Ban className="size-3 mr-1" /> CANCELLED
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs font-mono">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-mono">
            PAID
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs font-mono">
            PARTIALLY PAID
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-xs font-mono">
            UNPAID
          </Badge>
        );
    }
  };

  const totalOrdered = purchaseOrder.items.reduce((acc, i) => acc + i.orderedQty, 0);
  const totalReceived = purchaseOrder.items.reduce((acc, i) => acc + (i.receivedQty || 0), 0);
  const fulfillmentPercent = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

  const handleRecordPaymentSubmit = () => {
    const amount = parseFloat(paymentAmountInput);
    if (!isNaN(amount) && amount > 0) {
      recordPayment(purchaseOrder.id, amount);
      setPaymentDialogOpen(false);
      setPaymentAmountInput("");
    }
  };

  const handleCancelSubmit = () => {
    cancelPurchaseOrder(purchaseOrder.id, cancelReason);
    setCancelDialogOpen(false);
    setCancelReason("");
  };

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Link
                href="/purchases"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Back to Purchase Orders"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-xl font-semibold tracking-tight text-foreground font-mono">
                {purchaseOrder.poNumber}
              </h1>
              {getStatusBadge(purchaseOrder.status)}
              {getPaymentBadge(purchaseOrder.paymentStatus)}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              ORDER DATE: {purchaseOrder.purchaseDate} • SUPPLIER: {purchaseOrder.supplierName.toUpperCase()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 text-xs border-border gap-1.5"
            >
              <Printer className="size-3.5" /> Print Order Slip
            </Button>

            {purchaseOrder.status !== "FULLY_RECEIVED" &&
              purchaseOrder.status !== "CLOSED" &&
              purchaseOrder.status !== "CANCELLED" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setGrnDialogOpen(true)}
                  className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-medium"
                >
                  <PackageCheck className="size-3.5" /> Receive Goods (GRN)
                </Button>
              )}

            {purchaseOrder.dueAmount > 0 && purchaseOrder.status !== "CANCELLED" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPaymentAmountInput(String(purchaseOrder.dueAmount));
                  setPaymentDialogOpen(true);
                }}
                className="h-8 text-xs border-border gap-1.5"
              >
                <CreditCard className="size-3.5" /> Record Payment
              </Button>
            )}

            {purchaseOrder.status !== "CANCELLED" && purchaseOrder.status !== "CLOSED" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
                className="h-8 text-xs border-border text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Cancel PO
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left Column (2/3): Items & Receiving History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Supplier & Warehouse Metadata Card */}
            <Card className="border border-border rounded-xs bg-background p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <Building2 className="size-3" /> Supplier Partner
                  </span>
                  <p className="font-semibold text-foreground line-clamp-1">{purchaseOrder.supplierName}</p>
                  <p className="text-muted-foreground text-[10px]">Code: {purchaseOrder.supplierCode}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <Warehouse className="size-3" /> Destination Facility
                  </span>
                  <p className="font-semibold text-foreground line-clamp-1">{purchaseOrder.warehouseName}</p>
                  <p className="text-muted-foreground text-[10px]">Code: {purchaseOrder.warehouseCode}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <Calendar className="size-3" /> Expected Delivery
                  </span>
                  <p className="font-semibold text-foreground">{purchaseOrder.expectedDeliveryDate || "Unscheduled"}</p>
                  <p className="text-muted-foreground text-[10px]">Order: {purchaseOrder.purchaseDate}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <FileText className="size-3" /> Quotation Ref
                  </span>
                  <p className="font-semibold text-foreground">{purchaseOrder.referenceNumber || "—"}</p>
                  <p className="text-muted-foreground text-[10px]">Terms: {purchaseOrder.paymentMethod || "Standard"}</p>
                </div>
              </div>
            </Card>

            {/* Line Items Table Card */}
            <Card className="border border-border rounded-xs bg-background">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between border-b border-border/60">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                    <span>Ordered Variant Items</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    Fulfillment Progress: {totalReceived} / {totalOrdered} Units ({fulfillmentPercent}%)
                  </p>
                </div>
                <div className="w-28 bg-muted/40 h-2 rounded-none overflow-hidden border border-border">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${fulfillmentPercent}%` }}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-background">
                      <TableHead className="h-8 text-xs">Product & Variant</TableHead>
                      <TableHead className="h-8 text-xs w-[120px]">SKU</TableHead>
                      <TableHead className="h-8 text-xs w-[75px] text-center">Ordered</TableHead>
                      <TableHead className="h-8 text-xs w-[75px] text-center">Received</TableHead>
                      <TableHead className="h-8 text-xs w-[100px] text-right">Cost (৳)</TableHead>
                      <TableHead className="h-8 text-xs w-[110px] text-right">Total (৳)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map((item) => (
                      <TableRow key={item.id} className="border-b border-border/60 hover:bg-muted/20">
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">{item.productName}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{item.variantName}</p>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-foreground">
                          {item.sku}
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-center font-semibold text-foreground">
                          {item.orderedQty}
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-center">
                          <span
                            className={
                              (item.receivedQty || 0) >= item.orderedQty
                                ? "text-emerald-500 font-semibold"
                                : (item.receivedQty || 0) > 0
                                ? "text-amber-500 font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {item.receivedQty || 0}
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-right text-muted-foreground">
                          ৳{item.unitCost.toLocaleString()}
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-right font-semibold text-foreground">
                          ৳{item.lineTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Goods Receipt (GRN) Timeline */}
            <Card className="border border-border rounded-xs bg-background">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Truck className="size-4 text-muted-foreground" />
                  <span>Goods Receipt History (GRN)</span>
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono border-border">
                  {purchaseOrder.receipts?.length || 0} Deliveries Logged
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {!purchaseOrder.receipts || purchaseOrder.receipts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs font-mono space-y-1">
                    <Truck className="size-5 mx-auto text-muted-foreground/60 mb-1" />
                    <p>No shipments received yet.</p>
                    <p className="text-[11px]">Click &quot;Receive Goods (GRN)&quot; when physical shipments arrive.</p>
                  </div>
                ) : (
                  purchaseOrder.receipts.map((grn) => (
                    <div key={grn.id} className="border border-border p-3 rounded-xs space-y-2 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground">{grn.grnNumber}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground font-mono">{grn.receivedDate}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-border">
                          Facility: {grn.warehouseName}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground font-mono">
                        Inspected & tagged by: <strong className="text-foreground">{grn.receivedBy}</strong>
                      </p>

                      {grn.notes && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                          &quot;{grn.notes}&quot;
                        </p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {grn.items.map((gi) => (
                          <div key={gi.itemId} className="p-1.5 border border-border/80 rounded-xs bg-background text-[11px] font-mono">
                            <p className="text-muted-foreground truncate">{gi.sku}</p>
                            <p className="font-semibold text-emerald-500">+{gi.receivedQty} Units</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3): Financial & Invoicing Summary */}
          <div className="space-y-4">
            {/* Commercial Breakdown Card */}
            <Card className="border border-border rounded-xs bg-background">
              <CardHeader className="p-3.5 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <span>Commercial & Invoicing</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-3 font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span>৳{purchaseOrder.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>-৳{purchaseOrder.discount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax & VAT</span>
                    <span>+৳{purchaseOrder.tax.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Logistics & Freight</span>
                    <span>+৳{purchaseOrder.shippingCharges.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between font-semibold text-sm text-foreground">
                    <span>Grand Total</span>
                    <span>৳{purchaseOrder.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-500 font-medium">
                    <span>Amount Paid</span>
                    <span>৳{purchaseOrder.paidAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-amber-500 font-medium">
                    <span>Balance Due</span>
                    <span>৳{purchaseOrder.dueAmount.toLocaleString()}</span>
                  </div>
                </div>

                {purchaseOrder.dueAmount > 0 && purchaseOrder.status !== "CANCELLED" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentAmountInput(String(purchaseOrder.dueAmount));
                      setPaymentDialogOpen(true);
                    }}
                    className="w-full h-8 text-xs border-border gap-1.5 mt-2"
                  >
                    <CreditCard className="size-3.5" /> Settle Due Balance (৳{purchaseOrder.dueAmount.toLocaleString()})
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Notes & Memo Card */}
            <Card className="border border-border rounded-xs bg-background p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" /> Order Notes & Memo
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {purchaseOrder.notes || "No internal instructions or memo recorded for this purchase order."}
              </p>
              <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground space-y-0.5">
                <p>Created by: {purchaseOrder.createdBy}</p>
                <p>Last updated: {new Date(purchaseOrder.updatedAt).toLocaleString()}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Goods Receipt Modal */}
        <GoodsReceiptDialog
          purchaseOrder={purchaseOrder}
          open={grnDialogOpen}
          onOpenChange={setGrnDialogOpen}
        />

        {/* Record Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md rounded-xs p-4 bg-background">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold text-foreground">Record Supplier Payment</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record cash or wire remittance against PO {purchaseOrder.poNumber}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment Amount (৳) *
                </label>
                <Input
                  type="number"
                  step="any"
                  min="1"
                  max={purchaseOrder.dueAmount}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="Enter amount in BDT"
                />
                <p className="text-[11px] font-mono text-muted-foreground">
                  Maximum payable balance: ৳{purchaseOrder.dueAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentDialogOpen(false)}
                className="h-8 text-xs border-border"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRecordPaymentSubmit}
                className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium"
              >
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel PO Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-md rounded-xs p-4 bg-background">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="size-4" /> Cancel Purchase Order
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to cancel PO <strong>{purchaseOrder.poNumber}</strong>? This action cannot be reversed.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reason for Cancellation
                </label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Supplier out of stock / Price renegotiation"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancelDialogOpen(false)}
                className="h-8 text-xs border-border"
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCancelSubmit}
                className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}
