# NEXORA AI

The AI-powered business operating system: CRM, leads, pipeline, conversations,
workflow automation, analytics, integrations, team management and billing in one
workspace.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (design tokens in `src/styles/globals.css`)
- React Router
- Framer Motion
- Lucide React
- Inter, Plus Jakarta Sans and IBM Plex Mono (self-hosted via Fontsource)

## Getting started

```bash
npm install
npm run dev        # http://localhost:5190
npm run build      # type-check + production build
npm run preview    # serve the production build
```

In development, the full design system documentation (tokens, every component
in every state, charts and motion) is available at `/ui`.

## Project structure

```
src/
├── assets/
├── components/
│   ├── ui/            Design-system primitives (Button, Input, Modal, Table, …)
│   │   └── charts/    SVG charts: Area, Line, Bar, Donut, Sparkline
│   ├── layout/        App shell, marketing and auth layouts, sidebar, topbar
│   ├── dashboard/
│   ├── crm/
│   ├── automation/
│   ├── analytics/
│   └── integrations/
├── data/              Navigation config and static data
├── hooks/             Shared hooks (disclosure, overlays, local storage, element size)
├── lib/               Utilities (cn, formatting, routes, motion presets, tokens)
├── pages/             One file per route, lazy-loaded
├── styles/            Global styles and theme tokens
├── App.tsx            Router
└── main.tsx           Entry point
```

## Design system

All tokens live in `src/styles/globals.css` (Tailwind v4 `@theme`) and generate
utilities, so components never hard-code values.

### Color

| Token                                   | Value                           | Usage                          |
| --------------------------------------- | ------------------------------- | ------------------------------ |
| `white` / `canvas` / `sunken`           | `#FFFFFF` / `#F8FAFC` / `#F1F5F9` | Surfaces, app background, wells |
| `ink` / `muted` / `subtle`              | `#111827` / `#475569` / `#94A3B8` | Text hierarchy                 |
| `border-subtle` / `border` / `border-strong` | `#F1F5F9` / `#E2E8F0` / `#CBD5E1` | Dividers, outlines, hover   |
| `primary` (+ `-hover`, `-active`, `-soft`, `-border`) | `#2563EB`             | Actions, focus, active state   |
| `accent` (+ `-hover`, `-soft`, `-border`) | `#4F46E5`                     | AI features                    |
| `success` / `warning` / `danger` (+ `-hover`, `-text`, `-soft`, `-border`) | `#16A34A` / `#F59E0B` / `#DC2626` | Status |
| `chart-1` … `chart-6`                   | Blue, indigo, sky, teal, amber, slate | Data series, in order    |

### Typography

Inter for UI, Plus Jakarta Sans for headings (`font-display`), IBM Plex Mono for
numbers (`font-mono`, `.text-metric`). Base size is 14px.

| Role utility                          | Size / line height |
| ------------------------------------- | ------------------ |
| `.type-display`                       | 48 / 56            |
| `.type-h1` · `.type-h2`               | 30 / 38 · 24 / 32  |
| `.type-h3` · `.type-h4`               | 17 / 26 · 15 / 24  |
| `.type-body` · `.type-body-sm`        | 14 / 22 · 13 / 20  |
| `.type-caption` · `.type-overline`    | 12 / 16 · 11 / 16  |
| `.type-metric`                        | 24 / 32 mono       |

The raw scale is `text-2xs` (11px) through `text-6xl` (60px).

### Spacing, radius, borders and elevation

- Spacing uses a 4px grid. Layout tokens: `w-sidebar` (240px),
  `w-sidebar-collapsed` (60px), `h-topbar` (56px), `max-w-content` (1400px).
- Radius is restrained: `rounded-xs` 2px, `sm` 4px (badges), `md` 6px (buttons,
  inputs), `lg` 8px (cards), `xl` 10px (modals), `2xl` 12px (the maximum).
- Borders are 1px hairlines in three strengths: `border-subtle`, `border`,
  `border-strong`.
- Shadows: `shadow-xs` (controls), `sm` (cards), `md` (hovered cards), `lg`
  (menus, tooltips, toasts), `xl` (modals, drawers). Focus rings are
  `shadow-focus`, `shadow-focus-danger` and `shadow-focus-success`.

### States

Every interactive component implements the same states:

| State    | Treatment                                                    |
| -------- | ------------------------------------------------------------ |
| Default  | Token colors at rest                                         |
| Hover    | One step darker background or stronger border                |
| Active   | Two steps darker; buttons nudge down 1px                     |
| Focus    | `focus-visible` 3px soft ring, plus a primary border on fields |
| Disabled | 50% opacity, no pointer events                               |
| Loading  | Spinner with `aria-busy`, optional `loadingText`             |
| Error    | Danger border, danger ring, icon and message (`aria-invalid`) |
| Success  | Success border, ring and check icon                          |

### Components

`src/components/ui` exports: Button, Input, Select, Textarea, Checkbox, Field,
Badge, Avatar, Card, MetricCard, Alert, Progress, Table, Tabs, Modal,
ConfirmDialog, Drawer, Dropdown, Tooltip, Toast, EmptyState, LoadingState,
Skeleton, Breadcrumbs, Pagination, TopNavLink, SidebarPanel, SidebarSection and
SidebarItem. The charts are ChartContainer, AreaChart, LineChart, BarChart,
DonutChart, Sparkline, ChartLegend and ChartTooltip. Charts are keyboard
accessible: focus a chart and use the arrow keys.

### Motion

`src/lib/motion.ts` exports the `duration` and `ease` tokens, the `transitions`,
and the variants `fadeIn`, `fadeUp`, `scaleIn`, `slideIn(direction, distance)`,
`staggerChildren(stagger, delay)` and `pageTransition`, each with
`hidden` / `visible` / `exit` states. Wrapper components are `FadeIn`,
`Stagger`, `StaggerItem` and `PageTransition`, which is applied to every `/app`
route.

`prefers-reduced-motion` is respected in two places. `MotionProvider` (Framer
Motion's `reducedMotion="user"`) removes transform animations and keeps opacity
fades. A global CSS rule removes CSS transitions and animations, except
spinners.

Keyboard shortcuts in the app: `Ctrl/⌘ K` opens the command menu, and `[`
toggles the sidebar.

## Routes

| Path                 | Screen        |
| -------------------- | ------------- |
| `/`                  | Home          |
| `/features`          | Features      |
| `/pricing`           | Pricing       |
| `/login`, `/signup`  | Auth          |
| `/app`               | Dashboard     |
| `/app/leads`         | Leads         |
| `/app/contacts`      | Contacts      |
| `/app/pipeline`      | Pipeline      |
| `/app/conversations` | Conversations |
| `/app/automations`   | Automations   |
| `/app/ai`            | AI Assistant  |
| `/app/analytics`     | Analytics     |
| `/app/integrations`  | Integrations  |
| `/app/team`          | Team          |
| `/app/settings`      | Settings      |
| `/app/billing`       | Billing       |

## Deployment

`vercel.json` rewrites all paths to `index.html` so client-side routes work on
refresh. Import the repository in Vercel; it detects Vite automatically.
