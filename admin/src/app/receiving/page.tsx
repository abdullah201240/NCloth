"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useReceiving } from "@/lib/stores/receiving-context";
import { usePurchases } from "@/lib/stores/purchase-context";
import { LocationBadge } from "@/components/inventory/location-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Box,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Store,
  Grid,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function InboundReceivingPage() {
  const router = useRouter();
  const { sessions, startReceivingSession } = useReceiving();
  const { purchaseOrders } = usePurchases();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [newSessionOpen, setNewSessionOpen] = React.useState(false);
  const [selectedPoId, setSelectedPoId] = React.useState("");
  const [destType, setDestType] = React.useState<"WAREHOUSE" | "STORE">("WAREHOUSE");

  // Eligible POs for receiving (ordered or partially received)
  const eligiblePOs = purchaseOrders.filter(
    (p) => p.status === "ORDERED" || p.status === "PARTIALLY_RECEIVED" || p.status === "DRAFT"
  );

  const filteredSessions = React.useMemo(() => {
    return sessions.filter((s) => {
      return (
        searchQuery === "" ||
        s.sessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [sessions, searchQuery]);

  const handleStartSession = () => {
    if (!selectedPoId) {
      toast.error("Please select a Purchase Order");
      return;
    }

    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    if (!po) return;

    const newSession = startReceivingSession(
      {
        purchaseOrderId: po.id,
        destinationType: destType,
        destinationId: destType === "WAREHOUSE" ? po.warehouseId || "wh-01" : "str-01",
      },
      "Inbound Supervisor"
    );

    setNewSessionOpen(false);
    router.push(`/receiving/${newSession.id}`);
  };

  return (
    <AdminShell>
      <div className="space-y-4 pb-16 w-full min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Box className="size-5 text-emerald-500" />
              <span>Inbound Receiving Center</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Goods Inward & QA Dock
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            SUPPLIER PURCHASE RECEIPT, BARCODE VALIDATION & STORE DIRECT RECEIVING
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/warehouse/putaway")}
            className="h-8 text-xs border-border gap-1.5"
          >
            <Grid className="size-3.5 text-muted-foreground" /> Putaway Queue
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setNewSessionOpen(true)}
            className="h-8 text-xs px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" /> Start Receiving Session
          </Button>
        </div>
      </div>

      {/* 2. Receiving Sessions Master Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search session #, PO #, supplier, destination..."
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
                <TableHead className="h-8 text-xs font-semibold">Session #</TableHead>
                <TableHead className="h-8 text-xs font-semibold">PO Reference</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Supplier</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Receiving Destination</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Inward Units</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[110px] text-center">Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No inbound receiving sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((s) => (
                  <TableRow key={s.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground">
                      <Link href={`/receiving/${s.id}`} className="hover:underline flex items-center gap-1.5">
                        {s.sessionNumber}
                      </Link>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-foreground font-semibold">
                      {s.poNumber}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                      {s.supplierName}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        {s.destinationType === "WAREHOUSE" ? (
                          <Building2 className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Store className="size-3.5 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">{s.destinationName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-right">
                      <span className="text-foreground font-bold">{s.totalAcceptedQty}</span> /{" "}
                      <span className="text-muted-foreground">{s.totalOrderedQty}</span>
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono px-2 py-0.5 rounded-xs ${
                          s.status === "COMPLETED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 text-right">
                      <Button
                        type="button"
                        variant={s.status === "IN_PROGRESS" ? "default" : "outline"}
                        size="xs"
                        onClick={() => router.push(`/receiving/${s.id}`)}
                        className={`h-7 text-xs ${
                          s.status === "IN_PROGRESS"
                            ? "bg-foreground text-background hover:bg-foreground/90 font-medium"
                            : "border-border"
                        }`}
                      >
                        {s.status === "IN_PROGRESS" ? "Open Terminal" : "View Manifest"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Start New Inbound Receiving Modal */}
      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent className="sm:max-w-md rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
          <DialogHeader className="p-4 border-b border-border bg-background">
            <DialogTitle className="text-base font-semibold text-foreground">
              Start Inbound Receiving Session
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an approved Purchase Order to initialize inbound barcode scanning.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Purchase Order *
              </Label>
              <Select
                value={selectedPoId}
                onValueChange={(val) => {
                  if (val) setSelectedPoId(val);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  {eligiblePOs.map((po) => (
                    <SelectItem key={po.id} value={po.id} className="text-xs">
                      {po.poNumber} — {po.supplierName} (৳{po.grandTotal.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Receiving Destination Routing *
              </Label>
              <Select value={destType} onValueChange={(val: any) => setDestType(val)}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAREHOUSE" className="text-xs">
                    Central Warehouse (Dock → QC → Putaway)
                  </SelectItem>
                  <SelectItem value="STORE" className="text-xs">
                    Store Direct Delivery (Immediate Available Stock)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-3 px-4 border-t border-border bg-muted/10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNewSessionOpen(false)}
              className="h-8 text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStartSession}
              className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              Launch Terminal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminShell>
  );
}
