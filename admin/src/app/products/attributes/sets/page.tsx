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
import { AttributeSetFormSheet } from "@/components/attributes/attribute-set-form-sheet";
import { AttributeSetStatusDialog } from "@/components/attributes/attribute-set-status-dialog";
import { AttributeSetConfigDialog } from "@/components/attributes/attribute-set-config-dialog";
import { useAttributeContext } from "@/lib/stores/attribute-context";
import { AttributeSet, AttributeSetConfig, EntityStatus } from "@/lib/types/attribute";
import { AttributeSetFormValues } from "@/lib/validations/attribute";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  Sliders,
  Settings2,
  Tag,
} from "lucide-react";

export default function AttributeSetsPage() {
  const {
    attributeSets,
    attributes,
    stats,
    addAttributeSet,
    updateAttributeSet,
    updateSetAttributeConfigs,
    toggleAttributeSetStatus,
  } = useAttributeContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingSet, setEditingSet] = React.useState<AttributeSet | null>(null);

  // Matrix Config Dialog State
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false);
  const [targetConfigSet, setTargetConfigSet] = React.useState<AttributeSet | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    attributesCount: number;
    currentStatus: EntityStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingSet(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (set: AttributeSet) => {
    setEditingSet(set);
    setSheetOpen(true);
  };

  const handleOpenConfigMatrix = (set: AttributeSet) => {
    setTargetConfigSet(set);
    setConfigDialogOpen(true);
  };

  const handleFormSubmit = (
    data: AttributeSetFormValues,
    initialConfigs?: AttributeSetConfig[],
    editId?: string
  ) => {
    if (editId) {
      updateAttributeSet(editId, data);
    } else {
      addAttributeSet(data, initialConfigs);
    }
  };

  const filteredSets = React.useMemo(() => {
    return attributeSets
      .filter((set) => {
        if (statusFilter !== "all" && set.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = set.name.toLowerCase().includes(q);
          const matchesCode = set.code.toLowerCase().includes(q);
          const matchesDesc = set.description?.toLowerCase().includes(q) || false;
          return matchesName || matchesCode || matchesDesc;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [attributeSets, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Attribute Sets & Templates
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {attributeSets.length} Industry Bundles
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Group reusable attributes into industry-specific templates (Fashion, Electronics, Furniture) and customize per-set override rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Attribute Set
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Attribute Sets</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSets}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {attributeSets.filter((s) => s.status === "active").length} Active Bundles
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Configured Attributes</span>
              <Sliders className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {attributeSets.reduce((sum, s) => sum + s.attributeConfigs.length, 0)}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                Active Assignments
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Master Property Pool</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalAttributes}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Reusable Elements
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Status Filter + View Switcher (Table default) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search set name (e.g. Fashion, Electronics), code, or description..."
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
                  <TableHead className="h-9 text-xs">Attribute Set</TableHead>
                  <TableHead className="w-[160px] h-9 text-xs">Set Code</TableHead>
                  <TableHead className="h-9 text-xs">Included Attributes</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[140px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                      No attribute sets match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSets.map((set) => {
                    const isActive = set.status === "active";
                    const assignedAttrs = set.attributeConfigs
                      .map((cfg) => attributes.find((a) => a.id === cfg.attributeId))
                      .filter(Boolean) as typeof attributes;

                    return (
                      <TableRow key={set.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-foreground block">
                              {set.name}
                            </span>
                            {set.description && (
                              <span className="text-xs text-muted-foreground block line-clamp-1">
                                {set.description}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {set.code}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1 flex-wrap max-w-md">
                            {assignedAttrs.slice(0, 4).map((a) => (
                              <Badge
                                key={a.id}
                                variant="outline"
                                className="text-[10px] font-mono px-1.5 py-0 border-border"
                              >
                                {a.name}
                              </Badge>
                            ))}
                            {assignedAttrs.length > 4 && (
                              <span className="text-[11px] font-mono text-muted-foreground">
                                +{assignedAttrs.length - 4} more
                              </span>
                            )}
                            {assignedAttrs.length === 0 && (
                              <span className="text-xs text-muted-foreground italic">
                                No attributes configured
                              </span>
                            )}
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
                              {set.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: set.id,
                                  name: set.name,
                                  code: set.code,
                                  attributesCount: set.attributeConfigs.length,
                                  currentStatus: set.status,
                                });
                                setToggleDialogOpen(true);
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenConfigMatrix(set)}
                              className="h-7 text-xs px-2 border-border gap-1"
                              title="Configure Attribute Matrix & Overrides"
                            >
                              <Settings2 className="size-3" /> Matrix
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(set)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                              title="Edit Set Information"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSets.map((set) => {
              const isActive = set.status === "active";
              const assignedAttrs = set.attributeConfigs
                .map((cfg) => attributes.find((a) => a.id === cfg.attributeId))
                .filter(Boolean) as typeof attributes;

              return (
                <Card
                  key={set.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors p-3.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground block">
                          {set.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                          {set.code}
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
                        {set.status}
                      </Badge>
                    </div>

                    {set.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {set.description}
                      </p>
                    )}

                    <div className="space-y-1.5 border-t border-border/60 pt-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Included Attributes ({assignedAttrs.length})
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {assignedAttrs.map((a) => (
                          <Badge
                            key={a.id}
                            variant="outline"
                            className="text-[10px] font-mono px-1.5 py-0 border-border"
                          >
                            {a.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => {
                        setTargetToggleItem({
                          id: set.id,
                          name: set.name,
                          code: set.code,
                          attributesCount: set.attributeConfigs.length,
                          currentStatus: set.status,
                        });
                        setToggleDialogOpen(true);
                      }}
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenConfigMatrix(set)}
                        className="h-7 text-xs px-2.5 border-border gap-1"
                      >
                        <Settings2 className="size-3" /> Matrix Overrides
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(set)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Creation & Edit Sheet */}
      <AttributeSetFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingSet}
        availableAttributes={attributes}
        onSubmit={handleFormSubmit}
      />

      {/* Matrix Config Dialog */}
      <AttributeSetConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        set={targetConfigSet}
        allAttributes={attributes}
        onSave={updateSetAttributeConfigs}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <AttributeSetStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        set={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleAttributeSetStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
