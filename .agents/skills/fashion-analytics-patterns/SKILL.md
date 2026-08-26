---
name: fashion-analytics-patterns
description: >-
  Minimalist data visualization and KPI metrics tailored for apparel brands: sell-through rate, return rates by size, collection performance, AOV, and inventory turnover.
---

# Fashion Analytics & Visualizations

Use this skill when implementing analytics charts, KPI summary widgets, and financial dashboards for the NCloth admin platform.

## 1. Key Fashion Industry Metrics (KPIs)

1. **Sell-Through Rate (STR)**: Percentage of inventory sold within a given period (e.g., `% of SS26 collection sold in first 30 days`).
2. **Average Order Value (AOV)**: Track basket size and multi-piece styling purchases (e.g., Blazer + Matching Trousers).
3. **Return Rate by Size/Category**: Highlight high-return items to detect pattern/fit discrepancies early.
4. **Collection Revenue Share**: Visual breakdown of revenue across Collections (`SS26`, `Core Essentials`, `Accessories`).
5. **Inventory Turnover & Days to Sell**: Velocity of fast-moving items vs slow-moving stock.

---

## 2. Minimalist Chart Guidelines (Recharts + shadcn)

* **Restrained Color Palette**: Never use bright neon colors. Use monochrome gradients, deep blacks, subtle slates (`zinc-400`, `zinc-700`), and one accent tint (`oklch(0.205 0 0)` or soft emerald).
* **Sparse Gridlines**: Keep `strokeDasharray="3 3"` with very faint opacity (`stroke="currentColor" className="opacity-10"`).
* **Minimalist Tooltip**: Clean black/white card tooltip with tabular numbers and subtle border (`@/components/ui/chart`).
* **KPI Card Anatomy**:
  * Title: `text-xs uppercase tracking-wider text-muted-foreground font-medium`
  * Metric: `text-3xl font-light tracking-tight tabular-nums mt-2`
  * Delta / Subtitle: Clean badge with `+14.2% vs last collection` or `Target: >75% STR`.
