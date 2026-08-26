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
import { SizeStatus } from "@/lib/types/size";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface SizeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeItem: {
    id: string;
    name: string;
    code: string;
    group: string;
    currentStatus: SizeStatus;
  } | null;
  onConfirm: (id: string, newStatus: SizeStatus) => void;
}

export function SizeStatusDialog({
  open,
  onOpenChange,
  sizeItem,
  onConfirm,
}: SizeStatusDialogProps) {
  if (!sizeItem) return null;

  const nextStatus: SizeStatus =
    sizeItem.currentStatus === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  const handleConfirm = () => {
    onConfirm(sizeItem.id, nextStatus);
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
              {isDeactivating ? "Deactivate Size Option?" : "Activate Size Option?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are about to change the status of size{" "}
            <strong className="text-foreground font-medium">{sizeItem.name}</strong> (
            <span className="font-mono text-foreground">{sizeItem.code}</span> /{" "}
            <span className="text-foreground">{sizeItem.group}</span>) from{" "}
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono px-1 py-0 border-border inline-block"
            >
              {sizeItem.currentStatus}
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
              ? " Inactive sizes will be excluded from new product SKU matrices and inventory forms, but historical catalog references remain safe."
              : " Activated sizes will be immediately available across variant matrices and filter options."}
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
