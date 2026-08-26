"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { TransferForm } from "@/components/transfers/transfer-form";

export default function NewStockTransferPage() {
  return (
    <AdminShell>
      <TransferForm />
    </AdminShell>
  );
}
