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
import { UnitFormSheet } from "@/components/attributes/unit-form-sheet";
import { UnitStatusDialog } from "@/components/attributes/unit-status-dialog";
import { useAttributeContext } from "@/lib/stores/attribute-context";
import { Unit, EntityStatus } from "@/lib/types/attribute";
import { UnitFormValues } from "@/lib/validations/attribute";
import { formatStudioDate } from "@/lib/utils";
import {
  Scale,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  Tag,
  Layers,
} from "lucide-react";

export default function UnitsPage() {
  const {
    units,
    attributes,
    stats,
    addUnit,
    updateUnit,
    toggleUnitStatus,
  } = useAttributeContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingUnit, setEditingUnit] = React.useState<Unit | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    symbol: string;
    currentStatus: EntityStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: UnitFormValues, editId?: string) => {
    if (editId) {
      updateUnit(editId, data);
    } else {
      addUnit(data);
    }
  };

  const filteredUnits = React.useMemo(() => {
    return units.filter((unit) => {
      if (typeFilter !== "all" && unit.unitType !== typeFilter) return false;
      if (statusFilter !== "all" && unit.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = unit.name.toLowerCase().includes(q);
        const matchesSymbol = unit.symbol.toLowerCase().includes(q);
        const matchesCode = unit.code.toLowerCase().includes(q);
        const matchesType = unit.unitType.toLowerCase().includes(q);
        return matchesName || matchesSymbol || matchesCode || matchesType;
      }
      return true;
    });
  }, [units, typeFilter, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Measurement Units
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {units.length} Units Defined
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Standardize physical and digital measurement units (kg, cm, GB, W, mAh) across multi-industry numeric attributes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Unit
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Defined Units</span>
              <Scale className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalUnits}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {units.filter((u) => u.status === "active").length} Active Units
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Referenced in Properties</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {attributes.filter((a) => !!a.unitId).length}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                NUMBER_WITH_UNIT
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Classification Types</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {new Set(units.map((u) => u.unitType)).size}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Weight, Length, Digital, Power...
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Type Filter + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search unit name (e.g. Kilogram, Gigabyte), symbol (kg, GB), or code..."
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
            {/* Classification Type Filter */}
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[145px]">
                <SelectValue placeholder="All Unit Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Unit Types</SelectItem>
                <SelectItem value="WEIGHT" className="text-xs">WEIGHT</SelectItem>
                <SelectItem value="LENGTH" className="text-xs">LENGTH</SelectItem>
                <SelectItem value="VOLUME" className="text-xs">VOLUME</SelectItem>
                <SelectItem value="DIGITAL" className="text-xs">DIGITAL</SelectItem>
                <SelectItem value="ELECTRICAL" className="text-xs">ELECTRICAL</SelectItem>
                <SelectItem value="AREA" className="text-xs">AREA</SelectItem>
                <SelectItem value="TEMPERATURE" className="text-xs">TEMPERATURE</SelectItem>
                <SelectItem value="TIME" className="text-xs">TIME</SelectItem>
                <SelectItem value="OTHER" className="text-xs">OTHER</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[125px]">
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
                  <TableHead className="h-9 text-xs">Unit Name</TableHead>
                  <TableHead className="w-[120px] h-9 text-xs">Symbol</TableHead>
                  <TableHead className="w-[140px] h-9 text-xs">Unit Code</TableHead>
                  <TableHead className="w-[160px] h-9 text-xs">Classification</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                      No units match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit) => {
                    const isActive = unit.status === "active";

                    return (
                      <TableRow key={unit.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5 font-semibold text-sm text-foreground">
                          {unit.name}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-border">
                            {unit.symbol}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {unit.code}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                            {unit.unitType}
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
                              {unit.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: unit.id,
                                  name: unit.name,
                                  symbol: unit.symbol,
                                  currentStatus: unit.status,
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
                            onClick={() => handleOpenEdit(unit)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Unit"
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
            {filteredUnits.map((unit) => {
              const isActive = unit.status === "active";

              return (
                <Card
                  key={unit.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors p-3.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-xs border border-border bg-muted/20 font-mono text-sm font-semibold text-foreground">
                          {unit.symbol}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-foreground block">
                            {unit.name}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            Code: {unit.code}
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
                        {unit.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                        {unit.unitType}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        Updated {formatStudioDate(unit.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => {
                        setTargetToggleItem({
                          id: unit.id,
                          name: unit.name,
                          symbol: unit.symbol,
                          currentStatus: unit.status,
                        });
                        setToggleDialogOpen(true);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(unit)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Unit
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <UnitFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingUnit}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <UnitStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        unit={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleUnitStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
