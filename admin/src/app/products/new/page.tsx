"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { ProductForm } from "@/components/products/product-form";

export default function CreateProductPage() {
  return (
    <AdminShell>
      <div className="w-full min-w-0">
        <ProductForm mode="create" />
      </div>
    </AdminShell>
  );
}
