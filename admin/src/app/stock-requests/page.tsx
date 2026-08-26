"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransfers } from "@/lib/stores/transfer-context";
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
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function StockRequestsPage() {
  const router = useRouter();
  const { stockRequests, approveStockRequest, rejectStockRequest } = useTransfers();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredRequests = React.useMemo(() => {
    return stockRequests.filter((r) => {
      return (
        searchQuery === "" ||
        r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetWarehouseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [stockRequests, searchQuery]);

  const handleApprove = (id: string) => {
    const transfer = approveStockRequest(id);
    if (transfer) {
      router.push(`/transfers/${transfer.id}`);
    }
  };

  const handleReject = (id: string) => {
    rejectStockRequest(id, "Stock currently allocated to priority export orders.");
  };

  return (
    <div className="space-y-4 pb-16 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Store className="size-5 text-foreground" />
              <span>Store Replenishment Requests</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Retail Stock Orders
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            STORE-TO-WAREHOUSE STOCK REORDER PIPELINE & AUTOMATED TRANSFER SPAWNING
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => router.push("/stock-requests/new")}
            className="h-8 text-xs px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" /> Create Stock Request
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search request #, store, warehouse..."
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
                <TableHead className="h-8 text-xs font-semibold">Request #</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Requesting Store</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Target Fulfillment Hub</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[100px] text-right">Requested Qty</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[110px] text-center">Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[90px] text-center">Priority</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No stock replenishment requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground">
                      {req.requestNumber}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs font-medium text-foreground">
                      {req.storeName}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                      {req.targetWarehouseName}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      {req.totalRequestedQty} units
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-xs ${
                          req.status === "APPROVED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : req.status === "REJECTED"
                            ? "border-destructive/40 text-destructive bg-destructive/10"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <span className="text-[11px] font-mono font-semibold uppercase text-muted-foreground">
                        {req.priority}
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5 text-right">
                      {req.status === "SUBMITTED" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => handleApprove(req.id)}
                            className="h-7 text-xs px-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
                          >
                            <CheckCircle2 className="size-3 text-emerald-400" /> Approve & Spawn Transfer
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleReject(req.id)}
                            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : req.stockTransferId ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => router.push(`/transfers/${req.stockTransferId}`)}
                          className="h-7 text-xs border-border gap-1"
                        >
                          View Transfer <ArrowRight className="size-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
