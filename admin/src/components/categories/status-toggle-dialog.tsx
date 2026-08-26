"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HierarchyLevel, EntityStatus } from "@/lib/types/category";
import { Power, CheckCircle2 } from "lucide-react";

interface StatusToggleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  } | null;
  onConfirm: (id: string, newStatus: EntityStatus, level: HierarchyLevel) => void;
}

export function StatusToggleDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: StatusToggleDialogProps) {
  if (!item) return null;

  const nextStatus: EntityStatus = item.currentStatus === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  const handleConfirm = () => {
    onConfirm(item.id, nextStatus, item.level);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 bg-background border border-border">
        <DialogHeader className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-8 rounded-xs flex items-center justify-center border ${
                isDeactivating
                  ? "border-destructive/40 text-destructive bg-destructive/10"
                  : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              }`}
            >
              {isDeactivating ? <Power className="size-4 text-destructive" /> : <CheckCircle2 className="size-4" />}
            </div>
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
              {isDeactivating ? `Deactivate ${item.name}?` : `Activate ${item.name}?`}
            </DialogTitle>
          </div>

          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isDeactivating ? (
              <>
                Setting this <strong className="text-foreground font-semibold">{item.level}</strong> to{" "}
                <span className="font-mono text-destructive font-medium">Inactive</span> will hide it and
                its child items from the public storefront and disable new product assignments.
                <br />
                <span className="text-xs block mt-2 text-muted-foreground font-mono">
                  * Note: In accordance with studio zero-delete policy, historical data and products remain preserved.
                </span>
              </>
            ) : (
              <>
                Setting this <strong className="text-foreground font-semibold">{item.level}</strong> to{" "}
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Active</span> will restore
                visibility across all storefront navigation menus and merchandising channels.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border p-3 rounded-xs my-2 flex items-center justify-between text-xs font-mono bg-background">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium text-foreground text-sm">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase border-border px-1.5 py-0.5 text-foreground">
              {item.currentStatus}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge
              variant="outline"
              className={`text-xs uppercase font-mono px-2 py-0.5 font-medium ${
                isDeactivating
                  ? "border-destructive/40 text-destructive bg-destructive/10"
                  : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              }`}
            >
              {nextStatus}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2.5 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-sm px-3 border-border">
            Cancel
          </Button>
          <Button
            size="sm"
            variant={isDeactivating ? "destructive" : "default"}
            onClick={handleConfirm}
            className="h-8 text-sm px-3 font-medium"
          >
            {isDeactivating ? "Confirm Deactivation" : "Confirm Activation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
