"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SizeFormSheet } from "@/components/sizes/size-form-sheet";
import { SizeStatusDialog } from "@/components/sizes/size-status-dialog";
import { useSizeContext } from "@/lib/stores/size-context";
import { SizeItem, SizeStatus } from "@/lib/types/size";
import { SizeFormValues } from "@/lib/validations/size";
import { formatStudioDate } from "@/lib/utils";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Tag,
  ArrowUpDown,
} from "lucide-react";

export default function SizesPage() {
  const {
    sizes,
    stats,
    groups,
    addSize,
    updateSize,
    toggleStatus,
  } = useSizeContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingSize, setEditingSize] = React.useState<SizeItem | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    group: string;
    currentStatus: SizeStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingSize(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (sizeItem: SizeItem) => {
    setEditingSize(sizeItem);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: SizeFormValues, editId?: string) => {
    if (editId) {
      updateSize(editId, data);
    } else {
      addSize(data);
    }
  };

  // Compute suggested next sort order for newly created size
  const suggestedNextOrder = React.useMemo(() => {
    const relevantSizes = groupFilter !== "all"
      ? sizes.filter((s) => s.group === groupFilter)
      : sizes;
    if (relevantSizes.length === 0) return 1;
    const maxOrder = Math.max(...relevantSizes.map((s) => s.sortOrder || 0));
    return maxOrder + 1;
  }, [sizes, groupFilter]);

  const filteredSizes = React.useMemo(() => {
    return sizes
      .filter((sizeItem) => {
        if (groupFilter !== "all" && sizeItem.group !== groupFilter) return false;
        if (statusFilter !== "all" && sizeItem.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = sizeItem.name.toLowerCase().includes(q);
          const matchesCode = sizeItem.code.toLowerCase().includes(q);
          const matchesGroup = sizeItem.group.toLowerCase().includes(q);
          return matchesName || matchesCode || matchesGroup;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort primarily by group, then by sortOrder
        if (a.group !== b.group) {
          return a.group.localeCompare(b.group);
        }
        return a.sortOrder - b.sortOrder;
      });
  }, [sizes, groupFilter, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Apparel Sizes & Scale Matrix
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {sizes.length} Sizes Defined
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Define standard sizing grids, category groups (Adult, Shoes, Kids), and consistent display sort order for product variant matrices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Size
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Defined Sizes</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSizes}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeSizes} Active in Matrix
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Sizes</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeSizes}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                In Production
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Size Scale Groups</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.groupsCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {groups.slice(0, 3).join(", ")}
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Group Filter + Status Filter + View Switcher (Table default) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search size name (e.g. XS, M, 42 EU), code, or group..."
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
            {/* Group Filter */}
            <Select value={groupFilter} onValueChange={(val) => setGroupFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Groups</SelectItem>
                {groups.map((grp) => (
                  <SelectItem key={grp} value={grp} className="text-xs">
                    {grp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="w-[100px] h-9 text-xs">Sort Order</TableHead>
                  <TableHead className="h-9 text-xs">Size Name</TableHead>
                  <TableHead className="w-[140px] h-9 text-xs">Size Code</TableHead>
                  <TableHead className="h-9 text-xs">Size Group</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                      No sizes match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSizes.map((sizeItem) => {
                    const isActive = sizeItem.status === "active";

                    return (
                      <TableRow key={sizeItem.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <ArrowUpDown className="size-3 text-muted-foreground" />
                            {sizeItem.sortOrder}
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-xs border border-border bg-muted/20 font-mono text-xs font-semibold text-foreground">
                              {sizeItem.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {sizeItem.code}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Badge variant="outline" className="text-xs font-sans border-border px-2 py-0.5">
                            {sizeItem.group}
                          </Badge>
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
                              {sizeItem.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: sizeItem.id,
                                  name: sizeItem.name,
                                  code: sizeItem.code,
                                  group: sizeItem.group,
                                  currentStatus: sizeItem.status,
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
                            onClick={() => handleOpenEdit(sizeItem)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Size"
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSizes.map((sizeItem) => {
              const isActive = sizeItem.status === "active";

              return (
                <Card
                  key={sizeItem.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors p-3.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-xs border border-border bg-muted/20 font-mono text-sm font-semibold text-foreground">
                          {sizeItem.name}
                        </span>
                        <div>
                          <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                            {sizeItem.group}
                          </Badge>
                          <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                            Code: {sizeItem.code}
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
                        {sizeItem.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1 font-mono">
                        <ArrowUpDown className="size-3" /> Sort Order: {sizeItem.sortOrder}
                      </span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => {
                          setTargetToggleItem({
                            id: sizeItem.id,
                            name: sizeItem.name,
                            code: sizeItem.code,
                            group: sizeItem.group,
                            currentStatus: sizeItem.status,
                          });
                          setToggleDialogOpen(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(sizeItem.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(sizeItem)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Size
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <SizeFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingSize}
        availableGroups={groups}
        suggestedNextOrder={suggestedNextOrder}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <SizeStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        sizeItem={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
