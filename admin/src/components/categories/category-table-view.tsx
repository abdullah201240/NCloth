"use client";

import * as React from "react";
import { CategoryFlatItem, HierarchyLevel, EntityStatus } from "@/lib/types/category";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit2, FolderTree, Folder, Tag, X } from "lucide-react";

interface CategoryTableViewProps {
  data: CategoryFlatItem[];
  onEdit: (item: CategoryFlatItem) => void;
  onRequestStatusToggle: (item: {
    id: string;
    name: string;
    level: HierarchyLevel;
    currentStatus: EntityStatus;
  }) => void;
}

export function CategoryTableView({
  data,
  onEdit,
  onRequestStatusToggle,
}: CategoryTableViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Level filter
      if (levelFilter !== "all" && item.level !== levelFilter) return false;

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesParent = item.parentName?.toLowerCase().includes(q) || false;
        return matchesName || matchesSlug || matchesCode || matchesParent;
      }

      return true;
    });
  }, [data, levelFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search classification name, SKU prefix code, slug..."
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
          {/* Level Filter */}
          <Select
            value={levelFilter}
            onValueChange={(val) => setLevelFilter(val || "all")}
          >
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Tiers (3 Levels)</SelectItem>
              <SelectItem value="root" className="text-xs">Tier 1 • Roots</SelectItem>
              <SelectItem value="category" className="text-xs">Tier 2 • Categories</SelectItem>
              <SelectItem value="subcategory" className="text-xs">Tier 3 • Subcategories</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="active" className="text-xs">Active Only</SelectItem>
              <SelectItem value="inactive" className="text-xs">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Component */}
      <div className="border border-border rounded-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-background">
              <TableHead className="w-[120px] h-9 text-xs">Tier Level</TableHead>
              <TableHead className="h-9 text-xs">Classification Name</TableHead>
              <TableHead className="w-[100px] h-9 text-xs">SKU Code</TableHead>
              <TableHead className="w-[160px] h-9 text-xs">Parent Relation</TableHead>
              <TableHead className="w-[90px] text-right h-9 text-xs">Items</TableHead>
              <TableHead className="w-[130px] text-right h-9 text-xs">Status</TableHead>
              <TableHead className="w-[60px] text-center h-9 text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                  No hierarchy entries match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const isActive = item.status === "active";

                return (
                  <TableRow key={item.id} className="border-b border-border/60 hover:bg-muted/30">
                    {/* Level */}
                    <TableCell className="py-2">
                      <Badge
                        variant="outline"
                        className={`text-xs uppercase font-mono px-1.5 py-0 border-border ${
                          item.level === "root"
                            ? "bg-foreground text-background font-medium"
                            : item.level === "category"
                            ? "bg-muted text-foreground"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        {item.level === "root" && <FolderTree className="size-2.5 mr-1 inline" />}
                        {item.level === "category" && <Folder className="size-2.5 mr-1 inline" />}
                        {item.level === "subcategory" && <Tag className="size-2.5 mr-1 inline" />}
                        {item.level}
                      </Badge>
                    </TableCell>

                    {/* Name & Slug */}
                    <TableCell className="py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          /{item.slug}
                        </span>
                      </div>
                    </TableCell>

                    {/* Code */}
                    <TableCell className="py-2">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {item.code}
                      </span>
                    </TableCell>

                    {/* Parent */}
                    <TableCell className="py-2">
                      <span className="text-sm text-muted-foreground">
                        {item.parentName ? (
                          <>
                            <span className="text-xs uppercase font-mono block text-muted-foreground/70">
                              Under {item.rootName === item.parentName ? "Root" : "Category"}
                            </span>
                            {item.parentName}
                          </>
                        ) : (
                          <span className="font-mono text-xs italic text-muted-foreground/60">
                            Root Anchor
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Items */}
                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground font-mono py-2">
                      {item.level === "subcategory" ? `${item.itemCount} SKUs` : `${item.itemCount} nodes`}
                    </TableCell>

                    {/* Status & Switch */}
                    <TableCell className="text-right py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                            isActive
                              ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                              : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                          }`}
                        >
                          {item.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() =>
                            onRequestStatusToggle({
                              id: item.id,
                              name: item.name,
                              level: item.level,
                              currentStatus: item.status,
                            })
                          }
                        />
                      </div>
                    </TableCell>

                    {/* Edit */}
                    <TableCell className="text-center py-2">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onEdit(item)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        title="Edit entry"
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

      {/* Record Counter */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Showing {filteredData.length} of {data.length} classification nodes</span>
        <span>Zero-Delete Enforced</span>
      </div>
    </div>
  );
}
