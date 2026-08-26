"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { HierarchyLevel, EntityStatus, RootCategory } from "@/lib/types/category";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import { cn } from "@/lib/utils";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  LayoutGrid,
  ListFilter,
} from "lucide-react";

export default function RootCategoriesPage() {
  const {
    rootCategories,
    addRootCategory,
    updateRootCategory,
    toggleStatus,
  } = useCategoryContext();

  const [searchQuery, setSearchQuery] = React.useState("");
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

  const handleOpenCreate = () => {
    setEditingItem({
      level: "root",
      rootCategoryId: "",
      categoryId: "",
      name: "",
      slug: "",
      code: "",
      description: "",
      imageUrl: "",
      bannerUrl: "",
      displayOrder: rootCategories.length + 1,
      status: "active",
    });
    setSheetOpen(true);
  };

  const handleOpenEdit = (root: RootCategory) => {
    setEditingItem({
      id: root.id,
      level: "root",
      name: root.name,
      slug: root.slug,
      code: root.code,
      description: root.description,
      imageUrl: root.imageUrl,
      bannerUrl: root.bannerUrl,
      displayOrder: root.displayOrder,
      status: root.status,
    });
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: UnifiedCategoryFormValues, editId?: string) => {
    if (editId) {
      updateRootCategory(editId, data);
    } else {
      addRootCategory(data);
    }
  };

  const filteredRoots = React.useMemo(() => {
    if (!searchQuery.trim()) return rootCategories;
    const q = searchQuery.toLowerCase();
    return rootCategories.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
    );
  }, [rootCategories, searchQuery]);

  const totalSkus = rootCategories.reduce(
    (acc, r) =>
      acc +
      r.categories.reduce(
        (cAcc, c) => cAcc + c.subcategories.reduce((sAcc, s) => sAcc + s.productCount, 0),
        0
      ),
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
                Root Categories (Tier 1)
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {rootCategories.length} Departments
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Top-level merchandising classifications (Ready-to-Wear, Footwear, Leather Goods, Runway Archive).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Root Category
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Root Classifications</span>
              <FolderTree className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {rootCategories.length}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {rootCategories.filter((r) => r.status === "active").length} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Product Categories Mapped</span>
              <Sparkles className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {rootCategories.reduce((acc, r) => acc + r.categories.length, 0)}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Tier 2 Children
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Assigned SKUs</span>
              <Layers className="size-4" />
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
        </div>

        {/* Toolbar: Search + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search root category name, SKU code (e.g. RTW), slug..."
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

          <div className="flex items-center gap-1.5 border border-border p-0.5 rounded-xs bg-background">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("table")}
              className="h-7 text-xs px-2.5 gap-1.5"
            >
              <ListFilter className="size-3.5" /> Data Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("grid")}
              className="h-7 text-xs px-2.5 gap-1.5"
            >
              <LayoutGrid className="size-3.5" /> Grid Cards
            </Button>
          </div>
        </div>

        {/* Content: Grid or Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRoots.map((root) => {
              const rootSkus = root.categories.reduce(
                (sum, c) => sum + c.subcategories.reduce((sSum, s) => sSum + s.productCount, 0),
                0
              );
              const isActive = root.status === "active";

              return (
                <Card
                  key={root.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-32 w-full bg-muted/20 border-b border-border overflow-hidden">
                      {root.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={root.imageUrl}
                          alt={root.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <FolderTree className="size-8 stroke-1" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <Badge className="text-xs font-mono uppercase bg-background/90 text-foreground border border-border">
                          {root.code}
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
                          {root.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: root.id,
                              name: root.name,
                              level: "root",
                              currentStatus: root.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    <CardHeader className="p-3 px-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {root.name}
                        </CardTitle>
                        <span className="text-xs font-mono text-muted-foreground">
                          /{root.slug}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                        {root.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-3 px-3.5 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/60 pt-2">
                        <span>Child Categories: <strong className="text-foreground">{root.categories.length}</strong></span>
                        <span>SKUs: <strong className="text-foreground">{rootSkus}</strong></span>
                      </div>

                      {/* Categories List */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {root.categories.map((c) => (
                          <span
                            key={c.id}
                            className="text-[11px] font-mono px-1.5 py-0.5 border border-border rounded-xs text-muted-foreground bg-muted/10"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(root)}
                      className="h-7.5 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Root
                    </Button>

                    <Link
                      href="/categories/category"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7.5 px-2.5 border-border")}
                    >
                      View Categories <ArrowRight className="size-3 ml-1" />
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
                  <TableHead className="h-9 text-xs">Department Classification</TableHead>
                  <TableHead className="w-[100px] h-9 text-xs">SKU Prefix</TableHead>
                  <TableHead className="w-[120px] h-9 text-xs">URL Slug</TableHead>
                  <TableHead className="w-[110px] text-right h-9 text-xs">Categories</TableHead>
                  <TableHead className="w-[110px] text-right h-9 text-xs">Total SKUs</TableHead>
                  <TableHead className="w-[130px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoots.map((root) => {
                  const rootSkus = root.categories.reduce(
                    (sum, c) => sum + c.subcategories.reduce((sSum, s) => sSum + s.productCount, 0),
                    0
                  );
                  const isActive = root.status === "active";

                  return (
                    <TableRow key={root.id} className="border-b border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-8 rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                            {root.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={root.imageUrl}
                                alt={root.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <FolderTree className="size-3.5 text-muted-foreground stroke-1" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground">{root.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                              {root.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                        {root.code}
                      </TableCell>

                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                        /{root.slug}
                      </TableCell>

                      <TableCell className="text-right py-2.5 font-mono text-sm tabular-nums text-foreground">
                        {root.categories.length}
                      </TableCell>

                      <TableCell className="text-right py-2.5 font-mono text-sm tabular-nums text-foreground">
                        {rootSkus}
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
                            {root.status}
                          </Badge>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => {
                              setTargetToggleItem({
                                id: root.id,
                                name: root.name,
                                level: "root",
                                currentStatus: root.status,
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
                          onClick={() => handleOpenEdit(root)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit Root Category"
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
