"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useInventory } from "@/lib/stores/inventory-context";
import { useWarehouses } from "@/lib/stores/warehouse-context";
import { formatBDT } from "@/lib/utils";
import { LocationBadge } from "@/components/inventory/location-badge";
import { StockStatusPill } from "@/components/inventory/stock-status-pill";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  ArrowLeft,
  Search,
  Grid,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

export default function WarehouseInventoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { warehouses } = useWarehouses();
  const { balances, batches, serials } = useInventory();
  const [searchQuery, setSearchQuery] = React.useState("");

  const warehouse = warehouses.find((w) => w.id === params.id || w.code.toLowerCase() === params.id.toLowerCase());

  // Filter balances for this warehouse
  const warehouseBalances = React.useMemo(() => {
    return balances.filter((b) => {
      const isThisWarehouse =
        b.warehouseId === params.id ||
        (warehouse && b.warehouseName === warehouse.name) ||
        b.locationCode.includes(warehouse?.code || "");

      const matchesSearch =
        searchQuery === "" ||
        b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.locationName.toLowerCase().includes(searchQuery.toLowerCase());

      return isThisWarehouse && matchesSearch;
    });
  }, [balances, params.id, warehouse, searchQuery]);

  const totalOnHand = warehouseBalances.reduce((acc, curr) => acc + curr.onHand, 0);
  const totalValuation = warehouseBalances.reduce((acc, curr) => acc + curr.onHand * curr.unitCost, 0);

  return (
    <AdminShell>
      <div className="space-y-4 pb-16 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => router.push("/warehouses")}
              className="h-7 w-7 p-0 border-border"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-foreground" />
              <span>{warehouse?.name || "Warehouse"} — Storage Inventory</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              {warehouse?.code || "WH"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            PHYSICAL SHELF & BIN INVENTORY BALANCES WITH BATCH & SERIAL DRILLDOWN
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/inventory")}
            className="h-8 text-xs border-border"
          >
            Global Stock Matrix
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Warehouse Valuation
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            ৳{totalValuation.toLocaleString("en-BD", { minimumFractionDigits: 0 })}
          </p>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            On Hand Units
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {totalOnHand.toLocaleString()}
          </p>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Active Storage Shelves
          </p>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {new Set(warehouseBalances.map((b) => b.locationId)).size} Shelves
          </p>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search SKU, product, shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background rounded-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20">
                <TableHead className="h-8 text-xs font-semibold">Product & Variant</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[140px]">SKU</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[220px]">Shelf / Bin Location</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Cost Price</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[160px]">Stock Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Valuation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouseBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No inventory records found in this warehouse.
                  </TableCell>
                </TableRow>
              ) : (
                warehouseBalances.map((bal) => {
                  const lineVal = bal.onHand * bal.unitCost;

                  return (
                    <TableRow key={bal.id} className="border-b border-border/60 hover:bg-muted/10">
                      <TableCell className="py-2.5">
                        <p className="text-xs font-semibold text-foreground">{bal.productName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{bal.variantName}</p>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-foreground">
                        {bal.sku}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <LocationBadge type={bal.locationType} code={bal.locationCode} name={bal.locationName} />
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground text-right">
                        ৳{bal.unitCost.toLocaleString("en-BD")}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <StockStatusPill
                          onHand={bal.onHand}
                          available={bal.available}
                          reserved={bal.reserved}
                          inTransit={bal.inTransit}
                          damaged={bal.damaged}
                          quarantined={bal.quarantined}
                          showBreakdown={true}
                        />
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs font-semibold text-foreground text-right">
                        ৳{lineVal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </AdminShell>
  );
}
