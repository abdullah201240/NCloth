"use client";

import * as React from "react";
import { StockTransfer } from "@/lib/types/transfer";
import { useTransfers } from "@/lib/stores/transfer-context";
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
import { Truck, CheckCircle2, ShieldCheck } from "lucide-react";

interface TransferDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: StockTransfer;
}

export function TransferDispatchDialog({
  open,
  onOpenChange,
  transfer,
}: TransferDispatchDialogProps) {
  const { dispatchTransfer } = useTransfers();
  const [driverName, setDriverName] = React.useState(transfer.driverName || "");
  const [vehicleNumber, setVehicleNumber] = React.useState(transfer.vehicleNumber || "");
  const [courierTrackingNo, setCourierTrackingNo] = React.useState(transfer.courierTrackingNo || "");
  const [notes, setNotes] = React.useState("");

  const handleConfirmDispatch = () => {
    const success = dispatchTransfer(
      transfer.id,
      {
        driverName: driverName.trim() || undefined,
        vehicleNumber: vehicleNumber.trim() || undefined,
        courierTrackingNo: courierTrackingNo.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      "Warehouse Lead Dispatcher"
    );

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
        <DialogHeader className="p-4 border-b border-border bg-background">
          <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Truck className="size-4 text-amber-400" />
            <span>Confirm Transfer Dispatch — {transfer.transferNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dispatching will immediately deduct available stock from {transfer.sourceLocationName} and place {transfer.totalRequestedQty} units into the IN_TRANSIT pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Manifest Summary */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transfer Manifest ({transfer.items.length} Line Items)
            </Label>
            <div className="border border-border rounded-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20">
                    <TableHead className="h-7 text-xs">Variant</TableHead>
                    <TableHead className="h-7 text-xs">SKU</TableHead>
                    <TableHead className="h-7 text-xs text-right">Dispatch Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.items.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/60">
                      <TableCell className="py-2 text-xs font-medium">
                        {item.productName} ({item.variantName})
                      </TableCell>
                      <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="py-2 font-mono text-xs font-semibold text-foreground text-right">
                        {item.approvedQty || item.requestedQty} units
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Courier & Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Driver Name
              </Label>
              <Input
                placeholder="e.g. Kalam Mia"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle Plate Number
              </Label>
              <Input
                placeholder="e.g. DHAKA-METRO-TA-11-8842"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Courier / Waybill Tracking Ref
            </Label>
            <Input
              placeholder="e.g. NC-FLEET-2026-8821"
              value={courierTrackingNo}
              onChange={(e) => setCourierTrackingNo(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dispatch Verification Memo
            </Label>
            <Input
              placeholder="e.g. Checked all garment bags and barcode seals before loading."
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
            onClick={handleConfirmDispatch}
            className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
          >
            <ShieldCheck className="size-3.5" /> Confirm Dispatch (Move to IN_TRANSIT)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
