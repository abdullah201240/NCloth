"use client";

import * as React from "react";
import Image from "next/image";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { StoreFormSheet } from "@/components/stores/store-form-sheet";
import { StoreStatusDialog } from "@/components/stores/store-status-dialog";
import { useStoreContext } from "@/lib/stores/store-context";
import { Store, StoreStatus } from "@/lib/types/store";
import { StoreFormValues } from "@/lib/validations/store";
import { formatStudioDate } from "@/lib/utils";
import {
  Store as StoreIcon,
  Plus,
  Search,
  Edit2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Archive,
  ImageOff,
} from "lucide-react";

export default function StoresPage() {
  const {
    stores,
    stats,
    addStore,
    updateStore,
    toggleStatus,
  } = useStoreContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingStore, setEditingStore] = React.useState<Store | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    currentStatus: StoreStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingStore(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: StoreFormValues, editId?: string) => {
    if (editId) {
      updateStore(editId, data);
    } else {
      addStore(data);
    }
  };

  const filteredStores = React.useMemo(() => {
    return stores.filter((store) => {
      if (statusFilter !== "all" && store.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesCode = store.code.toLowerCase().includes(q);
        const matchesAddress = store.address?.toLowerCase().includes(q) || false;
        const matchesManager = store.manager?.toLowerCase().includes(q) || false;
        const matchesPhone = store.phone?.toLowerCase().includes(q) || false;
        const matchesEmail = store.email?.toLowerCase().includes(q) || false;
        return (
          matchesName ||
          matchesCode ||
          matchesAddress ||
          matchesManager ||
          matchesPhone ||
          matchesEmail
        );
      }
      return true;
    });
  }, [stores, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Retail Stores & Boutiques
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {stores.length} Boutiques Registered
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage flagship boutiques, retail salons, boutique managers, contact details, and omnichannel routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Store
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Stores</span>
              <StoreIcon className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalStores}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeStores} Active Boutiques
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Boutiques</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeStores}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                Open
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Inactive / Renovating</span>
              <Archive className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.inactiveStores}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Closed
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Status Filter + View Switcher (Table default) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search store name, code (STR-PAR-01), manager, address, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active Only</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* View Switcher: Table 1st, Grid 2nd */}
            <div className="flex items-center gap-1 border border-border p-0.5 rounded-xs bg-background shrink-0">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Data Table"
              >
                <ListFilter className="size-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="xs"
                onClick={() => setViewMode("grid")}
                className="h-7 text-xs px-2.5 gap-1.5"
                title="Grid Cards"
              >
                <LayoutGrid className="size-3.5" /> Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Content: Data Table (Default) or Grid Cards */}
        {viewMode === "table" ? (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-9 text-xs">Store Boutique</TableHead>
                  <TableHead className="w-[120px] h-9 text-xs">Store Code</TableHead>
                  <TableHead className="h-9 text-xs">Address</TableHead>
                  <TableHead className="h-9 text-xs">Manager</TableHead>
                  <TableHead className="h-9 text-xs">Contact</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                      No stores match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => {
                    const isActive = store.status === "active";

                    return (
                      <TableRow key={store.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            {store.imageUrl ? (
                              <div className="relative size-8 rounded-xs overflow-hidden border border-border shrink-0 bg-muted">
                                <Image
                                  src={store.imageUrl}
                                  alt={store.name}
                                  fill
                                  sizes="32px"
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="size-8 rounded-xs border border-border bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0">
                                <StoreIcon className="size-4" />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-foreground">{store.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-sm font-medium text-foreground">
                          {store.code}
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-muted-foreground max-w-xs truncate">
                          {store.address ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{store.address}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-sm text-foreground">
                          {store.manager ? (
                            <div className="flex items-center gap-1.5">
                              <User className="size-3 text-muted-foreground shrink-0" />
                              <span>{store.manager}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-foreground">
                          <div className="space-y-0.5">
                            {store.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="size-3 text-muted-foreground shrink-0" />
                                <span className="font-mono">{store.phone}</span>
                              </div>
                            )}
                            {store.email && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[160px]">{store.email}</span>
                              </div>
                            )}
                            {!store.phone && !store.email && <span className="text-muted-foreground">—</span>}
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                                isActive
                                  ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                  : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                              }`}
                            >
                              {store.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: store.id,
                                  name: store.name,
                                  code: store.code,
                                  currentStatus: store.status,
                                });
                                setToggleDialogOpen(true);
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-2.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(store)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Store"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStores.map((store) => {
              const isActive = store.status === "active";

              return (
                <Card
                  key={store.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div>
                    {/* Storefront Image */}
                    {store.imageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden border-b border-border bg-muted">
                        <Image
                          src={store.imageUrl}
                          alt={store.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-full border-b border-border bg-muted/20 flex items-center justify-center text-muted-foreground gap-2 text-xs">
                        <ImageOff className="size-4" />
                        <span>No photography provided</span>
                      </div>
                    )}

                    <div className="p-3.5 space-y-2.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-foreground block truncate">
                            {store.name}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                            {store.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs uppercase font-mono px-1.5 py-0.5 ${
                              isActive
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                : "border-zinc-500/40 text-zinc-500"
                            }`}
                          >
                            {store.status}
                          </Badge>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => {
                              setTargetToggleItem({
                                id: store.id,
                                name: store.name,
                                code: store.code,
                                currentStatus: store.status,
                              });
                              setToggleDialogOpen(true);
                            }}
                          />
                        </div>
                      </div>

                      {/* Address & Manager */}
                      <div className="space-y-1.5 border-t border-border/60 pt-2 text-xs">
                        {store.address && (
                          <div className="flex items-start gap-1.5 text-muted-foreground">
                            <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{store.address}</span>
                          </div>
                        )}

                        {store.manager && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground font-medium">{store.manager}</span>
                          </div>
                        )}

                        {store.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="size-3 text-muted-foreground shrink-0" />
                            <span className="font-mono text-foreground">{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(store.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(store)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Store
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <StoreFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingStore}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <StoreStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        store={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
