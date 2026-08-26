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
import { Badge } from "@/components/ui/badge";
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

export function AdminHeader({
  onQuickAction,
  quickActionLabel,
}: {
  onQuickAction?: () => void;
  quickActionLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
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

  const getBreadcrumbs = () => {
    if (pathname === "/") return [{ label: "Dashboard", href: "/", isLast: true }];
    if (pathname.startsWith("/categories")) {
      return [
        { label: "Catalog", href: "/categories", isLast: false },
        { label: "Category Hierarchy", href: "/categories", isLast: true },
      ];
    }
    if (pathname.startsWith("/products")) {
      return [
        { label: "Catalog", href: "/products", isLast: false },
        { label: "Products & SKUs", href: "/products", isLast: true },
      ];
    }
    if (pathname.startsWith("/orders")) {
      return [
        { label: "Operations", href: "/orders", isLast: false },
        { label: "Client Orders", href: "/orders", isLast: true },
      ];
    }
    return [{ label: "Studio Admin", href: pathname, isLast: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-11 w-full items-center justify-between border-b border-border bg-background px-4 select-none">
        {/* Left: Sidebar Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="size-7" />

          <div className="h-4 w-px bg-border hidden sm:block" />

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                  Studio
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label + idx}>
                  <BreadcrumbSeparator className="text-muted-foreground/60">/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-medium text-foreground text-xs">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground text-xs">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: Search, Theme Toggle, Environment Badge, Quick Action & User Menu */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenCommand(true)}
            className="hidden md:flex items-center gap-2 h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border bg-background"
          >
            <Search className="size-3.5 text-muted-foreground" />
            <span>Search studio catalog...</span>
            <Kbd className="text-[10px] ml-1.5 bg-muted border border-border/60">⌘K</Kbd>
          </Button>

          {/* Environment Status Badge */}
          <Badge
            variant="outline"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono border-border bg-background text-muted-foreground px-2 py-0.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            SS26 Live
          </Badge>

          {/* Theme Toggle (Dark / Light / System) */}
          <ModeToggle />

          {/* Optional Page Quick Action */}
          {onQuickAction && quickActionLabel && (
            <Button size="xs" onClick={onQuickAction} className="h-7 text-xs px-2.5">
              {quickActionLabel}
            </Button>
          )}

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="size-7 border-border bg-background text-foreground"
                />
              }
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="sr-only">Admin menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">Alexander S.</p>
                  <p className="text-xs font-mono leading-none text-muted-foreground">
                    alex@ncloth.studio • Merchandising
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/categories")} className="text-sm py-2">
                <FolderTree className="size-4 mr-2 text-muted-foreground" />
                <span>Categories & Hierarchy</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/products")} className="text-sm py-2">
                <Package className="size-4 mr-2 text-muted-foreground" />
                <span>Products & SKUs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/orders")} className="text-sm py-2">
                <ShoppingBag className="size-4 mr-2 text-muted-foreground" />
                <span>Client Orders</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive text-sm py-2">
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
          <CommandGroup heading="Catalog & Hierarchy">
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
                router.push("/collections");
              }}
              className="text-sm py-2"
            >
              <Sparkles className="size-4 mr-2" />
              <span>Runway & Lookbook Collections</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/inventory");
              }}
              className="text-sm py-2"
            >
              <Layers className="size-4 mr-2" />
              <span>Inventory & Low Stock Matrix</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Operations">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/orders");
              }}
              className="text-sm py-2"
            >
              <ShoppingBag className="size-4 mr-2" />
              <span>Client Orders & Fulfillments</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
