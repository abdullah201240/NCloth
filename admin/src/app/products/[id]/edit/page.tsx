"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { ProductForm } from "@/components/products/product-form";
import { useProducts } from "@/lib/stores/product-context";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getProductById } = useProducts();

  const product = React.useMemo(() => {
    return params.id ? getProductById(params.id) : undefined;
  }, [params.id, getProductById]);

  if (!product) {
    return (
      <AdminShell>
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-4 border border-dashed border-border rounded-xs">
          <AlertCircle className="size-8 text-muted-foreground" />
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold text-foreground">Product Not Found</h2>
            <p className="text-xs text-muted-foreground font-mono">
              The product identifier &ldquo;{params.id}&rdquo; does not exist or has been removed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
            className="h-8 text-xs border-border gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Return to Catalog
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="w-full min-w-0">
        <ProductForm initialData={product} mode="edit" />
      </div>
    </AdminShell>
  );
}
