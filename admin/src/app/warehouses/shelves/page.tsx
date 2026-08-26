"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
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
import { ShelfFormSheet } from "@/components/shelves/shelf-form-sheet";
import { ShelfStatusDialog } from "@/components/shelves/shelf-status-dialog";
import { useShelfContext } from "@/lib/stores/shelf-context";
import { useWarehouseContext } from "@/lib/stores/warehouse-context";
import { Shelf, ShelfStatus } from "@/lib/types/shelf";
import { ShelfFormValues } from "@/lib/validations/shelf";
import {
  Grid,
  Plus,
  Search,
  Edit2,
  X,
  Building2,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Archive,
} from "lucide-react";

export default function ShelvesPage() {
  const {
    shelves,
    stats,
    addShelf,
    updateShelf,
    toggleStatus,
  } = useShelfContext();

  const { warehouses } = useWarehouseContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [warehouseFilter, setWarehouseFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingShelf, setEditingShelf] = React.useState<Shelf | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    warehouseName: string;
    currentStatus: ShelfStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingShelf(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (shelf: Shelf) => {
    setEditingShelf(shelf);
    setSheetOpen(true);
  };

  const handleFormSubmit = (
    data: ShelfFormValues,
    warehouseName: string,
    editId?: string
  ) => {
    if (editId) {
      updateShelf(editId, data, warehouseName);
    } else {
      addShelf(data, warehouseName);
    }
  };

  const filteredShelves = React.useMemo(() => {
    return shelves.filter((shelf) => {
      if (statusFilter !== "all" && shelf.status !== statusFilter) return false;
      if (warehouseFilter !== "all" && shelf.warehouseId !== warehouseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = shelf.name.toLowerCase().includes(q);
        const matchesCode = shelf.code.toLowerCase().includes(q);
        const matchesWh = shelf.warehouseName.toLowerCase().includes(q);
        const matchesDesc = shelf.description?.toLowerCase().includes(q) || false;
        return matchesName || matchesCode || matchesWh || matchesDesc;
      }
      return true;
    });
  }, [shelves, warehouseFilter, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Storage Shelves & Bins
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {shelves.length} Shelves Registered
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Organize internal warehouse storage racks, shelf codes (e.g. SH-A01), parent facilities, and slotting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Shelf
            </Button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Shelves</span>
              <Grid className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalShelves}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeShelves} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Storage Bins</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeShelves}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                Live
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Inactive / Offline</span>
              <Archive className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.inactiveShelves}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Archived
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Warehouses Covered</span>
              <Building2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.warehouseCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Facilities
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Warehouse Filter + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search shelf name (e.g. Shelf A01), code (SH-A01), warehouse, description..."
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

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Warehouse Filter */}
            <Select value={warehouseFilter} onValueChange={(val) => setWarehouseFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs min-w-[160px]">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Warehouses</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id} className="text-xs">
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active Only</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* View Switcher */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background shrink-0">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("grid")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Grid Cards"
              >
                <LayoutGrid className="size-3.5" /> Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Data Table"
              >
                <ListFilter className="size-3.5" /> Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content: Grid Cards or Data Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredShelves.map((shelf) => {
              const isActive = shelf.status === "active";

              return (
                <Card
                  key={shelf.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-7 rounded-xs border border-border bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0">
                          <Grid className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-foreground block truncate">
                            {shelf.name}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {shelf.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                            isActive
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-zinc-500/40 text-zinc-500"
                          }`}
                        >
                          {shelf.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: shelf.id,
                              name: shelf.name,
                              code: shelf.code,
                              warehouseName: shelf.warehouseName,
                              currentStatus: shelf.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Warehouse Info */}
                    <div className="border-t border-border/60 pt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {shelf.warehouseName}
                        </span>
                      </div>

                      {shelf.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
                          {shelf.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(shelf.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(shelf)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Shelf
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-9 text-xs">Shelf Name</TableHead>
                  <TableHead className="w-[120px] h-9 text-xs">Shelf Code</TableHead>
                  <TableHead className="h-9 text-xs">Parent Warehouse</TableHead>
                  <TableHead className="h-9 text-xs">Description / Notes</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShelves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                      No shelves match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShelves.map((shelf) => {
                    const isActive = shelf.status === "active";

                    return (
                      <TableRow key={shelf.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Grid className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{shelf.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                          {shelf.code}
                        </TableCell>

                        <TableCell className="py-2.5 text-sm text-foreground">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="size-3 text-muted-foreground shrink-0" />
                            <span>{shelf.warehouseName}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-muted-foreground max-w-sm truncate">
                          {shelf.description || "—"}
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
                              {shelf.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: shelf.id,
                                  name: shelf.name,
                                  code: shelf.code,
                                  warehouseName: shelf.warehouseName,
                                  currentStatus: shelf.status,
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
                            onClick={() => handleOpenEdit(shelf)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Shelf"
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
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <ShelfFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        warehouses={warehouses}
        initialData={editingShelf}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <ShelfStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        shelf={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
