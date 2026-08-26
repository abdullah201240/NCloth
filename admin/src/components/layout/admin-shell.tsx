"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminFooter } from "@/components/layout/admin-footer";

interface AdminShellProps {
  children: React.ReactNode;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export function AdminShell({
  children,
  onQuickAction,
  quickActionLabel,
}: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full bg-background text-foreground">
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-background">
          <AdminHeader
            onQuickAction={onQuickAction}
            quickActionLabel={quickActionLabel}
          />
          <main className="flex-1 p-2.5 sm:p-3.5 w-full">
            {children}
          </main>
          <AdminFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
