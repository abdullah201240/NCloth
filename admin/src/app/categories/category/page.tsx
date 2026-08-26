"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { HierarchyLevel, EntityStatus, Category } from "@/lib/types/category";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import { cn } from "@/lib/utils";
import {
  Folder,
  Plus,
  Search,
  Edit2,
  X,
  ArrowRight,
  Layers,
  LayoutGrid,
  ListFilter,
  Tag,
} from "lucide-react";

export default function ProductCategoriesPage() {
  const {
    rootCategories,
    addCategory,
    updateCategory,
    toggleStatus,
  } = useCategoryContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [rootFilter, setRootFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

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

  // Flattened categories with parent Root information
  const allCategories = React.useMemo(() => {
    const list: (Category & { rootName: string; rootCode: string })[] = [];
    rootCategories.forEach((r) => {
      r.categories.forEach((c) => {
        list.push({
          ...c,
          rootName: r.name,
          rootCode: r.code,
        });
      });
    });
    return list;
  }, [rootCategories]);

  // Filtered categories
  const filteredCategories = React.useMemo(() => {
    return allCategories.filter((cat) => {
      if (rootFilter !== "all" && cat.rootCategoryId !== rootFilter) return false;
      if (statusFilter !== "all" && cat.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesSlug = cat.slug.toLowerCase().includes(q);
        const matchesCode = cat.code.toLowerCase().includes(q);
        const matchesRoot = cat.rootName.toLowerCase().includes(q);
        return matchesName || matchesSlug || matchesCode || matchesRoot;
      }
      return true;
    });
  }, [allCategories, rootFilter, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    const defaultRootId = rootFilter !== "all" ? rootFilter : rootCategories[0]?.id || "";
    setEditingItem({
      level: "category",
      rootCategoryId: defaultRootId,
      categoryId: "",
      name: "",
      slug: "",
      code: "",
      description: "",
      imageUrl: "",
      bannerUrl: "",
      displayOrder: allCategories.length + 1,
      status: "active",
    });
    setSheetOpen(true);
  };

  const handleOpenEdit = (cat: Category & { rootName: string }) => {
    setEditingItem({
      id: cat.id,
      level: "category",
      rootCategoryId: cat.rootCategoryId,
      categoryId: "",
      name: cat.name,
      slug: cat.slug,
      code: cat.code,
      description: cat.description,
      imageUrl: cat.imageUrl,
      bannerUrl: cat.bannerUrl,
      displayOrder: cat.displayOrder,
      status: cat.status,
    });
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: UnifiedCategoryFormValues, editId?: string) => {
    if (editId) {
      updateCategory(editId, data);
    } else {
      addCategory(data);
    }
  };

  const totalSubsCount = allCategories.reduce((acc, c) => acc + c.subcategories.length, 0);
  const totalSkusCount = allCategories.reduce(
    (acc, c) => acc + c.subcategories.reduce((sAcc, s) => sAcc + s.productCount, 0),
    0
  );

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Product Categories (Tier 2)
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {allCategories.length} Categories
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Mid-level product groups (Outerwear, Knitwear, Tailoring, Boots, Sneakers, Handbags) attached to Root departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Product Category
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Product Categories</span>
              <Folder className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {allCategories.length}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {allCategories.filter((c) => c.status === "active").length} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Subcategories Attached</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {totalSubsCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Tier 3 Nodes
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total SKUs Assigned</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {totalSkusCount}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                100% Active
              </Badge>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Root Filter + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search category name, SKU prefix (e.g. OTR), root parent..."
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
            {/* Root Parent Filter */}
            <Select value={rootFilter} onValueChange={(val) => setRootFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                {rootCategories.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name} ({r.code})
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
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* View Switcher */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("grid")}
                className="h-7 text-xs px-2"
                title="Grid Cards"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs px-2"
                title="Data Table"
              >
                <ListFilter className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content: Grid or Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((cat) => {
              const catSkus = cat.subcategories.reduce((sum, s) => sum + s.productCount, 0);
              const isActive = cat.status === "active";

              return (
                <Card
                  key={cat.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-28 w-full bg-muted/20 border-b border-border overflow-hidden">
                      {cat.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <Folder className="size-8 stroke-1" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <Badge className="text-xs font-mono uppercase bg-background/90 text-foreground border border-border">
                          {cat.code}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono bg-background/90 text-muted-foreground border-border">
                          {cat.rootCode}
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
                          {cat.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: cat.id,
                              name: cat.name,
                              level: "category",
                              currentStatus: cat.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    <CardHeader className="p-3 px-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {cat.name}
                        </CardTitle>
                        <span className="text-xs font-mono text-muted-foreground">
                          /{cat.slug}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <span>Parent Department:</span>
                        <strong className="text-foreground">{cat.rootName}</strong>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3 px-3.5 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/60 pt-2">
                        <span>Subcategories: <strong className="text-foreground">{cat.subcategories.length}</strong></span>
                        <span>SKUs: <strong className="text-foreground">{catSkus}</strong></span>
                      </div>

                      {/* Subcategory Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cat.subcategories.map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] font-mono px-1.5 py-0.5 border border-border rounded-xs text-muted-foreground bg-muted/10"
                          >
                            {s.name} ({s.productCount})
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(cat)}
                      className="h-7.5 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Category
                    </Button>

                    <Link
                      href="/categories/subcategory"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7.5 px-2.5 border-border")}
                    >
                      View Subcategories <ArrowRight className="size-3 ml-1" />
                    </Link>
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
                  <TableHead className="h-9 text-xs">Product Category</TableHead>
                  <TableHead className="w-[100px] h-9 text-xs">SKU Prefix</TableHead>
                  <TableHead className="w-[150px] h-9 text-xs">Department (Root)</TableHead>
                  <TableHead className="w-[120px] text-right h-9 text-xs">Subcategories</TableHead>
                  <TableHead className="w-[110px] text-right h-9 text-xs">Total SKUs</TableHead>
                  <TableHead className="w-[130px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => {
                  const catSkus = cat.subcategories.reduce((sum, s) => sum + s.productCount, 0);
                  const isActive = cat.status === "active";

                  return (
                    <TableRow key={cat.id} className="border-b border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-8 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                            {cat.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Folder className="size-3.5 text-muted-foreground stroke-1" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground">{cat.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">/{cat.slug}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                        {cat.code}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <Badge variant="outline" className="text-xs font-mono border-border">
                          {cat.rootName}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right py-2.5 font-mono text-sm tabular-nums text-foreground">
                        {cat.subcategories.length}
                      </TableCell>

                      <TableCell className="text-right py-2.5 font-mono text-sm tabular-nums text-foreground">
                        {catSkus}
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
                            {cat.status}
                          </Badge>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => {
                              setTargetToggleItem({
                                id: cat.id,
                                name: cat.name,
                                level: "category",
                                currentStatus: cat.status,
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
                          onClick={() => handleOpenEdit(cat)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit Category"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
