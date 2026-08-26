"use client";

import * as React from "react";

export function AdminFooter() {
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full border-t border-border bg-background py-2 px-4 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            Studio Services Active
          </span>
          <span className="text-border">|</span>
          <span>Zero-Delete Enforced</span>
        </div>

        <div className="flex items-center gap-2.5">
          {time && <span>{time}</span>}
          <span className="text-border">|</span>
          <span>NCLOTH • PARIS / NYC</span>
        </div>
      </div>
    </footer>
  );
}
