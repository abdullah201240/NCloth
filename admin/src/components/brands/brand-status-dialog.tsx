"use client";

import * as React from "react";
import { Brand } from "@/lib/types/brand";
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
import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface BrandStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onConfirm: () => void;
}

export function BrandStatusDialog({
  open,
  onOpenChange,
  brand,
  onConfirm,
}: BrandStatusDialogProps) {
  if (!brand) return null;

  const isDeactivating = brand.status === "active";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xs border-border bg-background">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            {isDeactivating ? (
              <div className="size-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <ShieldAlert className="size-4" />
              </div>
            ) : (
              <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-4" />
              </div>
            )}
            <AlertDialogTitle className="text-base font-semibold">
              {isDeactivating ? "Deactivate Brand House?" : "Reactivate Brand House?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isDeactivating ? (
              <>
                You are setting <strong className="text-foreground">{brand.name}</strong> to{" "}
                <span className="font-mono text-zinc-400">INACTIVE</span>. Products currently linked to this brand will remain preserved, but this brand will be hidden from new product creation and public storefront filters.
              </>
            ) : (
              <>
                You are reactivating <strong className="text-foreground">{brand.name}</strong>. It will immediately be available for catalog assignment and visible on public brand directories.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel className="h-8 text-xs border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`h-8 text-xs font-medium px-4 ${
              isDeactivating
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isDeactivating ? "Confirm Deactivation" : "Confirm Activation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
