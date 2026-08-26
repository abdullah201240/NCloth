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
import { CategoryFormSheet } from "@/components/categories/category-form-sheet";
import { StatusToggleDialog } from "@/components/categories/status-toggle-dialog";
import { useCategoryContext } from "@/lib/stores/category-context";
import { HierarchyLevel, EntityStatus, Subcategory } from "@/lib/types/category";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  X,
  Layers,
  LayoutGrid,
  ListFilter,
  Package,
} from "lucide-react";

export default function SubcategoriesPage() {
  const {
    rootCategories,
    addSubcategory,
    updateSubcategory,
    toggleStatus,
  } = useCategoryContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [rootFilter, setRootFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<{
    id?: string;
    level: HierarchyLevel;
    rootCategoryId?: string;
    categoryId?: string;
    name: string;
    slug: string;
    code: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    displayOrder: number;
    status: EntityStatus;
  } | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  } | null>(null);

  // Flattened subcategories with full ancestry details
  const allSubcategories = React.useMemo(() => {
    const list: (Subcategory & {
      rootName: string;
      rootCode: string;
      categoryName: string;
      categoryCode: string;
    })[] = [];

    rootCategories.forEach((r) => {
      r.categories.forEach((c) => {
        c.subcategories.forEach((s) => {
          list.push({
            ...s,
            rootName: r.name,
            rootCode: r.code,
            categoryName: c.name,
            categoryCode: c.code,
          });
        });
      });
    });

    return list;
  }, [rootCategories]);

  // Categories available for current root filter
  const availableCategories = React.useMemo(() => {
    if (rootFilter === "all") {
      return rootCategories.flatMap((r) => r.categories);
    }
    const r = rootCategories.find((root) => root.id === rootFilter);
    return r ? r.categories : [];
  }, [rootCategories, rootFilter]);

  // Filtered subcategories
  const filteredSubcategories = React.useMemo(() => {
    return allSubcategories.filter((sub) => {
      if (rootFilter !== "all" && sub.rootCategoryId !== rootFilter) return false;
      if (categoryFilter !== "all" && sub.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(q);
        const matchesSlug = sub.slug.toLowerCase().includes(q);
        const matchesCode = sub.code.toLowerCase().includes(q);
        const matchesCategory = sub.categoryName.toLowerCase().includes(q);
        const matchesRoot = sub.rootName.toLowerCase().includes(q);
        return matchesName || matchesSlug || matchesCode || matchesCategory || matchesRoot;
      }
      return true;
    });
  }, [allSubcategories, rootFilter, categoryFilter, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    const defaultRootId = rootFilter !== "all" ? rootFilter : rootCategories[0]?.id || "";
    const defaultCatId =
      categoryFilter !== "all"
        ? categoryFilter
        : rootCategories.find((r) => r.id === defaultRootId)?.categories[0]?.id || "";

    setEditingItem({
      level: "subcategory",
      rootCategoryId: defaultRootId,
      categoryId: defaultCatId,
      name: "",
      slug: "",
      code: "",
      description: "",
      imageUrl: "",
      bannerUrl: "",
      displayOrder: allSubcategories.length + 1,
      status: "active",
    });
    setSheetOpen(true);
  };

  const handleOpenEdit = (
    sub: Subcategory & { rootName: string; categoryName: string }
  ) => {
    setEditingItem({
      id: sub.id,
      level: "subcategory",
      rootCategoryId: sub.rootCategoryId,
      categoryId: sub.categoryId,
      name: sub.name,
      slug: sub.slug,
      code: sub.code,
      description: sub.description,
      imageUrl: sub.imageUrl,
      bannerUrl: sub.bannerUrl,
      displayOrder: sub.displayOrder,
      status: sub.status,
    });
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: UnifiedCategoryFormValues, editId?: string) => {
    if (editId) {
      updateSubcategory(editId, data);
    } else {
      addSubcategory(data);
    }
  };

  const totalSkus = allSubcategories.reduce((sum, s) => sum + s.productCount, 0);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Subcategories (Tier 3)
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {allSubcategories.length} Granular Nodes
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct SKU product assignments (Overcoats, Trench, Cashmere Crewnecks, Chelsea Boots, Court Sneakers).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Subcategory
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Subcategories</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {allSubcategories.length}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {allSubcategories.filter((s) => s.status === "active").length} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Assigned SKUs</span>
              <Package className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {totalSkus}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                100% Routed
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Avg SKUs per Subcategory</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {allSubcategories.length > 0
                  ? (totalSkus / allSubcategories.length).toFixed(1)
                  : 0}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Optimal distribution
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Root Filter + Category Filter + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search subcategory name, SKU prefix (e.g. OTR-OVC), parent category..."
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
            {/* Root Parent Filter */}
            <Select
              value={rootFilter}
              onValueChange={(val) => {
                setRootFilter(val || "all");
                setCategoryFilter("all");
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="All Roots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Roots</SelectItem>
                {rootCategories.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val || "all")}
            >
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[110px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* View Switcher */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs px-2"
                title="Data Table"
              >
                <ListFilter className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("grid")}
                className="h-7 text-xs px-2"
                title="Grid Cards"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content: Table or Grid */}
        {viewMode === "table" ? (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-9 text-xs">Subcategory & Image</TableHead>
                  <TableHead className="w-[110px] h-9 text-xs">SKU Prefix</TableHead>
                  <TableHead className="w-[160px] h-9 text-xs">Parent Category</TableHead>
                  <TableHead className="w-[140px] h-9 text-xs">Department (Root)</TableHead>
                  <TableHead className="w-[100px] text-right h-9 text-xs">SKU Count</TableHead>
                  <TableHead className="w-[130px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                      No subcategories match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubcategories.map((sub) => {
                    const isActive = sub.status === "active";

                    return (
                      <TableRow key={sub.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative size-8 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                              {sub.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sub.imageUrl}
                                  alt={sub.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Tag className="size-3.5 text-muted-foreground stroke-1" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-foreground">{sub.name}</span>
                              <span className="text-xs font-mono text-muted-foreground">/{sub.slug}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                          {sub.code}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <span className="text-sm font-medium text-foreground">{sub.categoryName}</span>
                          <span className="text-xs font-mono text-muted-foreground block">
                            ({sub.categoryCode})
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Badge variant="outline" className="text-xs font-mono border-border">
                            {sub.rootName}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right py-2.5 font-mono text-sm tabular-nums text-foreground">
                          <div className="flex items-center justify-end gap-1.5">
                            <Package className="size-3.5 text-muted-foreground" />
                            <span>{sub.productCount} SKUs</span>
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
                              {sub.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: sub.id,
                                  name: sub.name,
                                  level: "subcategory",
                                  currentStatus: sub.status,
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
                            onClick={() => handleOpenEdit(sub)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Subcategory"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSubcategories.map((sub) => {
              const isActive = sub.status === "active";

              return (
                <div
                  key={sub.id}
                  className="border border-border rounded-xs p-3 flex flex-col justify-between gap-3 bg-background hover:border-foreground/30 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="relative size-12 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                        {sub.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Tag className="size-5 text-muted-foreground stroke-1" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {sub.name}
                          </span>
                          <Badge variant="outline" className="text-xs font-mono shrink-0 border-border">
                            {sub.code}
                          </Badge>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground block truncate">
                          /{sub.slug}
                        </span>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          Under: <strong className="text-foreground">{sub.categoryName}</strong> ({sub.rootCode})
                        </div>
                      </div>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Package className="size-3.5 text-muted-foreground" />
                      <span>{sub.productCount} SKUs Assigned</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(sub)}
                        className="size-6 border-border"
                        title="Edit Subcategory"
                      >
                        <Edit2 className="size-2.5" />
                      </Button>

                      <Badge
                        variant="outline"
                        className={`text-xs uppercase px-1.5 py-0 ${
                          isActive
                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                            : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                        }`}
                      >
                        {sub.status}
                      </Badge>

                      <Switch
                        checked={isActive}
                        onCheckedChange={() => {
                          setTargetToggleItem({
                            id: sub.id,
                            name: sub.name,
                            level: "subcategory",
                            currentStatus: sub.status,
                          });
                          setToggleDialogOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        rootCategories={rootCategories}
        initialData={editingItem}
        lockLevel={true}
        onSubmit={handleFormSubmit}
      />

      {/* Status Toggle Confirmation Dialog (Zero-Delete) */}
      <StatusToggleDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        item={targetToggleItem}
        onConfirm={(id, nextStatus, level) => toggleStatus(id, nextStatus, level)}
      />
    </AdminShell>
  );
}
