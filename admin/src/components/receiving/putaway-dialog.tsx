"use client";

import * as React from "react";
import { PutawayTask } from "@/lib/types/receiving";
import { useReceiving } from "@/lib/stores/receiving-context";
import { useInventory } from "@/lib/stores/inventory-context";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid, ArrowRight, CheckCircle2, Layers } from "lucide-react";

interface PutawayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PutawayTask;
}

export function PutawayDialog({ open, onOpenChange, task }: PutawayDialogProps) {
  const { executePutaway } = useReceiving();
  const { locations } = useInventory();

  // Storage shelves in warehouse
  const shelves = locations.filter(
    (l) => l.type === "SHELF" || l.type === "BIN" || l.type === "STAGING"
  );

  const [itemsState, setItemsState] = React.useState(
    task.items.map((item) => ({
      itemId: item.id,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      destinationShelfId: item.suggestedShelfId || (shelves[0]?.id ?? "loc-wh-01-sh-a01"),
    }))
  );

  const [notes, setNotes] = React.useState("");

  const handleConfirm = () => {
    const success = executePutaway(
      {
        taskId: task.id,
        items: itemsState,
        notes: notes.trim() || undefined,
      },
      "Putaway Execution Lead"
    );

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
        <DialogHeader className="p-4 border-b border-border bg-background">
          <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Grid className="size-4 text-emerald-500" />
            <span>Execute Warehouse Putaway — {task.taskNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Move {task.totalUnits} accepted units from the Inbound Receiving Dock into permanent shelf storage locations.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="border border-border rounded-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-8 text-xs font-semibold">Variant & SKU</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[80px] text-right">Units</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">Assign Storage Shelf / Bin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsState.map((item, idx) => (
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

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      {item.quantity}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <Select
                        value={item.destinationShelfId}
                        onValueChange={(val) => {
                          if (val) {
                            setItemsState((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, destinationShelfId: val } : it))
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs bg-background">
                          <SelectValue placeholder="Select Shelf" />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          {shelves.map((shelf) => (
                            <SelectItem key={shelf.id} value={shelf.id} className="text-xs">
                              [{shelf.code}] {shelf.name} {shelf.zone ? `• ${shelf.zone}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Putaway Operational Notes
            </Label>
            <Input
              placeholder="e.g. Shelved with barcode tags facing aisle outward."
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
            onClick={handleConfirm}
            className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
          >
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Confirm Putaway to Shelves
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
