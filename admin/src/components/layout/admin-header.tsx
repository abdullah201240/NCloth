"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Kbd } from "@/components/ui/kbd";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Search,
  SlidersHorizontal,
  LogOut,
  FolderTree,
  Package,
  ShoppingBag,
  Sparkles,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/stores/profile-context";

interface BreadcrumbEntry {
  label: string;
  href: string;
  isLast?: boolean;
}

const STATIC_ROUTE_MAP: Record<string, BreadcrumbEntry[]> = {
  "/": [{ label: "Dashboard", href: "/", isLast: true }],
  "/categories": [
    { label: "Category Management", href: "/categories" },
    { label: "Taxonomy Dashboard", href: "/categories", isLast: true },
  ],
  "/categories/root": [
    { label: "Category Management", href: "/categories" },
    { label: "Root Categories", href: "/categories/root", isLast: true },
  ],
  "/categories/category": [
    { label: "Category Management", href: "/categories" },
    { label: "Product Categories", href: "/categories/category", isLast: true },
  ],
  "/categories/subcategory": [
    { label: "Category Management", href: "/categories" },
    { label: "Subcategories", href: "/categories/subcategory", isLast: true },
  ],
  "/products": [
    { label: "Product Management", href: "/products" },
    { label: "All Products & SKUs", href: "/products", isLast: true },
  ],
  "/products/new": [
    { label: "Product Management", href: "/products" },
    { label: "Create Product Matrix", href: "/products/new", isLast: true },
  ],
  "/products/brands": [
    { label: "Product Management", href: "/products" },
    { label: "Brand Houses", href: "/products/brands", isLast: true },
  ],
  "/products/attributes": [
    { label: "Product Management", href: "/products" },
    { label: "Dynamic Attributes", href: "/products/attributes", isLast: true },
  ],
  "/products/attributes/sets": [
    { label: "Product Management", href: "/products/attributes" },
    { label: "Attribute Sets", href: "/products/attributes/sets", isLast: true },
  ],
  "/products/attributes/values": [
    { label: "Product Management", href: "/products/attributes" },
    { label: "Attribute Values", href: "/products/attributes/values", isLast: true },
  ],
  "/products/attributes/units": [
    { label: "Product Management", href: "/products/attributes" },
    { label: "Measurement Units", href: "/products/attributes/units", isLast: true },
  ],
  "/purchases": [
    { label: "Sourcing & Procurement", href: "/purchases" },
    { label: "Purchase Orders", href: "/purchases", isLast: true },
  ],
  "/purchases/new": [
    { label: "Sourcing & Procurement", href: "/purchases" },
    { label: "Create Purchase Order", href: "/purchases/new", isLast: true },
  ],
  "/suppliers": [
    { label: "Sourcing & Procurement", href: "/suppliers" },
    { label: "All Suppliers", href: "/suppliers", isLast: true },
  ],
  "/inventory": [
    { label: "Inventory & Storage", href: "/inventory" },
    { label: "Global Stock Matrix", href: "/inventory", isLast: true },
  ],
  "/receiving": [
    { label: "Inbound Logistics", href: "/receiving" },
    { label: "Inward Receiving Center", href: "/receiving", isLast: true },
  ],
  "/warehouse/putaway": [
    { label: "Warehouse Operations", href: "/warehouses" },
    { label: "Putaway Execution Queue", href: "/warehouse/putaway", isLast: true },
  ],
  "/transfers": [
    { label: "Transfers & Logistics", href: "/transfers" },
    { label: "Stock Transfers Pipeline", href: "/transfers", isLast: true },
  ],
  "/transfers/new": [
    { label: "Transfers & Logistics", href: "/transfers" },
    { label: "New Stock Transfer", href: "/transfers/new", isLast: true },
  ],
  "/stock-requests": [
    { label: "Retail & Boutiques", href: "/stores" },
    { label: "Store Stock Requests", href: "/stock-requests", isLast: true },
  ],
  "/stock-requests/new": [
    { label: "Retail & Boutiques", href: "/stores" },
    { label: "New Stock Request", href: "/stock-requests/new", isLast: true },
  ],
  "/warehouses": [
    { label: "Storage & Facilities", href: "/warehouses" },
    { label: "Central Warehouses", href: "/warehouses", isLast: true },
  ],
  "/warehouses/shelves": [
    { label: "Storage & Facilities", href: "/warehouses" },
    { label: "Storage Shelves & Bins", href: "/warehouses/shelves", isLast: true },
  ],
  "/stores": [
    { label: "Retail & Boutiques", href: "/stores" },
    { label: "Retail Stores", href: "/stores", isLast: true },
  ],
  "/stores/shelves": [
    { label: "Retail & Boutiques", href: "/stores" },
    { label: "Store Floor Shelves", href: "/stores/shelves", isLast: true },
  ],
  "/profile": [
    { label: "Studio Admin", href: "/" },
    { label: "Administrator Profile", href: "/profile", isLast: true },
  ],
};

function resolveDynamicBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  if (STATIC_ROUTE_MAP[pathname]) {
    return STATIC_ROUTE_MAP[pathname];
  }

  // Handle dynamic routes
  if (pathname.startsWith("/products/") && pathname.endsWith("/edit")) {
    return [
      { label: "Product Management", href: "/products" },
      { label: "Edit Product Matrix", href: pathname, isLast: true },
    ];
  }
  if (pathname.startsWith("/purchases/")) {
    return [
      { label: "Sourcing & Procurement", href: "/purchases" },
      { label: "Purchase Order Details", href: pathname, isLast: true },
    ];
  }
  if (pathname.startsWith("/transfers/")) {
    return [
      { label: "Transfers & Logistics", href: "/transfers" },
      { label: "Transfer Manifest & Timeline", href: pathname, isLast: true },
    ];
  }
  if (pathname.startsWith("/receiving/")) {
    return [
      { label: "Inbound Logistics", href: "/receiving" },
      { label: "Receiving Scan Terminal", href: pathname, isLast: true },
    ];
  }
  if (pathname.startsWith("/warehouses/") && pathname.endsWith("/inventory")) {
    return [
      { label: "Storage & Facilities", href: "/warehouses" },
      { label: "Warehouse Inventory Drilldown", href: pathname, isLast: true },
    ];
  }
  if (pathname.startsWith("/stores/") && pathname.endsWith("/inventory")) {
    return [
      { label: "Retail & Boutiques", href: "/stores" },
      { label: "Store Boutique Inventory", href: pathname, isLast: true },
    ];
  }

  // Fallback: segment-based parsing
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbEntry[] = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;
    const formatted = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({
      label: formatted,
      href: currentPath,
      isLast: i === segments.length - 1,
    });
  }

  return crumbs.length > 0 ? crumbs : [{ label: "Dashboard", href: "/", isLast: true }];
}

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useProfile();
  const [openCommand, setOpenCommand] = React.useState(false);

  // Keyboard shortcut Cmd+K or Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const breadcrumbs = React.useMemo(() => resolveDynamicBreadcrumbs(pathname), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-background px-4">
        {/* Left: Sidebar Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="size-8 text-foreground" />

          <div className="h-5 w-px bg-border hidden sm:block" />

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList className="text-sm font-medium">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground text-sm">
                  Studio
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label + idx}>
                  <BreadcrumbSeparator className="text-muted-foreground/60 text-sm">/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground text-sm">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground text-sm font-medium">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: Quick actions, Command Palette & Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenCommand(true)}
            className="hidden md:flex h-8 w-60 items-center justify-between px-2.5 text-xs text-muted-foreground border-border bg-background hover:bg-background hover:border-foreground/40 font-normal"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground" />
              <span>Search studio or commands...</span>
            </span>
            <Kbd className="text-[10px] uppercase font-mono px-1.5 py-0.5">⌘K</Kbd>
          </Button>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setOpenCommand(true)}
            className="flex md:hidden size-8 border-border bg-background text-foreground"
          >
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="size-8 border-border bg-background text-foreground"
                />
              }
            >
              <SlidersHorizontal className="size-4" />
              <span className="sr-only">Admin menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel
                onClick={() => router.push("/profile")}
                className="font-normal p-2 cursor-pointer hover:bg-background transition-colors rounded-xs border-b border-border/40"
              >
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs font-mono leading-none text-muted-foreground">
                    {profile.email} • {profile.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/profile")} className="text-sm py-2">
                <SlidersHorizontal className="size-4 mr-2 text-muted-foreground" />
                <span>My Profile & Security</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/inventory")} className="text-sm py-2">
                <Layers className="size-4 mr-2 text-muted-foreground" />
                <span>Global Stock Matrix</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/transfers")} className="text-sm py-2">
                <Package className="size-4 mr-2 text-muted-foreground" />
                <span>Stock Transfers</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/categories")} className="text-sm py-2">
                <FolderTree className="size-4 mr-2 text-muted-foreground" />
                <span>Categories & Hierarchy</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-destructive focus:text-destructive text-sm py-2 cursor-pointer"
              >
                <LogOut className="size-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Type a category, product, or command..." className="text-sm" />
        <CommandList className="text-sm">
          <CommandEmpty className="text-sm p-4">No matching studio records found.</CommandEmpty>
          <CommandGroup heading="Catalog & Taxonomy">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/categories");
              }}
              className="text-sm py-2"
            >
              <FolderTree className="size-4 mr-2" />
              <span>Category Hierarchy (Root, Categories, Subcategories)</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/products");
              }}
              className="text-sm py-2"
            >
              <Package className="size-4 mr-2" />
              <span>Product Catalog & Variant Matrix</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/products/attributes");
              }}
              className="text-sm py-2"
            >
              <Layers className="size-4 mr-2" />
              <span>Dynamic Attributes & Sets</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/products/brands");
              }}
              className="text-sm py-2"
            >
              <Sparkles className="size-4 mr-2" />
              <span>Brand Houses & Ateliers</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Inventory & Logistics">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/inventory");
              }}
              className="text-sm py-2"
            >
              <Layers className="size-4 mr-2" />
              <span>Global Stock Matrix & Audit Ledger</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/receiving");
              }}
              className="text-sm py-2"
            >
              <Package className="size-4 mr-2" />
              <span>Inbound Inward Receiving Center</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/transfers");
              }}
              className="text-sm py-2"
            >
              <Package className="size-4 mr-2" />
              <span>Stock Transfers & Dispatch Pipeline</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/warehouse/putaway");
              }}
              className="text-sm py-2"
            >
              <Layers className="size-4 mr-2" />
              <span>Warehouse Putaway Operations</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Procurement & Facilities">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/purchases");
              }}
              className="text-sm py-2"
            >
              <ShoppingBag className="size-4 mr-2" />
              <span>Purchase Orders & Goods Receipts</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/suppliers");
              }}
              className="text-sm py-2"
            >
              <ShoppingBag className="size-4 mr-2" />
              <span>Fabric & Garment Suppliers</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/warehouses");
              }}
              className="text-sm py-2"
            >
              <Package className="size-4 mr-2" />
              <span>Central Warehouses & Shelves</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/stores");
              }}
              className="text-sm py-2"
            >
              <ShoppingBag className="size-4 mr-2" />
              <span>Retail Stores & Boutique Shelves</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
