# The Middle East Hustle Platform

## Overview

Full-stack polling and opinion platform for the Middle East. Users vote on daily high-signal questions across business, culture, technology, and identity. Features curated profiles of regional voices, rankings, and a weekly editorial digest.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, shadcn/ui, Wouter routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API)

## CMS (Content Management System)

Located at `artifacts/cms/`, served at `/cms`. Admin interface for managing all platform content. Login: `admin` / `1234` (default, overridable via `CMS_USERNAME`/`CMS_PIN` env vars).

Design aligned with main site: "THE TRIBUNAL." branding with crimson period, Playfair Display headings, Barlow Condensed uppercase labels, sharp corners (radius: .125rem), muted-foreground at 63% lightness, dark-only theme.

Sidebar sections:
- **Overview**: Dashboard (content stats + recent activity), Analytics (vote analytics, top polls, votes by category/country, daily activity), Homepage Manager (masthead, ticker, sections, banners, newsletter CTA)
- **Content**: Debates (CRUD + editorial workflow + vote options), Predictions (CRUD + resolution dates + momentum), Pulse (DB-backed topics with CRUD, spark data, editorial status), Voices (CRUD + full profile editor), Ideation Engine (AI-powered content generation with 5-step agentic workflow)
- **Pages**: About (hero, pillars, beliefs, founder statement, region coverage editor), FAQ (sections + Q&A editor), Terms (sections editor with last-updated date), Contact (emails, social links, office location), Debates Page (hero, ticker, sort labels, empty state), Predictions Page (hero, ticker, categories, featured IDs), Voices Page (hero, impact statements, stats bar, filter labels), Polls Page (hero, ticker items, ticker source), Apply Page (hero, criteria, countries, sectors, success message, disclaimer)
- **Settings**: Site Settings (navigation links, CTA button, footer links, social links, SEO/meta, cookie consent, share gate copy)
- **Design**: Design Tokens (brand colors, UI colors, typography — all DB-backed)
- **Audience**: Subscribers (newsletter list from DB, search, CSV export), Applications ("Join The Voices" submissions from DB, review/approve/reject/shortlist)

All CMS content endpoints are backed by real PostgreSQL queries via Drizzle ORM:
- **Debates** (`/api/cms/debates`): Queries `pollsTable` + `pollOptionsTable` — 422 polls with full CRUD, status transitions, and vote counts
- **Voices** (`/api/cms/voices`): Queries `profilesTable` — 103 profiles with full CRUD (no editorial_status column in DB; all treated as "approved")
- **Predictions** (`/api/cms/predictions`): Queries `predictionsTable` — 230 predictions with full CRUD, editorial status, momentum tracking
- **Pulse Topics** (`/api/cms/pulse-topics`): Queries `pulseTopicsTable` — 56 topics with full CRUD, spark data, editorial status
- **Design Tokens** (`/api/cms/design-tokens`): Queries `designTokensTable` — 13 tokens with full CRUD (brand colors, UI colors, typography)
- **Page Configs** (`/api/cms/pages/:page`): Queries `cmsConfigsTable` — about, pulse, polls, apply, faq, terms, contact, debates_page, predictions_page, voices_page
- **Site Settings** (`/api/cms/site-settings`): GET + PUT for global navigation, footer, SEO, cookie consent, share gate config
- **Stats** (`/api/cms/stats`): Real DB counts for debates/voices/predictions
- **Taxonomy** (`/api/cms/taxonomy`): Categories, tags, sectors, countries, cities all derived from real DB data
- **Subscribers** (`/api/cms/subscribers`, `/export`): Real DB queries on `newsletterSubscribersTable`
- **Applications** (`/api/cms/applications`): Real DB queries on `hustlerApplicationsTable`
- **Analytics** (`/api/cms/analytics`): Real DB aggregations across votes, polls, profiles, subscribers
- **Ideation Engine** (`/api/cms/ideation/*`): AI-powered content generation with sessions, ideas, exclusion list, prompt templates, rejection log. Uses Claude (Anthropic) for generation/safety/refinement and Perplexity for research. Falls back to intelligent mock data when API keys are not configured. DB tables: `ideation_sessions`, `ideation_ideas`, `ideation_rejection_log`, `ideation_exclusion_list`, `ideation_prompt_templates` (schema in `lib/db/src/schema/ideation.ts`). AI service abstraction in `artifacts/api-server/src/services/ideation-ai.ts`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, served at /api)
│   ├── cms/                # React + Vite CMS (served at /cms)
│   └── tmh-platform/       # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
└── ...
```

## CMS API Integration (Frontend)

The frontend (`artifacts/tmh-platform/`) fetches data from the CMS backend's public API endpoints, with graceful fallback to hardcoded data when the API is unavailable.

**Hooks file**: `src/hooks/use-cms-data.ts` — shared React Query hooks for all CMS endpoints:
- `usePredictions(category?)` → `/api/public/predictions` — prediction cards with trend data
- `usePulseTopics()` → `/api/public/pulse-topics` — MENA Pulse trend cards
- `usePageConfig<T>(page)` → `/api/public/page-config/:page` — page-specific config (about, apply, profiles, polls, pulse, etc.)
- `useHomepageConfig<T>()` → `/api/public/homepage` — homepage-specific config (masthead, section stats)
- `useSiteSettings()` → `/api/public/site-settings` — site-wide settings (navigation, footer, cookie consent, share gate, SEO)
- `useDesignTokens()` → `/api/public/design-tokens` — design system tokens (colors, typography)
- `useLiveCounts()` → `/api/public/live-counts` — real-time DB counts (debates, predictions, pulse, voices, votes)
- `getTokenValue(items, name, fallback)` — utility to extract a design token value

**Pattern**: Every page tries API first, falls back to hardcoded data arrays (renamed as `FALLBACK_*`). This ensures the site works without the CMS backend running.

**Pages migrated**:
- `predictions.tsx` — predictions + ticker from API
- `home.tsx` — predictions, pulse topics, section counts from live-counts API with CMS overrides
- `mena-pulse.tsx` — pulse topics, categories, and hero content from API
- `profiles.tsx` — impact statements prefer profile.impactStatement from API, fallback to company map
- `polls.tsx` — hero content from page config, debate ticker from live polls API
- `apply.tsx` — hero, criteria, countries, sectors, success message, disclaimer from page config
- `about.tsx` — hero, pillars, beliefs, founder statement, region coverage, stats from page config

**Components migrated**:
- `Navbar.tsx` — branding from site settings seo.siteTitle, nav links + CTA from navigation
- `Footer.tsx` — tagline, copyright, nav links, social links from site settings footer section (with design tokens fallback for socials)
- `CookieConsent.tsx` — all text from site settings cookieConsent
- `PollCard.tsx` — share-gate heading, body, skip text, email placeholder from site settings shareGate

## Features

### Insight & Engagement Layer
- **Personal Insight Card** — after unlocking results, shows a contextual insight based on vote % and how divided the question is
- **Enhanced Voter Profile** (`localStorage tmh_voter`) — tracks total votes, streak, categories, pollsVoted, firstVoteAt; updates on every vote
- **Vote counter badge** — Navbar shows live vote count with streak flame icon; hover tooltip shows category breakdown
- **"Weigh in" / "Voted" indicators** — poll card left panel shows voting status; bottom bar shows "You voted: [option] · X,XXX total"
- **Share icon fix** — robust clipboard copy with `execCommand` fallback + URL tooltip if clipboard unavailable
- **Weekly streak** — consecutive day voting tracked; "3-day streak 🔥" shown in results phase
- **First-time welcome** — one-time message on first vote: "Welcome to TMH. You just joined X,XXX people…"
- **Live activity feed** — homepage shows anonymized "Someone from UAE just voted on '…'" cycling every 4s from `/api/activity`
- **Platform stats bar** — live homepage stats strip: total votes, live debates, countries, active this week
- **Personalized hero subhead** — once user has voted, changes to "You've cast X votes. Y total across the region"
- **Country breakdown enhanced** — shows top voted option per country ("Most voted: 'Option text'")
- **Cross-sell filter** — related polls on `/polls/[id]` prioritize unvoted polls; shows "You've voted on X of Y in [Category]"

### Admin
- **Admin page** (`/admin`) — password-gated (key: `tmh-admin-2026` / `ADMIN_KEY` env var); application queue with AI scores, editorial approval/decline, notes; create polls with featured toggle; live stats dashboard
- **Admin API** (`/api/admin/*`) — requires `x-admin-key` header; endpoints: `GET /applications`, `PATCH /applications/:id`, `GET /stats`, `POST /polls`

### Editorial Gate
- **`editorialStatus`** column on `polls` table: `"approved"` (default), `"draft"`, `"rejected"`
- All public API endpoints filter by `editorialStatus = 'approved'`
- Admin can toggle status via `PATCH /api/admin/polls/:id/editorial`
- New polls created via admin are auto-approved

### Integrations (env-variable gated)
- **Resend** (`RESEND_API_KEY`) — sends confirmation email on Voice application
- **Beehiiv** (`BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID`) — syncs newsletter subscribers on subscribe
- **Admin key** (`ADMIN_KEY`) — defaults to `"tmh-admin-2026"` if not set

### Pages
- **Home** (`/`) — WSJ-style editorial front page: masthead → mixed ticker (debates+predictions+pulse with colored badges) → 4-column section hooks (Debates/Predictions/The Pulse/Voices) → lead debate column + latest debates sidebar → featured prediction with inline YES/NO voting (localStorage-persisted, share gate with WhatsApp/X/LinkedIn/Telegram/email unlock) + prediction sidebar with quick Y/N vote buttons and share icons → featured pulse card with share + "Explore →" link + pulse sidebar with share icons → The Voices → topics → newsletter CTA. All sections have share functionality (ShareMenu component with native share API fallback to clipboard). Prediction votes persist in `localStorage` as `tmh_pred_{id}`. Share gate pattern matches debates: vote → share/email to unlock → see results.
- **Polls** (`/polls`) — Full poll browser with search bar (sidebar), filter tabs (Latest/Trending/Most Voted) and category sidebar; client-side search filters by question, category, and tags
- **Poll Detail** (`/polls/:id`) — Full poll with context, voting UI, animated result reveal, share CTA, related polls
- **Profiles** (`/profiles`) — Searchable directory with country/sector/role filters
- **Profile Detail** (`/profiles/:id`) — Portrait, headline, story, lessons, quote, associated polls, similar voices
- **The Pulse** (`/mena-pulse`) — "Exploding Topics for MENA" style trend dashboard with search bar. Matching header branding (dark bg, crimson label, bold title, ticker, stats bar). Features: live population counter, 78 trend cards across 8 categories covering all 19 MENA countries. Each card has colored category tags, sparkline charts, expandable blurbs with sources. Country-specific entries include Algeria (gas leverage), Morocco (automotive industry), Tunisia (olive oil), Iraq (Development Road), Jordan (water crisis), Turkey (defense industry), Lebanon (banking collapse), Palestine (tech scene), Oman (green hydrogen), Sudan (famine crisis), Qatar (LNG expansion), Syria (reconstruction gap), Libya (oil revenue), Yemen (Red Sea disruption), Kuwait (political gridlock), Bahrain (fintech hub), Egypt (population surge). Scrolling LIVE ticker uses `tmh-ticker-scroll` CSS class. `useLiveCounter` hook for real-time ticking numbers. Search filters by title, blurb, stat, source, and tag.
- **Predictions** (`/predictions`) — Prediction market-style page with 230 predictions across 10 categories covering all 19 MENA countries (Economy & Finance, Technology & AI, Energy & Climate, Culture & Society, Business & Startups, Geopolitics & Governance, Education & Workforce, Infrastructure & Cities, Sports & Entertainment, Health & Demographics). YES bars/buttons are green (#10B981), NO bars/buttons are red (#DC143C). Features: search bar, category filter chips with counts, stats bar, featured prediction with green confidence chart, paginated grid with "Load More", and closed predictions section. Country-specific predictions for Morocco, Algeria, Tunisia, Egypt, Jordan, Lebanon, Iraq, Kuwait, Bahrain, Qatar, Oman, Turkey, Palestine, Yemen, Sudan, Syria, Libya plus existing UAE/Saudi coverage. Data in `src/data/predictions-data.ts`.
- **About** (`/about`) — Platform manifesto with founder statement, "Why This Exists", 6 beliefs, numbers bar (94 Founding Voices, 135+ Active Debates, 12 Topic Categories, 541M Potential Voices), 20 MENA countries grid, "Our Ethos" editorial section, and CTAs

### Database Schema
- `polls` — Poll questions with category, type, editorialStatus, and metadata
- `poll_options` — Answer options with vote counts
- `votes` — Vote records keyed by voterToken (localStorage UUID)
- `profiles` — Curated regional voices with full editorial profiles (includes `impactStatement` text column)
- `predictions` — MENA prediction market items with category, resolution dates, momentum, editorial status
- `prediction_votes` — Individual prediction votes (predictionId, choice yes/no, voterToken, country, createdAt)
- `pulse_topics` — Trend topics with spark data, live config, editorial status
- `cms_configs` — Key-value config store (homepage, page configs)
- `design_tokens` — Design system tokens (colors, typography, UI values)
- `majlis_users` — Authenticated Majlis chat users (FK to profiles, email + hashed password, ban/mute flags)
- `majlis_channels` — Chat channels (group or DM, with default "General" channel)
- `majlis_channel_members` — Channel membership with last-read message tracking for unread counts
- `majlis_messages` — Chat messages with reply threading, edit/delete tracking, nullable channelId FK, AES-256-CBC encrypted content

### API Endpoints
- `GET /api/polls` — List polls (with filter/category query params)
- `GET /api/polls/featured` — Get featured hero poll
- `GET /api/polls/:id` — Get single poll
- `POST /api/polls/:id/vote` — Cast a vote
- `GET /api/profiles` — List profiles (with search/country/sector filters)
- `GET /api/profiles/:id` — Get profile detail
- `GET /api/rankings` — Get rankings (type: profiles/founders/women_leaders/sectors/cities/topics)
- `GET /api/categories` — List all categories with poll counts
- `GET /api/weekly-pulse` — Weekly editorial digest

### Public Content API (no auth required)
Canonical public endpoints for frontend consumption:
- `GET /api/predictions` — All approved predictions (alias: `/api/public/predictions`)
- `GET /api/predictions/:id` — Single approved prediction
- `GET /api/pulse-topics` — All approved pulse topics (alias: `/api/public/pulse-topics`)
- `GET /api/homepage` — Homepage config (alias: `/api/public/homepage`)
- `GET /api/page-config/:page` — Page config by key (alias: `/api/public/page-config/:page`)
  - Keys: `about`, `pulse`, `faq`, `terms`, `contact`, `debates_page`, `predictions_page`, `voices_page`
- `GET /api/design-tokens` — All design tokens (alias: `/api/public/design-tokens`)
- `GET /api/site-settings` — Global site settings (alias: `/api/public/site-settings`)
- `GET /api/live-counts` — Live DB counts: debates, predictions, pulseTopics, voices, totalVotes (alias: `/api/public/live-counts`)
- `POST /api/predictions/:id/vote` — Cast prediction vote (choice: yes/no, voterToken), returns updated percentages
- `GET /api/predictions/:id/results` — Get prediction vote results

CMS admin endpoints (`/api/cms/*`) require `x-cms-token` header for mutations.

**Seeding**: CMS seed data runs idempotently on API server startup via `seedCmsData()`. It populates predictions, pulse topics, design tokens, homepage config (with population counter + country breakdown + section stats overrides), page configs (about with founderStatement/regionCoverage, pulse with tickerItems, polls, apply), and site_settings (navigation, footer, SEO, cookie consent, share gate). Only inserts if keys don't exist. Requires DB schema to be pushed first (`pnpm --filter @workspace/db run push`).

### Majlis API Endpoints
- `POST /api/majlis/auth/register` — Register (requires valid profileId)
- `POST /api/majlis/auth/login` — Login with email + password
- `POST /api/majlis/auth/verify` — Verify session token
- `POST /api/majlis/channels` — Create group or DM channel (DM dedup)
- `GET /api/majlis/channels` — List user's channels with last message + unread count
- `GET /api/majlis/channels/:id` — Channel details + members
- `POST /api/majlis/channels/:id/members` — Add members (creator-only for groups)
- `DELETE /api/majlis/channels/:id/members/:userId` — Leave group channel
- `GET /api/majlis/channels/:channelId/messages` — Paginated, decrypted messages for channel
- `POST /api/majlis/channels/:channelId/messages` — Send encrypted message to channel
- `GET /api/majlis/channels/:channelId/messages/poll` — Poll for new messages in channel
- `GET /api/majlis/messages` — Legacy endpoint (routes to General channel)
- `POST /api/majlis/messages` — Legacy endpoint (routes to General channel)
- `GET /api/majlis/messages/poll` — Legacy poll endpoint (routes to General channel)
- `GET /api/majlis/members` — List members with online status (auth required)
- CMS endpoints: `GET /api/cms/majlis/stats`, `GET/PATCH /api/cms/majlis/users`, `GET/DELETE /api/cms/majlis/messages`

### The Majlis (Private Chat)
- **Route**: `/majlis` — protected chat room, redirects to `/majlis/login` if not authenticated
- **Auth**: Email + password registration (invite-only, requires approved Voice profile ID). Login/register pages call real API (no mock data).
- **Session**: JWT-like token in `x-majlis-token` header, stored in `localStorage` as `majlis_token`
- **Layout**: Three-panel — channel sidebar (left), active chat (center), members panel (right). Mobile: left sidebar is slide-out drawer.
- **Channels**: Group channels and DMs. Default "General" channel seeded on first access. DM dedup prevents duplicate conversations.
- **Encryption**: Messages encrypted at rest with AES-256-CBC (per-message IV). `MAJLIS_ENCRYPTION_KEY` env var required (32-byte hex). Decrypted server-side before returning.
- **Real-time**: Polling every 3 seconds for new messages, channel list refreshes every 10 seconds
- **Design**: Dark theme with crimson accents, editorial feel, member sidebar with online status and DM button
- **Entry points**: Navbar (lock icon), Profiles page hero button, individual profile detail links
- **CMS**: Majlis management under COMMUNITY section — user management (ban/mute/activate), message moderation
- **Edge cases**: Banned users blocked at auth middleware, muted users shown notice + disabled input, unread indicators on channels

## Database State (as of March 2026)
- **327 polls** total across 15 categories
- **1,217 poll options** total
- **103 profiles** total
- **77 votes** recorded
- **15 categories**: Arts & Expression, Business, Cities & Lifestyle, Consumer Trends, Culture & Society, Economy & Finance, Education & Learning, Future of the Region, Leadership, Media & Influence, Sports & Events, Startups & Venture, Technology & AI, Women & Equality, Work & Careers
- Profile photos use CamelCase filenames in `/profiles/` public dir
- All content persisted in PostgreSQL (predictions, pulse topics, page configs, design tokens)

**⚠️ WARNING:** Running `pnpm --filter @workspace/scripts run seed` will WIPE all DB data (polls, options, profiles). seed.ts needs updating to include the 28 new profiles and 84 roast polls before safe re-seeding.

## Design System
- Dark mode by default (charcoal soft-black background, warm ivory text)
- Brand crimson primary: `hsl(348 83% 47%)` light / `hsl(348 83% 53%)` dark
- Fonts: Playfair Display (`font-display`), Barlow Condensed (`font-serif`), DM Sans (`font-sans`)
- Light mode toggle in navbar, persisted in `localStorage tmh_theme`

## Running Locally

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/tmh-platform run dev

# Seed database
pnpm --filter @workspace/scripts run seed

# Run codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push
```
