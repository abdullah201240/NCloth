"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductVariant, ProductMedia, ProductType, ProductStatus } from "@/lib/types/product";
import { productFormSchema, type ProductFormValues } from "@/lib/validations/product";
import { useProducts } from "@/lib/stores/product-context";
import { useCategory } from "@/lib/stores/category-context";
import { useAttributes } from "@/lib/stores/attribute-context";
import { useBrands } from "@/lib/stores/brand-context";
import { DynamicAttributeField } from "@/components/products/dynamic-attribute-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "@/components/ui/toast";
import {
  Package,
  Layers,
  Sparkles,
  Grid,
  Coins,
  Image as ImageIcon,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Camera,
  Tag,
  Barcode as BarcodeIcon,
} from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  mode?: "create" | "edit";
}

const PRODUCT_TYPES: { value: ProductType; label: string; description: string }[] = [
  { value: "STOCKABLE", label: "Stockable Item", description: "Standard physical inventory tracked by units & warehouse shelves" },
  { value: "NON_STOCK", label: "Non-Stock Item", description: "Physical goods not tracked in local inventory" },
  { value: "SERVICE", label: "Service / Atelier", description: "Bespoke tailoring, embroidery, or repair service" },
  { value: "DIGITAL", label: "Digital Asset", description: "Virtual goods, licenses, or digital gift cards" },
  { value: "BUNDLE", label: "Kit / Bundle", description: "Packaged set composed of multiple standalone SKUs" },
  { value: "COMPOSITE", label: "Composite Item", description: "Manufactured product assembled from raw materials" },
];

export function ProductForm({ initialData, mode = "create" }: ProductFormProps) {
  const router = useRouter();
  const { addProduct, updateProduct, isSkuAvailable, isBarcodeAvailable } = useProducts();
  const { flatCategories, rootCategories } = useCategory();
  const { attributeSets, attributes, attributeValues, units } = useAttributes();
  const { brands } = useBrands();

  // Collapsible section state for compact high-density navigation
  const [openSections, setOpenSections] = React.useState({
    basic: true,
    attributes: true,
    variants: true,
    pricing: true,
    media: true,
    additional: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Selected values for variant generation: { [attributeId]: string[] }
  const [selectedVariantValues, setSelectedVariantValues] = React.useState<Record<string, string[]>>({});

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          slug: initialData.slug,
          categoryId: initialData.categoryId,
          brandId: initialData.brandId || "",
          attributeSetId: initialData.attributeSetId,
          productType: initialData.productType,
          description: initialData.description || "",
          status: initialData.status,
          defaultCostPrice: initialData.defaultCostPrice,
          defaultSellingPrice: initialData.defaultSellingPrice,
          compareAtPrice: initialData.compareAtPrice,
          currency: initialData.currency || "BDT",
          hasVariants: initialData.hasVariants,
          variantAttributeIds: initialData.variantAttributeIds || [],
          attributes: initialData.attributes || [],
          variants: initialData.variants || [],
          media: initialData.media || [],
          additionalInfo: initialData.additionalInfo || {
            manufacturer: "",
            originCountry: "",
            warranty: "",
            hsCode: "",
            notes: "",
            externalReference: "",
          },
        }
      : {
          name: "",
          code: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
          slug: "",
          categoryId: flatCategories[0]?.id || "",
          brandId: brands[0]?.id || "",
          attributeSetId: attributeSets[0]?.id || "set-fashion",
          productType: "STOCKABLE",
          description: "",
          status: "active",
          defaultCostPrice: 1000,
          defaultSellingPrice: 2500,
          compareAtPrice: undefined,
          currency: "BDT",
          hasVariants: true,
          variantAttributeIds: ["attr-color", "attr-size"],
          attributes: [],
          variants: [],
          media: [
            {
              id: `med-${Date.now()}`,
              url: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop",
              isPrimary: true,
              alt: "Primary Product View",
              sortOrder: 1,
            },
          ],
          additionalInfo: {
            manufacturer: "",
            originCountry: "France",
            warranty: "Standard 2-Year Studio Warranty",
            hsCode: "",
            notes: "",
            externalReference: "",
          },
        },
  });

  const { fields: variantFields, replace: replaceVariants, update: updateVariant, remove: removeVariant, append: appendVariant } =
    useFieldArray({
      control: form.control,
      name: "variants",
    });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia, update: updateMedia } =
    useFieldArray({
      control: form.control,
      name: "media",
    });

  const currentAttributeSetId = form.watch("attributeSetId");
  const currentCategoryId = form.watch("categoryId");
  const currentProductCode = form.watch("code") || "PRD";
  const defaultCostPrice = form.watch("defaultCostPrice") || 0;
  const defaultSellingPrice = form.watch("defaultSellingPrice") || 0;
  const hasVariants = form.watch("hasVariants");
  const selectedVariantAttributeIds = form.watch("variantAttributeIds") || [];
  const currentAttributes = form.watch("attributes") || [];

  // Active Attribute Set
  const currentAttributeSet = React.useMemo(() => {
    return attributeSets.find((s) => s.id === currentAttributeSetId) || attributeSets[0];
  }, [attributeSets, currentAttributeSetId]);

  // Set of attributes belonging to active Attribute Set
  const setAttributes = React.useMemo(() => {
    if (!currentAttributeSet) return [];
    return currentAttributeSet.attributeConfigs
      .map((cfg) => {
        const attr = attributes.find((a) => a.id === cfg.attributeId);
        if (!attr) return null;
        return {
          ...attr,
          isSetRequired: cfg.isRequired,
          isSetVariant: cfg.isVariant,
          setSortOrder: cfg.sortOrder,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => a.setSortOrder - b.setSortOrder);
  }, [currentAttributeSet, attributes]);

  // Split into Product Master Attributes vs Candidate Variant Attributes
  const { productAttributes, candidateVariantAttributes } = React.useMemo(() => {
    const productAttrs: typeof setAttributes = [];
    const candidateVariantAttrs: typeof setAttributes = [];

    setAttributes.forEach((attr) => {
      // Attributes with SELECT, MULTI_SELECT, or marked isVariant can participate in variants
      if (attr.isSetVariant || attr.isVariant || attr.type === "SELECT") {
        candidateVariantAttrs.push(attr);
      }
      // If not currently selected as a variant dimension, it functions as a product master attribute
      if (!selectedVariantAttributeIds.includes(attr.id)) {
        productAttrs.push(attr);
      }
    });

    return { productAttributes: productAttrs, candidateVariantAttributes: candidateVariantAttrs };
  }, [setAttributes, selectedVariantAttributeIds]);

  // Handle Category Change -> Auto-resolve Attribute Set
  const handleCategoryChange = (categoryId: string) => {
    form.setValue("categoryId", categoryId);

    // Heuristic matching based on category code/name
    const catItem = flatCategories.find((c) => c.id === categoryId);
    if (catItem) {
      const lower = (catItem.name + " " + catItem.slug).toLowerCase();
      if (lower.includes("phone") || lower.includes("laptop") || lower.includes("electronic") || lower.includes("digital")) {
        const found = attributeSets.find((s) => s.code.includes("mobile") || s.code.includes("electronic"));
        if (found) form.setValue("attributeSetId", found.id);
      } else if (lower.includes("furniture") || lower.includes("lamp") || lower.includes("table") || lower.includes("chair")) {
        const found = attributeSets.find((s) => s.code.includes("furniture"));
        if (found) form.setValue("attributeSetId", found.id);
      } else {
        const found = attributeSets.find((s) => s.code.includes("fashion") || s.code.includes("apparel"));
        if (found) form.setValue("attributeSetId", found.id);
      }
    }
  };

  // Toggle variant attribute participation
  const toggleVariantAttribute = (attrId: string) => {
    const nextIds = selectedVariantAttributeIds.includes(attrId)
      ? selectedVariantAttributeIds.filter((id) => id !== attrId)
      : [...selectedVariantAttributeIds, attrId];

    form.setValue("variantAttributeIds", nextIds);
    form.setValue("hasVariants", nextIds.length > 0);

    // Clean up selected values for removed attributes
    if (!nextIds.includes(attrId)) {
      setSelectedVariantValues((prev) => {
        const copy = { ...prev };
        delete copy[attrId];
        return copy;
      });
    }
  };

  // Toggle attribute value selection for variant generator
  const toggleAttributeValueSelection = (attrId: string, valueId: string) => {
    setSelectedVariantValues((prev) => {
      const current = prev[attrId] || [];
      const updated = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      return { ...prev, [attrId]: updated };
    });
  };

  // Select all values for an attribute
  const selectAllValuesForAttribute = (attrId: string) => {
    const values = attributeValues.filter((v) => v.attributeId === attrId && v.status === "active");
    setSelectedVariantValues((prev) => ({
      ...prev,
      [attrId]: values.map((v) => v.id),
    }));
  };

  // Cartesian Product Generator for Combinations
  const generateVariantsMatrix = () => {
    const activeAttrs = selectedVariantAttributeIds
      .map((id) => attributes.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== null);

    if (activeAttrs.length === 0) {
      toast.warning("No Variant Attributes", "Please check at least one variant attribute (e.g. Color or Size).");
      return;
    }

    // Check that each active attribute has at least one value selected
    for (const attr of activeAttrs) {
      const selected = selectedVariantValues[attr.id] || [];
      if (selected.length === 0) {
        toast.warning(
          `No Values Selected for ${attr.name}`,
          `Please select at least one value for ${attr.name} before generating combinations.`
        );
        return;
      }
    }

    // Build combination matrix
    const cartesian = (arrays: { attrId: string; attrCode: string; valueId: string; valueName: string; valueCode: string }[][]) => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap((a) => curr.map((b) => [...a, b]));
      }, [[]] as { attrId: string; attrCode: string; valueId: string; valueName: string; valueCode: string }[][]);
    };

    const attributeValueLists = activeAttrs.map((attr) => {
      const selectedIds = selectedVariantValues[attr.id] || [];
      return selectedIds.map((valId) => {
        const val = attributeValues.find((v) => v.id === valId);
        return {
          attrId: attr.id,
          attrCode: attr.code,
          valueId: valId,
          valueName: val?.name || valId,
          valueCode: val?.code || valId,
        };
      });
    });

    const combinations = cartesian(attributeValueLists);

    const newVariants: ProductVariant[] = combinations.map((combo, idx) => {
      const combinationMap: Record<string, string> = {};
      const nameParts: string[] = [];
      const skuParts: string[] = [currentProductCode];

      combo.forEach((item) => {
        combinationMap[item.attrId] = item.valueId;
        nameParts.push(item.valueName);
        skuParts.push(item.valueCode.toUpperCase().slice(0, 4));
      });

      const variantName = nameParts.join(" / ");
      const generatedSku = skuParts.join("-");
      const generatedBarcode = `3700${Math.floor(100000000 + Math.random() * 900000000)}`;

      return {
        id: `var-${Date.now().toString(36)}-${idx}`,
        name: variantName,
        sku: generatedSku,
        barcode: generatedBarcode,
        combination: combinationMap,
        costPrice: defaultCostPrice,
        sellingPrice: defaultSellingPrice,
        compareAtPrice: defaultSellingPrice * 1.2,
        weight: 1.0,
        status: "active",
      };
    });

    replaceVariants(newVariants);
    toast.success(
      "Variants Generated",
      `Created ${newVariants.length} sellable variant combination(s) with unique SKUs and barcodes.`
    );
  };

  // Bulk Apply Default Pricing to All Variants
  const handleApplyBulkPricing = () => {
    if (variantFields.length === 0) {
      toast.info("No Variants", "Generate or add variants first before applying bulk prices.");
      return;
    }

    const updated = variantFields.map((v) => ({
      ...v,
      costPrice: defaultCostPrice,
      sellingPrice: defaultSellingPrice,
    }));

    replaceVariants(updated);
    toast.success("Prices Applied", `Updated ${updated.length} variant(s) with Cost: ৳${defaultCostPrice} / Sell: ৳${defaultSellingPrice}.`);
  };

  // Auto-fill SKU generator for single row
  const regenerateSingleSku = (index: number) => {
    const variant = variantFields[index];
    if (!variant) return;

    const skuParts = [currentProductCode];
    Object.entries(variant.combination || {}).forEach(([attrId, valId]) => {
      const val = attributeValues.find((v) => v.id === valId);
      if (val) skuParts.push(val.code.toUpperCase().slice(0, 4));
    });
    if (skuParts.length === 1) skuParts.push(`V${index + 1}`);

    updateVariant(index, {
      ...variant,
      sku: skuParts.join("-"),
    });
  };

  // Handle Dynamic Attribute Value Change
  const handleAttributeValueChange = (
    attributeId: string,
    attributeCode: string,
    attributeName: string,
    value: any,
    unitId?: string,
    unitSymbol?: string
  ) => {
    const existingIndex = currentAttributes.findIndex((a) => a.attributeId === attributeId);
    const newEntry = {
      attributeId,
      attributeCode,
      attributeName,
      value,
      unitId,
      unitSymbol,
    };

    let nextAttributes: typeof currentAttributes;
    if (existingIndex >= 0) {
      nextAttributes = [...currentAttributes];
      nextAttributes[existingIndex] = newEntry;
    } else {
      nextAttributes = [...currentAttributes, newEntry];
    }

    form.setValue("attributes", nextAttributes);
  };

  // Calculate live gross profit and margin %
  const grossProfit = defaultSellingPrice - defaultCostPrice;
  const marginPercent = defaultSellingPrice > 0 ? (grossProfit / defaultSellingPrice) * 100 : 0;
  const markupPercent = defaultCostPrice > 0 ? (grossProfit / defaultCostPrice) * 100 : 0;

  // Form Submit Handler
  const onSubmit = (data: ProductFormValues) => {
    // If no variants exist, create a default single variant
    if (!data.hasVariants || data.variants.length === 0) {
      data.variants = [
        {
          id: `var-${Date.now().toString(36)}-0`,
          name: "Standard Edition",
          sku: `${data.code}-STD`,
          barcode: `3700${Math.floor(100000000 + Math.random() * 900000000)}`,
          combination: {},
          costPrice: data.defaultCostPrice,
          sellingPrice: data.defaultSellingPrice,
          status: "active",
        },
      ];
    }

    if (mode === "edit" && initialData) {
      const success = updateProduct(initialData.id, data);
      if (success) {
        router.push("/products");
      }
    } else {
      const created = addProduct(data);
      if (created) {
        router.push("/products");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 pb-20 min-w-0">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "edit" ? `Edit Product: ${initialData?.name}` : "Create New Product"}
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Single-Page Studio Creator
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            CATEGORY → ATTRIBUTE SET → DYNAMIC MATRIX → MULTI-TIER PRICING
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
            className="h-8 text-xs border-border gap-1"
          >
            <X className="size-3.5" /> Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
          >
            <Save className="size-3.5" /> {mode === "edit" ? "Save Changes" : "Save Product"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BASIC INFORMATION SECTION */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("basic")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <span>1. Basic Product Information</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Master title, unique product code, category hierarchy binding, and brand house.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {openSections.basic ? "Expanded" : "Collapsed"}
          </Badge>
        </CardHeader>

        {openSections.basic && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Product Name */}
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Name *
                </Label>
                <Input
                  placeholder="e.g. Double-Breasted Cashmere Trench Coat"
                  className="h-8.5 text-sm"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Product Code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Master Code *
                </Label>
                <Input
                  placeholder="e.g. OTR-OVC-001"
                  className="h-8.5 text-sm font-mono uppercase"
                  {...form.register("code")}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category *
                </Label>
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => { if (val) handleCategoryChange(val); }}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {flatCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-1">[{c.code}]</span> {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              {/* Attribute Set Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="size-3 text-muted-foreground" />
                  Attribute Set *
                </Label>
                <Controller
                  name="attributeSetId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Set" />
                      </SelectTrigger>
                      <SelectContent>
                        {attributeSets.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-sm">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Brand House Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3 text-muted-foreground" />
                  Brand House
                </Label>
                <Controller
                  name="brandId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id} className="text-sm">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Product Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Type *
                </Label>
                <Controller
                  name="productType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8.5 text-sm w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-sm">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Description & Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Editorial Description & Craft Notes
                </Label>
                <Textarea
                  placeholder="Enter high-fashion product copy, textile provenance, silhouette specs..."
                  className="min-h-[70px] text-xs resize-none"
                  {...form.register("description")}
                />
              </div>

              <div className="space-y-3 border border-border p-3 rounded-xs bg-muted/10">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lifecycle Status
                  </Label>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-8 text-xs font-mono w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active" className="text-xs">Active / Publish</SelectItem>
                          <SelectItem value="draft" className="text-xs">Draft / Review</SelectItem>
                          <SelectItem value="inactive" className="text-xs">Inactive / Suspended</SelectItem>
                          <SelectItem value="archived" className="text-xs">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted-foreground">Multi-Variant:</span>
                  <Switch
                    checked={hasVariants}
                    onCheckedChange={(checked) => form.setValue("hasVariants", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC PRODUCT ATTRIBUTES SECTION */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("attributes")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <span>2. Dynamic Product Attributes</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Specifications dynamically configured for <strong>{currentAttributeSet?.name}</strong>.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {productAttributes.length} Master Fields
          </Badge>
        </CardHeader>

        {openSections.attributes && (
          <CardContent className="p-4">
            {productAttributes.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xs text-muted-foreground text-xs font-mono">
                No non-variant master attributes in this set. All attributes are assigned to variant generation.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productAttributes.map((attr) => {
                  const currentVal = currentAttributes.find((a) => a.attributeId === attr.id)?.value;
                  const currentUnit = currentAttributes.find((a) => a.attributeId === attr.id)?.unitId;
                  const values = attributeValues.filter((v) => v.attributeId === attr.id && v.status === "active");

                  return (
                    <div key={attr.id} className="space-y-1.5 border border-border/60 p-3 rounded-xs bg-muted/5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {attr.name} {attr.isSetRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Badge variant="outline" className="text-[10px] font-mono border-border/60 text-muted-foreground px-1 py-0">
                          {attr.type}
                        </Badge>
                      </div>

                      <DynamicAttributeField
                        attribute={attr}
                        values={values}
                        units={units}
                        currentValue={currentVal}
                        currentUnitId={currentUnit}
                        onChange={(val, unitId, unitSymbol) =>
                          handleAttributeValueChange(attr.id, attr.code, attr.name, val, unitId, unitSymbol)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. VARIANTS CONFIGURATION & MATRIX GENERATOR */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("variants")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Grid className="size-4 text-muted-foreground" />
              <span>3. Variant Matrix & SKU Configuration</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select variant dimensions, choose attribute values, and generate combinations.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {variantFields.length} Sellable SKUs
          </Badge>
        </CardHeader>

        {openSections.variants && (
          <CardContent className="p-4 space-y-4">
            {/* Variant Attribute Selector */}
            <div className="border border-border p-3.5 rounded-xs bg-muted/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step 1: Choose Variant Dimensions
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedVariantAttributeIds.length} Dimension(s) Active
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {candidateVariantAttributes.map((attr) => {
                  const isChecked = selectedVariantAttributeIds.includes(attr.id);
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => toggleVariantAttribute(attr.id)}
                      className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-foreground text-background border-foreground font-medium"
                          : "border-border text-muted-foreground hover:text-foreground bg-background hover:bg-muted/30"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${isChecked ? "bg-background" : "bg-muted-foreground/60"}`} />
                      <span>{attr.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step 2: Pick Values for Selected Variant Attributes */}
              {selectedVariantAttributeIds.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Step 2: Select Values for Cartesian Combination
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedVariantAttributeIds.map((attrId) => {
                      const attr = attributes.find((a) => a.id === attrId);
                      const values = attributeValues.filter((v) => v.attributeId === attrId && v.status === "active");
                      const selectedValIds = selectedVariantValues[attrId] || [];

                      return (
                        <div key={attrId} className="border border-border p-3 rounded-xs bg-background space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{attr?.name} Values</span>
                            <button
                              type="button"
                              onClick={() => selectAllValuesForAttribute(attrId)}
                              className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline"
                            >
                              Select All ({values.length})
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                            {values.map((v) => {
                              const isSelected = selectedValIds.includes(v.id);
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => toggleAttributeValueSelection(attrId, v.id)}
                                  className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-xs border transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-foreground text-background border-foreground font-medium"
                                      : "border-border text-muted-foreground hover:text-foreground bg-muted/20"
                                  }`}
                                >
                                  {v.colorHex && (
                                    <span
                                      className="size-2 rounded-full border border-border shrink-0"
                                      style={{ backgroundColor: v.colorHex }}
                                    />
                                  )}
                                  <span>{v.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-mono">
                      Click generate to compute all combinations, assign SKUs, and build barcodes.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={generateVariantsMatrix}
                      className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                    >
                      <RefreshCw className="size-3.5" /> Generate Variants Matrix
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Editable Variant Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step 3: Editable Variant Matrix Table
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    appendVariant({
                      id: `var-${Date.now()}`,
                      name: `Custom Variant ${variantFields.length + 1}`,
                      sku: `${currentProductCode}-V${variantFields.length + 1}`,
                      barcode: `3700${Math.floor(100000000 + Math.random() * 900000000)}`,
                      combination: {},
                      costPrice: defaultCostPrice,
                      sellingPrice: defaultSellingPrice,
                      status: "active",
                    })
                  }
                  className="h-7 text-xs border-border gap-1"
                >
                  <Plus className="size-3" /> Add Custom Variant Row
                </Button>
              </div>

              {variantFields.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xs space-y-1.5">
                  <p className="text-xs text-muted-foreground font-mono">This product currently has no variants generated.</p>
                  <p className="text-[11px] text-muted-foreground">
                    Select variant attributes above and click &ldquo;Generate Variants Matrix&rdquo; or save as a single standard item.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border bg-background">
                        <TableHead className="h-9 text-xs w-[180px]">Variant Title</TableHead>
                        <TableHead className="h-9 text-xs w-[170px]">SKU *</TableHead>
                        <TableHead className="h-9 text-xs w-[150px]">Barcode *</TableHead>
                        <TableHead className="h-9 text-xs w-[110px]">Cost Price</TableHead>
                        <TableHead className="h-9 text-xs w-[110px]">Selling Price</TableHead>
                        <TableHead className="h-9 text-xs w-[90px]">Weight</TableHead>
                        <TableHead className="h-9 text-xs w-[80px]">Status</TableHead>
                        <TableHead className="h-9 text-xs w-[60px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variantFields.map((field, idx) => {
                        const skuVal = form.watch(`variants.${idx}.sku`);
                        const barcodeVal = form.watch(`variants.${idx}.barcode`);
                        const isSkuDup = !isSkuAvailable(skuVal, initialData?.id, field.id);
                        const isBarcodeDup = !isBarcodeAvailable(barcodeVal, initialData?.id, field.id);

                        return (
                          <TableRow key={field.id} className="border-b border-border/60 hover:bg-muted/20">
                            <TableCell className="py-2">
                              <Input
                                value={form.watch(`variants.${idx}.name`)}
                                onChange={(e) =>
                                  updateVariant(idx, {
                                    ...form.getValues(`variants.${idx}`),
                                    name: e.target.value,
                                  })
                                }
                                className="h-7 text-xs font-medium"
                              />
                            </TableCell>

                            <TableCell className="py-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={skuVal}
                                    onChange={(e) =>
                                      updateVariant(idx, {
                                        ...form.getValues(`variants.${idx}`),
                                        sku: e.target.value.toUpperCase(),
                                      })
                                    }
                                    className={`h-7 text-xs font-mono uppercase ${isSkuDup ? "border-destructive text-destructive" : ""}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => regenerateSingleSku(idx)}
                                    title="Auto-generate SKU"
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <RefreshCw className="size-3" />
                                  </button>
                                </div>
                                {isSkuDup && (
                                  <p className="text-[10px] text-destructive font-mono">Duplicate SKU</p>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-2">
                              <div className="space-y-0.5">
                                <Input
                                  value={barcodeVal}
                                  onChange={(e) =>
                                    updateVariant(idx, {
                                      ...form.getValues(`variants.${idx}`),
                                      barcode: e.target.value,
                                    })
                                  }
                                  className={`h-7 text-xs font-mono ${isBarcodeDup ? "border-destructive text-destructive" : ""}`}
                                />
                                {isBarcodeDup && (
                                  <p className="text-[10px] text-destructive font-mono">Duplicate Barcode</p>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-2">
                              <Input
                                type="number"
                                step="any"
                                value={form.watch(`variants.${idx}.costPrice`)}
                                onChange={(e) =>
                                  updateVariant(idx, {
                                    ...form.getValues(`variants.${idx}`),
                                    costPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-7 text-xs font-mono"
                              />
                            </TableCell>

                            <TableCell className="py-2">
                              <Input
                                type="number"
                                step="any"
                                value={form.watch(`variants.${idx}.sellingPrice`)}
                                onChange={(e) =>
                                  updateVariant(idx, {
                                    ...form.getValues(`variants.${idx}`),
                                    sellingPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-7 text-xs font-mono"
                              />
                            </TableCell>

                            <TableCell className="py-2">
                              <Input
                                type="number"
                                step="any"
                                value={form.watch(`variants.${idx}.weight`) || ""}
                                onChange={(e) =>
                                  updateVariant(idx, {
                                    ...form.getValues(`variants.${idx}`),
                                    weight: parseFloat(e.target.value) || undefined,
                                  })
                                }
                                placeholder="1.0"
                                className="h-7 text-xs font-mono"
                              />
                            </TableCell>

                            <TableCell className="py-2">
                              <Switch
                                checked={form.watch(`variants.${idx}.status`) === "active"}
                                onCheckedChange={(checked) =>
                                  updateVariant(idx, {
                                    ...form.getValues(`variants.${idx}`),
                                    status: checked ? "active" : "inactive",
                                  })
                                }
                              />
                            </TableCell>

                            <TableCell className="text-right py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeVariant(idx)}
                                className="size-6 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. PRICING, MARGINS & PROFIT PREVIEW */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("pricing")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="size-4 text-muted-foreground" />
              <span>4. Master Pricing & Profit Margin Preview</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Define baseline procurement costs, retail MSRP, and calculate real-time profitability.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {marginPercent.toFixed(1)}% Margin
          </Badge>
        </CardHeader>

        {openSections.pricing && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Default Cost & Sell Inputs */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Master Cost Price (৳) *
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="h-8.5 text-sm font-mono"
                    {...form.register("defaultCostPrice", { valueAsNumber: true })}
                  />
                  {form.formState.errors.defaultCostPrice && (
                    <p className="text-xs text-destructive font-medium">{form.formState.errors.defaultCostPrice.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Master Selling Price (৳) *
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="h-8.5 text-sm font-mono"
                    {...form.register("defaultSellingPrice", { valueAsNumber: true })}
                  />
                  {form.formState.errors.defaultSellingPrice && (
                    <p className="text-xs text-destructive font-medium">{form.formState.errors.defaultSellingPrice.message}</p>
                  )}
                </div>
              </div>

              {/* Bulk Apply Action */}
              <div className="flex flex-col justify-end space-y-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyBulkPricing}
                  className="h-8.5 text-xs border-border gap-1.5"
                >
                  <TrendingUp className="size-3.5" /> Apply to All Variants
                </Button>
                <p className="text-[10px] text-muted-foreground font-mono text-center">
                  Updates all variant matrix rows with master prices
                </p>
              </div>
            </div>

            {/* Live Profit Preview Box */}
            <div className="border border-border p-3.5 rounded-xs bg-muted/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Cost Base</span>
                <p className="text-sm font-semibold text-foreground">৳{defaultCostPrice.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Selling MSRP</span>
                <p className="text-sm font-semibold text-foreground">৳{defaultSellingPrice.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Gross Profit</span>
                <p className={`text-sm font-semibold ${grossProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {grossProfit >= 0 ? `+৳${grossProfit.toFixed(2)}` : `-৳${Math.abs(grossProfit).toFixed(2)}`}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Profit Margin</span>
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold ${marginPercent >= 20 ? "text-emerald-500" : marginPercent >= 0 ? "text-amber-500" : "text-destructive"}`}>
                    {marginPercent.toFixed(1)}%
                  </p>
                  {marginPercent < 0 && (
                    <Badge variant="outline" className="text-[9px] font-mono border-destructive text-destructive px-1 py-0">
                      Loss
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. MEDIA & VISUAL GALLERY */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("media")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span>5. Media & Lookbook Gallery</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Primary lookbook hero imagery, editorial angles, and colorway swatches.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {mediaFields.length} Image(s)
          </Badge>
        </CardHeader>

        {openSections.media && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {mediaFields.map((field, idx) => (
                <div key={field.id} className="border border-border p-2.5 rounded-xs bg-background space-y-2">
                  <div className="relative aspect-square rounded-xs overflow-hidden border border-border bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.watch(`media.${idx}.url`)}
                      alt={form.watch(`media.${idx}.alt`) || `Photo ${idx + 1}`}
                      className="size-full object-cover"
                    />
                    {form.watch(`media.${idx}.isPrimary`) && (
                      <Badge className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-foreground text-background px-1 py-0">
                        Primary Hero
                      </Badge>
                    )}
                  </div>

                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={form.watch(`media.${idx}.url`)}
                    onChange={(e) =>
                      updateMedia(idx, {
                        ...form.getValues(`media.${idx}`),
                        url: e.target.value,
                      })
                    }
                    className="h-7 text-xs font-mono"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        mediaFields.forEach((_, mIdx) => {
                          updateMedia(mIdx, {
                            ...form.getValues(`media.${mIdx}`),
                            isPrimary: mIdx === idx,
                          });
                        });
                      }}
                      className={`text-[11px] font-mono ${
                        form.watch(`media.${idx}.isPrimary`)
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground underline"
                      }`}
                    >
                      {form.watch(`media.${idx}.isPrimary`) ? "✓ Primary" : "Set Primary"}
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeMedia(idx)}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add New Media Card */}
              <button
                type="button"
                onClick={() =>
                  appendMedia({
                    id: `med-${Date.now()}`,
                    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
                    isPrimary: mediaFields.length === 0,
                    alt: "Lookbook Angle",
                    sortOrder: mediaFields.length + 1,
                  })
                }
                className="aspect-square border border-dashed border-border rounded-xs flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <Plus className="size-5" />
                <span className="text-xs font-medium">Add Gallery Image</span>
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 6. ADDITIONAL INFORMATION */}
      {/* ========================================================================= */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader
          onClick={() => toggleSection("additional")}
          className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span>6. Additional Atelier & Logistics Info (Optional)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manufacturer details, origin country, warranty periods, and HS customs tariff codes.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border">
            {openSections.additional ? "Expanded" : "Collapsed"}
          </Badge>
        </CardHeader>

        {openSections.additional && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Manufacturer */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Manufacturer / Atelier
                </Label>
                <Input
                  placeholder="e.g. Atelier Saint-Honoré"
                  className="h-8.5 text-sm"
                  {...form.register("additionalInfo.manufacturer")}
                />
              </div>

              {/* Country of Origin */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Country of Origin
                </Label>
                <Input
                  placeholder="e.g. France, Italy, Sweden"
                  className="h-8.5 text-sm"
                  {...form.register("additionalInfo.originCountry")}
                />
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warranty Terms
                </Label>
                <Input
                  placeholder="e.g. Lifetime Repair Guarantee"
                  className="h-8.5 text-sm"
                  {...form.register("additionalInfo.warranty")}
                />
              </div>

              {/* HS Code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  HS Customs Tariff Code
                </Label>
                <Input
                  placeholder="e.g. 6101.90.00"
                  className="h-8.5 text-sm font-mono"
                  {...form.register("additionalInfo.hsCode")}
                />
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Internal Merchandising Notes
              </Label>
              <Textarea
                placeholder="Internal provenance memo, runway rollout constraints, VIP pre-order terms..."
                className="min-h-[60px] text-xs resize-none"
                {...form.register("additionalInfo.notes")}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 7. STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 z-20 -mx-3 md:-mx-4 -mb-3 md:-mb-4 px-4 py-2.5 bg-background/98 backdrop-blur-xs border-t border-border flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
            {variantFields.length} Variants Configured
          </Badge>
          {Object.keys(form.formState.errors).length > 0 && (
            <span className="text-xs text-destructive flex items-center gap-1 font-medium">
              <AlertCircle className="size-3.5" /> Please review required fields
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
            className="h-8 text-xs border-border"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs px-5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5 shadow-sm"
          >
            <Save className="size-3.5" /> {mode === "edit" ? "Update Product" : "Save Product Payload"}
          </Button>
        </div>
      </div>
    </form>
  );
}
