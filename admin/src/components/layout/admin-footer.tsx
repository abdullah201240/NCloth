"use client";

import * as React from "react";

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

function getSnapshot() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function getServerSnapshot() {
  return "00:00:00 UTC";
}

export function AdminFooter() {
  const time = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <footer className="sticky bottom-0 z-30 flex h-8 w-full shrink-0 items-center justify-between border-t border-border bg-background/98 backdrop-blur-xs px-4">
      <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            Studio Services Active
          </span>
          <span className="text-border">|</span>
          <span>Zero-Delete Enforced</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="tabular-nums font-mono min-w-[100px] text-right">
            {time}
          </span>
          <span className="text-border">|</span>
          <span>NCLOTH • PARIS / NYC</span>
        </div>
      </div>
    </footer>
  );
}
