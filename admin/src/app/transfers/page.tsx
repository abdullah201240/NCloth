"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransfers } from "@/lib/stores/transfer-context";
import { StockTransfer } from "@/lib/types/transfer";
import { LocationBadge } from "@/components/inventory/location-badge";
import { TransferDispatchDialog } from "@/components/transfers/transfer-dispatch-dialog";
import { TransferReceiveDialog } from "@/components/transfers/transfer-receive-dialog";
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
  Truck,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function StockTransfersPage() {
  const router = useRouter();
  const { transfers, stats, approveTransfer } = useTransfers();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Dialog states
  const [dispatchTarget, setDispatchTarget] = React.useState<StockTransfer | null>(null);
  const [receiveTarget, setReceiveTarget] = React.useState<StockTransfer | null>(null);

  const filteredTransfers = React.useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch =
        searchQuery === "" ||
        t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sourceLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.driverName && t.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && (t.status === "APPROVED" || t.status === "IN_TRANSIT" || t.status === "PICKING")) ||
        t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchQuery, statusFilter]);

  return (
    <div className="space-y-4 pb-16 w-full min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="size-5 text-foreground" />
              <span>Stock Transfers & In-Transit Movements</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Multi-Hub Logistics
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            INTER-WAREHOUSE, STORE REPLENISHMENTS & RETURN REALLOCATION PIPELINE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => router.push("/transfers/new")}
            className="h-8 text-xs px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" /> Create Stock Transfer
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total Transfers
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {stats.totalTransfers}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">All-time transfer orders</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Awaiting Dispatch
          </p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">
            {stats.approvedCount}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">Approved in staging</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            In-Transit Pipeline
          </p>
          <p className="text-lg font-bold font-mono text-amber-400 mt-1">
            {stats.inTransitCount}
          </p>
          <span className="text-[10px] text-amber-500/80 font-mono">En route between facilities</span>
        </Card>

        <Card className="border border-border rounded-xs bg-background p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Completed Receipts
          </p>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {stats.completedCount}
          </p>
          <span className="text-[10px] text-emerald-500/80 font-mono">Successfully delivered</span>
        </Card>
      </div>

      {/* 3. Transfers Master Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transfer #, source, destination, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background rounded-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "ACTIVE", "APPROVED", "IN_TRANSIT", "COMPLETED"].map((st) => (
              <Button
                key={st}
                type="button"
                variant={statusFilter === st ? "secondary" : "ghost"}
                size="xs"
                onClick={() => setStatusFilter(st)}
                className="h-7 text-xs font-medium rounded-xs px-2.5"
              >
                {st}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20">
                <TableHead className="h-8 text-xs font-semibold">Transfer #</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Route (From → To)</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[90px] text-right">Units</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[130px] text-right">Valuation</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[110px] text-center">Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Logistics / Driver</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No stock transfers found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((t) => (
                  <TableRow key={t.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5 font-mono text-xs">
                      <Link
                        href={`/transfers/${t.id}`}
                        className="font-bold text-foreground hover:underline flex items-center gap-1.5"
                      >
                        {t.transferNumber}
                      </Link>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(t.requestedDate).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <LocationBadge type={t.sourceType} code={t.sourceLocationCode} name={t.sourceLocationName} />
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <LocationBadge type={t.destinationType} code={t.destinationLocationCode} name={t.destinationLocationName} />
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      {t.totalRequestedQty}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-semibold text-foreground text-right">
                      ৳{t.totalValuationBDT.toLocaleString("en-BD")}
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-xs ${
                          t.status === "COMPLETED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : t.status === "IN_TRANSIT"
                            ? "border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse"
                            : t.status === "APPROVED"
                            ? "border-purple-500/40 text-purple-400 bg-purple-500/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 text-xs">
                      {t.driverName ? (
                        <div>
                          <p className="font-medium text-foreground">{t.driverName}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {t.vehicleNumber || t.courierTrackingNo || "Fleet vehicle"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === "APPROVED" && (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => setDispatchTarget(t)}
                            className="h-7 text-xs px-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
                          >
                            <ShieldCheck className="size-3 text-amber-400" /> Dispatch
                          </Button>
                        )}

                        {t.status === "IN_TRANSIT" && (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => setReceiveTarget(t)}
                            className="h-7 text-xs px-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
                          >
                            <PackageCheck className="size-3 text-emerald-400" /> Receive
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => router.push(`/transfers/${t.id}`)}
                          className="h-7 text-xs border-border"
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dispatch & Receive Modals */}
      {dispatchTarget && (
        <TransferDispatchDialog
          open={!!dispatchTarget}
          onOpenChange={(open) => {
            if (!open) setDispatchTarget(null);
          }}
          transfer={dispatchTarget}
        />
      )}

      {receiveTarget && (
        <TransferReceiveDialog
          open={!!receiveTarget}
          onOpenChange={(open) => {
            if (!open) setReceiveTarget(null);
          }}
          transfer={receiveTarget}
        />
      )}
    </div>
  );
}
