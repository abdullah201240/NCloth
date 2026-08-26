"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, ShieldAlert } from "lucide-react";

export default function NewPurchasePage() {
  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Link
                href="/purchases"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Back to Purchase Orders"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShoppingCart className="size-4 text-muted-foreground" />
                <span>Create Purchase Order</span>
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                Direct Procurement
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              DIRECT SUPPLIER PURCHASE • PRODUCT VARIANT LINE ITEMS • BDT FINANCIALS
            </p>
          </div>
        </div>

        {/* Master Single-Page Form */}
        <PurchaseForm mode="create" />
      </div>
    </AdminShell>
  );
}
