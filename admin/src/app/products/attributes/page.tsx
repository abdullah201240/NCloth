"use client";

import * as React from "react";
import Link from "next/link";
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
import { AttributeFormSheet } from "@/components/attributes/attribute-form-sheet";
import { AttributeStatusDialog } from "@/components/attributes/attribute-status-dialog";
import { useAttributeContext } from "@/lib/stores/attribute-context";
import { Attribute, AttributeType, EntityStatus } from "@/lib/types/attribute";
import { AttributeFormValues } from "@/lib/validations/attribute";
import {
  Sliders,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  Layers,
  Sparkles,
  Tag,
  Check,
} from "lucide-react";

export default function AttributesPage() {
  const {
    attributes,
    units,
    stats,
    addAttribute,
    updateAttribute,
    toggleAttributeStatus,
    getUnitById,
    getSetsUsingAttribute,
  } = useAttributeContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingAttribute, setEditingAttribute] = React.useState<Attribute | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    type: AttributeType;
    currentStatus: EntityStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: AttributeFormValues, editId?: string) => {
    if (editId) {
      updateAttribute(editId, data);
    } else {
      addAttribute(data);
    }
  };

  const filteredAttributes = React.useMemo(() => {
    return attributes
      .filter((attr) => {
        if (typeFilter !== "all" && attr.type !== typeFilter) return false;
        if (statusFilter !== "all" && attr.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = attr.name.toLowerCase().includes(q);
          const matchesCode = attr.code.toLowerCase().includes(q);
          const matchesDesc = attr.description?.toLowerCase().includes(q) || false;
          return matchesName || matchesCode || matchesDesc;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [attributes, typeFilter, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Dynamic Attributes
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {attributes.length} Master Properties
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage reusable, multi-industry dynamic specifications, data types, and storefront indexing rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Attribute
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Attributes</span>
              <Sliders className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalAttributes}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeAttributes} Active Properties
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Variant-Ready (SKU)</span>
              <Sparkles className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {attributes.filter((a) => a.isVariant && a.status === "active").length}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                Matrix Enablers
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Industry Bundles</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSets}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Configured Sets
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Type Filter + Status Filter + View Switcher (Table default) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search attribute name (e.g. Color, RAM, Material), code, or description..."
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
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[145px]">
                <SelectValue placeholder="All Data Types" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all" className="text-xs">All Data Types</SelectItem>
                <SelectItem value="SELECT" className="text-xs">SELECT</SelectItem>
                <SelectItem value="MULTI_SELECT" className="text-xs">MULTI_SELECT</SelectItem>
                <SelectItem value="NUMBER_WITH_UNIT" className="text-xs">NUMBER_WITH_UNIT</SelectItem>
                <SelectItem value="TEXT" className="text-xs">TEXT</SelectItem>
                <SelectItem value="LONG_TEXT" className="text-xs">LONG_TEXT</SelectItem>
                <SelectItem value="NUMBER" className="text-xs">NUMBER</SelectItem>
                <SelectItem value="BOOLEAN" className="text-xs">BOOLEAN</SelectItem>
                <SelectItem value="DATE" className="text-xs">DATE</SelectItem>
                <SelectItem value="DATETIME" className="text-xs">DATETIME</SelectItem>
                <SelectItem value="URL" className="text-xs">URL</SelectItem>
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
                  <TableHead className="h-9 text-xs">Attribute Name</TableHead>
                  <TableHead className="w-[140px] h-9 text-xs">Code</TableHead>
                  <TableHead className="w-[150px] h-9 text-xs">Data Type</TableHead>
                  <TableHead className="w-[110px] h-9 text-xs text-center">Used in Sets</TableHead>
                  <TableHead className="w-[80px] h-9 text-xs text-center">Variant</TableHead>
                  <TableHead className="w-[80px] h-9 text-xs text-center">Filterable</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[100px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center text-sm text-muted-foreground">
                      No attributes match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attr) => {
                    const isActive = attr.status === "active";
                    const boundUnit = attr.unitId ? getUnitById(attr.unitId) : undefined;
                    const usedSets = getSetsUsingAttribute(attr.id);
                    const isSelectType = attr.type === "SELECT" || attr.type === "MULTI_SELECT";

                    return (
                      <TableRow key={attr.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-foreground block">
                              {attr.name}
                            </span>
                            {attr.description && (
                              <span className="text-xs text-muted-foreground block line-clamp-1">
                                {attr.description}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {attr.code}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                              {attr.type}
                            </Badge>
                            {boundUnit && (
                              <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary px-1.5 py-0" title={`Unit: ${boundUnit.name}`}>
                                {boundUnit.symbol}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-center">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono px-2 py-0 border-border"
                            title={usedSets.map((s) => s.name).join(", ")}
                          >
                            {usedSets.length} Sets
                          </Badge>
                        </TableCell>

                        <TableCell className="py-2.5 text-center">
                          {attr.isVariant ? (
                            <span className="inline-flex items-center text-emerald-600 text-xs font-medium gap-0.5">
                              <Check className="size-3.5" /> Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-center">
                          {attr.isFilterable ? (
                            <span className="inline-flex items-center text-foreground text-xs font-medium gap-0.5">
                              <Check className="size-3.5 text-muted-foreground" /> Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono">—</span>
                          )}
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
                              {attr.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: attr.id,
                                  name: attr.name,
                                  code: attr.code,
                                  type: attr.type,
                                  currentStatus: attr.status,
                                });
                                setToggleDialogOpen(true);
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            {isSelectType && (
                              <Link
                                href={`/products/attributes/values?attr=${attr.id}`}
                                className="inline-flex items-center justify-center size-7 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Manage Predefined Values"
                              >
                                <Tag className="size-3.5" />
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(attr)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                              title="Edit Attribute"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                          </div>
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
            {filteredAttributes.map((attr) => {
              const isActive = attr.status === "active";
              const boundUnit = attr.unitId ? getUnitById(attr.unitId) : undefined;
              const usedSets = getSetsUsingAttribute(attr.id);
              const isSelectType = attr.type === "SELECT" || attr.type === "MULTI_SELECT";

              return (
                <Card
                  key={attr.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors p-3.5"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground block">
                          {attr.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                          {attr.code}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                          isActive
                            ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                            : "border-zinc-500/40 text-zinc-500"
                        }`}
                      >
                        {attr.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                        {attr.type}
                      </Badge>
                      {boundUnit && (
                        <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary px-1.5 py-0">
                          Unit: {boundUnit.symbol}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                        {usedSets.length} Sets
                      </Badge>
                    </div>

                    {attr.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {attr.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-border/60 text-xs text-muted-foreground font-mono">
                      <span>Variant: {attr.isVariant ? "Yes" : "No"}</span>
                      <span>Filter: {attr.isFilterable ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => {
                        setTargetToggleItem({
                          id: attr.id,
                          name: attr.name,
                          code: attr.code,
                          type: attr.type,
                          currentStatus: attr.status,
                        });
                        setToggleDialogOpen(true);
                      }}
                    />
                    <div className="flex items-center gap-1.5">
                      {isSelectType && (
                        <Link
                          href={`/products/attributes/values?attr=${attr.id}`}
                          className="inline-flex items-center justify-center h-7 text-xs px-2 border border-border rounded-xs text-foreground hover:bg-muted transition-colors"
                        >
                          <Tag className="size-3 mr-1" /> Values
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenEdit(attr)}
                        className="h-7 text-xs px-2 border-border"
                      >
                        <Edit2 className="size-3 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <AttributeFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingAttribute}
        availableUnits={units}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <AttributeStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        attribute={targetToggleItem}
        usedInSetsCount={targetToggleItem ? getSetsUsingAttribute(targetToggleItem.id).length : 0}
        onConfirm={(id, nextStatus) => toggleAttributeStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
