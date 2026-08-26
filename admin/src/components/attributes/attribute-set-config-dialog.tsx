"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AttributeSet,
  Attribute,
  AttributeSetConfig,
} from "@/lib/types/attribute";
import {
  Sliders,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";

interface AttributeSetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: AttributeSet | null;
  allAttributes: Attribute[];
  onSave: (setId: string, configs: AttributeSetConfig[]) => void;
}

function ConfigDialogBody({
  set,
  allAttributes,
  onSave,
  onClose,
}: {
  set: AttributeSet;
  allAttributes: Attribute[];
  onSave: (setId: string, configs: AttributeSetConfig[]) => void;
  onClose: () => void;
}) {
  const [configs, setConfigs] = React.useState<AttributeSetConfig[]>(() =>
    [...set.attributeConfigs].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [selectedNewAttrId, setSelectedNewAttrId] = React.useState<string>("");

  const assignedAttrIds = configs.map((c) => c.attributeId);
  const unassignedAttributes = allAttributes.filter(
    (a) => !assignedAttrIds.includes(a.id)
  );

  const handleAddAttribute = () => {
    if (!selectedNewAttrId) return;
    const attrObj = allAttributes.find((a) => a.id === selectedNewAttrId);
    if (!attrObj) return;

    const nextOrder =
      configs.length > 0 ? Math.max(...configs.map((c) => c.sortOrder || 0)) + 1 : 1;

    const newConfig: AttributeSetConfig = {
      attributeId: selectedNewAttrId,
      isRequired: attrObj.isRequired,
      isVariant: attrObj.isVariant,
      isFilterable: attrObj.isFilterable,
      isSearchable: attrObj.isSearchable,
      isComparable: attrObj.isComparable,
      sortOrder: nextOrder,
    };

    setConfigs((prev) => [...prev, newConfig]);
    setSelectedNewAttrId("");
  };

  const handleRemoveConfig = (attributeId: string) => {
    setConfigs((prev) => prev.filter((c) => c.attributeId !== attributeId));
  };

  const handleUpdateConfigField = <K extends keyof AttributeSetConfig>(
    attributeId: string,
    field: K,
    val: AttributeSetConfig[K]
  ) => {
    setConfigs((prev) =>
      prev.map((c) => (c.attributeId === attributeId ? { ...c, [field]: val } : c))
    );
  };

  const handleSaveMatrix = () => {
    onSave(set.id, configs);
    onClose();
  };

  return (
    <>
      <DialogHeader className="p-4 px-5 border-b border-border">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sliders className="size-4 text-muted-foreground" />
            <span>Configure Set Matrix: {set.name}</span>
          </DialogTitle>
          <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
            {configs.length} Attributes Assigned
          </Badge>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Configure specific override rules for how each attribute behaves within the <strong>{set.name}</strong> industry bundle.
        </DialogDescription>
      </DialogHeader>

      {/* Toolbar: Add Attribute to Set */}
      <div className="p-3 px-5 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={selectedNewAttrId}
            onValueChange={(val) => setSelectedNewAttrId(val || "")}
          >
            <SelectTrigger className="h-8 text-xs flex-1 sm:max-w-xs bg-background">
              <SelectValue placeholder="Select attribute to add..." />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {unassignedAttributes.length === 0 ? (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  All available attributes already added.
                </div>
              ) : (
                unassignedAttributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id} className="text-xs">
                    <span className="font-medium text-foreground">{attr.name}</span>{" "}
                    <span className="font-mono text-muted-foreground">({attr.code})</span>{" "}
                    <Badge variant="outline" className="text-[10px] ml-1 font-mono py-0">
                      {attr.type}
                    </Badge>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="xs"
            onClick={handleAddAttribute}
            disabled={!selectedNewAttrId}
            className="h-8 text-xs px-3"
          >
            <Plus className="size-3.5 mr-1" /> Add to Set
          </Button>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground">
          Changes apply specifically to this bundle
        </span>
      </div>

      {/* Matrix Configuration Table */}
      <div className="flex-1 overflow-y-auto p-4 px-5">
        {configs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xs">
            <Layers className="size-8 mx-auto mb-2 opacity-40" />
            <span>No attributes assigned to this set yet. Use the dropdown above to add attributes.</span>
          </div>
        ) : (
          <div className="border border-border rounded-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-background">
                  <TableHead className="w-[60px] h-9 text-xs text-center">Order</TableHead>
                  <TableHead className="h-9 text-xs">Attribute</TableHead>
                  <TableHead className="w-[90px] h-9 text-xs text-center">Type</TableHead>
                  <TableHead className="w-[90px] h-9 text-xs text-center">Required</TableHead>
                  <TableHead className="w-[90px] h-9 text-xs text-center">Variant</TableHead>
                  <TableHead className="w-[90px] h-9 text-xs text-center">Filterable</TableHead>
                  <TableHead className="w-[90px] h-9 text-xs text-center">Searchable</TableHead>
                  <TableHead className="w-[60px] h-9 text-xs text-center">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((cfg) => {
                  const attrObj = allAttributes.find((a) => a.id === cfg.attributeId);
                  if (!attrObj) return null;

                  return (
                    <TableRow key={cfg.attributeId} className="border-b border-border/60 hover:bg-muted/20">
                      {/* Order Input */}
                      <TableCell className="p-2 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={999}
                          value={cfg.sortOrder}
                          onChange={(e) =>
                            handleUpdateConfigField(
                              cfg.attributeId,
                              "sortOrder",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-7 w-12 font-mono text-xs text-center px-1 mx-auto"
                        />
                      </TableCell>

                      {/* Name & Code */}
                      <TableCell className="py-2">
                        <span className="text-xs font-semibold text-foreground block">
                          {attrObj.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          {attrObj.code}
                        </span>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-2 text-center">
                        <Badge variant="outline" className="text-[10px] font-mono py-0">
                          {attrObj.type}
                        </Badge>
                      </TableCell>

                      {/* Required Switch */}
                      <TableCell className="py-2 text-center">
                        <Switch
                          checked={cfg.isRequired}
                          onCheckedChange={(val) =>
                            handleUpdateConfigField(cfg.attributeId, "isRequired", val)
                          }
                        />
                      </TableCell>

                      {/* Variant Switch */}
                      <TableCell className="py-2 text-center">
                        <Switch
                          checked={cfg.isVariant}
                          onCheckedChange={(val) =>
                            handleUpdateConfigField(cfg.attributeId, "isVariant", val)
                          }
                        />
                      </TableCell>

                      {/* Filterable Switch */}
                      <TableCell className="py-2 text-center">
                        <Switch
                          checked={cfg.isFilterable}
                          onCheckedChange={(val) =>
                            handleUpdateConfigField(cfg.attributeId, "isFilterable", val)
                          }
                        />
                      </TableCell>

                      {/* Searchable Switch */}
                      <TableCell className="py-2 text-center">
                        <Switch
                          checked={cfg.isSearchable}
                          onCheckedChange={(val) =>
                            handleUpdateConfigField(cfg.attributeId, "isSearchable", val)
                          }
                        />
                      </TableCell>

                      {/* Remove Action */}
                      <TableCell className="py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveConfig(cfg.attributeId)}
                          className="size-7 text-muted-foreground hover:text-destructive"
                          title="Remove attribute from this set"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DialogFooter className="p-3 px-5 border-t border-border flex flex-row items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs px-3"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs px-3"
          onClick={handleSaveMatrix}
        >
          Save Set Matrix ({configs.length})
        </Button>
      </DialogFooter>
    </>
  );
}

export function AttributeSetConfigDialog({
  open,
  onOpenChange,
  set,
  allAttributes,
  onSave,
}: AttributeSetConfigDialogProps) {
  if (!set) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 rounded-xs border border-border bg-background">
        <ConfigDialogBody
          key={set.id}
          set={set}
          allAttributes={allAttributes}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
