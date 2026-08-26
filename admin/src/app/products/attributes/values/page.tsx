"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AttributeValueFormSheet } from "@/components/attributes/attribute-value-form-sheet";
import { AttributeValueStatusDialog } from "@/components/attributes/attribute-value-status-dialog";
import { useAttributeContext } from "@/lib/stores/attribute-context";
import { AttributeValue, EntityStatus } from "@/lib/types/attribute";
import { AttributeValueFormValues } from "@/lib/validations/attribute";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Sliders,
  ArrowUpDown,
} from "lucide-react";

function AttributeValuesContent() {
  const searchParams = useSearchParams();
  const initialAttrParam = searchParams.get("attr");

  const {
    attributes,
    attributeValues,
    addAttributeValue,
    updateAttributeValue,
    toggleAttributeValueStatus,
  } = useAttributeContext();

  // Filter only SELECT and MULTI_SELECT attributes for values management
  const selectAttributes = React.useMemo(() => {
    return attributes.filter(
      (a) => a.type === "SELECT" || a.type === "MULTI_SELECT"
    );
  }, [attributes]);

  const [selectedAttributeId, setSelectedAttributeId] = React.useState<string>(() => {
    if (initialAttrParam && selectAttributes.some((a) => a.id === initialAttrParam)) {
      return initialAttrParam;
    }
    return selectAttributes[0]?.id || "";
  });

  // Keep selectedAttributeId valid if selectAttributes loads or initialAttrParam changes
  const activeSelectedId = React.useMemo(() => {
    if (selectedAttributeId && selectAttributes.some((a) => a.id === selectedAttributeId)) {
      return selectedAttributeId;
    }
    if (initialAttrParam && selectAttributes.some((a) => a.id === initialAttrParam)) {
      return initialAttrParam;
    }
    return selectAttributes[0]?.id || "";
  }, [selectedAttributeId, initialAttrParam, selectAttributes]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState<AttributeValue | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    attributeName: string;
    currentStatus: EntityStatus;
  } | null>(null);

  const currentAttribute = selectAttributes.find((a) => a.id === activeSelectedId);

  const handleOpenCreate = () => {
    setEditingValue(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (val: AttributeValue) => {
    setEditingValue(val);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: AttributeValueFormValues, editId?: string) => {
    if (editId) {
      updateAttributeValue(editId, data);
    } else {
      addAttributeValue(data);
    }
  };

  const currentValues = React.useMemo(() => {
    return attributeValues
      .filter((v) => v.attributeId === activeSelectedId)
      .filter((v) => {
        if (statusFilter !== "all" && v.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = v.name.toLowerCase().includes(q);
          const matchesCode = v.code.toLowerCase().includes(q);
          return matchesName || matchesCode;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [attributeValues, activeSelectedId, statusFilter, searchQuery]);

  const suggestedNextOrder = React.useMemo(() => {
    const raw = attributeValues.filter((v) => v.attributeId === activeSelectedId);
    if (raw.length === 0) return 1;
    return Math.max(...raw.map((v) => v.sortOrder || 0)) + 1;
  }, [attributeValues, activeSelectedId]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Attribute Option Values
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              {currentValues.length} Values Defined
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage discrete selection options, codes, visual color metadata, and display sequence for SELECT & MULTI_SELECT attributes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            disabled={!activeSelectedId}
            className="text-xs h-8 px-3"
          >
            <Plus className="size-3.5 mr-1" /> Add Value
          </Button>
        </div>
      </div>

      {/* 3 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 border border-border rounded-xs bg-background">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Parent Attribute</span>
            <Sliders className="size-4" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-lg font-medium text-foreground truncate max-w-[180px]">
              {currentAttribute?.name || "None Selected"}
            </span>
            <Badge variant="outline" className="text-xs font-mono border-border">
              {currentAttribute?.type || "SELECT"}
            </Badge>
          </div>
        </Card>

        <Card className="p-3.5 border border-border rounded-xs bg-background">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Options in Attribute</span>
            <Tag className="size-4" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-light font-mono tabular-nums text-foreground">
              {currentValues.length}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-medium">
              {currentValues.filter((v) => v.status === "active").length} Active Options
            </span>
          </div>
        </Card>

        <Card className="p-3.5 border border-border rounded-xs bg-background">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Selectable Master Pools</span>
            <CheckCircle2 className="size-4" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-light font-mono tabular-nums text-foreground">
              {selectAttributes.length}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              SELECT Attributes
            </span>
          </div>
        </Card>
      </div>

      {/* Toolbar: Attribute Selector + Search + Status Filter + View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
        {/* Target Attribute Switcher */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Attribute:
          </Label>
          <Select
            value={activeSelectedId}
            onValueChange={(val) => {
              if (val) setSelectedAttributeId(val);
            }}
          >
            <SelectTrigger className="h-8 text-xs font-medium bg-background flex-1">
              <SelectValue placeholder="Select target attribute..." />
            </SelectTrigger>
            <SelectContent>
              {selectAttributes.map((attr) => (
                <SelectItem key={attr.id} value={attr.id} className="text-xs">
                  <span className="font-semibold text-foreground">{attr.name}</span>{" "}
                  <span className="font-mono text-muted-foreground">({attr.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search option values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
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
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-background">
                <TableHead className="w-[80px] h-9 text-xs text-center">Order</TableHead>
                <TableHead className="h-9 text-xs">Option Value</TableHead>
                <TableHead className="w-[160px] h-9 text-xs">Value Code</TableHead>
                <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentValues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    No option values defined for this attribute yet. Click &quot;+ Add Value&quot; to add options.
                  </TableCell>
                </TableRow>
              ) : (
                currentValues.map((val) => {
                  const isActive = val.status === "active";

                  return (
                    <TableRow key={val.id} className="border-b border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2.5 text-center font-mono text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <ArrowUpDown className="size-3 text-muted-foreground" />
                          {val.sortOrder}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          {val.colorHex && (
                            <span
                              className="size-4.5 rounded-xs border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: val.colorHex }}
                              title={val.colorHex}
                            />
                          )}
                          <span className="text-sm font-semibold text-foreground">{val.name}</span>
                          {val.colorHex && (
                            <span className="text-xs font-mono text-muted-foreground">({val.colorHex})</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                        {val.code}
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
                            {val.status}
                          </Badge>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => {
                              setTargetToggleItem({
                                id: val.id,
                                name: val.name,
                                code: val.code,
                                attributeName: currentAttribute?.name || "Attribute",
                                currentStatus: val.status,
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
                          onClick={() => handleOpenEdit(val)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit Value"
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
          {currentValues.map((val) => {
            const isActive = val.status === "active";

            return (
              <Card
                key={val.id}
                className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors p-3.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {val.colorHex && (
                        <span
                          className="size-6 rounded-xs border border-border shadow-xs shrink-0"
                          style={{ backgroundColor: val.colorHex }}
                        />
                      )}
                      <div>
                        <span className="text-sm font-semibold text-foreground block truncate">
                          {val.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          {val.code}
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
                      {val.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs font-mono text-muted-foreground">
                    <span>Order: #{val.sortOrder}</span>
                    {val.colorHex && <span>{val.colorHex}</span>}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => {
                      setTargetToggleItem({
                        id: val.id,
                        name: val.name,
                        code: val.code,
                        attributeName: currentAttribute?.name || "Attribute",
                        currentStatus: val.status,
                      });
                      setToggleDialogOpen(true);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenEdit(val)}
                    className="h-7 text-xs px-2.5 border-border"
                  >
                    <Edit2 className="size-3 mr-1" /> Edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Creation & Edit Sheet */}
      <AttributeValueFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingValue}
        selectedAttributeId={activeSelectedId}
        selectAttributes={selectAttributes}
        suggestedSortOrder={suggestedNextOrder}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <AttributeValueStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        valueItem={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleAttributeValueStatus(id, nextStatus)}
      />
    </div>
  );
}

export default function AttributeValuesPage() {
  return (
    <AdminShell>
      <React.Suspense
        fallback={
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading attribute option values...
          </div>
        }
      >
        <AttributeValuesContent />
      </React.Suspense>
    </AdminShell>
  );
}
