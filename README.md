# NexoraAI

The AI tools marketplace and dashboard. Users discover AI tools, add them to a
personal workspace, and run them from one dashboard. Creators publish tools and
earn recurring revenue.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4.

## Features

- **Landing page** with featured tools, categories, creator pitch and FAQ
- **Marketplace** with search, category filters, free-only toggle and sorting
- **Tool detail pages** with features, sample prompts, reviews and pricing
- **Auth** (sign up / log in / log out) with signed, HTTP-only session cookies
- **Dashboard** with usage chart, credit balance, workspace and activity feed
- **AI Playground** that streams responses from OpenAI, or a demo reply when no key is set
- **Creator Studio** with revenue chart, listings and a publish-tool form
- **Billing** with plan switching, usage meter and invoices
- **Settings** with profile editing and creator mode toggle

## Getting started

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable         | Required | Description                                             |
| ---------------- | -------- | ------------------------------------------------------- |
| `SESSION_SECRET` | In prod  | Secret used to sign session cookies                     |
| `OPENAI_API_KEY` | No       | Enables real AI responses in the playground             |
| `OPENAI_MODEL`   | No       | Model to use (default `gpt-4o-mini`)                    |

## Project structure

```
src/
  app/
    (marketing)/     Landing, marketplace, tool pages, pricing
    (auth)/          Login and signup
    dashboard/       Overview, tools, playground, creator, billing, settings
    api/chat/        Streaming chat endpoint
    actions.ts       Server actions (auth, workspace, plans, profile)
  components/        Shared UI and dashboard components
  lib/
    data.ts          Tool catalog, plans and demo analytics
    session.ts       Signed cookie sessions
  proxy.ts           Redirects signed-out users away from /dashboard
```

## Roadmap

The app currently runs on demo data so it deploys with zero setup. Next steps:

- Replace demo auth and cookie storage with a database (e.g. Supabase or Postgres + Prisma)
- Stripe Checkout and webhooks for plans and tool subscriptions
- Persist creator submissions and an admin review queue
- Real per-user usage metering
