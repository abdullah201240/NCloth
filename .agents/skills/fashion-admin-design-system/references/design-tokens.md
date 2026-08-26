# Fashion Admin Design Tokens & Typography Scale

## 1. Color System (Tailwind v4 OKLCH)

```css
/* Monochromatic Neutrals */
--color-luxury-black: oklch(0.145 0 0);       /* #09090b */
--color-luxury-charcoal: oklch(0.205 0 0);    /* #18181b */
--color-luxury-surface: oklch(0.985 0 0);     /* #fafafa */
--color-luxury-border: oklch(0.922 0 0);      /* #e4e4e7 */
--color-luxury-muted: oklch(0.556 0 0);       /* #71717a */

/* Semantic Accents (Subtle Muted Hues) */
--status-fulfilled-bg: oklch(0.95 0.05 155);
--status-fulfilled-fg: oklch(0.45 0.12 155);
--status-pending-bg: oklch(0.96 0.06 75);
--status-pending-fg: oklch(0.55 0.14 75);
--status-urgent-bg: oklch(0.95 0.07 25);
--status-urgent-fg: oklch(0.50 0.18 25);
```

## 2. Typography Guidelines

* **Brand Title / Monogram**: `font-sans font-semibold tracking-widest uppercase` (e.g. `N C L O T H`)
* **Page Headers**: `text-2xl font-medium tracking-tight text-foreground`
* **Section Headers**: `text-base font-medium text-foreground`
* **Metric Numbers**: `text-3xl font-light tracking-tight tabular-nums`
* **Table Headers**: `text-xs uppercase tracking-wider text-muted-foreground font-medium`
* **Badge Labels**: `text-[11px] font-medium tracking-wide`
