"use client";

import * as React from "react";
import { useInventory } from "@/lib/stores/inventory-context";
import { LocationBadge } from "@/components/inventory/location-badge";
import { StockStatusPill } from "@/components/inventory/stock-status-pill";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Layers,
  Search,
  SlidersHorizontal,
  Package,
  Building2,
  Store,
  Truck,
  ShieldAlert,
  AlertTriangle,
  History,
  ArrowUpDown,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function GlobalInventoryPage() {
  const { balances, locations, transactions, stats, adjustStock } = useInventory();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLocationType, setSelectedLocationType] = React.useState<string>("ALL");
  const [activeTab, setActiveTab] = React.useState<"matrix" | "ledger">("matrix");

  // Stock Adjustment Modal
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [selectedBalanceId, setSelectedBalanceId] = React.useState<string>("");
  const [adjustType, setAdjustType] = React.useState<any>("INCREASE");
  const [adjustQty, setAdjustQty] = React.useState(1);
  const [adjustReason, setAdjustReason] = React.useState("");

  const filteredBalances = React.useMemo(() => {
    return balances.filter((b) => {
      const matchesSearch =
        searchQuery === "" ||
        b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.barcode && b.barcode.includes(searchQuery)) ||
        b.locationName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedLocationType === "ALL" ||
        (selectedLocationType === "WAREHOUSE" && (b.locationType === "WAREHOUSE" || b.locationType === "SHELF")) ||
        (selectedLocationType === "STORE" && (b.locationType === "STORE" || b.locationType === "STORE_FLOOR" || b.locationType === "STORE_BACKROOM")) ||
        (selectedLocationType === "IN_TRANSIT" && b.locationType === "IN_TRANSIT") ||
        (selectedLocationType === "DAMAGE" && b.locationType === "DAMAGE");

      return matchesSearch && matchesType;
    });
  }, [balances, searchQuery, selectedLocationType]);

  const handleOpenAdjust = (balanceId: string) => {
    setSelectedBalanceId(balanceId);
    setAdjustOpen(true);
  };

  const handleConfirmAdjust = () => {
    const bal = balances.find((b) => b.id === selectedBalanceId);
    if (!bal) return;

    if (!adjustReason.trim()) {
      toast.error("Reason Required", {
        description: "Please specify why this stock adjustment is being logged.",
      });
      return;
    }

    const success = adjustStock({
      locationId: bal.locationId,
      variantId: bal.variantId,
      adjustmentType: adjustType,
      quantity: Number(adjustQty) || 1,
      reason: adjustReason.trim(),
    });

    if (success) {
      setAdjustOpen(false);
      setAdjustReason("");
    }
  };

  const selectedBalance = balances.find((b) => b.id === selectedBalanceId);

  return (
    <div className="space-y-4 pb-16 w-full min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-5 text-foreground" />
              <span>Global Multi-Location Inventory Engine</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Unified Balance Ledger
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            AUTHORITATIVE WAREHOUSE, RETAIL STORE, IN-TRANSIT & DAMAGE STOCK MATRIX
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-xs p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={activeTab === "matrix" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setActiveTab("matrix")}
              className="h-7 text-xs font-medium rounded-xs gap-1"
            >
              <Package className="size-3.5" /> Stock Matrix
            </Button>
            <Button
              type="button"
              variant={activeTab === "ledger" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setActiveTab("ledger")}
              className="h-7 text-xs font-medium rounded-xs gap-1"
            >
              <History className="size-3.5" /> Audit Ledger ({transactions.length})
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards in BDT */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total Valuation
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            ৳{stats.totalValuationBDT.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">Cost basis BDT</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total On Hand
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {stats.totalOnHand.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">Physical across all sites</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Available Stock
          </p>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {stats.totalAvailable.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500/80 font-mono">Ready for sale / transfer</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            In-Transit Fleet
          </p>
          <p className="text-lg font-bold font-mono text-amber-400 mt-1">
            {stats.totalInTransit.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-500/80 font-mono">Moving between hubs</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Quarantine & QC
          </p>
          <p className="text-lg font-bold font-mono text-purple-400 mt-1">
            {stats.totalQuarantined.toLocaleString()}
          </p>
          <span className="text-[10px] text-purple-400/80 font-mono">Pending QA inspection</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Defect & Damaged
          </p>
          <p className="text-lg font-bold font-mono text-destructive mt-1">
            {stats.totalDamaged.toLocaleString()}
          </p>
          <span className="text-[10px] text-destructive/80 font-mono">Non-sellable items</span>
        </Card>
      </div>

      {activeTab === "matrix" ? (
        <Card className="border border-border rounded-xs bg-background">
          {/* Filters Bar */}
          <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search product, SKU, barcode, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background rounded-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedLocationType}
                onValueChange={(val) => {
                  if (val) setSelectedLocationType(val);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[160px] bg-background">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Locations</SelectItem>
                  <SelectItem value="WAREHOUSE" className="text-xs">Warehouses & Shelves</SelectItem>
                  <SelectItem value="STORE" className="text-xs">Retail Stores & Floors</SelectItem>
                  <SelectItem value="IN_TRANSIT" className="text-xs">In-Transit Pipeline</SelectItem>
                  <SelectItem value="DAMAGE" className="text-xs">Damaged Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          {/* Balances Table */}
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-8 text-xs font-semibold">Product & Variant</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[140px]">SKU / Barcode</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[220px]">Physical Location</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Cost Price</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[160px]">Stock Status</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Valuation</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-mono">
                      No inventory balances found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBalances.map((bal) => {
                    const lineVal = bal.onHand * bal.unitCost;

                    return (
                      <TableRow key={bal.id} className="border-b border-border/60 hover:bg-muted/10">
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground line-clamp-1">
                              {bal.productName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {bal.variantName} {bal.brandName ? `• ${bal.brandName}` : ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs">
                          <div className="text-foreground">{bal.sku}</div>
                          {bal.barcode && (
                            <div className="text-[10px] text-muted-foreground">BC: {bal.barcode}</div>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <LocationBadge
                            type={bal.locationType}
                            code={bal.locationCode}
                            name={bal.locationName}
                          />
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

                        <TableCell className="py-2.5 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenAdjust(bal.id)}
                            className="h-7 text-xs border-border"
                          >
                            Adjust
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
      ) : (
        /* Audit Transaction Ledger Tab */
        <Card className="border border-border rounded-xs bg-background">
          <CardHeader className="p-3.5 border-b border-border/60 bg-muted/10 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <History className="size-4 text-muted-foreground" />
                <span>Immutable Inventory Transaction Ledger</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                Complete sequential audit trail of all physical stock movements
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-8 text-xs font-semibold">Txn #</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">Type</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">Item & SKU</TableHead>
                  <TableHead className="h-8 text-xs font-semibold w-[80px] text-right">Qty</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">Movement Vector</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">Reference</TableHead>
                  <TableHead className="h-8 text-xs font-semibold">User & Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5 font-mono text-xs text-foreground font-semibold">
                      {tx.txnNumber}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-1.5 py-0 rounded-xs ${
                          tx.type.includes("RECEIPT") || tx.type === "PUTAWAY"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : tx.type.includes("DISPATCH")
                            ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                            : tx.type.includes("DAMAGE")
                            ? "border-destructive/40 text-destructive bg-destructive/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{tx.productName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {tx.variantName} ({tx.sku})
                      </p>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      {tx.quantity}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs font-mono text-muted-foreground">
                      {tx.sourceLocationName ? (
                        <span>
                          {tx.sourceLocationName} → {tx.destinationLocationName}
                        </span>
                      ) : (
                        <span>→ {tx.destinationLocationName}</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs">
                      <span className="bg-muted/40 px-1.5 py-0.5 rounded-xs border border-border/40 text-foreground">
                        {tx.referenceNumber}
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5 text-xs">
                      <p className="font-medium text-foreground">{tx.createdBy}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-md rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
          <DialogHeader className="p-4 border-b border-border bg-background">
            <DialogTitle className="text-base font-semibold text-foreground">
              Adjust Inventory Balance
            </DialogTitle>
          </DialogHeader>

          {selectedBalance && (
            <div className="p-4 space-y-3">
              <div className="p-2.5 rounded-xs border border-border/60 bg-muted/20 space-y-1">
                <p className="text-xs font-semibold text-foreground">{selectedBalance.productName}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>{selectedBalance.sku}</span>
                  <span>•</span>
                  <span>{selectedBalance.locationName}</span>
                </div>
                <div className="text-xs font-mono text-foreground font-semibold pt-1">
                  Current On Hand: {selectedBalance.onHand} | Available: {selectedBalance.available}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Adjustment Operation
                </Label>
                <Select value={adjustType} onValueChange={setAdjustType}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Select Operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCREASE" className="text-xs">Physical Increase (+ Qty)</SelectItem>
                    <SelectItem value="DECREASE" className="text-xs">Physical Decrease (- Qty)</SelectItem>
                    <SelectItem value="MOVE_TO_DAMAGE" className="text-xs text-destructive">Record Damaged / Defect</SelectItem>
                    <SelectItem value="MOVE_TO_QUARANTINE" className="text-xs text-purple-400">Move to Quarantine (QC Hold)</SelectItem>
                    <SelectItem value="RELEASE_QUARANTINE" className="text-xs text-emerald-400">Release from Quarantine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quantity
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value) || 1)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Adjustment Reason & Audit Reference *
                </Label>
                <Input
                  placeholder="e.g. Discovered 1 unit torn lining during monthly cycle count."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="p-3 px-4 border-t border-border bg-muted/10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdjustOpen(false)}
              className="h-8 text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmAdjust}
              className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
