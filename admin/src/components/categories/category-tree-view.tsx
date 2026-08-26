"use client";

import * as React from "react";
import { RootCategory, HierarchyLevel, EntityStatus } from "@/lib/types/category";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  FolderTree,
  Folder,
  Tag,
  Package,
} from "lucide-react";

interface CategoryTreeViewProps {
  data: RootCategory[];
  onEdit: (item: {
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
  }) => void;
  onAddChild: (level: HierarchyLevel, rootId?: string, categoryId?: string) => void;
  onRequestStatusToggle: (item: {
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  }) => void;
}

export function CategoryTreeView({
  data,
  onEdit,
  onAddChild,
  onRequestStatusToggle,
}: CategoryTreeViewProps) {
  const [collapsedRoots, setCollapsedRoots] = React.useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>({});

  const toggleRootCollapse = (id: string) => {
    setCollapsedRoots((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategoryCollapse = (id: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (data.length === 0) {
    return (
      <div className="border border-border p-10 text-center rounded-xs space-y-3">
        <FolderTree className="size-8 mx-auto text-muted-foreground stroke-1" />
        <p className="text-sm font-medium text-foreground">No Root Categories Found</p>
        <p className="text-xs text-muted-foreground">
          Start by creating your primary root classification such as Ready-To-Wear, Footwear, or Accessories.
        </p>
        <Button size="sm" onClick={() => onAddChild("root")} className="h-8 text-xs">
          <Plus className="size-3.5 mr-1" /> Create Root Category
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((root) => {
        const isRootCollapsed = !!collapsedRoots[root.id];
        const isRootActive = root.status === "active";
        const totalSubcategories = root.categories.reduce(
          (acc, c) => acc + c.subcategories.length,
          0
        );

        return (
          <Card key={root.id} className="border border-border rounded-xs overflow-hidden">
            {/* Root Header */}
            <CardHeader className="p-3 px-3.5 bg-background border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Left: Collapse toggle, Icon, Title, Badges */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => toggleRootCollapse(root.id)}
                    className="size-6 text-muted-foreground hover:text-foreground"
                  >
                    {isRootCollapsed ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>

                  <FolderTree className="size-4 text-foreground shrink-0" />

                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <CardTitle className="text-sm font-medium text-foreground truncate">
                      {root.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                      {root.code}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">/{root.slug}</span>
                  </div>
                </div>

                {/* Right: Counters, Actions, Status Toggle */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span>{root.categories.length} Categories</span>
                    <span>•</span>
                    <span>{totalSubcategories} Subcategories</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAddChild("category", root.id)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Plus className="size-3 mr-1" /> Category
                    </Button>

                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        onEdit({
                          id: root.id,
                          level: "root",
                          name: root.name,
                          slug: root.slug,
                          code: root.code,
                          description: root.description,
                          displayOrder: root.displayOrder,
                          status: root.status,
                        })
                      }
                      className="size-7 border-border"
                      title="Edit Root Category"
                    >
                      <Edit2 className="size-3 text-muted-foreground" />
                    </Button>

                    <div className="h-4 w-px bg-border mx-1" />

                    {/* Status Badge & Switch */}
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                          isRootActive
                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                            : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                        }`}
                      >
                        {root.status}
                      </Badge>
                      <Switch
                        checked={isRootActive}
                        onCheckedChange={() =>
                          onRequestStatusToggle({
                            id: root.id,
                            name: root.name,
                            level: "root",
                            currentStatus: root.status,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {root.description && (
                <p className="text-xs text-muted-foreground mt-1 pl-8">
                  {root.description}
                </p>
              )}
            </CardHeader>

            {/* Categories & Subcategories (Tree Content) */}
            {!isRootCollapsed && (
              <CardContent className="p-3 space-y-3 bg-background">
                {root.categories.length === 0 ? (
                  <div className="p-5 text-center border border-dashed border-border rounded-xs">
                    <p className="text-xs text-muted-foreground mb-2">
                      No categories created under {root.name} yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddChild("category", root.id)}
                      className="h-7 text-xs px-2.5"
                    >
                      <Plus className="size-3 mr-1" /> Add Category
                    </Button>
                  </div>
                ) : (
                  root.categories.map((cat) => {
                    const isCatCollapsed = !!collapsedCategories[cat.id];
                    const isCatActive = cat.status === "active";

                    return (
                      <div
                        key={cat.id}
                        className="border border-border/80 rounded-xs overflow-hidden ml-2 sm:ml-4"
                      >
                        {/* Tier 2 Category Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 px-3 bg-background border-b border-border/60 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => toggleCategoryCollapse(cat.id)}
                              className="size-5 text-muted-foreground hover:text-foreground"
                            >
                              {isCatCollapsed ? (
                                <ChevronRight className="size-3.5" />
                              ) : (
                                <ChevronDown className="size-3.5" />
                              )}
                            </Button>

                            <Folder className="size-4 text-foreground shrink-0" />

                            <span className="text-sm font-medium text-foreground truncate">
                              {cat.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono border-border px-1.5 py-0"
                            >
                              {cat.code}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">
                              /{cat.slug}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs font-mono text-muted-foreground">
                              {cat.subcategories.length} subs
                            </span>

                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => onAddChild("subcategory", root.id, cat.id)}
                              className="h-6 text-xs px-2 border-border"
                            >
                              <Plus className="size-2.5 mr-1" /> Sub
                            </Button>

                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() =>
                                onEdit({
                                  id: cat.id,
                                  level: "category",
                                  rootCategoryId: root.id,
                                  name: cat.name,
                                  slug: cat.slug,
                                  code: cat.code,
                                  description: cat.description,
                                  displayOrder: cat.displayOrder,
                                  status: cat.status,
                                })
                              }
                              className="size-6 border-border"
                              title="Edit Category"
                            >
                              <Edit2 className="size-2.5 text-muted-foreground" />
                            </Button>

                            <div className="flex items-center gap-1.5 ml-1">
                              <Badge
                                variant="outline"
                                className={`text-xs uppercase font-mono px-1.5 py-0 ${
                                  isCatActive
                                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                    : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                                }`}
                              >
                                {cat.status}
                              </Badge>
                              <Switch
                                checked={isCatActive}
                                onCheckedChange={() =>
                                  onRequestStatusToggle({
                                    id: cat.id,
                                    name: cat.name,
                                    level: "category",
                                    currentStatus: cat.status,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tier 3 Subcategories Grid */}
                        {!isCatCollapsed && (
                          <div className="p-3 bg-background">
                            {cat.subcategories.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic px-2 py-1">
                                No subcategories yet.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {cat.subcategories.map((sub) => {
                                  const isSubActive = sub.status === "active";
                                  return (
                                    <div
                                      key={sub.id}
                                      className="border border-border/70 p-2.5 rounded-xs flex flex-col justify-between gap-2 hover:border-border transition-colors bg-background"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <Tag className="size-3 text-muted-foreground shrink-0" />
                                          <span className="text-sm font-medium text-foreground truncate">
                                            {sub.name}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-mono shrink-0 border-border px-1.5 py-0"
                                        >
                                          {sub.code}
                                        </Badge>
                                      </div>

                                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1.5 border-t border-border/40">
                                        <div className="flex items-center gap-1.5">
                                          <Package className="size-3.5 text-muted-foreground" />
                                          <span>{sub.productCount} SKUs</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                              onEdit({
                                                id: sub.id,
                                                level: "subcategory",
                                                rootCategoryId: root.id,
                                                categoryId: cat.id,
                                                name: sub.name,
                                                slug: sub.slug,
                                                code: sub.code,
                                                description: sub.description,
                                                displayOrder: sub.displayOrder,
                                                status: sub.status,
                                              })
                                            }
                                            className="size-5 p-0 hover:text-foreground"
                                            title="Edit Subcategory"
                                          >
                                            <Edit2 className="size-3" />
                                          </Button>

                                          <Badge
                                            variant="outline"
                                            className={`text-xs uppercase px-1.5 py-0 ${
                                              isSubActive
                                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                                : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                                            }`}
                                          >
                                            {sub.status}
                                          </Badge>

                                          <Switch
                                            checked={isSubActive}
                                            onCheckedChange={() =>
                                              onRequestStatusToggle({
                                                id: sub.id,
                                                name: sub.name,
                                                level: "subcategory",
                                                currentStatus: sub.status,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
