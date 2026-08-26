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
import { Search, Package, Plus, Check, Filter } from "lucide-react";

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

  // Flatten products into selectable variants
  const availableVariants = React.useMemo(() => {
    const list: {
      product: Product;
      variant: ProductVariant;
    }[] = [];

    products.forEach((prod) => {
      // Category filter
      if (selectedCategory !== "all" && prod.categoryId !== selectedCategory) {
        return;
      }
      // Brand filter
      if (selectedBrand !== "all" && prod.brandId !== selectedBrand) {
        return;
      }

      // If product has variants, add each
      if (prod.variants && prod.variants.length > 0) {
        prod.variants.forEach((v) => {
          list.push({ product: prod, variant: v });
        });
      } else {
        // Single default variant
        list.push({
          product: prod,
          variant: {
            id: `var-${prod.id}-std`,
            name: "Standard Edition",
            sku: `${prod.code}-STD`,
            barcode: "3700000000000",
            combination: {},
            costPrice: prod.defaultCostPrice,
            sellingPrice: prod.defaultSellingPrice,
            status: "active",
          },
        });
      }
    });

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter(
        (item) =>
          item.product.name.toLowerCase().includes(q) ||
          item.product.code.toLowerCase().includes(q) ||
          item.variant.name.toLowerCase().includes(q) ||
          item.variant.sku.toLowerCase().includes(q) ||
          (item.variant.barcode && item.variant.barcode.includes(q))
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-xs p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <span>Select Product Variant</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Search the catalog to add exact sellable variant items to this purchase order.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono border-border">
              {availableVariants.length} Variants Available
            </Badge>
          </div>
        </DialogHeader>

        {/* Toolbar with Search, Category & Brand Filters */}
        <div className="p-3 border-b border-border bg-muted/10 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by product name, code, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-[150px] bg-background">
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

            <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-[130px] bg-background">
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
          </div>
        </div>

        {/* Variants List Table */}
        <div className="max-h-[380px] overflow-y-auto">
          {availableVariants.length === 0 ? (
            <div className="text-center py-12 space-y-1 text-muted-foreground">
              <Package className="size-6 mx-auto mb-2 text-muted-foreground/60" />
              <p className="text-xs font-mono">No matching variants found.</p>
              <p className="text-[11px]">Try adjusting your search keywords or category filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-8 text-xs">Product & Variant</TableHead>
                  <TableHead className="h-8 text-xs w-[140px]">SKU</TableHead>
                  <TableHead className="h-8 text-xs w-[120px]">Barcode</TableHead>
                  <TableHead className="h-8 text-xs w-[110px]">Cost Price</TableHead>
                  <TableHead className="h-8 text-xs w-[90px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableVariants.map(({ product, variant }) => {
                  const isSelected = alreadySelectedVariantIds.includes(variant.id);

                  return (
                    <TableRow key={`${product.id}-${variant.id}`} className="border-b border-border/60 hover:bg-muted/20">
                      <TableCell className="py-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                            <span className="text-foreground font-medium">{variant.name}</span>
                            <span>•</span>
                            <span>{product.code}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2 font-mono text-xs text-foreground">
                        {variant.sku}
                      </TableCell>

                      <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                        {variant.barcode || "—"}
                      </TableCell>

                      <TableCell className="py-2 font-mono text-xs text-foreground font-medium">
                        ৳{(variant.costPrice || product.defaultCostPrice).toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right py-2">
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
                              unitCost: variant.costPrice || product.defaultCostPrice,
                            });
                          }}
                          className={`h-6.5 text-[11px] px-2.5 rounded-xs gap-1 ${
                            isSelected ? "bg-muted text-muted-foreground border-border" : "border-border"
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
      </DialogContent>
    </Dialog>
  );
}
