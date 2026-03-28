# Claude Todos — TMH Platform

> Actionable checklist for future Claude sessions. Each item includes context so you can pick up without re-reading the full conversation history.
> Last updated: 2026-03-26 (session 2 — Ideation Engine audit)

---

## 🔴 BLOCKING — Must do before going live

### [ ] Commit the Ideation Engine audit fixes
Files changed in session 2:
```bash
git add \
  artifacts/api-server/src/services/ideation-ai.ts \
  artifacts/api-server/src/routes/ideation.ts \
  lib/db/src/schema/ideation.ts \
  docs/claude-todos.md
git commit -m "fix: Ideation Engine — correct Claude model, wire categories/tags to generation, add date to research prompt, fix schema types"
git push origin master
```
**What was fixed:**
- `claude-sonnet-4-20250514` → `claude-sonnet-4-6` (was an invalid model ID — all Claude calls would have failed)
- `categories` and `tags` now explicitly passed to Claude generation as `EDITORIAL FOCUS` note (previously dead weight — only hit Perplexity, never Claude)
- Research prompt now includes today's date + "past 30 days" anchor for Perplexity
- `guardrails` and `pillarCounts` added to `configSnapshot` TypeScript type

### [ ] Commit the deployment changes to GitHub
Files to stage (do NOT include the .key file or -1.jpg duplicates):
```bash
git add .gitignore \
  artifacts/api-server/build.ts \
  artifacts/api-server/package.json \
  artifacts/api-server/src/app.ts \
  artifacts/api-server/src/index.ts \
  artifacts/api-server/src/routes/admin.ts \
  artifacts/api-server/src/routes/cms.ts \
  artifacts/api-server/src/routes/polls.ts \
  artifacts/api-server/src/routes/predictions.ts \
  artifacts/api-server/src/utils/r2.ts \
  pnpm-lock.yaml \
  railway.toml \
  .env.production.example \
  CLAUDE.md \
  docs/claude-todos.md
git commit -m "feat: Railway production deployment — static serving, R2 uploads, rate limiting, security hardening"
git push origin master
```

### [ ] Untrack the 63MB Keynote file from git
```bash
git rm --cached "attached_assets/TMH_Master_Deck_KK_RELEASE_1773851416485.key"
git commit -m "chore: untrack large binary Keynote file from git history"
```

### [ ] Delete duplicate profile photo files
These were accidentally created and are untracked:
```bash
rm artifacts/tmh-platform/public/profiles/laith_zraikat-1.jpg
rm artifacts/tmh-platform/public/profiles/nahla_atie-1.jpg
rm artifacts/tmh-platform/public/profiles/nikita_sachdev_lord-1.jpg
```

### [ ] Set Railway Build Variables (separate from runtime vars)
In Railway → Service → Variables → **Build Variables** tab, add:
```
PORT=3000
BASE_PATH=/
NODE_ENV=production
```
**Why:** `artifacts/tmh-platform/vite.config.ts` and `artifacts/cms/vite.config.ts` throw at build time if these are missing. Without them, the Vite build step fails and Railway never produces the frontend assets.

### [ ] Run DB schema push on Railway PostgreSQL (one-time)
After Railway PostgreSQL is provisioned, run from Railway shell or as a one-time release command:
```bash
pnpm --filter @workspace/db run push
```
The api-server auto-seeds on startup but requires tables to exist first.

---

## 🟡 HIGH PRIORITY — Do before opening to public

### [ ] Persist Ideation Engine predictions to DB (not in-memory)
**Current behaviour:** When you publish a prediction draft from the Ideation Engine (`/cms/ideation/ideas/:id/publish-draft`), it pushes to the `mockPredictions[]` in-memory array. This gets wiped on every server restart — predictions created via ideation vanish.
**Debates work correctly:** They write to `pollsTable` in the DB.
**Fix:** Create a proper predictions DB table (same pattern as polls) and update the publish-draft route for `pillarType === "predictions"` to insert there instead of `mockPredictions.push(...)`.
**File:** `artifacts/api-server/src/routes/ideation.ts` line ~480 — `mockPredictions.push(...)` block.

### [ ] Fix majlis.ts pre-existing TypeScript errors
**Why it matters:** `src/routes/majlis.ts` has ~20+ `TS7030` ("not all code paths return a value") errors. In Express 5, async route handlers without explicit returns can cause silent failures or hung connections. This is real runtime risk, not just type noise.
**What to do:** Read `artifacts/api-server/src/routes/majlis.ts`, fix async handlers to always `return res.json(...)` or `return res.status(N).json(...)`. Do NOT use `res.send()` without return.

### [ ] Fix polls.ts pre-existing TypeScript errors
Same pattern as majlis.ts. File: `artifacts/api-server/src/routes/polls.ts`.
Errors: TS7030 at multiple lines + TS2345 (`string | string[]` not assignable to `string` — likely a `req.headers` value being passed directly).

### [ ] Run smoke test checklist after first Railway deploy
Work through these in order — stop and fix before continuing if anything fails:
- [ ] `GET https://themiddleeasthustle.com/api/health` → 200
- [ ] Homepage loads with debates, predictions, pulse, voices
- [ ] CMS loads at `/cms` — log in with new credentials
- [ ] Cast a vote on a debate → share gate appears → results unlock
- [ ] Vote YES/NO on a prediction → percentage updates
- [ ] Profiles page loads all photos
- [ ] CMS: create a new debate → set status to `approved` → verify it appears on frontend
- [ ] CMS Analytics page loads vote charts
- [ ] Ideation Engine: run full 5-step flow (Research → Generate → Safety → Cherry-pick → Refine)
- [ ] Newsletter signup → check Beehiiv subscriber list
- [ ] Submit application → check Resend for confirmation email
- [ ] Upload a profile photo in CMS → verify R2 URL returned → photo shows in Voices
- [ ] `curl -A "Twitterbot" https://themiddleeasthustle.com/polls/[any-id]` → confirm OG meta tags in response HTML

### [ ] Fix/run the existing CMS e2e test file
File: `artifacts/api-server/src/__tests__/cms-e2e.ts`
It has 50+ TypeScript errors but the test logic is likely useful. Fix types and run against the Railway instance. This covers CMS auth, CRUD operations, and content workflow.

### [ ] Content review — set real content to `approved`, archive seed data
All 422 debates, 103 profiles, 230 predictions are seed/placeholder data. Nothing with `editorialStatus = 'draft'` or `'archived'` appears publicly.
Strategy: use CMS → bulk set all to `archived` first, then approve only real content piece by piece.

---

## 🟢 POST-LAUNCH — Do after going live

### [ ] Add Sentry error tracking
```bash
pnpm --filter @workspace/api-server add @sentry/node
pnpm --filter @workspace/tmh-platform add @sentry/react
```
Add `Sentry.init({ dsn: process.env.SENTRY_DSN })` in `artifacts/api-server/src/index.ts` before app setup.
Add `SENTRY_DSN` to env vars.

### [ ] Set up UptimeRobot monitoring
- Free tier at uptimerobot.com
- Monitor: `https://themiddleeasthustle.com/api/health` every 5 minutes
- Alert via email on downtime

### [ ] Enable Railway PostgreSQL automatic backups
Railway → PostgreSQL service → Settings → Enable automatic backups.
Also run initial manual backup: `pg_dump $DATABASE_URL > backup-launch-$(date +%Y%m%d).sql`

### [ ] Add sitemap and submit to Google Search Console
Check if `/sitemap.xml` exists. If not, generate one covering `/`, `/polls`, `/predictions`, `/profiles`, `/about`, `/apply`.
Submit at search.google.com/search-console.

### [ ] Verify OG tags in social validators
- Twitter Card Validator: cards-dev.twitter.com/validator (now X)
- LinkedIn Post Inspector: linkedin.com/post-inspector
- Test URLs: homepage, a poll detail page, a profile page

### [ ] Set up Cloudflare proxy for themiddleeasthustle.com (optional but recommended)
If domain DNS is managed through Cloudflare (not just R2), enable the orange-cloud proxy. Gives you: DDoS protection, WAF, free caching of static assets, analytics.

### [ ] Fix profiles.ts pre-existing TypeScript error
File: `artifacts/api-server/src/routes/profiles.ts` — 1 pre-existing error. Lower priority than majlis.ts.

### [ ] Remove wroflow.html or add to docs properly
File is untracked at project root. Either:
- Commit it to `docs/wroflow.md` (convert to markdown)
- Or delete if not needed

### [ ] Majlis — set up first users before launch
Majlis chat requires invite tokens. Before inviting real users:
1. Log into CMS → Majlis → Create invite token
2. Register first user (yourself/admin) with the token
3. Create the "General" channel if not auto-created
4. Test send/receive encrypted messages end-to-end

---

## 📋 Infrastructure Provisioning Checklist (one-time setup)

- [ ] Railway: Create project, add PostgreSQL service, connect GitHub repo
- [ ] Railway: Set all runtime env vars from `.env.production.example`
- [ ] Railway: Set build vars (PORT, BASE_PATH, NODE_ENV) — separate tab
- [ ] Railway: Set custom domains — `themiddleeasthustle.com` + `www.themiddleeasthustle.com`
- [ ] Cloudflare R2: Create bucket `tmh-uploads`, enable public access, generate API token
- [ ] Resend: Create account, verify `themiddleeasthustle.com` domain, add DNS records
- [ ] Beehiiv: Create "The Middle East Hustle" publication, get API key + publication ID
- [ ] DNS: Point `@` and `www` CNAME/A records to Railway public URL
- [ ] DNS: Add Resend TXT + DKIM records for email sending
- [ ] Generate new `MAJLIS_ENCRYPTION_KEY`: `openssl rand -hex 32`

---

## 🔑 API Keys Still Needed

| Key | Purpose | Status |
|-----|---------|--------|
| `ANTHROPIC_API_KEY` | AI ideation engine | ✅ Have it |
| `PERPLEXITY_API_KEY` | Research phase of ideation | ✅ Have it |
| `RESEND_API_KEY` | Application confirmation emails | ❌ Create at resend.com |
| `BEEHIIV_API_KEY` | Newsletter subscriber sync | ❌ Create at beehiiv.com |
| `BEEHIIV_PUBLICATION_ID` | Newsletter publication ID | ❌ From Beehiiv dashboard |
| `R2_ACCOUNT_ID` | Cloudflare R2 storage | ❌ From Cloudflare dashboard |
| `R2_ACCESS_KEY_ID` | R2 API token | ❌ From Cloudflare R2 tokens |
| `R2_SECRET_ACCESS_KEY` | R2 API secret | ❌ From Cloudflare R2 tokens |
| `R2_PUBLIC_URL` | Public URL for R2 bucket | ❌ After enabling R2 public access |
| `MAJLIS_ENCRYPTION_KEY` | Chat message encryption | ❌ Generate: `openssl rand -hex 32` |
| `CMS_USERNAME` | CMS login | ❌ Choose your own |
| `CMS_PIN` | CMS PIN | ❌ Choose strong PIN |
| `ADMIN_KEY` | Admin API key | ❌ Generate: `openssl rand -base64 32` |

---

## 🗂 Key File Reference

| What | Where |
|------|-------|
| Railway config | `railway.toml` |
| All env vars documented | `.env.production.example` |
| Express app (static serving, CORS) | `artifacts/api-server/src/app.ts` |
| R2 client utility | `artifacts/api-server/src/utils/r2.ts` |
| CMS routes + upload | `artifacts/api-server/src/routes/cms.ts` |
| Vote rate limiting | `artifacts/api-server/src/routes/polls.ts` + `predictions.ts` |
| Ideation Engine routes | `artifacts/api-server/src/routes/ideation.ts` |
| Ideation AI service (prompts, Claude, Perplexity) | `artifacts/api-server/src/services/ideation-ai.ts` |
| Ideation DB schema | `lib/db/src/schema/ideation.ts` |
| DB schema | `lib/db/src/schema/` |
| Seed script | `lib/db/src/seed-cms.ts` |
| Product documentation | `docs/PRODUCT.md` |
