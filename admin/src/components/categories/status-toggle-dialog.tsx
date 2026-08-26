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
      <DialogContent className="max-w-md p-5 bg-background">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`size-8 rounded-xs flex items-center justify-center border ${
                isDeactivating
                  ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                  : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
              }`}
            >
              {isDeactivating ? <Power className="size-4" /> : <CheckCircle2 className="size-4" />}
            </div>
            <DialogTitle className="text-base font-medium tracking-tight">
              {isDeactivating ? `Deactivate ${item.name}?` : `Activate ${item.name}?`}
            </DialogTitle>
          </div>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isDeactivating ? (
              <>
                Setting this <strong className="text-foreground">{item.level}</strong> to{" "}
                <span className="font-mono text-amber-600 font-medium">Inactive</span> will hide it and
                its child items from the public storefront and disable new product assignments.
                <br />
                <span className="text-[11px] block mt-1.5 text-muted-foreground font-mono">
                  * Note: In accordance with studio zero-delete policy, historical data and products remain preserved.
                </span>
              </>
            ) : (
              <>
                Setting this <strong className="text-foreground">{item.level}</strong> to{" "}
                <span className="font-mono text-emerald-600 font-medium">Active</span> will restore
                visibility across all storefront navigation menus and merchandising channels.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border p-3 rounded-xs my-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium text-foreground">{item.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] uppercase border-border">
              {item.currentStatus}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-mono ${
                isDeactivating
                  ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                  : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
              }`}
            >
              {nextStatus}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={isDeactivating ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {isDeactivating ? "Confirm Deactivation" : "Confirm Activation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
