"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sizeFormSchema,
  type SizeFormValues,
} from "@/lib/validations/size";
import { SizeItem } from "@/lib/types/size";
import { Layers, Hash, ArrowUpDown, Tag } from "lucide-react";

interface SizeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SizeItem | null;
  availableGroups: string[];
  suggestedNextOrder?: number;
  onSubmit: (data: SizeFormValues, editId?: string) => void;
}

const PRESET_GROUPS = ["Adult", "Shoes", "Kids", "Baby", "Accessories"];

export function SizeFormSheet({
  open,
  onOpenChange,
  initialData,
  availableGroups,
  suggestedNextOrder = 1,
  onSubmit,
}: SizeFormSheetProps) {
  const isEditing = !!initialData?.id;
  const allGroups = React.useMemo(() => {
    const combined = Array.from(new Set([...PRESET_GROUPS, ...availableGroups])).filter(Boolean);
    return combined;
  }, [availableGroups]);

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      group: initialData?.group || "Adult",
      sortOrder: initialData?.sortOrder ?? suggestedNextOrder,
      status: initialData?.status || "active",
    },
  });

  const selectedStatus = form.watch("status");
  const currentGroup = form.watch("group");

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        group: initialData?.group || "Adult",
        sortOrder: initialData?.sortOrder ?? suggestedNextOrder,
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, suggestedNextOrder, form]);

  const onFormSubmit = (data: SizeFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val, { shouldValidate: true });
    // Auto-fill code if not editing
    if (!isEditing && !form.getValues("code")) {
      form.setValue("code", val.toUpperCase(), { shouldValidate: false });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border"
      >
        <SheetHeader className="p-4 px-5 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <span>{isEditing ? "Edit Size Option" : "Create Size Option"}</span>
            </SheetTitle>
            <Badge
              variant="outline"
              className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 ${
                selectedStatus === "active"
                  ? "border-emerald-500/40 text-emerald-500"
                  : "border-zinc-500/40 text-zinc-500"
              }`}
            >
              {selectedStatus}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Configure apparel size label, code, target category group, and deterministic sorting order.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-4 px-5 space-y-4">
            {/* Size Name */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">
                Size Name *
              </Label>
              <Input
                placeholder="e.g. XS, S, M, 42 EU, One Size"
                className="h-8.5 text-sm"
                {...form.register("name")}
                onChange={handleNameChange}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Size Code */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Hash className="size-3 text-muted-foreground" />
                Size Code *
              </Label>
              <Input
                placeholder="e.g. XS, S, M, EU-42, OS"
                className="font-mono text-sm uppercase h-8.5"
                {...form.register("code")}
                onChange={(e) => {
                  form.setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });
                }}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* Size Group (Select + Quick Chips) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Tag className="size-3 text-muted-foreground" />
                Size Group *
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={currentGroup}
                  onValueChange={(val) => {
                    if (val) form.setValue("group", val, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="h-8.5 text-sm flex-1">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {allGroups.map((grp) => (
                      <SelectItem key={grp} value={grp} className="text-xs">
                        {grp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or custom group..."
                  value={currentGroup}
                  onChange={(e) => form.setValue("group", e.target.value, { shouldValidate: true })}
                  className="h-8.5 text-xs flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {PRESET_GROUPS.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => form.setValue("group", grp, { shouldValidate: true })}
                    className={`px-2 py-0.5 text-xs rounded-xs border transition-colors cursor-pointer ${
                      currentGroup === grp
                        ? "bg-foreground text-background border-foreground font-medium"
                        : "bg-muted/20 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
              {form.formState.errors.group && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.group.message}
                </p>
              )}
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <ArrowUpDown className="size-3 text-muted-foreground" />
                Sort Order * (Lower = Displays First)
              </Label>
              <Input
                type="number"
                min={0}
                max={999}
                placeholder="e.g. 1"
                className="font-mono text-sm h-8.5"
                {...form.register("sortOrder", { valueAsNumber: true })}
              />
              <p className="text-[11px] text-muted-foreground">
                Determines the exact display sequence in storefront variant pickers (e.g. 1=XS, 2=S, 3=M, 4=L).
              </p>
              {form.formState.errors.sortOrder && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.sortOrder.message}
                </p>
              )}
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between border border-border p-3 rounded-xs">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Active Size Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStatus === "active"
                    ? "Size is active and available in SKU matrix tables."
                    : "Size is disabled / archived."}
                </p>
              </div>
              <Switch
                checked={selectedStatus === "active"}
                onCheckedChange={(checked) =>
                  form.setValue("status", checked ? "active" : "inactive")
                }
              />
            </div>
          </div>

          <SheetFooter className="p-4 px-5 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm px-3"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-sm px-3">
              {isEditing ? "Update Size" : "Create Size"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
