"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInventory } from "@/lib/stores/inventory-context";
import { useStores } from "@/lib/stores/store-context";
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
  Store,
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
  Package,
} from "lucide-react";

export default function StoreInventoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { stores } = useStores();
  const { balances } = useInventory();
  const [searchQuery, setSearchQuery] = React.useState("");

  const store = stores.find((s) => s.id === params.id || s.code.toLowerCase() === params.id.toLowerCase());

  const storeBalances = React.useMemo(() => {
    return balances.filter((b) => {
      const isThisStore =
        b.storeId === params.id ||
        (store && b.storeName === store.name) ||
        b.locationCode.includes(store?.code || "");

      const matchesSearch =
        searchQuery === "" ||
        b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sku.toLowerCase().includes(searchQuery.toLowerCase());

      return isThisStore && matchesSearch;
    });
  }, [balances, params.id, store, searchQuery]);

  const totalOnHand = storeBalances.reduce((acc, curr) => acc + curr.onHand, 0);
  const totalAvailable = storeBalances.reduce((acc, curr) => acc + curr.available, 0);
  const totalValuation = storeBalances.reduce((acc, curr) => acc + curr.onHand * curr.retailPrice, 0);

  return (
    <div className="space-y-4 pb-16 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => router.push("/stores")}
              className="h-7 w-7 p-0 border-border"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Store className="size-5 text-foreground" />
              <span>{store?.name || "Store"} — Boutique Stock Inventory</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              {store?.code || "STR"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            STORE FLOOR & BACKROOM STOCK WITH LOW INVENTORY REORDER TRIGGERS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => router.push("/stock-requests/new")}
            className="h-8 text-xs px-3 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" /> Request Stock Replenishment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Retail Retail Valuation
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            ৳{totalValuation.toLocaleString("en-BD", { minimumFractionDigits: 0 })}
          </p>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Available for Sale
          </p>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {totalAvailable.toLocaleString()} Units
          </p>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total On Hand
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {totalOnHand.toLocaleString()} Units
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search store inventory SKU or product..."
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
                <TableHead className="h-8 text-xs font-semibold w-[200px]">Store Area</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Retail MSRP</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[160px]">Stock Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No active stock records found for this store.
                  </TableCell>
                </TableRow>
              ) : (
                storeBalances.map((bal) => {
                  const isLow = bal.minStockLevel && bal.available <= bal.minStockLevel;

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
                        ৳{bal.retailPrice.toLocaleString("en-BD")}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="space-y-1">
                          <StockStatusPill
                            onHand={bal.onHand}
                            available={bal.available}
                            reserved={bal.reserved}
                            inTransit={bal.inTransit}
                            damaged={bal.damaged}
                          />
                          {isLow && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-medium">
                              <AlertTriangle className="size-2.5" /> Low Stock (Min: {bal.minStockLevel})
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => router.push("/stock-requests/new")}
                          className="h-7 text-xs border-border"
                        >
                          Reorder
                        </Button>
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
  );
}
