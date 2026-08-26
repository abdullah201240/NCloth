"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryTreeView } from "@/components/categories/category-tree-view";
import { CategoryFormSheet } from "@/components/categories/category-form-sheet";
import { StatusToggleDialog } from "@/components/categories/status-toggle-dialog";
import { useCategoryContext } from "@/lib/stores/category-context";
import { HierarchyLevel, EntityStatus } from "@/lib/types/category";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import { cn } from "@/lib/utils";
import {
  FolderTree,
  Folder,
  Tag,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function CategoryDashboardPage() {
  const {
    rootCategories,
    stats,
    addRootCategory,
    updateRootCategory,
    addCategory,
    updateCategory,
    addSubcategory,
    updateSubcategory,
    toggleStatus,
  } = useCategoryContext();

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

  const handleAddChild = (level: HierarchyLevel, rootId?: string, categoryId?: string) => {
    setEditingItem({
      level,
      rootCategoryId: rootId || "",
      categoryId: categoryId || "",
      name: "",
      slug: "",
      code: "",
      description: "",
      imageUrl: "",
      bannerUrl: "",
      displayOrder: 1,
      status: "active",
    });
    setSheetOpen(true);
  };

  const handleEdit = (item: {
    id: string;
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
  }) => {
    setEditingItem(item);
    setSheetOpen(true);
  };

  const handleRequestStatusToggle = (item: {
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  }) => {
    setTargetToggleItem(item);
    setToggleDialogOpen(true);
  };

  const handleFormSubmit = (data: UnifiedCategoryFormValues, editId?: string) => {
    if (data.level === "root") {
      if (editId) updateRootCategory(editId, data);
      else addRootCategory(data);
    } else if (data.level === "category") {
      if (editId) updateCategory(editId, data);
      else addCategory(data);
    } else if (data.level === "subcategory") {
      if (editId) updateSubcategory(editId, data);
      else addSubcategory(data);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Category Management Dashboard
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                Full Taxonomy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              High-level overview of Root classifications, Product categories, Subcategories, and SKU distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/categories/root"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8 px-2.5 border-border")}
            >
              <FolderTree className="size-3.5 mr-1" /> Root Nodes
            </Link>
            <Link
              href="/categories/category"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8 px-2.5 border-border")}
            >
              <Folder className="size-3.5 mr-1" /> Categories
            </Link>
            <Link
              href="/categories/subcategory"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8 px-2.5 border-border")}
            >
              <Tag className="size-3.5 mr-1" /> Subcategories
            </Link>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/categories/root" className="block group">
            <Card className="p-3.5 border border-border rounded-xs bg-background hover:border-foreground/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Tier 1 • Roots</span>
                <FolderTree className="size-4 group-hover:text-foreground transition-colors" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                  {stats.totalRoots}
                </span>
                <span className="text-xs font-mono text-emerald-600 font-medium">
                  {stats.activeRoots} Active
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Manage Roots</span>
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link href="/categories/category" className="block group">
            <Card className="p-3.5 border border-border rounded-xs bg-background hover:border-foreground/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Tier 2 • Categories</span>
                <Folder className="size-4 group-hover:text-foreground transition-colors" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                  {stats.totalCats}
                </span>
                <span className="text-xs font-mono text-emerald-600 font-medium">
                  {stats.activeCats} Active
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Manage Categories</span>
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link href="/categories/subcategory" className="block group">
            <Card className="p-3.5 border border-border rounded-xs bg-background hover:border-foreground/40 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Tier 3 • Subcategories</span>
                <Tag className="size-4 group-hover:text-foreground transition-colors" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                  {stats.totalSubs}
                </span>
                <span className="text-xs font-mono text-emerald-600 font-medium">
                  {stats.activeSubs} Active
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Manage Subcategories</span>
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active SKUs Assigned</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSkus}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                100% Mapped
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>Zero-Delete Enforced</span>
            </div>
          </Card>
        </div>

        {/* 3 Department Modules Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Taxonomy Departments & Merchandising Divisions
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {rootCategories.length} Root Classifications Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rootCategories.map((root) => {
              const rootSkus = root.categories.reduce(
                (sum, c) => sum + c.subcategories.reduce((sSum, s) => sSum + s.productCount, 0),
                0
              );

              return (
                <Card key={root.id} className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background">
                  <div>
                    {/* Cover Photography */}
                    <div className="relative h-28 w-full bg-muted/20 border-b border-border overflow-hidden">
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
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-1.5 py-0.5 bg-background/90 ${
                            root.status === "active"
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-zinc-500/40 text-zinc-500"
                          }`}
                        >
                          {root.status}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-3 px-3.5 space-y-1">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>{root.name}</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                        {root.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-3 px-3.5 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/60 pt-2">
                        <span>Categories: <strong className="text-foreground">{root.categories.length}</strong></span>
                        <span>SKUs: <strong className="text-foreground">{rootSkus}</strong></span>
                      </div>

                      {/* Sub-categories chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {root.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[11px] font-mono px-1.5 py-0.5 border border-border/80 rounded-xs text-muted-foreground bg-muted/10"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {root.categories.length > 3 && (
                          <span className="text-[11px] font-mono px-1 py-0.5 text-muted-foreground">
                            +{root.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center gap-1.5">
                    <Link
                      href="/categories/category"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs h-7.5 border-border")}
                    >
                      Explore Categories <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Global Taxonomy Visual Tree */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FolderTree className="size-4 text-muted-foreground" />
              Unified Hierarchy Visual Navigator
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                onClick={() => handleAddChild("root")}
                className="text-xs h-7 px-2.5"
              >
                <Plus className="size-3 mr-1" /> Add Node
              </Button>
            </div>
          </div>

          <CategoryTreeView
            data={rootCategories}
            onEdit={handleEdit}
            onAddChild={handleAddChild}
            onRequestStatusToggle={handleRequestStatusToggle}
          />
        </div>
      </div>

      {/* Creation & Edit Sheet */}
      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        rootCategories={rootCategories}
        initialData={editingItem}
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
