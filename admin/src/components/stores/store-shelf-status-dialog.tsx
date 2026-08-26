"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { StoreShelfStatus } from "@/lib/types/store-shelf";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StoreShelfStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shelf: {
    id: string;
    name: string;
    code: string;
    storeName: string;
    currentStatus: StoreShelfStatus;
  } | null;
  onConfirm: () => void;
}

export function StoreShelfStatusDialog({
  open,
  onOpenChange,
  shelf,
  onConfirm,
}: StoreShelfStatusDialogProps) {
  if (!shelf) return null;

  const isDeactivating = shelf.currentStatus === "active";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-background border border-border">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            {isDeactivating ? (
              <div className="size-8 rounded-xs bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <AlertTriangle className="size-4" />
              </div>
            ) : (
              <div className="size-8 rounded-xs bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-4" />
              </div>
            )}
            <AlertDialogTitle className="text-base font-semibold">
              {isDeactivating ? "Deactivate Boutique Shelf" : "Activate Boutique Shelf"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isDeactivating ? (
              <>
                Are you sure you want to mark{" "}
                <strong className="text-foreground">{shelf.name}</strong> (
                <span className="font-mono text-foreground">{shelf.code}</span>) at{" "}
                <strong className="text-foreground">{shelf.storeName}</strong> as{" "}
                <Badge variant="outline" className="text-xs font-mono uppercase px-1 py-0 border-zinc-500/40 text-zinc-500">
                  Inactive
                </Badge>
                ? The unit will be taken offline while retaining full allocation history.
              </>
            ) : (
              <>
                Reactivating{" "}
                <strong className="text-foreground">{shelf.name}</strong> (
                <span className="font-mono text-foreground">{shelf.code}</span>) will restore it to{" "}
                <Badge variant="outline" className="text-xs font-mono uppercase px-1 py-0 border-emerald-500/40 text-emerald-500">
                  Active
                </Badge>{" "}
                status for retail stock allocation and merchandising.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2 flex items-center justify-end gap-2">
          <AlertDialogCancel className="h-8 text-xs px-3">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`h-8 text-xs px-3 font-medium ${
              isDeactivating
                ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
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
