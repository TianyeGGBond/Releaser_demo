# AI-Powered Internal Developer Platform

An Internal Developer Platform (IDP) demo built with React, Express, tRPC, and an AI assistant for DevOps troubleshooting. Runs fully in mock-data mode with no external dependencies required.

---

## Features

### Core Platform
- **Plugin Architecture** — Enable / disable / configure plugins at runtime via the Plugin Manager
- **Dark-themed sidebar layout** — Collapsible, resizable sidebar with per-route navigation
- **Plugin Marketplace** — Discover and toggle community plugins

### Built-in Plugins

| Plugin | Description |
|---|---|
| **Service Catalog** | Browse microservices — owner, team, language, framework, health status, tier |
| **Deployment Monitor** | Real-time and historical deployment records across production / staging / dev |
| **AI Assistant** | Chat with an LLM-powered DevOps assistant for log analysis and troubleshooting |
| **Onboarding Workflow** | Scaffold new projects from curated templates (Next.js, Go, FastAPI, Rust, …) |
| **Developer Metrics** | DORA (Deployment Frequency, Lead Time, CFR, MTTR) and SPACE framework dashboards |

### Backend
- **tRPC API** — End-to-end type-safe API between React and Express
- **MySQL via Drizzle ORM** — Full schema with migrations; gracefully falls back to in-memory mock data when no DB is configured
- **OAuth session management** — JWT-signed cookies; bypassed in no-auth mode
- **LLM integration** — OpenAI-compatible chat endpoint (configurable via env vars)

---

## Project Structure

```
.
├── client/                  # React frontend (Vite)
│   ├── index.html
│   └── src/
│       ├── _core/hooks/     # useAuth, etc.
│       ├── components/      # DashboardLayout, AIChatBox, UI primitives
│       ├── pages/           # One file per route
│       │   ├── Home.tsx
│       │   ├── ServiceCatalog.tsx
│       │   ├── DeploymentMonitor.tsx
│       │   ├── AIAssistant.tsx
│       │   ├── Onboarding.tsx
│       │   ├── Metrics.tsx
│       │   ├── Marketplace.tsx
│       │   └── PluginManager.tsx
│       └── lib/trpc.ts      # tRPC client setup
│
├── server/                  # Express backend
│   ├── _core/
│   │   ├── index.ts         # Server entry point
│   │   ├── trpc.ts          # tRPC init + middleware
│   │   ├── context.ts       # Request context (auth)
│   │   ├── sdk.ts           # OAuth / session helpers
│   │   ├── llm.ts           # LLM invocation wrapper
│   │   ├── env.ts           # Environment variable bindings
│   │   └── vite.ts          # Vite dev-server middleware
│   ├── routers.ts           # All tRPC routers
│   ├── db.ts                # Drizzle queries (+ mock fallback)
│   ├── mock-data.ts         # In-memory demo data
│   └── storage.ts           # File storage helpers
│
├── shared/                  # Code shared by client + server
│   ├── const.ts
│   └── types.ts
│
├── drizzle/                 # DB schema & migrations
│   └── schema.ts
│
├── package.json
├── vite.config.ts
└── drizzle.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (`npm i -g pnpm`)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Required – signs JWT session cookies
JWT_SECRET=change-me-in-production

# Optional – connect a MySQL database (app runs on mock data without this)
# DATABASE_URL=mysql://user:password@localhost:3306/ai_idp_demo

# Optional – enable OAuth login
# OAUTH_SERVER_URL=https://your-oauth-server
# VITE_APP_ID=your-app-id
# OWNER_OPEN_ID=your-open-id

# Optional – enable the AI Assistant
# BUILT_IN_FORGE_API_URL=https://api.openai.com
# BUILT_IN_FORGE_API_KEY=sk-...
```

The app runs in **mock-data mode** when `DATABASE_URL` is omitted — all pages render with realistic demo data, no database needed.

### 3. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. (Optional) Set up the database

```bash
# Push schema and run migrations
pnpm db:push
```

### 5. Build for production

```bash
pnpm build
pnpm start
```

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build client + server for production |
| `pnpm start` | Run the production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm check` | TypeScript type check |
| `pnpm format` | Prettier format |
| `pnpm db:push` | Generate & apply Drizzle migrations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, TanStack Query, wouter, Tailwind CSS v4 |
| UI Components | Radix UI primitives, shadcn/ui, Lucide icons, Recharts |
| API | tRPC v11, superjson |
| Backend | Express 4, TypeScript, tsx |
| Database | MySQL 2, Drizzle ORM |
| Auth | JWT (jose), HTTP-only cookies |
| Testing | Vitest |

---

## Mock Data

When no database is configured the following demo data is served automatically:

- **10 services** across Go, TypeScript, Java, Python, and Rust — with healthy / degraded / down statuses
- **15 deployment records** spanning production, staging, and development environments
- **6 plugins** (all enabled)
- **8 project templates** sorted by popularity
- **Metrics** computed in real time from the mock deployments

To add a real database, set `DATABASE_URL` in `.env` and run `pnpm db:push`.
