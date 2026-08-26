"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatStudioDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { WarehouseFormSheet } from "@/components/warehouses/warehouse-form-sheet";
import { WarehouseStatusDialog } from "@/components/warehouses/warehouse-status-dialog";
import { useWarehouseContext } from "@/lib/stores/warehouse-context";
import { Warehouse, WarehouseStatus } from "@/lib/types/warehouse";
import { WarehouseFormValues } from "@/lib/validations/warehouse";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  X,
  Phone,
  User,
  MapPin,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Globe2,
} from "lucide-react";

export default function WarehousesPage() {
  const {
    warehouses,
    stats,
    addWarehouse,
    updateWarehouse,
    toggleStatus,
  } = useWarehouseContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingWarehouse, setEditingWarehouse] = React.useState<Warehouse | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    currentStatus: WarehouseStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: WarehouseFormValues, editId?: string) => {
    if (editId) {
      updateWarehouse(editId, data);
    } else {
      addWarehouse(data);
    }
  };

  const filteredWarehouses = React.useMemo(() => {
    return warehouses.filter((wh) => {
      if (statusFilter !== "all" && wh.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = wh.name.toLowerCase().includes(q);
        const matchesCode = wh.code.toLowerCase().includes(q);
        const matchesAddress = wh.address.toLowerCase().includes(q);
        const matchesManager = wh.manager.toLowerCase().includes(q);
        const matchesPhone = wh.phone.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesAddress || matchesManager || matchesPhone;
      }
      return true;
    });
  }, [warehouses, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Warehouses & Logistics Hubs
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {warehouses.length} Facilities
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage international atelier storage vaults, fulfillment centers, facility managers, and direct routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Warehouse Hub
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Registered Facilities</span>
              <Building2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalWarehouses}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeWarehouses} Active Hubs
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Logistics Hubs</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeWarehouses}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {stats.inactiveWarehouses} Inactive / Archived
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Global Operational Status</span>
              <Globe2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalWarehouses > 0
                  ? Math.round((stats.activeWarehouses / stats.totalWarehouses) * 100)
                  : 0}%
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                100% Verified
              </Badge>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search warehouse name, code (e.g. WH-PAR-01), manager, address, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active Only</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* View Switcher */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Data Table"
              >
                <ListFilter className="size-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("grid")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Grid Cards"
              >
                <LayoutGrid className="size-3.5" /> Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Content: Grid or Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWarehouses.map((wh) => {
              const isActive = wh.status === "active";

              return (
                <Card
                  key={wh.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-32 w-full bg-muted/20 border-b border-border overflow-hidden">
                      {wh.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={wh.imageUrl}
                          alt={wh.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <Building2 className="size-8 stroke-1" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <Badge className="text-xs font-mono uppercase bg-background/90 text-foreground border border-border">
                          {wh.code}
                        </Badge>
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-1.5 py-0.5 bg-background/90 ${
                            isActive
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-zinc-500/40 text-zinc-500"
                          }`}
                        >
                          {wh.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: wh.id,
                              name: wh.name,
                              code: wh.code,
                              currentStatus: wh.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    <CardHeader className="p-3 px-3.5 space-y-1">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {wh.name}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-0.5">
                        <MapPin className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                        <span className="line-clamp-2">{wh.address}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3 px-3.5 pt-0 space-y-2">
                      {/* Manager & Contact */}
                      <div className="border-t border-border/60 pt-2.5 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <User className="size-3" /> Manager:
                          </span>
                          <strong className="text-foreground">{wh.manager}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="size-3" /> Phone:
                          </span>
                          <span className="text-foreground">{wh.phone}</span>
                        </div>
                        {wh.email && (
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="text-foreground truncate max-w-[190px]">{wh.email}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(wh.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(wh)}
                      className="h-7.5 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Hub
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-9 text-xs">Warehouse Facility</TableHead>
                  <TableHead className="w-[130px] h-9 text-xs">Hub Code</TableHead>
                  <TableHead className="h-9 text-xs">Physical Address</TableHead>
                  <TableHead className="w-[200px] h-9 text-xs">Manager & Phone</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                      No warehouses match your search query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarehouses.map((wh) => {
                    const isActive = wh.status === "active";

                    return (
                      <TableRow key={wh.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative size-8 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                              {wh.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={wh.imageUrl}
                                  alt={wh.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Building2 className="size-3.5 text-muted-foreground stroke-1" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-foreground">{wh.name}</span>
                              {wh.email && (
                                <span className="text-xs font-mono text-muted-foreground truncate">
                                  {wh.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                          {wh.code}
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-muted-foreground max-w-xs truncate">
                          {wh.address}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{wh.manager}</span>
                            <span className="text-xs font-mono text-muted-foreground">{wh.phone}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                                isActive
                                  ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                  : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                              }`}
                            >
                              {wh.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: wh.id,
                                  name: wh.name,
                                  code: wh.code,
                                  currentStatus: wh.status,
                                });
                                setToggleDialogOpen(true);
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-2.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(wh)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Warehouse"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <WarehouseFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingWarehouse}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <WarehouseStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        warehouse={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
