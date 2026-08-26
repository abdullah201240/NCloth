import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { LocationType } from "@/lib/types/inventory";
import {
  Building2,
  Store,
  Grid,
  Truck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Box,
  Layers,
} from "lucide-react";

interface LocationBadgeProps {
  type: LocationType;
  code?: string;
  name?: string;
  className?: string;
}

export function LocationBadge({ type, code, name, className = "" }: LocationBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case "WAREHOUSE":
        return <Building2 className="size-3 text-muted-foreground" />;
      case "STORE":
      case "STORE_FLOOR":
      case "STORE_BACKROOM":
        return <Store className="size-3 text-muted-foreground" />;
      case "SHELF":
      case "BIN":
      case "STAGING":
        return <Grid className="size-3 text-muted-foreground" />;
      case "IN_TRANSIT":
        return <Truck className="size-3 text-amber-400" />;
      case "QC":
      case "QUARANTINE":
        return <ShieldAlert className="size-3 text-purple-400" />;
      case "DAMAGE":
        return <AlertTriangle className="size-3 text-destructive" />;
      case "RETURN":
        return <RotateCcw className="size-3 text-cyan-400" />;
      case "RECEIVING":
        return <Box className="size-3 text-emerald-400" />;
      default:
        return <Layers className="size-3 text-muted-foreground" />;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs font-mono px-2 py-0.5 rounded-xs border-border bg-muted/20 gap-1.5 ${className}`}
    >
      {getIcon()}
      <span className="font-semibold text-foreground">{code || name}</span>
      {name && code && name !== code && (
        <span className="text-muted-foreground font-normal">({name})</span>
      )}
    </Badge>
  );
}
