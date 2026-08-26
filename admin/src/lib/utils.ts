import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStudioDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "—";
  }
}

/**
 * Standard Bangladeshi Taka (৳ / BDT) Currency Formatter
 */
export function formatBDT(amount: number | string | undefined | null, showDecimals: boolean = true): string {
  if (amount === undefined || amount === null || amount === "") return "৳0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳0";
  if (!showDecimals || Number.isInteger(num)) {
    return `৳${num.toLocaleString("en-US")}`;
  }
  return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

