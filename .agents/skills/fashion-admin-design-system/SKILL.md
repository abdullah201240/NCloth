---
name: fashion-admin-design-system
description: >-
  Provides luxury minimalist design principles, UI component patterns, spacing, typography, and aesthetic standards for high-end fashion and apparel e-commerce admin dashboards.
---

# Luxury Fashion Admin Design System

Use this skill when building or styling UI components, pages, navigation shells, and dashboards for the NCloth fashion brand admin portal.

## 1. Aesthetic Philosophy: "Quiet Luxury & Editorial Minimalism"

Fashion admin portals require an ultra-refined, high-contrast, editorial aesthetic that mirrors luxury e-commerce (e.g., SSENSE, Farfetch, Celine, Balenciaga, Jacquemus):

* **Pure Surfaces (Zero Extra Backgrounds)**: Pure whites (`#ffffff`), deep jet blacks (`#09090b`), and clean surfaces without nested gray backgrounds or tinted block fills.
* **Sharp Geometric Hairlines**: Crisp 1px borders (`border border-border/80`), sharp corners (`0.125rem` / `rounded-xs` or `rounded-none`), and strictly **zero heavy drop shadows**.
* **Achromatic Monochrome Palette**: Pure blacks, crisp whites, and slate/zinc neutrals. Color is strictly reserved for subtle, desaturated semantic status indicators.
* **Generous Negative Space**: Generous whitespace (`gap-6`, `p-6` to `p-8`) gives items room to breathe, preventing data clutter.
* **Editorial Typography Hierarchy**:
  * Headings: Clean, tracking-tight, medium or semibold (`tracking-tight text-foreground font-medium`).
  * Data/Numbers: Tabular numbers (`tabular-nums font-mono` or clean sans with `font-semibold`).
  * Subtext & Metadata: Muted uppercase tracking labels (`text-xs uppercase tracking-wider text-muted-foreground`).

---

## 2. Core UI Layout & Shell Patterns

### A. Collapsible Luxury Navigation Shell
* Use shadcn `@/components/ui/sidebar` with minimalist icon sets from `lucide-react` (e.g., `Package`, `Layers`, `ShoppingBag`, `Users`, `BarChart3`, `Sparkles`, `Settings`).
* Top brand bar: Clean minimalist logo ("**NCLOTH** • STUDIO"), environment switch, search trigger (`Command + K` shortcut indicator via `@/components/ui/kbd`).

### B. High-Density yet Clean Data Tables
* Use `@/components/ui/table` with thin border dividers and clean background (no gray headers).
* Always include:
  1. Product thumbnail with 3:4 aspect ratio (`aspect-[3/4] object-cover rounded-xs`).
  2. Quick filter tabs (e.g., All, New In, Best Sellers, Low Stock, Archived).
  3. Bulk action floating bar for batch price edits, collection assignment, or status changes.
  4. Quick hover action buttons (Quick Edit, Duplicate, Preview Lookbook).

### C. Slide-Over Detail Panels (Sheets)
* Prefer slide-over drawers (`@/components/ui/sheet`) over full-page redirects for quick inspects with responsive full-width bounds on mobile.

---

## 3. Fashion-Specific UI Components

1. **Aspect-Ratio Preserved Media Grids**:
   * Apparel looks best in standard fashion photography aspect ratios: **3:4 portrait** or **1:1 square**.
   * Always apply subtle hover zoom (`group-hover:scale-105 transition-transform duration-300`) and overlay badges (e.g., "Look 04", "Runway FW26", "In Stock").

2. **Color Swatch & Size Badges**:
   * Display color variants using circular 16px/20px swatches with border ring on active selection.
   * Render size matrices (`XS`, `S`, `M`, `L`, `XL`, `XXL` or numeric EU/US sizing) in clean sharp toggle buttons (`@/components/ui/toggle-group`).

3. **Status Badges (`@/components/ui/badge`)**:
   * Sharp micro-badges with uppercase tracking:
     * `Paid / Fulfilled`: `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`
     * `Pending / Processing`: `bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`
     * `Draft / Archived`: `bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20`
     * `VIP Client`: `bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20`
