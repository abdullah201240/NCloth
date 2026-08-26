"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useInventory,
  ScannedIdentificationResult,
} from "@/lib/stores/inventory-context";
import {
  Barcode,
  QrCode,
  Scan,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  MapPin,
  X,
  Volume2,
} from "lucide-react";

interface BarcodeScannerStationProps {
  onScan: (result: ScannedIdentificationResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
  expectedType?: "PRODUCT_VARIANT" | "INVENTORY_LOCATION" | "SERIAL" | "BATCH" | "ANY";
  className?: string;
  helperText?: string;
}

export function BarcodeScannerStation({
  onScan,
  placeholder = "Scan barcode, SKU, serial, QR or location code...",
  autoFocus = true,
  expectedType = "ANY",
  className = "",
  helperText = "Hardware USB/Bluetooth scanner ready • Auto-focus locked",
}: BarcodeScannerStationProps) {
  const { identifyScannedCode } = useInventory();
  const [inputValue, setInputValue] = React.useState("");
  const [lastScanResult, setLastScanResult] = React.useState<ScannedIdentificationResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus lock
  React.useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleProcessScan = React.useCallback(
    (textToProcess: string) => {
      const code = textToProcess.trim();
      if (!code) return;

      const result = identifyScannedCode(code);
      setLastScanResult(result);
      onScan(result);
      setInputValue("");

      // Re-focus input immediately for rapid successive barcode gun scans
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
    [identifyScannedCode, onScan]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProcessScan(inputValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Interactive Scan Input Bar */}
      <div className="relative flex items-center group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground pointer-events-none">
          <Scan className="size-4 text-foreground animate-pulse" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-24 h-10 text-sm font-mono bg-background border-border shadow-xs focus-visible:ring-1 focus-visible:ring-foreground rounded-xs"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setInputValue("")}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </Button>
          )}
          <Button
            type="button"
            size="xs"
            onClick={() => handleProcessScan(inputValue)}
            disabled={!inputValue.trim()}
            className="h-7 text-xs px-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs gap-1"
          >
            <Sparkles className="size-3" /> Process
          </Button>
        </div>
      </div>

      {/* Hardware Status / Feedback bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            SCANNER READY
          </span>
          <span>•</span>
          <span>{helperText}</span>
        </div>

        {lastScanResult && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Last Scanned:</span>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono px-1.5 py-0 h-4.5 rounded-xs gap-1 ${
                lastScanResult.type !== "UNKNOWN"
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : "border-amber-500/50 text-amber-400 bg-amber-500/10"
              }`}
            >
              {lastScanResult.type !== "UNKNOWN" ? (
                <CheckCircle2 className="size-2.5" />
              ) : (
                <AlertCircle className="size-2.5" />
              )}
              {lastScanResult.type}: {lastScanResult.matchedItem?.name || lastScanResult.rawValue}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
