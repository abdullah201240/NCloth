# Fashion Brand Admin UI Rules & Principles

## 1. 🚨 Strict shadcn-Only Directive
- **ONLY use shadcn UI components** (`@/components/ui/*`) for all layout, navigation, cards, tables, dialogs, sheets, buttons, badges, charts, inputs, dropdowns, and form elements.
- **NO third-party UI framework or custom ad-hoc raw UI alternatives.**

## 2. 🖥️ 100% Full-Width Layout Directive (NO max-w Constraints)
- **Zero Page/Container Width Clamping:** NEVER use artificial max-width constraints on main layout areas or page wrappers (e.g., strictly NO `max-w-7xl`, `max-w-6xl`, `max-w-5xl`, `max-w-4xl`, `max-w-screen-*`, `mx-auto` containers).
- **Edge-to-Edge Fluid Design:** All pages, grids, tables, and dashboards MUST span **`w-full` (100% full width)** edge-to-edge across the entire screen viewport.

## 3. 🌙 Default Dark Mode Standard
- **Dark Mode by Default:** The interface is built with luxury Dark Mode as the primary, default standard (`class="dark"` on `<html>`/`<body>`).
- Base surface is pure deep jet black (`#09090b` / `oklch(0.10 0 0)`), with pure white (`#ffffff`) typography and crisp hairline zinc/slate borders (`border-border/80`).

## 4. 🗚 Balanced & Legible Typography Scale (No Micro-Fonts)
- **Clear & Legible Standards:** Avoid unreadable, micro-sized fonts (no `text-[8px]`, `text-[9px]`, `text-[10px]`).
- **Standard Scale:**
  - Page Titles: `text-2xl` or `text-xl` font-semibold.
  - Card & Section Titles: `text-base` font-medium.
  - Body, Table cells & Inputs: `text-sm` (14px) or `text-xs` (12px minimum).
  - Badges, Meta & Secondary text: `text-xs` (12px) font-mono / font-sans.
  - Buttons & Sidebar Items: `text-sm` for optimal legibility and touch targets.

## 5. 🗜️ Ultra-Compact Minimalist Padding (No Bloated Whitespace)
- **Strict High-Density Layout:** Avoid loose, bulky, or oversized padding (no `p-8`, `p-6`, `space-y-8`, `h-16` headers).
- **Compact Padding Standards:**
  - Main view container: `p-3 md:p-4` with `space-y-3` or `space-y-4`.
  - Header: `h-11 px-4`.
  - Cards & Panels: `p-3.5` (header: `p-3 px-3.5`, content: `p-3`).
  - Table rows: compact `py-2` to `py-2.5`.
  - Buttons & Inputs: `h-8` or `h-8.5` with clear `text-xs` / `text-sm`.

## 6. 🚫 Zero Hard Deletion Directive (Only Active / Inactive / Archived)
- **NO DELETE OPERATIONS:** Never provide hard "Delete" buttons, delete actions, or SQL `DELETE` calls in any part of the system.
- **Soft Status Lifecycle:** All entities must only transition between **`Active`** and **`Inactive`** (or `Draft` / `Archived`).
- UI controls should use toggle switches, status badges, or "Set Inactive" / "Archive" actions with confirmation dialogs.

## 7. 🛡️ Mandatory Security & Zod Validation
- **100% Zod Schema Enforcement:** Every form, modal input, search query, and API payload MUST have a strict Zod schema definition (`z.object({...})`).
- **Form Integration:** Use `react-hook-form` paired with `@hookform/resolvers/zod` for all form handling and inline client-side validation.
- **Server-Side Validation:** Never trust client-side data alone. Always validate Server Actions and API Route requests using `schema.safeParse()`.
- **Zero Raw HTML Injection (XSS Prevention):** Never use `dangerouslySetInnerHTML` with untrusted data.
- **Zero Hardcoded Secrets:** All credentials, private API keys, and auth secrets must reside in `.env.local` and be validated with a Zod environment schema.
- **RBAC & Action Authorization:** Always verify user roles/permissions before executing any mutation.

## 8. 🚫 Zero Extra Backgrounds (No Gray Shading / No Background Clutter)
- **No extra background fills:** Do NOT add shaded gray block backgrounds, nested card backgrounds, or tinted footer/header containers (avoid `bg-muted`, `bg-zinc-100`, `bg-zinc-800` as block fills).
- **Pure & Clean Surfaces:** Base surfaces must be pure white (`#ffffff`) in light mode and deep jet black (`#09090b`) in dark mode.
- Use **crisp 1px borders** (`border border-border/80`) to define sections and structure, never bulky colored or gray background fills.

## 9. 📐 Sharp Geometry & No Bulky Shadows (Architectural Minimalist)
- **Zero Heavy Shadows:** Never use `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, or bulky ring halos. Everything is flat and defined by clean hairline borders (`shadow-none border border-border`).
- **Sharp Corners (No Rounded Pills):** Border radius is strictly minimal (`0.125rem` / `rounded-xs` or `rounded-none`). No `rounded-xl`, `rounded-2xl`, or `rounded-full` pills on cards, buttons, badges, tabs, or dialogs.

## 10. 🏁 Achromatic & Monochromatic Aesthetic
- **No colorful or neon elements:** Strictly high-contrast monochrome (pure blacks, crisp whites, slate/zinc hairlines).
- Reserve subtle, desaturated tints strictly for semantic status indicators (e.g., active, inactive, pending) without overpowering the interface.

## 11. 📱 Mandatory Full Responsiveness & Mobile-Friendliness
- **100% Mobile Optimized:** Every view must seamlessly adapt to mobile screens.
- Tables must have horizontal overflow wrappers (`overflow-x-auto`).
- Touch-friendly tap targets and collapsible mobile navigation with sheet drawers.
