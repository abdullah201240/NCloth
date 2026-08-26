"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminFooter } from "@/components/layout/admin-footer";

import { useProfile } from "@/lib/stores/profile-context";
import { useRouter } from "next/navigation";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { isAuthenticated } = useProfile();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-pulse">
          <span>Verifying Studio Session...</span>
        </div>
      </div>
    );
  }

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
