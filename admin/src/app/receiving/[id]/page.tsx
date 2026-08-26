"use client";

import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { useReceiving } from "@/lib/stores/receiving-context";
import { ReceivingSessionView } from "@/components/receiving/receiving-session-view";
export default function ReceivingSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getSessionById } = useReceiving();

  const session = getSessionById(params.id);

  if (!session) {
    return (
      <AdminShell>
        <div className="text-center py-20 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Receiving Session Not Found</h2>
          <p className="text-xs text-muted-foreground font-mono">
            The requested receiving session ID [{params.id}] does not exist.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <ReceivingSessionView session={session} />
    </AdminShell>
  );
}
