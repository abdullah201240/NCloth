"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderTree,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const recentVipOrders = [
  {
    id: "ORD-9482",
    client: "Charlotte de Bourbon",
    tier: "VIP Tier 1",
    items: "Oversized Cashmere Blazer (M) + Wide Trousers (38)",
    total: "৳24,500",
    status: "processing",
    date: "10 mins ago",
  },
  {
    id: "ORD-9481",
    client: "Julian Vance",
    tier: "Private Client",
    items: "Italian Calfskin Chelsea Boots (43)",
    total: "৳8,900",
    status: "packed",
    date: "42 mins ago",
  },
  {
    id: "ORD-9480",
    client: "Elena Rostova",
    tier: "VIP Tier 1",
    items: "Double-Breasted Wool Trench (S)",
    total: "৳18,500",
    status: "dispatched",
    date: "2 hrs ago",
  },
  {
    id: "ORD-9479",
    client: "Marcus Sterling",
    tier: "Regular",
    items: "13.5oz Japanese Selvedge Denim (32)",
    total: "৳4,200",
    status: "delivered",
    date: "5 hrs ago",
  },
];

export default function DashboardPage() {
  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Studio Operations & Merchandising
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                SS26 Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              PARIS / NEW YORK STUDIO • ZERO-DELETE ENFORCED
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/categories"
              className={cn(buttonVariants({ size: "sm" }), "text-sm h-8 px-3")}
            >
              <FolderTree className="size-4 mr-1.5" /> Manage Hierarchy
            </Link>
          </div>
        </div>

        {/* 4 Minimalist Fashion Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Gross Merchandise</span>
              <TrendingUp className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                ৳1,482,000
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                +18.4%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              vs last runway collection cycle
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Sell-Through Rate</span>
              <Sparkles className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                78.4%
              </span>
              <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0">
                &gt;75% Target
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Top velocity: Outerwear & Knitwear
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Category Hierarchy</span>
              <FolderTree className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                3 Tiers
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                4 Roots • 24 Nodes
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              100% SKU prefixes mapped
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Orders</span>
              <ShoppingBag className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                12 Orders
              </span>
              <span className="text-xs font-mono text-amber-600 font-medium">
                3 In-Pack
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Average fulfillment: 4.2 hrs
            </p>
          </Card>
        </div>

        {/* 2-Column Grid: Category Quick-Nav + Recent VIP Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Category Taxonomy Summary Card */}
          <Card className="lg:col-span-1 border border-border rounded-xs bg-background">
            <CardHeader className="p-3.5 px-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Hierarchy Taxonomy</CardTitle>
                <Link
                  href="/categories"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                >
                  Manage <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Root classifications and SKU prefix routing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2.5">
              <div className="border border-border p-2.5 rounded-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                    RTW
                  </Badge>
                  <span className="text-sm font-medium text-foreground">Ready-To-Wear</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">3 Categories</span>
              </div>

              <div className="border border-border p-2.5 rounded-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                    FTW
                  </Badge>
                  <span className="text-sm font-medium text-foreground">Footwear</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">2 Categories</span>
              </div>

              <div className="border border-border p-2.5 rounded-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                    ACC
                  </Badge>
                  <span className="text-sm font-medium text-foreground">Leather Goods</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">1 Category</span>
              </div>

              <div className="border border-border p-2.5 rounded-xs flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                    ARC
                  </Badge>
                  <span className="text-sm font-medium text-foreground">Runway & Archive</span>
                </div>
                <Badge variant="outline" className="text-xs uppercase border-border text-zinc-500 px-1.5 py-0">
                  Inactive
                </Badge>
              </div>

              <div className="pt-1.5">
                <Link
                  href="/categories"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full text-sm h-8 border-border"
                  )}
                >
                  <FolderTree className="size-3.5 mr-1.5" /> Open Full Hierarchy Tree
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Client Orders Table */}
          <Card className="lg:col-span-2 border border-border rounded-xs bg-background">
            <CardHeader className="p-3.5 px-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent Clienteling Orders</CardTitle>
                <Badge variant="outline" className="text-xs font-mono border-border px-1.5 py-0.5">
                  Realtime
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                High-priority orders, VIP allocations, and dispatch status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background">
                    <TableHead className="w-[100px] h-9 text-xs">Order</TableHead>
                    <TableHead className="h-9 text-xs">Client</TableHead>
                    <TableHead className="hidden sm:table-cell h-9 text-xs">Garments</TableHead>
                    <TableHead className="text-right h-9 text-xs">Total</TableHead>
                    <TableHead className="text-right w-[110px] h-9 text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVipOrders.map((ord) => (
                    <TableRow key={ord.id} className="border-b border-border/60 hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-medium py-2.5">
                        {ord.id}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{ord.client}</span>
                          <span className="text-xs font-mono text-muted-foreground">{ord.tier}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate py-2.5">
                        {ord.items}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums text-foreground py-2.5">
                        {ord.total}
                      </TableCell>
                      <TableCell className="text-right py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-mono px-2 py-0.5 ${
                            ord.status === "delivered"
                              ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                              : ord.status === "processing"
                              ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                              : ord.status === "dispatched"
                              ? "border-indigo-500/30 text-indigo-600 bg-indigo-500/10"
                              : "border-border text-foreground"
                          }`}
                        >
                          {ord.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
