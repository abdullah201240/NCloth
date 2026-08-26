"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { CategoryTreeView } from "@/components/categories/category-tree-view";
import { CategoryTableView } from "@/components/categories/category-table-view";
import { CategoryFormSheet } from "@/components/categories/category-form-sheet";
import { StatusToggleDialog } from "@/components/categories/status-toggle-dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  initialRootCategories,
  flattenHierarchy,
} from "@/lib/stores/category-store";
import {
  RootCategory,
  Category,
  Subcategory,
  CategoryFlatItem,
  HierarchyLevel,
  EntityStatus,
} from "@/lib/types/category";
import { UnifiedCategoryFormValues } from "@/lib/validations/category";
import {
  FolderTree,
  Folder,
  Tag,
  Plus,
  Layers,
  ListFilter,
} from "lucide-react";

export default function CategoriesPage() {
  const [rootCategories, setRootCategories] = React.useState<RootCategory[]>(initialRootCategories);
  const [activeTab, setActiveTab] = React.useState<string>("tree");

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

  // Flattened records for table view
  const flatItems = React.useMemo(() => {
    return flattenHierarchy(rootCategories);
  }, [rootCategories]);

  // Statistics
  const stats = React.useMemo(() => {
    const totalRoots = rootCategories.length;
    const activeRoots = rootCategories.filter((r) => r.status === "active").length;

    let totalCats = 0;
    let activeCats = 0;
    let totalSubs = 0;
    let activeSubs = 0;
    let totalSkus = 0;

    rootCategories.forEach((r) => {
      totalCats += r.categories.length;
      activeCats += r.categories.filter((c) => c.status === "active").length;
      r.categories.forEach((c) => {
        totalSubs += c.subcategories.length;
        activeSubs += c.subcategories.filter((s) => s.status === "active").length;
        c.subcategories.forEach((s) => {
          totalSkus += s.productCount;
        });
      });
    });

    return {
      totalRoots,
      activeRoots,
      totalCats,
      activeCats,
      totalSubs,
      activeSubs,
      totalSkus,
    };
  }, [rootCategories]);

  // Open creation sheet with preset level/parents
  const handleAddChild = (level: HierarchyLevel, rootId?: string, categoryId?: string) => {
    setEditingItem({
      level,
      rootCategoryId: rootId || "",
      categoryId: categoryId || "",
      name: "",
      slug: "",
      code: "",
      description: "",
      displayOrder: 1,
      status: "active",
    });
    setSheetOpen(true);
  };

  // Open edit sheet
  const handleEdit = (item: {
    id: string;
    level: HierarchyLevel;
    rootCategoryId?: string;
    categoryId?: string;
    name: string;
    slug: string;
    code: string;
    description?: string;
    displayOrder: number;
    status: EntityStatus;
  }) => {
    setEditingItem(item);
    setSheetOpen(true);
  };

  // Flat item edit from table
  const handleFlatEdit = (flatItem: CategoryFlatItem) => {
    setEditingItem({
      id: flatItem.id,
      level: flatItem.level,
      rootCategoryId: flatItem.rootId || "",
      categoryId: flatItem.parentId || "",
      name: flatItem.name,
      slug: flatItem.slug,
      code: flatItem.code,
      displayOrder: flatItem.displayOrder,
      status: flatItem.status,
    });
    setSheetOpen(true);
  };

  // Trigger Status Toggle confirmation dialog (Zero Delete)
  const handleRequestStatusToggle = (item: {
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  }) => {
    setTargetToggleItem(item);
    setToggleDialogOpen(true);
  };

  // Commit Status Toggle
  const handleConfirmStatusToggle = (
    id: string,
    newStatus: EntityStatus,
    level: HierarchyLevel
  ) => {
    const now = new Date().toISOString();
    setRootCategories((prev) => {
      if (level === "root") {
        return prev.map((root) =>
          root.id === id ? { ...root, status: newStatus, updatedAt: now } : root
        );
      }
      if (level === "category") {
        return prev.map((root) => ({
          ...root,
          categories: root.categories.map((cat) =>
            cat.id === id ? { ...cat, status: newStatus, updatedAt: now } : cat
          ),
        }));
      }
      if (level === "subcategory") {
        return prev.map((root) => ({
          ...root,
          categories: root.categories.map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.map((sub) =>
              sub.id === id ? { ...sub, status: newStatus, updatedAt: now } : sub
            ),
          })),
        }));
      }
      return prev;
    });
  };

  // Submit Category Form (Create or Update)
  const handleFormSubmit = (data: UnifiedCategoryFormValues, editId?: string) => {
    const now = new Date().toISOString();

    setRootCategories((prev) => {
      // 1. Root Category
      if (data.level === "root") {
        if (editId) {
          return prev.map((root) =>
            root.id === editId
              ? {
                  ...root,
                  name: data.name,
                  slug: data.slug,
                  code: data.code,
                  description: data.description,
                  displayOrder: data.displayOrder,
                  status: data.status,
                  updatedAt: now,
                }
              : root
          );
        } else {
          const newRoot: RootCategory = {
            id: `root-${Date.now()}`,
            name: data.name,
            slug: data.slug,
            code: data.code,
            description: data.description,
            displayOrder: data.displayOrder,
            status: data.status,
            categories: [],
            createdAt: now,
            updatedAt: now,
          };
          return [...prev, newRoot];
        }
      }

      // 2. Category
      if (data.level === "category") {
        if (editId) {
          return prev.map((root) => ({
            ...root,
            categories: root.categories.map((cat) =>
              cat.id === editId
                ? {
                    ...cat,
                    name: data.name,
                    slug: data.slug,
                    code: data.code,
                    description: data.description,
                    displayOrder: data.displayOrder,
                    status: data.status,
                    updatedAt: now,
                  }
                : cat
            ),
          }));
        } else {
          const newCat: Category = {
            id: `cat-${Date.now()}`,
            rootCategoryId: data.rootCategoryId,
            name: data.name,
            slug: data.slug,
            code: data.code,
            description: data.description,
            displayOrder: data.displayOrder,
            status: data.status,
            subcategories: [],
            createdAt: now,
            updatedAt: now,
          };
          return prev.map((root) =>
            root.id === data.rootCategoryId
              ? { ...root, categories: [...root.categories, newCat] }
              : root
          );
        }
      }

      // 3. Subcategory
      if (data.level === "subcategory") {
        if (editId) {
          return prev.map((root) => ({
            ...root,
            categories: root.categories.map((cat) => ({
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === editId
                  ? {
                      ...sub,
                      name: data.name,
                      slug: data.slug,
                      code: data.code,
                      description: data.description,
                      displayOrder: data.displayOrder,
                      status: data.status,
                      updatedAt: now,
                    }
                  : sub
              ),
            })),
          }));
        } else {
          const newSub: Subcategory = {
            id: `sub-${Date.now()}`,
            categoryId: data.categoryId,
            rootCategoryId: data.rootCategoryId,
            name: data.name,
            slug: data.slug,
            code: data.code,
            description: data.description,
            displayOrder: data.displayOrder,
            status: data.status,
            productCount: 0,
            createdAt: now,
            updatedAt: now,
          };
          return prev.map((root) => ({
            ...root,
            categories: root.categories.map((cat) =>
              cat.id === data.categoryId
                ? { ...cat, subcategories: [...cat.subcategories, newSub] }
                : cat
            ),
          }));
        }
      }

      return prev;
    });
  };

  return (
    <AdminShell
      onQuickAction={() => handleAddChild("root")}
      quickActionLabel="+ New Root"
    >
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Category Taxonomy & Hierarchy
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                3 Tiers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Define Root Classifications, Product Categories, and Subcategories with SKU prefix mappings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddChild("category")}
              className="text-xs h-8 px-2.5 border-border"
            >
              <Plus className="size-3.5 mr-1" /> Category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddChild("subcategory")}
              className="text-xs h-8 px-2.5 border-border"
            >
              <Plus className="size-3.5 mr-1" /> Subcategory
            </Button>
            <Button
              size="sm"
              onClick={() => handleAddChild("root")}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Root Node
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Tier 1 • Roots</span>
              <FolderTree className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalRoots}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeRoots} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Tier 2 • Categories</span>
              <Folder className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalCats}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeCats} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Tier 3 • Subcategories</span>
              <Tag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSubs}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeSubs} Active
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs">
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
          </Card>
        </div>

        {/* View Switcher: Tree vs Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <TabsList variant="line" className="h-9">
              <TabsTrigger value="tree" className="text-xs h-8 px-3">
                <FolderTree className="size-3.5 mr-1.5" /> Hierarchy Tree View
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs h-8 px-3">
                <ListFilter className="size-3.5 mr-1.5" /> Data Table View
              </TabsTrigger>
            </TabsList>

            <div className="text-xs font-mono text-muted-foreground hidden sm:block">
              Total Hierarchy Nodes: <strong className="text-foreground">{flatItems.length}</strong>
            </div>
          </div>

          {/* Tree View Content */}
          <TabsContent value="tree">
            <CategoryTreeView
              data={rootCategories}
              onEdit={handleEdit}
              onAddChild={handleAddChild}
              onRequestStatusToggle={handleRequestStatusToggle}
            />
          </TabsContent>

          {/* Table View Content */}
          <TabsContent value="table">
            <CategoryTableView
              data={flatItems}
              onEdit={handleFlatEdit}
              onRequestStatusToggle={handleRequestStatusToggle}
            />
          </TabsContent>
        </Tabs>
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
        onConfirm={handleConfirmStatusToggle}
      />
    </AdminShell>
  );
}
