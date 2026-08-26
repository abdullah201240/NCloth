"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FolderTree,
  Folder,
  Tag,
  Package,
  ShoppingBag,
  RotateCcw,
  Users,
  BarChart3,
  Sliders,
  Sparkles,
  LayoutDashboard,
  Layers,
  Building2,
  Grid,
  Truck,
  ArrowUpRight,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Studio Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Brand Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Category Management",
    items: [
      {
        title: "Taxonomy Dashboard",
        url: "/categories",
        icon: LayoutDashboard,
      },
      {
        title: "Root Categories",
        url: "/categories/root",
        icon: FolderTree,
        badge: "Tier 1",
      },
      {
        title: "Product Categories",
        url: "/categories/category",
        icon: Folder,
        badge: "Tier 2",
      },
      {
        title: "Subcategories",
        url: "/categories/subcategory",
        icon: Tag,
        badge: "Tier 3",
      },
    ],
  },
  {
    label: "Catalog & Merchandising",
    items: [
      {
        title: "Products & SKUs",
        url: "/products",
        icon: Package,
        badge: 87,
      },
      {
        title: "Collections & Runway",
        url: "/collections",
        icon: Sparkles,
        badge: "SS26",
      },
      {
        title: "Inventory Matrix",
        url: "/inventory",
        icon: Layers,
      },
    ],
  },
  {
    label: "Warehouse Management",
    items: [
      {
        title: "All Warehouses",
        url: "/warehouses",
        icon: Building2,
        badge: 5,
      },
      {
        title: "Storage Shelves",
        url: "/warehouses/shelves",
        icon: Grid,
        badge: 7,
      },
    ],
  },
  {
    label: "Sourcing & Procurement",
    items: [
      {
        title: "All Suppliers",
        url: "/suppliers",
        icon: Truck,
        badge: 6,
      },
    ],
  },
  {
    label: "Operations & Sales",
    items: [
      {
        title: "Client Orders",
        url: "/orders",
        icon: ShoppingBag,
        badge: 12,
      },
      {
        title: "Returns & Exchanges",
        url: "/returns",
        icon: RotateCcw,
        badge: 3,
      },
      {
        title: "Private Clients",
        url: "/customers",
        icon: Users,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Studio Settings",
        url: "/settings",
        icon: Sliders,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-background">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border p-3.5 px-4">
        <Link href="/" className="flex items-center justify-between group">
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-widest text-foreground uppercase">
              N C L O T H
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Studio Admin
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-xs uppercase font-mono tracking-wider px-1.5 py-0 border-border text-muted-foreground"
          >
            v1.0
          </Badge>
        </Link>
      </SidebarHeader>

      {/* Navigation Sections */}
      <SidebarContent className="px-2 py-3 space-y-3">
        {navigationSections.map((section) => (
          <SidebarGroup key={section.label} className="p-0">
            <SidebarGroupLabel className="px-2.5 mb-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground h-6">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const isExact = pathname === item.url;
                  const isPrefix = item.url !== "/" && pathname.startsWith(`${item.url}/`);
                  const hasMoreSpecificItem = navigationSections.some((sec) =>
                    sec.items.some(
                      (other) =>
                        other.url !== item.url &&
                        (pathname === other.url ||
                          (other.url.startsWith(item.url) && pathname.startsWith(`${other.url}/`)))
                    )
                  );

                  const isActive = isExact || (isPrefix && !hasMoreSpecificItem);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.url}
                            className={`flex items-center justify-between w-full h-8 px-2.5 rounded-xs text-sm transition-colors ${
                              isActive
                                ? "bg-foreground text-background font-medium hover:bg-foreground/90 hover:text-background"
                                : "text-foreground/90 hover:bg-muted hover:text-foreground"
                            }`}
                          />
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            className={`size-4 shrink-0 ${
                              isActive ? "text-background" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate text-sm">{item.title}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`text-xs font-mono px-1.5 py-0.5 rounded-xs ${
                              isActive
                                ? "bg-background/20 text-background"
                                : "bg-muted text-muted-foreground border border-border/40"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer Profile & Live Link */}
      <SidebarFooter className="border-t border-border p-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-6 rounded-xs border border-border">
              <AvatarFallback className="text-xs font-mono bg-background text-foreground">
                NC
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground truncate leading-tight">
                Alexander S.
              </span>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 leading-tight mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                Active Admin
              </span>
            </div>
          </div>
          <Link
            href="https://ncloth.store"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Storefront"
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
