import * as React from "react";
import { Badge } from "@/components/ui/badge";

interface StockStatusPillProps {
  onHand: number;
  available: number;
  reserved?: number;
  inTransit?: number;
  damaged?: number;
  quarantined?: number;
  showBreakdown?: boolean;
  className?: string;
}

export function StockStatusPill({
  onHand,
  available,
  reserved = 0,
  inTransit = 0,
  damaged = 0,
  quarantined = 0,
  showBreakdown = false,
  className = "",
}: StockStatusPillProps) {
  const isOutOfStock = available === 0 && onHand === 0 && inTransit === 0;

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <Badge
          variant="outline"
          className={`px-2 py-0.5 rounded-xs font-semibold ${
            isOutOfStock
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : available > 0
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          {available} Avail
        </Badge>

        <span className="text-muted-foreground text-[11px]">
          ({onHand} On Hand)
        </span>
      </div>

      {showBreakdown && (reserved > 0 || inTransit > 0 || damaged > 0 || quarantined > 0) && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground flex-wrap">
          {reserved > 0 && <span className="text-amber-400">{reserved} res</span>}
          {inTransit > 0 && <span className="text-cyan-400">{inTransit} in-transit</span>}
          {quarantined > 0 && <span className="text-purple-400">{quarantined} qc</span>}
          {damaged > 0 && <span className="text-destructive font-medium">{damaged} dmg</span>}
        </div>
      )}
    </div>
  );
}
