"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { usePurchases } from "@/lib/stores/purchase-context";
import { useSuppliers } from "@/lib/stores/supplier-context";
import { GoodsReceiptDialog } from "@/components/purchases/goods-receipt-dialog";
import { PurchaseOrder } from "@/lib/types/purchase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ShoppingCart,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  PackageCheck,
  Building2,
  Warehouse,
  DollarSign,
  AlertCircle,
  Eye,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PurchasesPage() {
  const router = useRouter();
  const { purchaseOrders, stats } = usePurchases();
  const { suppliers } = useSuppliers();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSupplier, setSelectedSupplier] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState("all");

  // Goods receipt modal state
  const [activeReceivingPo, setActiveReceivingPo] = React.useState<PurchaseOrder | null>(null);

  // Filtered POs
  const filteredOrders = React.useMemo(() => {
    return purchaseOrders.filter((po) => {
      // Supplier Filter
      if (selectedSupplier !== "all" && po.supplierId !== selectedSupplier) {
        return false;
      }
      // Status Filter
      if (selectedStatus !== "all" && po.status !== selectedStatus) {
        return false;
      }
      // Payment Status Filter
      if (selectedPaymentStatus !== "all" && po.paymentStatus !== selectedPaymentStatus) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPo = po.poNumber.toLowerCase().includes(q);
        const matchesSupplier = po.supplierName.toLowerCase().includes(q) || po.supplierCode.toLowerCase().includes(q);
        const matchesRef = po.referenceNumber?.toLowerCase().includes(q);
        const matchesItems = po.items.some(
          (i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
        );
        return matchesPo || matchesSupplier || matchesRef || matchesItems;
      }
      return true;
    });
  }, [purchaseOrders, searchQuery, selectedSupplier, selectedStatus, selectedPaymentStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDERED":
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[11px] font-mono">
            <Clock className="size-3 mr-1" /> ORDERED
          </Badge>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[11px] font-mono">
            <Truck className="size-3 mr-1" /> PARTIAL
          </Badge>
        );
      case "FULLY_RECEIVED":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[11px] font-mono">
            <CheckCircle2 className="size-3 mr-1" /> RECEIVED
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge variant="outline" className="border-zinc-500/30 text-zinc-400 bg-zinc-500/10 text-[11px] font-mono">
            CLOSED
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-[11px] font-mono">
            <Ban className="size-3 mr-1" /> CANCELLED
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] font-mono">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[11px] font-mono">
            PAID
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[11px] font-mono">
            PARTIAL
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-[11px] font-mono">
            UNPAID
          </Badge>
        );
    }
  };

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShoppingCart className="size-4 text-muted-foreground" />
                <span>Purchase Orders & Procurement</span>
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {purchaseOrders.length} Total Orders
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              DIRECT PURCHASES • VARIANT FULFILLMENT • GOODS RECEIPT (GRN) • BDT CURRENCY
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchases/new"
              className={cn(buttonVariants({ size: "sm" }), "text-xs h-8 px-3 gap-1.5 font-medium")}
            >
              <Plus className="size-3.5" /> Create Purchase Order
            </Link>
          </div>
        </div>

        {/* 4 Overview Minimalist KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active POs</span>
              <ShoppingCart className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.orderedCount + stats.partiallyReceivedCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                In Pipeline
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {stats.partiallyReceivedCount} partially received
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Fulfilled POs</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.fullyReceivedCount}
              </span>
              <span className="text-xs font-mono text-emerald-500">
                100% Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              All items stocked in warehouses
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Procurement Spend</span>
              <DollarSign className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                ৳{stats.totalProcurementValuation.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Total BDT
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Across all supplier commitments
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Accounts Payable Due</span>
              <CreditCard className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-amber-500">
                ৳{stats.totalDueAmount.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-amber-500 font-medium">
                Pending
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Unsettled supplier balances
            </p>
          </Card>
        </div>

        {/* Multi-Filter Toolbar */}
        <Card className="p-3 border border-border rounded-xs bg-background">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by PO#, Supplier, SKU, or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Supplier Filter */}
              <Select value={selectedSupplier} onValueChange={(val) => setSelectedSupplier(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="all" className="text-xs">All Suppliers</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="ORDERED" className="text-xs">Ordered</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED" className="text-xs">Partially Received</SelectItem>
                  <SelectItem value="FULLY_RECEIVED" className="text-xs">Fully Received</SelectItem>
                  <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
                  <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Status Filter */}
              <Select value={selectedPaymentStatus} onValueChange={(val) => setSelectedPaymentStatus(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Payments</SelectItem>
                  <SelectItem value="UNPAID" className="text-xs">Unpaid</SelectItem>
                  <SelectItem value="PARTIALLY_PAID" className="text-xs">Partially Paid</SelectItem>
                  <SelectItem value="PAID" className="text-xs">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Master Purchase Orders Table */}
        <Card className="border border-border rounded-xs bg-background overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-8.5 text-xs w-[140px]">PO Number</TableHead>
                  <TableHead className="h-8.5 text-xs min-w-[180px]">Supplier & Facility</TableHead>
                  <TableHead className="h-8.5 text-xs w-[120px]">Order Date</TableHead>
                  <TableHead className="h-8.5 text-xs w-[140px]">Fulfillment Status</TableHead>
                  <TableHead className="h-8.5 text-xs w-[120px] text-right">Grand Total (৳)</TableHead>
                  <TableHead className="h-8.5 text-xs w-[120px] text-right">Balance Due (৳)</TableHead>
                  <TableHead className="h-8.5 text-xs w-[110px] text-center">Payment</TableHead>
                  <TableHead className="h-8.5 text-xs w-[130px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-44 text-center">
                      <div className="space-y-1 text-muted-foreground">
                        <ShoppingCart className="size-6 mx-auto mb-1 text-muted-foreground/60" />
                        <p className="text-xs font-mono">No purchase orders found.</p>
                        <p className="text-[11px]">Create a new purchase order or adjust active filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((po) => {
                    const totalQty = po.items.reduce((acc, i) => acc + i.orderedQty, 0);
                    const receivedQty = po.items.reduce((acc, i) => acc + (i.receivedQty || 0), 0);

                    return (
                      <TableRow key={po.id} className="border-b border-border/60 hover:bg-muted/20">
                        {/* PO Number */}
                        <TableCell className="py-2.5">
                          <Link
                            href={`/purchases/${po.id}`}
                            className="font-mono text-xs font-semibold text-foreground hover:underline"
                          >
                            {po.poNumber}
                          </Link>
                          {po.referenceNumber && (
                            <p className="text-[10px] font-mono text-muted-foreground">Ref: {po.referenceNumber}</p>
                          )}
                        </TableCell>

                        {/* Supplier & Warehouse */}
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">{po.supplierName}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">→ {po.warehouseName}</p>
                          </div>
                        </TableCell>

                        {/* Order Date */}
                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {po.purchaseDate}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2.5">
                          <div className="space-y-1">
                            {getStatusBadge(po.status)}
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {receivedQty}/{totalQty} units
                            </p>
                          </div>
                        </TableCell>

                        {/* Grand Total */}
                        <TableCell className="py-2.5 font-mono text-xs text-right font-semibold text-foreground">
                          ৳{po.grandTotal.toLocaleString()}
                        </TableCell>

                        {/* Balance Due */}
                        <TableCell className="py-2.5 font-mono text-xs text-right">
                          <span className={po.dueAmount > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}>
                            ৳{po.dueAmount.toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell className="py-2.5 text-center">
                          {getPaymentBadge(po.paymentStatus)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {po.status !== "FULLY_RECEIVED" &&
                              po.status !== "CLOSED" &&
                              po.status !== "CANCELLED" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setActiveReceivingPo(po)}
                                  className="h-7 text-xs border-border gap-1"
                                  title="Receive Goods"
                                >
                                  <PackageCheck className="size-3" /> Receive
                                </Button>
                              )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => router.push(`/purchases/${po.id}`)}
                              className="h-7 w-7 p-0"
                              title="View PO Details"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Goods Receipt Modal */}
        <GoodsReceiptDialog
          purchaseOrder={activeReceivingPo}
          open={!!activeReceivingPo}
          onOpenChange={(open) => {
            if (!open) setActiveReceivingPo(null);
          }}
        />
      </div>
    </AdminShell>
  );
}
