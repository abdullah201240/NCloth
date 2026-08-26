"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ReceivingSession } from "@/lib/types/receiving";
import { useReceiving } from "@/lib/stores/receiving-context";
import { BarcodeScannerStation } from "@/components/scanner/barcode-scanner-station";
import { LocationBadge } from "@/components/inventory/location-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Box,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Package,
  Check,
  Building2,
  Store,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ReceivingSessionViewProps {
  session: ReceivingSession;
}

export function ReceivingSessionView({ session }: ReceivingSessionViewProps) {
  const router = useRouter();
  const { recordItemScan, completeReceivingSession } = useReceiving();

  const handleScan = (scanResult: any) => {
    if (scanResult.type === "PRODUCT_VARIANT" || scanResult.type === "SERIAL" || scanResult.type === "PRODUCT") {
      const code = scanResult.matchedItem?.sku || scanResult.matchedItem?.barcode || scanResult.rawValue;
      const matched = session.items.find(
        (i) =>
          i.sku.toLowerCase() === code.toLowerCase() ||
          (i.barcode && i.barcode.toLowerCase() === code.toLowerCase())
      );

      if (matched) {
        recordItemScan(session.id, matched.variantId, 1, false);
      } else {
        toast.error("Unrecognized PO Item", {
          description: `Scanned code [${code}] does not match any line item in ${session.poNumber}.`,
        });
      }
    }
  };

  const handleQuickAdd = (variantId: string, qty: number = 1) => {
    recordItemScan(session.id, variantId, qty, false);
  };

  const handleLogDamaged = (variantId: string) => {
    recordItemScan(session.id, variantId, 1, true);
  };

  const handleComplete = () => {
    const success = completeReceivingSession(session.id, "Inbound Receiving Supervisor");
    if (success) {
      router.push("/receiving");
    }
  };

  const isComplete = session.status === "COMPLETED";
  const progressPercent = Math.min(
    100,
    session.totalOrderedQty > 0 ? Math.round((session.totalScannedQty / session.totalOrderedQty) * 100) : 100
  );

  return (
    <div className="space-y-4 pb-20 w-full min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => router.push("/receiving")}
              className="h-7 w-7 p-0 border-border"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Box className="size-5 text-emerald-500" />
              <span>Receiving Terminal — {session.sessionNumber}</span>
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-mono px-2 py-0.5 ${
                isComplete
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-amber-500/40 text-amber-400 bg-amber-500/10"
              }`}
            >
              {session.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            PO: <strong className="text-foreground">{session.poNumber}</strong> • SUPPLIER: {session.supplierName} • DESTINATION: {session.destinationName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isComplete && (
            <Button
              type="button"
              size="sm"
              onClick={handleComplete}
              className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
            >
              <ShieldCheck className="size-3.5 text-emerald-500" /> Complete Receiving Session
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Destination Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Receiving Destination
          </p>
          <div className="flex items-center gap-2 mt-1">
            {session.destinationType === "WAREHOUSE" ? (
              <Building2 className="size-4 text-muted-foreground" />
            ) : (
              <Store className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold text-foreground">
              {session.destinationName}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {session.destinationType === "WAREHOUSE"
              ? "Stock enters WH Receiving Dock -> Putaway"
              : "Stock directly becomes Available in Store"}
          </p>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Inbound Progress
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-bold font-mono text-foreground">
              {session.totalScannedQty} / {session.totalOrderedQty} Units
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Quality Inspection Summary
          </p>
          <div className="flex items-center gap-3 mt-1 font-mono text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> {session.totalAcceptedQty} Accepted
            </span>
            {session.totalDamagedQty > 0 && (
              <span className="text-destructive font-semibold flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> {session.totalDamagedQty} Damaged
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
            Started by {session.startedBy}
          </p>
        </Card>
      </div>

      {/* Barcode Scanner Station */}
      {!isComplete && (
        <Card className="border border-border rounded-xs bg-background p-3.5">
          <BarcodeScannerStation
            onScan={handleScan}
            placeholder="Scan product barcode, SKU or carton label to receive..."
            helperText="Point barcode gun or type SKU and hit Enter"
          />
        </Card>
      )}

      {/* Line Items Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Package className="size-4 text-muted-foreground" />
              <span>Purchase Order Inbound Manifest</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Expected vs Scanned vs Accepted Quantities
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20">
                <TableHead className="h-8 text-xs font-semibold">Product & Variant</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[150px]">SKU / Barcode</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Ordered</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Scanned</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Accepted</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[90px] text-right">Damaged</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-center">QC Status</TableHead>
                {!isComplete && (
                  <TableHead className="h-8 text-xs font-semibold w-[140px] text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.items.map((item) => {
                const isFulfilled = item.scannedQty >= item.orderedQty;

                return (
                  <TableRow key={item.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {item.variantName}
                      </p>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs">
                      <div>{item.sku}</div>
                      {item.barcode && (
                        <div className="text-[10px] text-muted-foreground">BC: {item.barcode}</div>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-muted-foreground text-right">
                      {item.orderedQty}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      <span className={isFulfilled ? "text-emerald-400" : "text-foreground"}>
                        {item.scannedQty}
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-emerald-400 font-semibold text-right">
                      {item.acceptedQty}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-destructive font-semibold text-right">
                      {item.damagedQty}
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-1.5 py-0 rounded-xs ${
                          item.qcStatus === "PASSED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : item.qcStatus === "FAILED"
                            ? "border-destructive/40 text-destructive bg-destructive/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {item.qcStatus}
                      </Badge>
                    </TableCell>

                    {!isComplete && (
                      <TableCell className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleQuickAdd(item.variantId, 1)}
                            className="h-6 text-[11px] px-2 border-border"
                          >
                            +1
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleQuickAdd(item.variantId, 10)}
                            className="h-6 text-[11px] px-2 border-border font-mono"
                          >
                            +10
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleLogDamaged(item.variantId)}
                            className="h-6 text-[10px] px-1 text-destructive hover:bg-destructive/10"
                          >
                            Dmg
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
