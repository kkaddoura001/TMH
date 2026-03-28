# The Middle East Hustle — Platform

A monorepo containing the TMH platform: main website, CMS, and API backend.

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/       # Express backend — serves API + static builds in prod
│   ├── cms/              # Vite + React CMS (admin panel)
│   └── tmh-platform/     # Vite + React main website
├── lib/
│   ├── db/               # Drizzle ORM schema + migrations (PostgreSQL)
│   ├── api-spec/         # Shared API type definitions
│   ├── api-zod/          # Zod validation schemas
│   └── api-client-react/ # React Query hooks for the API
├── scripts/
├── railway.toml          # Railway deployment config
└── pnpm-workspace.yaml
```

### How the services fit together

- In **production**, the API server serves everything from a single Railway service:
  - `tribunal.com` → TMH Platform (static build)
  - `cms.tribunal.com` → CMS Admin Panel (static build)
  - `*/api/*` → API routes (both domains)
  - Routing is hostname-based — the server checks the `Host` header
- In **development**, all 3 run as separate dev servers on different ports.

---

## Prerequisites

- Node.js 18+
- pnpm: `npm install -g pnpm`
- PostgreSQL running locally (or a hosted URL from Neon / Supabase / Railway)

---

## Local Development Setup

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

### 2. Create environment files

**`artifacts/api-server/.env`**
```env
PORT=3001
NODE_ENV=development
BASE_PATH=/

# PostgreSQL — local or hosted
DATABASE_URL=postgresql://postgres:password@localhost:5432/tmh_dev

# Security — any placeholder works locally
MAJLIS_ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000001
CMS_USERNAME=admin
CMS_PIN=1234
ADMIN_KEY=tmh-admin-local

# AI — needed only for Ideation Engine features
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Optional — email integrations
RESEND_API_KEY=re_...
BEEHIIV_API_KEY=...
BEEHIIV_PUBLICATION_ID=pub_...

# Optional — Cloudflare R2 media storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=tmh-uploads
R2_PUBLIC_URL=https://pub-REPLACE.r2.dev
```

**`artifacts/cms/.env`**
```env
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:3001
```

**`artifacts/tmh-platform/.env`**
```env
PORT=5174
BASE_PATH=/
VITE_API_URL=http://localhost:3001
```

> All three apps require `PORT` and `BASE_PATH` — they throw on startup without them (Replit-era requirement).

### 3. Push the database schema

```bash
cd lib/db
pnpm run push
```

This uses `drizzle-kit push` to sync the schema to your database. Use `push-force` if you need to reset:

```bash
pnpm run push-force
```

### 4. Start all 3 services

Open **3 terminal tabs**:

**Tab 1 — API Server** (backend + seed data):
```bash
cd artifacts/api-server
pnpm dev
# Running at http://localhost:3001
```

**Tab 2 — CMS** (admin panel):
```bash
cd artifacts/cms
pnpm dev
# Running at http://localhost:5173
```

**Tab 3 — TMH Platform** (main website):
```bash
cd artifacts/tmh-platform
pnpm dev
# Running at http://localhost:5174
```

### Service URLs (local)

| Service | URL |
|---|---|
| API | http://localhost:3001/api |
| API Health Check | http://localhost:3001/api/health |
| CMS | http://localhost:5173 |
| TMH Platform | http://localhost:5174 |

---

## API Routes

| Route | Description |
|---|---|
| `GET /api/health` | Health check |
| `/api/cms/*` | CMS content management |
| `/api/admin/*` | Admin operations (requires `ADMIN_KEY` header) |
| `/api/ideation/*` | AI-powered content ideation engine |
| `/api/polls/*` | Polls |
| `/api/predictions/*` | Predictions |
| `/api/profiles/*` | Speaker/guest profiles |
| `/api/majlis/*` | Majlis event data |
| `/api/newsletter/*` | Newsletter signup (Beehiiv) |
| `/api/apply/*` | Application forms |
| `/api/categories/*` | Content categories |

---

## Production Build

Build all packages:

```bash
pnpm run build
```

This compiles:
- `lib/*` TypeScript libs
- `artifacts/api-server` → `artifacts/api-server/dist/index.cjs`
- `artifacts/cms` → `artifacts/cms/dist/public/`
- `artifacts/tmh-platform` → `artifacts/tmh-platform/dist/public/`

Then the API server serves both frontends as static files.

---

## Deployment — Railway + Supabase

The project deploys as a **single Railway service** backed by a **Supabase PostgreSQL** database. Everything is pre-configured via `railway.toml`.

**See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full step-by-step guide**, covering:

1. Creating a Supabase project and getting the connection string
2. Running `./scripts/setup-db.sh` to initialize schema + seed data
3. Creating a Railway project and setting environment variables
4. Deploying and verifying
5. Custom domain setup
6. Troubleshooting

### Quick Start (if you know what you're doing)

```bash
# 1. Set up database
DATABASE_URL="postgresql://..." ./scripts/setup-db.sh

# 2. Link Railway project
railway login && railway init

# 3. Set env vars (see .env.production.example for full list)
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://..."
railway variables set MAJLIS_ENCRYPTION_KEY="$(openssl rand -hex 32)"
# ... set remaining vars

# 4. Deploy
railway up
```

| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
|---|---|
| Start command | `node artifacts/api-server/dist/index.cjs` |
| Health check | `GET /api/healthz` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Database | PostgreSQL, Drizzle ORM |
| AI | Anthropic Claude, Perplexity |
| Media storage | Cloudflare R2 |
| Email | Resend (transactional), Beehiiv (newsletter) |
| Deployment | Railway |
| Package manager | pnpm (workspaces) |
