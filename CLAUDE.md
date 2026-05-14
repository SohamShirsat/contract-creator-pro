# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start Vite dev server

# Build
bun run build        # Production build
bun run build:dev    # Development build
bun run preview      # Preview production build

# Code quality
bun run lint         # ESLint
bun run format       # Prettier
```

## Architecture

This is a **TanStack Start** (SSR) app scaffolded via Lovable, deployed to **Cloudflare Workers** via `@cloudflare/vite-plugin`. The entry point for the Worker is `src/server.ts`; the Vite config (`vite.config.ts`) delegates all plugin setup to `@lovable.dev/vite-tanstack-config` — do not add Tailwind, React, or TanStack plugins manually.

### Routing

File-based routing via `@tanstack/react-router`. Routes live in `src/routes/`. The generated route tree is in `src/routeTree.gen.ts` (auto-generated, do not edit). The only route currently is `/` (`src/routes/index.tsx`).

### State management — `ContractContext`

All wizard state lives in a single React context defined in `src/lib/contract.tsx`. `ContractState` is a large flat interface covering all 7 wizard steps. The context exposes:
- `state` / `setState` — full contract state
- `step` / `setStep` — current wizard step (1–7)
- `uid()` — generates random IDs for list items

`ContractProvider` wraps the entire wizard and holds the initial mock data (pre-filled hotel contract). Every wizard step component reads/writes state through `useContract()`.

### Wizard steps

`src/routes/index.tsx` renders one step component at a time based on `step`:

| Step | Component | Covers |
|------|-----------|--------|
| 1 | `Step1Setup` | Contract name, hotel, meal plans, child tiers, commission rates |
| 2 | `Step2Pricing` | Seasons, room types, per-season/room/meal pricing grid |
| 3 | `Step3Addons` | Add-on packages (mandatory/optional) |
| 4 | `Step4Policies` | Cancellation rules, blackouts, min LOS, FOC, inventory, holding |
| 5 | `Step5Tax` | Tax/levy/fee definitions |
| 6 | `Step6Info` | Contract validity dates, additional info |
| 7 | `Step7Preview` | Read-only preview before publishing |

Navigation (Back / Save & Continue / Publish) is in a fixed footer in the route component, not inside step components.

### Styling

Uses **Tailwind CSS v4** with a custom design system defined in `src/styles.css`. Semantic color tokens (e.g. `--color-primary`, `--color-border`) are defined as CSS custom properties in `:root` using `oklch`. Always use `oklch` format for new color values.

A set of custom utility classes (`cc-*`) is defined in `@layer components` for consistent form controls without importing shadcn:
- `cc-card`, `cc-input`, `cc-label` — layout and form primitives
- `cc-btn`, `cc-btn-primary`, `cc-btn-outline`, `cc-btn-ghost`, `cc-btn-lg` — buttons
- `cc-chip`, `cc-chip-active` — toggle chips
- `cc-table`, `cc-table-compact` — data tables
- `cc-icon-btn` — small icon action buttons

The `src/components/ui/` directory contains the full shadcn/ui component library, but the wizard steps currently use the `cc-*` CSS classes directly rather than shadcn components.

### Key data structures

- `pricing` is a 3-level nested record: `pricing[seasonId][roomId][MealPlan]` → `PriceCell`
- `MealPlan` is `"EP" | "CP" | "MAP" | "AP"`
- `PricingBasis` is `"PerRoom" | "PerPersonSharing"` and affects how the pricing grid is rendered in Step 2
- Child pricing columns (`cweb1`, `cnb1`, `cweb2`, `cnb2`) appear in the pricing grid based on the child tiers configured in Step 1
