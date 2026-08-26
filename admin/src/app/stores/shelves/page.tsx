"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { useStoreShelves } from "@/lib/stores/store-shelf-context";
import { useStoreContext } from "@/lib/stores/store-context";
import { StoreShelf } from "@/lib/types/store-shelf";
import { StoreShelfFormValues } from "@/lib/validations/store-shelf";
import { StoreShelfFormSheet } from "@/components/stores/store-shelf-form-sheet";
import { StoreShelfStatusDialog } from "@/components/stores/store-shelf-status-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Grid,
  Store as StoreIcon,
  Plus,
  Search,
  ListFilter,
  LayoutGrid,
  Edit2,
  CheckCircle2,
  Archive,
  MapPin,
  X,
} from "lucide-react";

export default function StoreShelvesPage() {
  const {
    shelves,
    stats,
    addStoreShelf,
    updateStoreShelf,
    toggleStoreShelfStatus,
  } = useStoreShelves();

  const { stores } = useStoreContext();

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [storeFilter, setStoreFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingShelf, setEditingShelf] = React.useState<StoreShelf | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    storeName: string;
    currentStatus: "active" | "inactive";
  } | null>(null);

  const filteredShelves = React.useMemo(() => {
    return shelves.filter((shelf) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        shelf.name.toLowerCase().includes(q) ||
        shelf.code.toLowerCase().includes(q) ||
        shelf.storeName.toLowerCase().includes(q) ||
        shelf.zone.toLowerCase().includes(q) ||
        (shelf.description && shelf.description.toLowerCase().includes(q));

      const matchesStore = storeFilter === "all" || shelf.storeId === storeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && shelf.status === "active") ||
        (statusFilter === "inactive" && shelf.status === "inactive");

      return matchesSearch && matchesStore && matchesStatus;
    });
  }, [shelves, searchQuery, storeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingShelf(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (shelf: StoreShelf) => {
    setEditingShelf(shelf);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: StoreShelfFormValues, storeName: string, editId?: string) => {
    if (editId) {
      updateStoreShelf(editId, data, storeName);
    } else {
      addStoreShelf(data, storeName);
    }
  };

  return (
    <AdminShell>
      <div className="w-full space-y-4 min-w-0">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Boutique Shelves & Display Racks
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {stats.totalShelves} Units
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage in-store presentation racks, showcase pedestals, VIP salon wardrobes, and retail floor zones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Shelf / Rack
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Shelves & Racks</span>
              <Grid className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalShelves}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeShelves} Active Units
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Presentation Units</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeShelves}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                Online
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Boutiques Covered</span>
              <StoreIcon className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.storeCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {stats.inactiveShelves} Offline
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Store Filter + Status Filter + View Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search shelf name, code (STR-PAR-RK01), boutique, or zone..."
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
            {/* Store Filter */}
            <Select value={storeFilter} onValueChange={(val) => setStoreFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[170px]">
                <SelectValue placeholder="All Boutiques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Boutiques</SelectItem>
                {stores.map((str) => (
                  <SelectItem key={str.id} value={str.id} className="text-xs">
                    {str.name}
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

            {/* View Switcher: Table 1st, Grid 2nd */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background shrink-0">
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

        {/* Content: Data Table (Default) or Grid Cards */}
        {viewMode === "table" ? (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background">
                    <TableHead className="h-9 text-xs">Boutique Shelf & Rack</TableHead>
                    <TableHead className="w-[140px] h-9 text-xs">Rack Code</TableHead>
                    <TableHead className="h-9 text-xs">Boutique Location</TableHead>
                    <TableHead className="w-[140px] h-9 text-xs">Store Zone</TableHead>
                    <TableHead className="h-9 text-xs">Description / Merchandising Notes</TableHead>
                    <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                    <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShelves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                        No boutique shelves match your search or filter criteria.
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
                              <StoreIcon className="size-3 text-muted-foreground shrink-0" />
                              <span>{shelf.storeName}</span>
                            </div>
                          </TableCell>

                          <TableCell className="py-2.5">
                            <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                              <MapPin className="size-2.5 mr-1" />
                              {shelf.zone}
                            </Badge>
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
                                    storeName: shelf.storeName,
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
          </div>
        ) : (
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
                          <span className="text-xs font-mono text-muted-foreground">
                            {shelf.code}
                          </span>
                        </div>
                      </div>

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
                    </div>

                    <div className="border-t border-border/60 pt-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Boutique:</span>
                        <strong className="text-foreground font-medium truncate max-w-[150px]">
                          {shelf.storeName}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Zone:</span>
                        <Badge variant="outline" className="text-[11px] font-mono border-border px-1 py-0">
                          {shelf.zone}
                        </Badge>
                      </div>
                    </div>

                    {shelf.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t border-border/40">
                        {shelf.description}
                      </p>
                    )}
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => {
                          setTargetToggleItem({
                            id: shelf.id,
                            name: shelf.name,
                            code: shelf.code,
                            storeName: shelf.storeName,
                            currentStatus: shelf.status,
                          });
                          setToggleDialogOpen(true);
                        }}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

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
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <StoreShelfFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        stores={stores}
        initialData={editingShelf}
        onSubmit={handleFormSubmit}
      />

      {/* Status Toggle Confirmation Dialog (Zero-Delete) */}
      <StoreShelfStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        shelf={targetToggleItem}
        onConfirm={() => {
          if (targetToggleItem) {
            toggleStoreShelfStatus(targetToggleItem.id);
          }
        }}
      />
    </AdminShell>
  );
}
