"use client";

import * as React from "react";
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
import { SupplierFormSheet } from "@/components/suppliers/supplier-form-sheet";
import { SupplierStatusDialog } from "@/components/suppliers/supplier-status-dialog";
import { useSupplierContext } from "@/lib/stores/supplier-context";
import { Supplier, SupplierStatus } from "@/lib/types/supplier";
import { SupplierFormValues } from "@/lib/validations/supplier";
import { formatStudioDate } from "@/lib/utils";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Archive,
} from "lucide-react";

export default function SuppliersPage() {
  const {
    suppliers,
    stats,
    addSupplier,
    updateSupplier,
    toggleStatus,
  } = useSupplierContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Form Sheet State
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);

  // Status Toggle Dialog State
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);
  const [targetToggleItem, setTargetToggleItem] = React.useState<{
    id: string;
    name: string;
    code: string;
    currentStatus: SupplierStatus;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSheetOpen(true);
  };

  const handleFormSubmit = (data: SupplierFormValues, editId?: string) => {
    if (editId) {
      updateSupplier(editId, data);
    } else {
      addSupplier(data);
    }
  };

  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter((supplier) => {
      if (statusFilter !== "all" && supplier.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = supplier.name.toLowerCase().includes(q);
        const matchesCode = supplier.code.toLowerCase().includes(q);
        const matchesContact = supplier.contactPerson?.toLowerCase().includes(q) || false;
        const matchesCompany = supplier.companyName?.toLowerCase().includes(q) || false;
        const matchesPhone = supplier.phone.toLowerCase().includes(q);
        const matchesEmail = supplier.email?.toLowerCase().includes(q) || false;
        const matchesAddress = supplier.address?.toLowerCase().includes(q) || false;
        const matchesNotes = supplier.notes?.toLowerCase().includes(q) || false;
        return (
          matchesName ||
          matchesCode ||
          matchesContact ||
          matchesCompany ||
          matchesPhone ||
          matchesEmail ||
          matchesAddress ||
          matchesNotes
        );
      }
      return true;
    });
  }, [suppliers, statusFilter, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Supplier & Vendor Directory
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                {suppliers.length} Suppliers Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage textile mills, leather ateliers, artisan workshops, commercial terms, and contact profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs h-8 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Create Supplier
            </Button>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Suppliers</span>
              <Truck className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.totalSuppliers}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                {stats.activeSuppliers} Active Partners
              </span>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Sourcing Mills</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.activeSuppliers}
              </span>
              <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500 px-1.5 py-0">
                Operational
              </Badge>
            </div>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Inactive / On Hold</span>
              <Archive className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {stats.inactiveSuppliers}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Archived
              </span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Search + Status Filter + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search supplier name, code (SUP-MIL-01), contact person, phone, email, notes..."
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

            {/* View Switcher */}
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

        {/* Content: Grid Cards or Data Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSuppliers.map((supplier) => {
              const isActive = supplier.status === "active";

              return (
                <Card
                  key={supplier.id}
                  className="border border-border rounded-xs overflow-hidden flex flex-col justify-between bg-background hover:border-foreground/30 transition-colors"
                >
                  <div className="p-3.5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-foreground block truncate">
                          {supplier.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {supplier.code}
                          </span>
                          {supplier.companyName && (
                            <>
                              <span className="text-border text-xs">•</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {supplier.companyName}
                              </span>
                            </>
                          )}
                        </div>
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
                          {supplier.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {
                            setTargetToggleItem({
                              id: supplier.id,
                              name: supplier.name,
                              code: supplier.code,
                              currentStatus: supplier.status,
                            });
                            setToggleDialogOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-xs">
                      {supplier.contactPerson && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-foreground font-medium">{supplier.contactPerson}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-foreground">{supplier.phone}</span>
                      </div>

                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-foreground truncate max-w-[240px]">{supplier.email}</span>
                        </div>
                      )}

                      {supplier.address && (
                        <div className="flex items-start gap-1.5 text-muted-foreground">
                          <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{supplier.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Business Badges & Notes */}
                    <div className="space-y-2 border-t border-border/60 pt-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {supplier.tradeLicense && (
                          <Badge variant="outline" className="text-[10px] font-mono border-border px-1.5 py-0">
                            <FileText className="size-2.5 mr-1 text-muted-foreground" />
                            {supplier.tradeLicense}
                          </Badge>
                        )}
                        {supplier.paymentTerms && (
                          <Badge variant="outline" className="text-[10px] border-border px-1.5 py-0">
                            <CreditCard className="size-2.5 mr-1 text-muted-foreground" />
                            {supplier.paymentTerms}
                          </Badge>
                        )}
                      </div>

                      {supplier.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {supplier.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 px-3.5 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Updated {formatStudioDate(supplier.updatedAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(supplier)}
                      className="h-7 text-xs px-2.5 border-border"
                    >
                      <Edit2 className="size-3 mr-1" /> Edit Supplier
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border border-border rounded-xs overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="h-9 text-xs">Supplier & Code</TableHead>
                  <TableHead className="h-9 text-xs">Contact Person</TableHead>
                  <TableHead className="h-9 text-xs">Phone & Email</TableHead>
                  <TableHead className="h-9 text-xs">Company & License</TableHead>
                  <TableHead className="h-9 text-xs">Payment Terms</TableHead>
                  <TableHead className="w-[140px] text-right h-9 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] text-center h-9 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                      No suppliers match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const isActive = supplier.status === "active";

                    return (
                      <TableRow key={supplier.id} className="border-b border-border/60 hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{supplier.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{supplier.code}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-sm text-foreground">
                          {supplier.contactPerson ? (
                            <div className="flex items-center gap-1.5">
                              <User className="size-3 text-muted-foreground shrink-0" />
                              <span>{supplier.contactPerson}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-foreground">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Phone className="size-3 text-muted-foreground shrink-0" />
                              <span className="font-mono">{supplier.phone}</span>
                            </div>
                            {supplier.email && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[180px]">{supplier.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-xs">
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground">{supplier.companyName || "—"}</div>
                            {supplier.tradeLicense && (
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {supplier.tradeLicense}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-muted-foreground">
                          {supplier.paymentTerms ? (
                            <Badge variant="outline" className="text-[11px] border-border px-1.5 py-0">
                              {supplier.paymentTerms}
                            </Badge>
                          ) : (
                            "—"
                          )}
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
                              {supplier.status}
                            </Badge>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => {
                                setTargetToggleItem({
                                  id: supplier.id,
                                  name: supplier.name,
                                  code: supplier.code,
                                  currentStatus: supplier.status,
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
                            onClick={() => handleOpenEdit(supplier)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Supplier"
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
          </div>
        )}
      </div>

      {/* Creation & Edit Sheet */}
      <SupplierFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingSupplier}
        onSubmit={handleFormSubmit}
      />

      {/* Zero-Delete Status Toggle Dialog */}
      <SupplierStatusDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        supplier={targetToggleItem}
        onConfirm={(id, nextStatus) => toggleStatus(id, nextStatus)}
      />
    </AdminShell>
  );
}
