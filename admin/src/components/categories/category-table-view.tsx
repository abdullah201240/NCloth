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
    <div className="space-y-2">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU code, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 text-xs h-7"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 size-5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-2.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Level Filter */}
          <Select
            value={levelFilter}
            onValueChange={(val) => setLevelFilter(val || "all")}
          >
            <SelectTrigger className="h-7 text-xs w-[130px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers (3 Levels)</SelectItem>
              <SelectItem value="root">Tier 1 • Roots</SelectItem>
              <SelectItem value="category">Tier 2 • Categories</SelectItem>
              <SelectItem value="subcategory">Tier 3 • Subcategories</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="h-7 text-xs w-[110px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Component */}
      <div className="border border-border rounded-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-background">
              <TableHead className="w-[110px] h-8 text-[11px]">Tier Level</TableHead>
              <TableHead className="h-8 text-[11px]">Classification Name</TableHead>
              <TableHead className="w-[90px] h-8 text-[11px]">SKU Code</TableHead>
              <TableHead className="w-[150px] h-8 text-[11px]">Parent Relation</TableHead>
              <TableHead className="w-[80px] text-right h-8 text-[11px]">Items</TableHead>
              <TableHead className="w-[120px] text-right h-8 text-[11px]">Status</TableHead>
              <TableHead className="w-[50px] text-center h-8 text-[11px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                  No hierarchy entries match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const isActive = item.status === "active";

                return (
                  <TableRow key={item.id} className="border-b border-border/60 hover:bg-muted/30">
                    {/* Level */}
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase font-mono px-1 py-0 border-border ${
                          item.level === "root"
                            ? "bg-foreground text-background font-medium"
                            : item.level === "category"
                            ? "bg-muted text-foreground"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        {item.level === "root" && <FolderTree className="size-2 mr-1 inline" />}
                        {item.level === "category" && <Folder className="size-2 mr-1 inline" />}
                        {item.level === "subcategory" && <Tag className="size-2 mr-1 inline" />}
                        {item.level}
                      </Badge>
                    </TableCell>

                    {/* Name & Slug */}
                    <TableCell className="py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          /{item.slug}
                        </span>
                      </div>
                    </TableCell>

                    {/* Code */}
                    <TableCell className="py-1.5">
                      <span className="font-mono text-xs font-medium text-foreground">
                        {item.code}
                      </span>
                    </TableCell>

                    {/* Parent */}
                    <TableCell className="py-1.5">
                      <span className="text-xs text-muted-foreground">
                        {item.parentName ? (
                          <>
                            <span className="text-[9px] uppercase font-mono block text-muted-foreground/70">
                              Under {item.rootName === item.parentName ? "Root" : "Category"}
                            </span>
                            {item.parentName}
                          </>
                        ) : (
                          <span className="font-mono text-[10px] italic text-muted-foreground/60">
                            Root Anchor
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Items */}
                    <TableCell className="text-right tabular-nums text-xs text-muted-foreground font-mono py-1.5">
                      {item.level === "subcategory" ? `${item.itemCount} SKUs` : `${item.itemCount} nodes`}
                    </TableCell>

                    {/* Status & Switch */}
                    <TableCell className="text-right py-1.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[8px] uppercase font-mono px-1 py-0 ${
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
                    <TableCell className="text-center py-1.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onEdit(item)}
                        className="size-6 text-muted-foreground hover:text-foreground"
                        title="Edit entry"
                      >
                        <Edit2 className="size-2.5" />
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
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
        <span>Showing {filteredData.length} of {data.length} nodes</span>
        <span>Zero-Delete Enforced</span>
      </div>
    </div>
  );
}
