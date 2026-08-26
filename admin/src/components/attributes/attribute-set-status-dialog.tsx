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

interface AttributeSetStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: {
    id: string;
    name: string;
    code: string;
    attributesCount: number;
    currentStatus: EntityStatus;
  } | null;
  onConfirm: (id: string, newStatus: EntityStatus) => void;
}

export function AttributeSetStatusDialog({
  open,
  onOpenChange,
  set,
  onConfirm,
}: AttributeSetStatusDialogProps) {
  if (!set) return null;

  const nextStatus: EntityStatus =
    set.currentStatus === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  const handleConfirm = () => {
    onConfirm(set.id, nextStatus);
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
              {isDeactivating ? "Deactivate Attribute Set?" : "Activate Attribute Set?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are about to change the status of Attribute Set{" "}
            <strong className="text-foreground font-medium">{set.name}</strong> (
            <span className="font-mono text-foreground">{set.code}</span> /{" "}
            <span className="text-foreground font-semibold">{set.attributesCount} attributes</span>) from{" "}
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono px-1 py-0 border-border inline-block"
            >
              {set.currentStatus}
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
            <span className="block mt-1">
              {isDeactivating
                ? " Deactivating this bundle removes it from new catalog template selection, while existing product specifications remain safely intact."
                : " Activated sets are immediately available for product category templates and bulk specification onboarding."}
            </span>
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
