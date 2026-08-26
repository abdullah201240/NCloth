"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EntityStatus } from "@/lib/types/attribute";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface UnitStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: {
    id: string;
    name: string;
    symbol: string;
    currentStatus: EntityStatus;
  } | null;
  onConfirm: (id: string, newStatus: EntityStatus) => void;
}

export function UnitStatusDialog({
  open,
  onOpenChange,
  unit,
  onConfirm,
}: UnitStatusDialogProps) {
  if (!unit) return null;

  const nextStatus: EntityStatus =
    unit.currentStatus === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  const handleConfirm = () => {
    onConfirm(unit.id, nextStatus);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xs border border-border bg-background p-5">
        <AlertDialogHeader className="space-y-2.5">
          <div className="flex items-center gap-2">
            {isDeactivating ? (
              <div className="size-8 rounded-xs border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center">
                <ShieldAlert className="size-4" />
              </div>
            ) : (
              <div className="size-8 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="size-4" />
              </div>
            )}
            <AlertDialogTitle className="text-base font-semibold text-foreground">
              {isDeactivating ? "Deactivate Measurement Unit?" : "Activate Measurement Unit?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are about to change the status of unit{" "}
            <strong className="text-foreground font-medium">{unit.name}</strong> (
            <span className="font-mono text-foreground font-semibold">{unit.symbol}</span>) from{" "}
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono px-1 py-0 border-border inline-block"
            >
              {unit.currentStatus}
            </Badge>{" "}
            to{" "}
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-mono px-1 py-0 inline-block ${
                nextStatus === "active"
                  ? "border-emerald-500/40 text-emerald-500"
                  : "border-zinc-500/40 text-zinc-500"
              }`}
            >
              {nextStatus}
            </Badge>
            .
            {isDeactivating
              ? " Inactive units will be hidden from new NUMBER_WITH_UNIT attribute creation. Existing product assignments remain safely archived."
              : " Activated units are immediately available for measurement attribute configuration."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <AlertDialogCancel className="h-8 text-xs px-3 border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`h-8 text-xs px-3 font-medium ${
              isDeactivating
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isDeactivating ? "Confirm Deactivation" : "Confirm Activation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
