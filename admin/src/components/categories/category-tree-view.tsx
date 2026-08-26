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
      <div className="border border-border p-8 text-center rounded-xs space-y-2">
        <FolderTree className="size-6 mx-auto text-muted-foreground stroke-1" />
        <p className="text-xs font-medium text-foreground">No Root Categories Found</p>
        <p className="text-[11px] text-muted-foreground">
          Start by creating your primary root classification such as Ready-To-Wear, Footwear, or Accessories.
        </p>
        <Button size="xs" onClick={() => onAddChild("root")} className="h-7 text-xs">
          <Plus className="size-3 mr-1" /> Create Root Category
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
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
            <CardHeader className="p-2 px-3 bg-background border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Left: Collapse toggle, Icon, Title, Badges */}
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => toggleRootCollapse(root.id)}
                    className="size-5 text-muted-foreground hover:text-foreground"
                  >
                    {isRootCollapsed ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </Button>

                  <FolderTree className="size-3.5 text-foreground shrink-0" />

                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <CardTitle className="text-xs font-medium text-foreground truncate">
                      {root.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] font-mono border-border px-1 py-0">
                      {root.code}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">/{root.slug}</span>
                  </div>
                </div>

                {/* Right: Counters, Actions, Status Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <span>{root.categories.length} Cats</span>
                    <span>•</span>
                    <span>{totalSubcategories} Subs</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAddChild("category", root.id)}
                      className="h-6 text-[11px] px-2 border-border"
                    >
                      <Plus className="size-2.5 mr-0.5" /> Category
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
                      className="size-6 border-border"
                      title="Edit Root Category"
                    >
                      <Edit2 className="size-2.5 text-muted-foreground" />
                    </Button>

                    <div className="h-3 w-px bg-border mx-0.5" />

                    {/* Status Badge & Switch */}
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`text-[8px] uppercase font-mono px-1 py-0 ${
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
                <p className="text-[11px] text-muted-foreground mt-0.5 pl-7">
                  {root.description}
                </p>
              )}
            </CardHeader>

            {/* Categories & Subcategories (Tree Content) */}
            {!isRootCollapsed && (
              <CardContent className="p-2 space-y-2 bg-background">
                {root.categories.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-border rounded-xs">
                    <p className="text-[11px] text-muted-foreground mb-1.5">
                      No categories created under {root.name} yet.
                    </p>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAddChild("category", root.id)}
                      className="h-6 text-[11px] px-2"
                    >
                      <Plus className="size-2.5 mr-1" /> Add Category
                    </Button>
                  </div>
                ) : (
                  root.categories.map((cat) => {
                    const isCatCollapsed = !!collapsedCategories[cat.id];
                    const isCatActive = cat.status === "active";

                    return (
                      <div
                        key={cat.id}
                        className="border border-border/80 rounded-xs overflow-hidden ml-2 sm:ml-3"
                      >
                        {/* Tier 2 Category Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 px-2 bg-background border-b border-border/60 gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => toggleCategoryCollapse(cat.id)}
                              className="size-4 text-muted-foreground hover:text-foreground"
                            >
                              {isCatCollapsed ? (
                                <ChevronRight className="size-3" />
                              ) : (
                                <ChevronDown className="size-3" />
                              )}
                            </Button>

                            <Folder className="size-3 text-foreground shrink-0" />

                            <span className="text-xs font-medium text-foreground truncate">
                              {cat.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[8px] font-mono border-border px-1 py-0"
                            >
                              {cat.code}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              /{cat.slug}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <span className="text-[9px] font-mono text-muted-foreground">
                              {cat.subcategories.length} subs
                            </span>

                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => onAddChild("subcategory", root.id, cat.id)}
                              className="h-5 text-[10px] px-1.5 border-border"
                            >
                              <Plus className="size-2 mr-0.5" /> Sub
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
                              className="size-5 border-border"
                              title="Edit Category"
                            >
                              <Edit2 className="size-2 text-muted-foreground" />
                            </Button>

                            <div className="flex items-center gap-1 ml-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[8px] uppercase font-mono px-1 py-0 ${
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
                          <div className="p-2 bg-background">
                            {cat.subcategories.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground italic px-1 py-0.5">
                                No subcategories yet.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                {cat.subcategories.map((sub) => {
                                  const isSubActive = sub.status === "active";
                                  return (
                                    <div
                                      key={sub.id}
                                      className="border border-border/70 p-2 rounded-xs flex flex-col justify-between gap-1.5 hover:border-border transition-colors bg-background"
                                    >
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div className="flex items-center gap-1 min-w-0">
                                          <Tag className="size-2.5 text-muted-foreground shrink-0" />
                                          <span className="text-xs font-medium text-foreground truncate">
                                            {sub.name}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-[8px] font-mono shrink-0 border-border px-1 py-0"
                                        >
                                          {sub.code}
                                        </Badge>
                                      </div>

                                      <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                                        <div className="flex items-center gap-1">
                                          <Package className="size-2.5 text-muted-foreground" />
                                          <span>{sub.productCount} SKUs</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
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
                                            className="size-4 p-0 hover:text-foreground"
                                            title="Edit Subcategory"
                                          >
                                            <Edit2 className="size-2" />
                                          </Button>

                                          <Badge
                                            variant="outline"
                                            className={`text-[8px] uppercase px-1 py-0 ${
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
