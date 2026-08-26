"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { useBrands } from "@/lib/stores/brand-context";
import { Brand } from "@/lib/types/brand";
import { BrandFormValues } from "@/lib/validations/brand";
import { BrandFormSheet } from "@/components/brands/brand-form-sheet";
import { BrandStatusDialog } from "@/components/brands/brand-status-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Plus,
  Search,
  Table as TableIcon,
  LayoutGrid,
  Globe,
  ExternalLink,
  Sparkles,
  Edit2,
  CheckCircle2,
  Flag,
} from "lucide-react";

export default function BrandsPage() {
  const {
    brands,
    stats,
    addBrand,
    updateBrand,
    toggleBrandStatus,
    toggleBrandFeatured,
  } = useBrands();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [featuredFilter, setFeaturedFilter] = React.useState<"ALL" | "FEATURED">("ALL");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);

  // Status transition dialog state
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [brandForStatusChange, setBrandForStatusChange] = React.useState<Brand | null>(null);

  const filteredBrands = React.useMemo(() => {
    return brands.filter((brand) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        brand.name.toLowerCase().includes(q) ||
        brand.code.toLowerCase().includes(q) ||
        (brand.originCountry && brand.originCountry.toLowerCase().includes(q)) ||
        (brand.description && brand.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && brand.status === "active") ||
        (statusFilter === "INACTIVE" && brand.status === "inactive");

      const matchesFeatured =
        featuredFilter === "ALL" || (featuredFilter === "FEATURED" && brand.isFeatured);

      return matchesSearch && matchesStatus && matchesFeatured;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [brands, searchQuery, statusFilter, featuredFilter]);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setSheetOpen(true);
  };

  const handlePromptStatusChange = (brand: Brand) => {
    setBrandForStatusChange(brand);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (brandForStatusChange) {
      toggleBrandStatus(brandForStatusChange.id);
      setStatusDialogOpen(false);
      setBrandForStatusChange(null);
    }
  };

  const handleFormSubmit = (data: BrandFormValues, id?: string) => {
    if (id) {
      updateBrand(id, data);
    } else {
      addBrand(data);
    }
  };

  return (
    <AdminShell>
      <div className="w-full p-3 md:p-4 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="size-5 text-foreground" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Brand Registry
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border">
                {stats.total} Brands
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage multi-industry brand houses, manufacturing ateliers, origin heritage, and spotlight showcases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium px-3 gap-1.5"
            >
              <Plus className="size-3.5" />
              Register Brand
            </Button>
          </div>
        </div>

        {/* Top 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-border p-3.5 rounded-xs bg-background space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Registered Brands</span>
              <Award className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-2xl font-semibold tracking-tight font-mono">
                {stats.total}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {stats.countriesCount} Countries
              </span>
            </div>
          </div>

          <div className="border border-border p-3.5 rounded-xs bg-background space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active in Catalog</span>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-2xl font-semibold tracking-tight font-mono text-emerald-500">
                {stats.active}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active
              </span>
            </div>
          </div>

          <div className="border border-border p-3.5 rounded-xs bg-background space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Spotlight Showcases</span>
              <Sparkles className="size-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-2xl font-semibold tracking-tight font-mono text-amber-500">
                {stats.featured}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Homepage Featured
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 border border-border p-2.5 rounded-xs bg-background">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name, code, origin country, description..."
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center border border-border rounded-xs p-0.5 bg-background shrink-0">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors ${
                    statusFilter === st
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "ALL" ? "All Status" : st}
                </button>
              ))}
            </div>

            {/* Featured Filter */}
            <div className="flex items-center border border-border rounded-xs p-0.5 bg-background shrink-0">
              <button
                onClick={() => setFeaturedFilter("ALL")}
                className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors ${
                  featuredFilter === "ALL"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Brands
              </button>
              <button
                onClick={() => setFeaturedFilter("FEATURED")}
                className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors flex items-center gap-1 ${
                  featuredFilter === "FEATURED"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="size-3" /> Featured Only
              </button>
            </div>
          </div>

          {/* View Switcher (Table View is 1st display) */}
          <div className="flex items-center gap-1 border border-border rounded-xs p-0.5 bg-background self-end lg:self-auto shrink-0">
            <button
              onClick={() => setViewMode("table")}
              title="Table View (1st Display)"
              className={`p-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid/Cards View"
              className={`p-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {filteredBrands.length === 0 ? (
          <div className="border border-border rounded-xs p-6 text-center bg-background space-y-3">
            <div className="size-10 rounded-xs border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Award className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No Brand Houses Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL" || featuredFilter !== "ALL"
                  ? "No brands match your current search and filter parameters."
                  : "Get started by registering your first luxury brand house or manufacturing partner."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {(searchQuery || statusFilter !== "ALL" || featuredFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setFeaturedFilter("ALL");
                  }}
                  className="h-8 text-xs border-border"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
              >
                <Plus className="size-3.5" /> Register Brand
              </Button>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table View (1st Display) */
          <div className="border border-border rounded-xs bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-12 text-xs font-mono">Seq</TableHead>
                    <TableHead className="min-w-[220px] text-xs font-semibold">Brand & Identity</TableHead>
                    <TableHead className="min-w-[140px] text-xs font-semibold">Code / Slug</TableHead>
                    <TableHead className="min-w-[140px] text-xs font-semibold">Origin Country</TableHead>
                    <TableHead className="min-w-[180px] text-xs font-semibold">Official Website</TableHead>
                    <TableHead className="w-24 text-xs font-semibold text-center">Spotlight</TableHead>
                    <TableHead className="w-32 text-xs font-semibold text-center">Catalog Status</TableHead>
                    <TableHead className="w-20 text-xs font-semibold text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow
                      key={brand.id}
                      className="border-border hover:bg-muted/30 transition-colors"
                    >
                      {/* Seq */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {brand.sortOrder}
                      </TableCell>

                      {/* Brand & Identity */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xs border border-border bg-muted/20 overflow-hidden shrink-0 flex items-center justify-center">
                            {brand.logoUrl ? (
                              <Image
                                src={brand.logoUrl}
                                alt={brand.name}
                                width={32}
                                height={32}
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="font-mono text-xs font-semibold text-muted-foreground">
                                {brand.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-foreground truncate">
                                {brand.name}
                              </span>
                              {brand.isFeatured && (
                                <Sparkles className="size-3 text-amber-500 shrink-0" />
                              )}
                            </div>
                            {brand.description && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                                {brand.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Code / Slug */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-2 py-0.5 border-border bg-muted/20 text-foreground"
                        >
                          {brand.code}
                        </Badge>
                      </TableCell>

                      {/* Origin Country */}
                      <TableCell>
                        {brand.originCountry ? (
                          <span className="text-xs text-foreground flex items-center gap-1.5">
                            <Flag className="size-3 text-muted-foreground" />
                            {brand.originCountry}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Official Website */}
                      <TableCell>
                        {brand.website ? (
                          <Link
                            href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono truncate max-w-[170px]"
                          >
                            <Globe className="size-3 shrink-0" />
                            <span className="truncate">
                              {brand.website.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Spotlight Toggle */}
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleBrandFeatured(brand.id)}
                          className={`p-1 rounded-xs transition-colors ${
                            brand.isFeatured
                              ? "text-amber-500 hover:text-amber-400"
                              : "text-muted-foreground/40 hover:text-muted-foreground"
                          }`}
                          title={brand.isFeatured ? "Featured Spotlight (Click to toggle)" : "Not featured"}
                        >
                          <Sparkles className="size-4" />
                        </button>
                      </TableCell>

                      {/* Status Toggle Switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={brand.status === "active"}
                            onCheckedChange={() => handlePromptStatusChange(brand)}
                          />
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono uppercase px-1.5 py-0 ${
                              brand.status === "active"
                                ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                                : "border-zinc-500/40 text-zinc-500 bg-zinc-500/10"
                            }`}
                          >
                            {brand.status}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleOpenEdit(brand)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit Brand"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          /* Grid / Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="border border-border rounded-xs p-4 bg-background space-y-3 flex flex-col justify-between hover:border-foreground/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-10 rounded-xs border border-border bg-muted/20 overflow-hidden shrink-0 flex items-center justify-center">
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-sm font-semibold text-muted-foreground">
                            {brand.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {brand.name}
                          </h4>
                          {brand.isFeatured && (
                            <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground block">
                          {brand.code}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono uppercase px-1.5 py-0 ${
                        brand.status === "active"
                          ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                          : "border-zinc-500/40 text-zinc-500 bg-zinc-500/10"
                      }`}
                    >
                      {brand.status}
                    </Badge>
                  </div>

                  {brand.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {brand.description}
                    </p>
                  )}

                  <div className="space-y-1 pt-1 border-t border-border/60 text-xs">
                    {brand.originCountry && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flag className="size-3" /> Origin:
                        </span>
                        <span className="font-medium text-foreground">{brand.originCountry}</span>
                      </div>
                    )}
                    {brand.website && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="size-3" /> Site:
                        </span>
                        <Link
                          href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-foreground hover:underline truncate max-w-[140px]"
                        >
                          {brand.website.replace(/^https?:\/\//, "")}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={brand.status === "active"}
                      onCheckedChange={() => handlePromptStatusChange(brand)}
                    />
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {brand.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenEdit(brand)}
                    className="h-7 text-xs border-border gap-1"
                  >
                    <Edit2 className="size-3" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Sheet Drawer */}
      <BrandFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleFormSubmit}
        initialData={editingBrand}
        suggestedSortOrder={brands.length + 1}
      />

      {/* Status Confirmation Dialog */}
      <BrandStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        brand={brandForStatusChange}
        onConfirm={handleConfirmStatusChange}
      />
    </AdminShell>
  );
}
