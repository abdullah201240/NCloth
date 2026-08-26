"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useTransfers } from "@/lib/stores/transfer-context";
import { LocationBadge } from "@/components/inventory/location-badge";
import { TransferDispatchDialog } from "@/components/transfers/transfer-dispatch-dialog";
import { TransferReceiveDialog } from "@/components/transfers/transfer-receive-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  Building2,
  Store,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

export default function StockTransferDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getTransferById, approveTransfer } = useTransfers();

  const [dispatchOpen, setDispatchOpen] = React.useState(false);
  const [receiveOpen, setReceiveOpen] = React.useState(false);

  const transfer = getTransferById(params.id);

  if (!transfer) {
    return (
      <div className="text-center py-20 space-y-3">
        <Truck className="size-12 mx-auto text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-foreground">Stock Transfer Not Found</h2>
        <p className="text-xs text-muted-foreground font-mono">
          The requested transfer ID [{params.id}] does not exist in the database.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/transfers")}
          className="h-8 text-xs border-border"
        >
          Return to Transfers Pipeline
        </Button>
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-4 pb-16 w-full min-w-0">
      {/* 1. Header Banner */}
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
              <Truck className="size-5 text-foreground" />
              <span>Transfer Document — {transfer.transferNumber}</span>
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-mono px-2 py-0.5 ${
                transfer.status === "COMPLETED"
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : transfer.status === "IN_TRANSIT"
                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                  : "border-purple-500/40 text-purple-400 bg-purple-500/10"
              }`}
            >
              {transfer.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            REQUESTED ON {new Date(transfer.requestedDate).toLocaleString()} BY {transfer.requestedBy}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transfer.status === "APPROVED" && (
            <Button
              type="button"
              size="sm"
              onClick={() => setDispatchOpen(true)}
              className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
            >
              <ShieldCheck className="size-3.5 text-amber-400" /> Dispatch Transfer (To IN_TRANSIT)
            </Button>
          )}

          {transfer.status === "IN_TRANSIT" && (
            <Button
              type="button"
              size="sm"
              onClick={() => setReceiveOpen(true)}
              className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
            >
              <PackageCheck className="size-3.5 text-emerald-400" /> Receive Transfer at Destination
            </Button>
          )}
        </div>
      </div>

      {/* 2. Transit Vector & Facility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Source Facility */}
        <Card className="border border-border rounded-xs bg-background p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Origin Facility (Source)
          </p>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{transfer.sourceLocationName}</h3>
          </div>
          <LocationBadge type={transfer.sourceType} code={transfer.sourceLocationCode} />
          {transfer.dispatchedDate && (
            <p className="text-xs text-muted-foreground font-mono pt-1 border-t border-border/40">
              Dispatched: {new Date(transfer.dispatchedDate).toLocaleString()} by {transfer.dispatchedBy}
            </p>
          )}
        </Card>

        {/* Vector Arrow & Status */}
        <div className="flex flex-col items-center justify-center p-3 text-center space-y-1 bg-background border border-border/80 rounded-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
            <span>{transfer.totalRequestedQty} Units</span>
            <ArrowRight className="size-4 text-amber-400 animate-pulse" />
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Valuation: ৳{transfer.totalValuationBDT.toLocaleString("en-BD")}
          </p>
          {transfer.driverName && (
            <div className="text-xs text-muted-foreground font-mono pt-1">
              🚚 {transfer.driverName} ({transfer.vehicleNumber || "Fleet"})
            </div>
          )}
        </div>

        {/* Destination Facility */}
        <Card className="border border-border rounded-xs bg-background p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Destination Facility (Target)
          </p>
          <div className="flex items-center gap-2">
            <Store className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{transfer.destinationLocationName}</h3>
          </div>
          <LocationBadge type={transfer.destinationType} code={transfer.destinationLocationCode} />
          {transfer.receivedDate ? (
            <p className="text-xs text-emerald-400 font-mono pt-1 border-t border-border/40">
              Received: {new Date(transfer.receivedDate).toLocaleString()} by {transfer.receivedBy}
            </p>
          ) : (
            <p className="text-xs text-amber-400 font-mono pt-1 border-t border-border/40">
              Status: Awaiting Delivery Arrival
            </p>
          )}
        </Card>
      </div>

      {/* 3. Items Manifest Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold text-foreground">
              Transfer Manifest & Quantity Tracking
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Individual SKU breakdown across all stages of transit
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20">
                <TableHead className="h-8 text-xs font-semibold">Variant</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[140px]">SKU</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Requested</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Dispatched</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Received</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[90px] text-right">Damaged</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Cost Price</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Total Valuation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items.map((item) => {
                const totalLineVal = (item.approvedQty || item.requestedQty) * item.unitCost;

                return (
                  <TableRow key={item.id} className="border-b border-border/60 hover:bg-background">
                    <TableCell className="py-2.5">
                      <p className="text-xs font-semibold text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.variantName}</p>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-foreground">
                      {item.sku}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-muted-foreground text-right">
                      {item.requestedQty}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-amber-400 text-right">
                      {item.dispatchedQty || 0}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-emerald-400 text-right">
                      {item.receivedQty || 0}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-destructive text-right">
                      {item.damagedQty || 0}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-muted-foreground text-right">
                      ৳{item.unitCost.toLocaleString("en-BD")}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-foreground text-right">
                      ৳{totalLineVal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Discrepancies if any */}
      {transfer.discrepancies && transfer.discrepancies.length > 0 && (
        <Card className="border border-amber-500/40 bg-background rounded-xs p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
            <AlertTriangle className="size-4 text-amber-400" />
            <span>Transit Discrepancies Recorded ({transfer.discrepancies.length})</span>
          </div>
          {transfer.discrepancies.map((disc) => (
            <div
              key={disc.id}
              className="text-xs text-muted-foreground border-t border-amber-500/20 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <strong className="text-foreground font-mono">[{disc.discrepancyType}]</strong> {disc.sku} • Difference: {disc.differenceQty} units.
                <p className="text-xs text-muted-foreground">{disc.reason}</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-amber-500/50 text-amber-300">
                {disc.resolutionStatus}
              </Badge>
            </div>
          ))}
        </Card>
      )}

      {/* Modals */}
      <TransferDispatchDialog
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        transfer={transfer}
      />

      <TransferReceiveDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        transfer={transfer}
      />
    </div>
    </AdminShell>
  );
}
