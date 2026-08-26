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
import { EntityStatus, AttributeType } from "@/lib/types/attribute";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface AttributeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: {
    id: string;
    name: string;
    code: string;
    type: AttributeType;
    currentStatus: EntityStatus;
  } | null;
  usedInSetsCount?: number;
  onConfirm: (id: string, newStatus: EntityStatus) => void;
}

export function AttributeStatusDialog({
  open,
  onOpenChange,
  attribute,
  usedInSetsCount = 0,
  onConfirm,
}: AttributeStatusDialogProps) {
  if (!attribute) return null;

  const nextStatus: EntityStatus =
    attribute.currentStatus === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  const handleConfirm = () => {
    onConfirm(attribute.id, nextStatus);
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
              {isDeactivating ? "Deactivate Attribute?" : "Activate Attribute?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are about to change the status of attribute{" "}
            <strong className="text-foreground font-medium">{attribute.name}</strong> (
            <span className="font-mono text-foreground">{attribute.code}</span> /{" "}
            <span className="font-mono text-foreground font-semibold">{attribute.type}</span>) from{" "}
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono px-1 py-0 border-border inline-block"
            >
              {attribute.currentStatus}
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
            {isDeactivating && usedInSetsCount > 0 && (
              <span className="block mt-1.5 text-amber-500 font-medium">
                Note: This attribute is currently configured in {usedInSetsCount} active Attribute Set(s).
              </span>
            )}
            <span className="block mt-1">
              {isDeactivating
                ? " Deactivating this attribute hides it from new product assignment, but historical product specs and catalog relations remain preserved."
                : " Activating this attribute immediately makes it available across all assigned Attribute Sets and product forms."}
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
