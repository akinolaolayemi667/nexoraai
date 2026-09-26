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

In development, the component library can be previewed at `/ui`.

## Project structure

```
src/
├── assets/
├── components/
│   ├── ui/            Design-system primitives (Button, Input, Modal, Table, …)
│   ├── layout/        App shell, marketing and auth layouts, sidebar, topbar
│   ├── dashboard/
│   ├── crm/
│   ├── automation/
│   ├── analytics/
│   └── integrations/
├── data/              Navigation config and static data
├── hooks/             Shared hooks (disclosure, overlays, local storage)
├── lib/               Utilities (cn, formatting, route constants)
├── pages/             One file per route, lazy-loaded
├── styles/            Global styles and theme tokens
├── App.tsx            Router
└── main.tsx           Entry point
```

## Design tokens

| Token            | Value     | Usage                        |
| ---------------- | --------- | ---------------------------- |
| `white`          | `#FFFFFF` | Surfaces                     |
| `canvas`         | `#F8FAFC` | App background, sidebar      |
| `ink`            | `#111827` | Primary text                 |
| `muted`          | `#475569` | Secondary text               |
| `primary`        | `#2563EB` | Actions, focus, active state |
| `accent`         | `#4F46E5` | AI and highlight accents     |
| `primary-soft`   | `#DBEAFE` | Selected / info backgrounds  |
| `accent-soft`    | `#EEF2FF` | AI backgrounds               |
| `border`         | `#E2E8F0` | Dividers and outlines        |
| `success`        | `#16A34A` | Positive states              |
| `warning`        | `#F59E0B` | Caution states               |
| `danger`         | `#DC2626` | Errors, destructive actions  |

Fonts: `font-sans` (Inter), `font-display` (Plus Jakarta Sans, used for headings),
`font-mono` / `.text-metric` (IBM Plex Mono, used for numbers and metrics).

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
