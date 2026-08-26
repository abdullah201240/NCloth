"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useReceiving } from "@/lib/stores/receiving-context";
import { PutawayTask } from "@/lib/types/receiving";
import { PutawayDialog } from "@/components/receiving/putaway-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Grid,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Package,
} from "lucide-react";

export default function WarehousePutawayPage() {
  const router = useRouter();
  const { putawayTasks } = useReceiving();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTask, setActiveTask] = React.useState<PutawayTask | null>(null);

  const filteredTasks = React.useMemo(() => {
    return putawayTasks.filter((t) => {
      return (
        searchQuery === "" ||
        t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receivingSessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.warehouseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [putawayTasks, searchQuery]);

  return (
    <AdminShell>
      <div className="space-y-4 pb-16 w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Grid className="size-5 text-emerald-500" />
              <span>Warehouse Putaway Operations</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
              Dock → Shelf Allocation
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            TRANSFER INBOUND GOODS FROM RECEIVING DOCKS TO PERMANENT STORAGE SHELVES
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/receiving")}
            className="h-8 text-xs border-border"
          >
            Inbound Receiving Dock
          </Button>
        </div>
      </div>

      {/* Tasks Table */}
      <Card className="border border-border rounded-xs bg-background">
        <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search putaway task #, receiving session, warehouse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background rounded-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20">
                <TableHead className="h-8 text-xs font-semibold">Task #</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Receiving Session</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Fulfillment Warehouse</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[120px] text-right">Units</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[110px] text-center">Status</TableHead>
                <TableHead className="h-8 text-xs font-semibold">Assigned Team</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-mono">
                    No putaway tasks pending. All received stock has been shelved.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((t) => (
                  <TableRow key={t.id} className="border-b border-border/60 hover:bg-muted/10">
                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground">
                      {t.taskNumber}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                      {t.receivingSessionNumber}
                    </TableCell>

                    <TableCell className="py-2.5 text-xs font-medium text-foreground">
                      {t.warehouseName}
                    </TableCell>

                    <TableCell className="py-2.5 font-mono text-xs font-bold text-foreground text-right">
                      {t.totalUnits} units
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono px-2 py-0.5 rounded-xs ${
                          t.status === "COMPLETED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                      {t.assignedTo || "Warehouse Crew"}
                    </TableCell>

                    <TableCell className="py-2.5 text-right">
                      {t.status !== "COMPLETED" ? (
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => setActiveTask(t)}
                          className="h-7 text-xs px-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
                        >
                          <Grid className="size-3 text-emerald-400" /> Execute Putaway
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-mono flex items-center justify-end gap-1">
                          <CheckCircle2 className="size-3" /> Shelved
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Putaway Execution Modal */}
      {activeTask && (
        <PutawayDialog
          open={!!activeTask}
          onOpenChange={(open) => {
            if (!open) setActiveTask(null);
          }}
          task={activeTask}
        />
      )}
    </div>
    </AdminShell>
  );
}
