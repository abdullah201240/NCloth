"use client";

import * as React from "react";
import { useProducts } from "@/lib/stores/product-context";
import { useCategory } from "@/lib/stores/category-context";
import { useBrands } from "@/lib/stores/brand-context";
import { Product, ProductVariant } from "@/lib/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, Package, Plus, Check, Barcode } from "lucide-react";

export interface SelectedVariantPayload {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  barcode?: string;
  unitCost: number;
}

interface ProductVariantPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariant: (variant: SelectedVariantPayload) => void;
  alreadySelectedVariantIds?: string[];
}

export function ProductVariantPickerDialog({
  open,
  onOpenChange,
  onSelectVariant,
  alreadySelectedVariantIds = [],
}: ProductVariantPickerDialogProps) {
  const { products } = useProducts();
  const { flatCategories } = useCategory();
  const { brands } = useBrands();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedBrand, setSelectedBrand] = React.useState<string>("all");

  // Reset search and filters when modal is reopened
  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedCategory("all");
      setSelectedBrand("all");
    }
  }, [open]);

  // Flatten active products and their variants
  const availableVariants = React.useMemo(() => {
    const list: Array<{ product: Product; variant: ProductVariant }> = [];

    products
      .filter((p) => p.status === "active")
      .forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          product.variants
            .filter((v) => v.status === "active")
            .forEach((variant) => {
              list.push({ product, variant });
            });
        } else {
          // Virtual single variant fallback if product has no variant matrix
          list.push({
            product,
            variant: {
              id: `${product.id}-default`,
              sku: `${product.code}-001`,
              barcode: "",
              name: "Standard",
              costPrice: product.defaultCostPrice,
              sellingPrice: product.defaultSellingPrice,
              combination: {},
              status: "active",
            },
          });
        }
      });

    // Apply Filter & Search
    return list.filter(({ product, variant }) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (product.categoryId !== selectedCategory) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrand !== "all" && product.brandId !== selectedBrand) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCode = product.code.toLowerCase().includes(q);
        const matchesVariantName = variant.name.toLowerCase().includes(q);
        const matchesSku = variant.sku.toLowerCase().includes(q);
        const matchesBarcode = variant.barcode ? variant.barcode.toLowerCase().includes(q) : false;
        const matchesBrand = product.brandName ? product.brandName.toLowerCase().includes(q) : false;
        const matchesCategory = product.categoryName ? product.categoryName.toLowerCase().includes(q) : false;

        return (
          matchesName ||
          matchesCode ||
          matchesVariantName ||
          matchesSku ||
          matchesBarcode ||
          matchesBrand ||
          matchesCategory
        );
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl md:max-w-6xl w-[96vw] max-h-[90vh] rounded-xs p-0 gap-0 overflow-hidden bg-background border border-border">
        {/* Modal Header */}
        <DialogHeader className="p-4 border-b border-border bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <span>Select Product Variant</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Search the catalog to add exact sellable variant items to this purchase order.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {availableVariants.length} Variants Available
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Expanded Toolbar with Search, Category & Brand Filters */}
        <div className="p-3 border-b border-border bg-muted/10 flex flex-col md:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by product name, code, SKU, barcode, brand, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8.5 text-xs bg-background rounded-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
              <SelectTrigger className="h-8.5 text-xs w-full md:w-[200px] bg-background rounded-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {flatCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name} ({c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "all")}>
              <SelectTrigger className="h-8.5 text-xs w-full md:w-[170px] bg-background rounded-xs">
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

            {(searchQuery || selectedCategory !== "all" || selectedBrand !== "all") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                }}
                className="h-8.5 text-xs px-2.5 rounded-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Variants List Table */}
        <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
          {availableVariants.length === 0 ? (
            <div className="text-center py-16 space-y-1.5 text-muted-foreground">
              <Package className="size-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No matching variants found</p>
              <p className="text-xs">Try adjusting your search keywords, category, or brand filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="h-9 text-xs font-semibold">Product & Category</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[180px]">Variant</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[150px]">SKU</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[130px]">Barcode</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[120px] text-right">Cost Price</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[120px] text-right">Retail MSRP</TableHead>
                  <TableHead className="h-9 text-xs font-semibold w-[100px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableVariants.map(({ product, variant }) => {
                  const isSelected = alreadySelectedVariantIds.includes(variant.id);
                  const costPrice = variant.costPrice || product.defaultCostPrice || 0;
                  const retailPrice = variant.sellingPrice || product.defaultSellingPrice || 0;

                  return (
                    <TableRow
                      key={`${product.id}-${variant.id}`}
                      className={`border-b border-border/60 transition-colors ${
                        isSelected ? "bg-muted/30" : "hover:bg-muted/20"
                      }`}
                    >
                      {/* Product Name & Taxonomy */}
                      <TableCell className="py-2.5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                            <span className="font-mono text-foreground/80">{product.code}</span>
                            {product.categoryName && (
                              <>
                                <span>•</span>
                                <span className="text-muted-foreground">{product.categoryName}</span>
                              </>
                            )}
                            {product.brandName && (
                              <>
                                <span>•</span>
                                <span className="text-muted-foreground font-medium">{product.brandName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Variant Name */}
                      <TableCell className="py-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">{variant.name}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="py-2.5 font-mono text-xs text-foreground">
                        <span className="bg-muted/40 px-1.5 py-0.5 rounded-xs border border-border/40">
                          {variant.sku}
                        </span>
                      </TableCell>

                      {/* Barcode */}
                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                        {variant.barcode ? (
                          <div className="flex items-center gap-1">
                            <Barcode className="size-3 text-muted-foreground/70" />
                            <span>{variant.barcode}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>

                      {/* Unit Cost Price in BDT */}
                      <TableCell className="py-2.5 font-mono text-xs text-foreground font-semibold text-right">
                        ৳{costPrice.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* Retail Price in BDT */}
                      <TableCell className="py-2.5 font-mono text-xs text-muted-foreground text-right">
                        ৳{retailPrice.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* Select Action Button */}
                      <TableCell className="text-right py-2.5">
                        <Button
                          type="button"
                          variant={isSelected ? "secondary" : "outline"}
                          size="xs"
                          onClick={() => {
                            onSelectVariant({
                              productId: product.id,
                              variantId: variant.id,
                              productName: product.name,
                              variantName: variant.name,
                              sku: variant.sku,
                              barcode: variant.barcode,
                              unitCost: costPrice,
                            });
                          }}
                          className={`h-7 text-xs px-2.5 rounded-xs gap-1 transition-all ${
                            isSelected
                              ? "bg-muted text-muted-foreground border-border hover:bg-muted"
                              : "bg-background text-foreground hover:bg-foreground hover:text-background border-border"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="size-3 text-emerald-500" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="size-3" /> Select
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3 px-4 border-t border-border bg-background flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">
            {availableVariants.length} variants available • {alreadySelectedVariantIds.length} already added
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs px-3 rounded-xs border-border"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
