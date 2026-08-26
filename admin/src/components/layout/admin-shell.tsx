"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminFooter } from "@/components/layout/admin-footer";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen={true} className="h-screen max-h-screen overflow-hidden">
      <div className="relative flex h-screen max-h-screen w-full overflow-hidden bg-background text-foreground">
        <AdminSidebar />
        <SidebarInset className="flex h-screen max-h-screen flex-1 min-w-0 flex-col overflow-hidden bg-background">
          <AdminHeader />
          <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-3 md:p-4">
            {children}
          </main>
          <AdminFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
