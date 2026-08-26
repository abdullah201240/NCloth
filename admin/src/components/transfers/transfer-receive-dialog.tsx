"use client";

import * as React from "react";
import { StockTransfer } from "@/lib/types/transfer";
import { useTransfers } from "@/lib/stores/transfer-context";
import { BarcodeScannerStation } from "@/components/scanner/barcode-scanner-station";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, PackageCheck, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TransferReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: StockTransfer;
}

export function TransferReceiveDialog({
  open,
  onOpenChange,
  transfer,
}: TransferReceiveDialogProps) {
  const { receiveTransfer } = useTransfers();

  // Local state tracking received & damaged quantities
  const [itemsState, setItemsState] = React.useState<
    Array<{
      itemId: string;
      variantId: string;
      productName: string;
      variantName: string;
      sku: string;
      barcode?: string;
      dispatchedQty: number;
      receivedQty: number;
      damagedQty: number;
      reason: string;
    }>
  >(() => {
    return transfer.items.map((item) => ({
      itemId: item.id,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      barcode: item.barcode,
      dispatchedQty: item.dispatchedQty || item.approvedQty || item.requestedQty,
      receivedQty: item.dispatchedQty || item.approvedQty || item.requestedQty, // Default to full match for quick 1-click receiving
      damagedQty: 0,
      reason: "",
    }));
  });

  const [notes, setNotes] = React.useState("");

  const handleScan = (scanResult: any) => {
    if (scanResult.type === "PRODUCT_VARIANT" || scanResult.type === "SERIAL") {
      const code = scanResult.matchedItem?.sku || scanResult.matchedItem?.barcode || scanResult.rawValue;
      let matched = false;

      setItemsState((prev) =>
        prev.map((item) => {
          if (item.sku.toLowerCase() === code.toLowerCase() || (item.barcode && item.barcode === code)) {
            matched = true;
            return {
              ...item,
              receivedQty: Math.min(item.dispatchedQty, item.receivedQty + 1),
            };
          }
          return item;
        })
      );

      if (matched) {
        toast.success("Item Verified via Scan (+1)", {
          description: `Logged scan for transfer ${transfer.transferNumber}.`,
        });
      }
    }
  };

  const handleConfirmReceive = () => {
    const success = receiveTransfer(
      transfer.id,
      {
        receivedItems: itemsState.map((i) => ({
          itemId: i.itemId,
          variantId: i.variantId,
          dispatchedQty: i.dispatchedQty,
          receivedQty: i.receivedQty,
          damagedQty: i.damagedQty,
          reason: i.reason || undefined,
        })),
        notes: notes.trim() || undefined,
      },
      "Store Inbound Receiver"
    );

    if (success) {
      onOpenChange(false);
    }
  };

  const totalDispatched = itemsState.reduce((acc, curr) => acc + curr.dispatchedQty, 0);
  const totalReceived = itemsState.reduce((acc, curr) => acc + curr.receivedQty, 0);
  const totalDamaged = itemsState.reduce((acc, curr) => acc + curr.damagedQty, 0);
  const hasDiscrepancy = totalReceived !== totalDispatched || totalDamaged > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
        <DialogHeader className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <PackageCheck className="size-4 text-emerald-500" />
                <span>Receive Incoming Transfer — {transfer.transferNumber}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Receiving stock into destination: <strong className="text-foreground">{transfer.destinationLocationName}</strong>. Stock moves from IN_TRANSIT into AVAILABLE.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono border-border">
              {totalDispatched} Units Dispatched
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Integrated Barcode Scan Station */}
          <div className="p-3 border border-border rounded-xs bg-muted/10">
            <BarcodeScannerStation
              onScan={handleScan}
              placeholder="Scan incoming box barcode or SKU to verify receipt..."
              helperText="Scan products to confirm received counts"
            />
          </div>

          {/* Line Item Receipt Verification Table */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item Verification Manifest
            </Label>
            <div className="border border-border rounded-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20">
                    <TableHead className="h-8 text-xs font-semibold">Variant & SKU</TableHead>
                    <TableHead className="h-8 text-xs font-semibold w-[90px] text-right">Dispatched</TableHead>
                    <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Received</TableHead>
                    <TableHead className="h-8 text-xs font-semibold w-[90px] text-right">Damaged</TableHead>
                    <TableHead className="h-8 text-xs font-semibold w-[180px]">Discrepancy Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsState.map((item, idx) => {
                    const isShortage = item.receivedQty + item.damagedQty < item.dispatchedQty;

                    return (
                      <TableRow key={item.itemId} className="border-b border-border/60">
                        <TableCell className="py-2.5">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                            <span>{item.variantName}</span>
                            <span>•</span>
                            <span className="text-foreground">{item.sku}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs font-semibold text-muted-foreground text-right">
                          {item.dispatchedQty}
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <Input
                            type="number"
                            min="0"
                            max={item.dispatchedQty}
                            value={item.receivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setItemsState((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, receivedQty: val } : it))
                              );
                            }}
                            className="h-7 text-xs font-mono w-20 text-right ml-auto"
                          />
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <Input
                            type="number"
                            min="0"
                            value={item.damagedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setItemsState((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, damagedQty: val } : it))
                              );
                            }}
                            className="h-7 text-xs font-mono w-16 text-right ml-auto text-destructive"
                          />
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Input
                            placeholder={isShortage ? "Reason for shortage..." : "Notes..."}
                            value={item.reason}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItemsState((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, reason: val } : it))
                              );
                            }}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Discrepancy Alert if detected */}
          {hasDiscrepancy && (
            <div className="p-3 border border-amber-500/30 bg-amber-500/10 rounded-xs flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Discrepancy Detected</p>
                <p className="text-muted-foreground mt-0.5">
                  Dispatched: {totalDispatched} units • Sound Accepted: {totalReceived} units • Damaged: {totalDamaged} units.
                  This discrepancy will be recorded in the audit log for investigation.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receiving Acknowledgement Remarks
            </Label>
            <Input
              placeholder="e.g. Unloaded into Gulshan Stock Room. All items verified."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="p-3 px-4 border-t border-border bg-muted/10 flex items-center justify-between">
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
            type="button"
            size="sm"
            onClick={handleConfirmReceive}
            className="h-8 text-xs px-5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
          >
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Confirm Receipt (Move to AVAILABLE)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
