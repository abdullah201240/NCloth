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
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-1 min-w-0 flex-col bg-background overflow-x-hidden">
          <AdminHeader />
          <div className="flex-1 w-full min-w-0 overflow-x-hidden">
            {children}
          </div>
          <AdminFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
