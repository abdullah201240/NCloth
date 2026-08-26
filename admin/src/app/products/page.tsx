"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useProducts } from "@/lib/stores/product-context";
import { useCategory } from "@/lib/stores/category-context";
import { useBrands } from "@/lib/stores/brand-context";
import { Product } from "@/lib/types/product";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Grid,
  List,
  SlidersHorizontal,
  Sparkles,
  Layers,
  DollarSign,
  TrendingUp,
  Tag,
  Copy,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const { products, stats, toggleProductStatus, duplicateProduct } = useProducts();
  const { flatCategories } = useCategory();
  const { brands } = useBrands();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedBrand, setSelectedBrand] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Zero-delete confirmation dialog
  const [statusDialogProduct, setStatusDialogProduct] = React.useState<Product | null>(null);

  // Filtered Products
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesSku = p.variants?.some((v) => v.sku.toLowerCase().includes(q));
        if (!matchesName && !matchesCode && !matchesSku) return false;
      }

      // Category
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }

      // Brand
      if (selectedBrand !== "all" && p.brandId !== selectedBrand) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedStatus]);

  const handleConfirmStatusToggle = () => {
    if (statusDialogProduct) {
      toggleProductStatus(statusDialogProduct.id);
      setStatusDialogProduct(null);
    }
  };

  return (
    <AdminShell>
      <div className="w-full space-y-4 min-w-0">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Product Catalog & Matrix
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {products.length} Products Loaded
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              GLOBAL MULTI-CATEGORY MERCHANDISING • REAL-TIME SKU & PRICING MATRICES
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/products/new")}
              size="sm"
              className="h-8 text-xs px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
            >
              <Plus className="size-3.5" /> Create Product
            </Button>
          </div>
        </div>

        {/* 4 Minimalist Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Products</span>
              <Package className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalProducts}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border">
                {stats.activeProducts} Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Across {flatCategories.length} Categories
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Variants (SKUs)</span>
              <Grid className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalVariants}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                Unique Barcodes
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Active Cartesian Combinations
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Draft Products</span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.draftProducts}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-amber-500/40 text-amber-500">
                Pending Review
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Pre-Release Collections
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Catalog Valuation</span>
              <DollarSign className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                €{stats.totalInventoryValuation.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                MSRP Base
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Aggregate Retail Value
            </p>
          </Card>
        </div>

        {/* Multi-Filter Toolbar */}
        <Card className="p-3 border border-border rounded-xs bg-background">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by product name, code, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                  {flatCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand Filter */}
              <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Brands</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
                <SelectTrigger className="h-8 text-xs w-[120px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs">Active</SelectItem>
                  <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-muted/10">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setViewMode("table")}
                className="size-7"
                title="Table View"
              >
                <List className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setViewMode("grid")}
                className="size-7"
                title="Grid View"
              >
                <Grid className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* View Content: Table or Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xs space-y-3 bg-background">
            <Package className="size-8 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No Products Found</h3>
              <p className="text-xs text-muted-foreground font-mono">
                No catalog items match your search filters.
              </p>
            </div>
            <Button
              onClick={() => router.push("/products/new")}
              size="sm"
              className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5"
            >
              <Plus className="size-3.5" /> Create First Product
            </Button>
          </div>
        ) : viewMode === "table" ? (
          <Card className="border border-border rounded-xs bg-background">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background">
                    <TableHead className="w-[80px] h-9 text-xs">Photo</TableHead>
                    <TableHead className="h-9 text-xs">Product Title & Code</TableHead>
                    <TableHead className="w-[140px] h-9 text-xs">Category</TableHead>
                    <TableHead className="w-[130px] h-9 text-xs">Brand</TableHead>
                    <TableHead className="w-[100px] h-9 text-xs">Variants</TableHead>
                    <TableHead className="w-[110px] h-9 text-xs">Cost Price</TableHead>
                    <TableHead className="w-[110px] h-9 text-xs">Selling Price</TableHead>
                    <TableHead className="w-[90px] h-9 text-xs">Status</TableHead>
                    <TableHead className="w-[140px] text-right h-9 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => {
                    const primaryMedia = p.media?.find((m) => m.isPrimary) || p.media?.[0];
                    const categoryItem = flatCategories.find((c) => c.id === p.categoryId);
                    const brandItem = brands.find((b) => b.id === p.brandId);

                    return (
                      <TableRow key={p.id} className="border-b border-border/60 hover:bg-muted/30">
                        {/* Primary Image */}
                        <TableCell className="py-2">
                          <div className="size-10 rounded-xs overflow-hidden border border-border bg-muted/20 relative">
                            {primaryMedia?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={primaryMedia.url}
                                alt={p.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-muted-foreground">
                                <Package className="size-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Name & Code */}
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5">
                            <Link
                              href={`/products/${p.id}/edit`}
                              className="text-sm font-medium text-foreground hover:underline"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                              <span>{p.code}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] font-mono border-border px-1 py-0">
                                {p.productType}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="py-2.5 text-xs text-muted-foreground">
                          {p.categoryName || categoryItem?.name || "General"}
                        </TableCell>

                        {/* Brand */}
                        <TableCell className="py-2.5 text-xs text-foreground font-medium">
                          {p.brandName || brandItem?.name || "—"}
                        </TableCell>

                        {/* Variants Count */}
                        <TableCell className="py-2.5 font-mono text-xs text-foreground">
                          <Badge variant="outline" className="text-xs font-mono border-border">
                            {p.variants?.length || 1} SKU(s)
                          </Badge>
                        </TableCell>

                        {/* Cost Price */}
                        <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                          €{p.defaultCostPrice.toFixed(2)}
                        </TableCell>

                        {/* Selling Price */}
                        <TableCell className="py-2.5 font-mono text-xs text-foreground font-semibold">
                          €{p.defaultSellingPrice.toFixed(2)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2.5">
                          <button
                            type="button"
                            onClick={() => setStatusDialogProduct(p)}
                            className="cursor-pointer"
                          >
                            <Badge
                              variant="outline"
                              className={`text-xs uppercase font-mono px-1.5 py-0 ${
                                p.status === "active"
                                  ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                                  : p.status === "draft"
                                  ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                                  : "border-zinc-500/40 text-zinc-500"
                              }`}
                            >
                              {p.status}
                            </Badge>
                          </button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => router.push(`/products/${p.id}/edit`)}
                              className="size-7 border-border"
                              title="Edit Product"
                            >
                              <Edit className="size-3.5" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => duplicateProduct(p.id)}
                              className="size-7 border-border"
                              title="Duplicate Product"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const primaryMedia = p.media?.find((m) => m.isPrimary) || p.media?.[0];
              const categoryItem = flatCategories.find((c) => c.id === p.categoryId);
              const brandItem = brands.find((b) => b.id === p.brandId);

              return (
                <Card key={p.id} className="border border-border rounded-xs bg-background overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video w-full border-b border-border bg-muted/20">
                    {primaryMedia?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryMedia.url}
                        alt={p.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground">
                        <Package className="size-6" />
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={`absolute top-2 right-2 text-[10px] uppercase font-mono px-1.5 py-0 bg-background/90 ${
                        p.status === "active"
                          ? "border-emerald-500/40 text-emerald-500"
                          : "border-zinc-500/40 text-zinc-500"
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {p.code} • {brandItem?.name || "Atelier"}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                        {p.name}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description || "No description provided."}
                    </p>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{p.variants?.length || 1} SKUs</span>
                      <span className="text-sm font-semibold text-foreground">€{p.defaultSellingPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 pt-0 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/products/${p.id}/edit`)}
                      className="h-7 text-xs flex-1 border-border"
                    >
                      Edit Matrix
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => duplicateProduct(p.id)}
                      className="size-7 border-border"
                      title="Duplicate"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Soft Status Confirmation Dialog (Zero Hard-Delete) */}
        <AlertDialog
          open={!!statusDialogProduct}
          onOpenChange={(open) => !open && setStatusDialogProduct(null)}
        >
          <AlertDialogContent className="rounded-xs max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold">
                Change Product Lifecycle Status?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                You are changing the status of &ldquo;<strong>{statusDialogProduct?.name}</strong>&rdquo; ({statusDialogProduct?.code}) to{" "}
                <strong>{statusDialogProduct?.status === "active" ? "Inactive" : "Active"}</strong>.
                Zero-Delete is strictly enforced; this product will remain in the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="h-8 text-xs rounded-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmStatusToggle}
                className="h-8 text-xs rounded-xs bg-foreground text-background hover:bg-foreground/90"
              >
                Confirm Transition
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminShell>
  );
}
