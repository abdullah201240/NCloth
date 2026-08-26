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
import { ColorFormSheet } from "@/components/colors/color-form-sheet";
import { ColorStatusDialog } from "@/components/colors/color-status-dialog";
import { useColorContext } from "@/lib/stores/color-context";
import { ColorItem, ColorStatus } from "@/lib/types/color";
import { ColorFormValues } from "@/lib/validations/color";
import { formatStudioDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import {
  Palette,
  Plus,
  Search,
  Edit2,
  X,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Archive,
  Copy,
} from "lucide-react";

export default function ColorsPage() {
  const {
    colors,
    stats,
    addColor,
    updateColor,
    toggleStatus,
  } = useColorContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingColor, setEditingColor] = React.useState<ColorItem | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    hex: string;
    currentStatus: ColorStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingColor(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (color: ColorItem) => {
    setEditingColor(color);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: ColorFormValues, editId?: string) => {
    if (editId) {
      updateColor(editId, data);
    } else {
      addColor(data);
    }
  };

  const handleCopyHex = (hex: string, name: string) => {
    try {
      navigator.clipboard.writeText(hex);
      toast.info("Copied to Clipboard", `${hex} (${name}) copied.`);
    } catch {
      // fallback
    }
  };

  const filteredColors = React.useMemo(() => {
    return colors.filter((color) => {
      if (statusFilter !== "all" && color.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = color.name.toLowerCase().includes(q);
        const matchesCode = color.code.toLowerCase().includes(q);
        const matchesHex = color.hex.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesHex;
      }
      return true;
    });
  }, [colors, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Apparel Colors & Swatches
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {colors.length} Colorways
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage fashion color palette, hex colorways, slug identifiers, and product SKU variant availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Color
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Palette</span>
              <Palette className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalColors}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeColors} Live Swatches
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Colorways</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeColors}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                In Production
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Inactive / Archived</span>
              <Archive className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.inactiveColors}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Archived
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Status Filter + View Switcher (Table default) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search color name (e.g. Noir Jet Black), slug (noir-jet-black), or hex (#09090B)..."
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
                  <TableHead className="h-9 text-xs">Color Swatch & Name</TableHead>
                  <TableHead className="w-[140px] h-9 text-xs">Hex Value</TableHead>
                  <TableHead className="h-9 text-xs">Color Code / Slug</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                      No colors match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColors.map((color) => {
                    const isActive = color.status === "active";

                    return (
                      <TableRow key={color.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="size-6 rounded-xs border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: color.hex }}
                              title={color.hex}
                            />
                            <span className="text-sm font-semibold text-foreground">{color.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <button
                            type="button"
                            onClick={() => handleCopyHex(color.hex, color.name)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
                            title="Click to copy hex"
                          >
                            <span>{color.hex}</span>
                            <Copy className="size-3 text-muted-foreground" />
                          </button>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          {color.code}
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
                              {color.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: color.id,
                                  name: color.name,
                                  code: color.code,
                                  hex: color.hex,
                                  currentStatus: color.status,
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
                            onClick={() => handleOpenEdit(color)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Color"
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
            {filteredColors.map((color) => {
              const isActive = color.status === "active";

              return (
                <Card
                  key={color.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div>
                    {/* Visual Color Block */}
                    <div
                      className="h-24 w-full border-b border-border p-3 flex flex-col justify-between relative"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleCopyHex(color.hex, color.name)}
                          className="px-2 py-0.5 rounded-xs bg-background/90 text-foreground font-mono text-xs border border-border shadow-xs flex items-center gap-1 hover:bg-background transition-colors cursor-pointer"
                        >
                          <span>{color.hex}</span>
                          <Copy className="size-2.5" />
                        </button>

                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-1.5 py-0.5 bg-background/90 shadow-xs ${
                            isActive
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-zinc-500/40 text-zinc-500"
                          }`}
                        >
                          {color.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-foreground block truncate">
                            {color.name}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                            {color.code}
                          </span>
                        </div>

                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: color.id,
                              name: color.name,
                              code: color.code,
                              hex: color.hex,
                              currentStatus: color.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(color.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(color)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Swatch
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <ColorFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingColor}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <ColorStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        color={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
