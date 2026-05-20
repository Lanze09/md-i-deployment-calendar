# MD&I Deployment Calendar

A real-time deployment coordination calendar for the **Accenture Oracle Business Group — Market Development & Innovations (MD&I)** team.

> 7 tool teams · 5 environments · 1 place to see who's deploying what, where, and when.

---

## Tech stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3FCF8E?logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-EF008F?logo=framer&logoColor=white)

- **React 18 + TypeScript (strict)** — functional components, hooks, no `any`
- **Vite** — fast dev server, static build for GitHub Pages
- **Tailwind CSS** — custom Accenture theme (`#A100FF`) + dark mode
- **Framer Motion** — page transitions, modals, calendar cells, list animations
- **Supabase** — PostgreSQL + Row Level Security + real-time subscriptions
- **date-fns** — lightweight date utilities
- **papaparse** — CSV export
- **lucide-react** — icons

---

## Screenshot

> _Add your own screenshot here once you've started the dev server. Suggested filename: `docs/screenshot.png`._

```
+----------------------------------------------------------+
|  MD&I Deployment Calendar       [Cal][Time][Wk]  [+ New] |
|  ──────────────────────────────────────────────────────  |
|  [Total: 29] [Conflicts: 3] [Most active: IDM] [Next…]   |
|  ──────────────────────────────────────────────────────  |
|  Filters   |  May 2026                ←  Today  →        |
|  ☐ IDM     |  S   M   T   W   T   F   S                  |
|  ☐ DQA     | [ ] [ ] [ ] [ ] [ ] [01][02]                |
|  ☐ RMT     | [03][04][05][06][07][08][09]                |
|  …         | …                                           |
+----------------------------------------------------------+
```

---

## Quick start

```bash
git clone https://github.com/<you>/deployment-calendar.git
cd deployment-calendar
npm install
cp .env.example .env       # add Supabase credentials (or skip for demo mode)
npm run dev                # http://localhost:5173/deployment-calendar/
npm run build              # build to ./dist (ready for GitHub Pages)
npm run typecheck          # tsc --noEmit
```

> **Demo mode**: if you skip `.env`, the app runs against in-memory seed data so
> you can demo it without a database. A banner in the header makes this explicit.

---

## Supabase setup

1. Create a free account at <https://supabase.com> and a new project.
2. In the project dashboard → **SQL Editor**, paste the contents of
   [`sql/schema.sql`](sql/schema.sql) and run it. This creates two tables
   (`deployments`, `freeze_periods`), enables row-level security with permissive
   policies (this is a team coordination tool, not a multi-tenant SaaS),
   enables realtime, and seeds 28 sample deployments + 1 freeze period.
3. In **Settings → API**, copy the project URL and the **anon** key.
4. Drop them into `.env`:
   ```dotenv
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. `npm run dev` and you're live. Real-time subscriptions are enabled by
   default — any insert/update/delete will sync to everyone's browser within
   a second and surface as a toast notification.

The `anon` key is safe to expose in frontend code because all access is
authorised through the row-level-security policies you control in Supabase.

---

## GitHub Pages deployment

The Vite config sets `base: '/deployment-calendar/'` so built assets resolve
correctly under a project page. Build and deploy:

```bash
npm run build
# Push ./dist to the gh-pages branch:
npx gh-pages -d dist
```

Or use the **GitHub Pages → "Deploy from a branch"** option in the repository
settings and point it at `gh-pages` / root. A simple workflow that builds on
push to `main` and deploys to `gh-pages` is the recommended setup.

---

## Features

- ✅ **Calendar view** with month grid, day cells, conflict indicators
- ✅ **Timeline view** — Gantt-style horizontal bars grouped by team
- ✅ **Week view** — hourly grid (6am–10pm) with time-positioned deployments
- ✅ **Add/edit/delete deployments** in a beautiful Framer-Motion modal
- ✅ **Conflict detection** — same env + same day for 2+ different teams
- ✅ **Freeze periods** with diagonal-stripe overlay and configurable environments
- ✅ **Filters** — teams, environments, status, risk level (with URL sync)
- ✅ **Search** — debounced 300ms across title + owner + description
- ✅ **Stats dashboard** — totals, conflicts, most active team, next deployment countdown
- ✅ **Dark mode** — class-based, persisted in `localStorage`, respects system preference
- ✅ **Real-time updates** — Supabase channel subscription + toast on remote change
- ✅ **CSV export** of the currently filtered set, one file per month
- ✅ **Keyboard shortcuts** — every common action has one
- ✅ **Quick status update** — right-click any deployment badge
- ✅ **Print-friendly view** — `Ctrl+P` produces a clean A4-landscape printout
- ✅ **Onboarding tour** — 4-step tooltip walkthrough on first visit
- ✅ **Accessible** — focus traps, ARIA roles, color-blind safe icon pairings
- ✅ **Responsive** — desktop grid, tablet drawer, mobile bottom-sheet patterns

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `N` | New deployment |
| `T` | Toggle theme |
| `←` / `→` | Previous / next month |
| `F` | Focus search |
| `1` / `2` / `3` | Calendar / Timeline / Week view |
| `Esc` | Close any open modal or panel |
| `?` | Show keyboard shortcuts help |

---

## Project structure

```
deployment-calendar/
├── index.html
├── vite.config.ts                     # base: '/deployment-calendar/'
├── tailwind.config.js                 # Accenture theme + team colors
├── postcss.config.js
├── tsconfig.json                      # strict mode
├── package.json
├── .env.example
├── .gitignore
├── sql/
│   └── schema.sql                     # tables, RLS, realtime, seed data
└── src/
    ├── main.tsx
    ├── App.tsx                        # AppProvider + shell + shortcuts
    ├── index.css
    ├── lib/
    │   ├── supabase.ts                # client init + demo-mode flag
    │   ├── database.ts                # typed CRUD with demo fallback
    │   ├── demoData.ts                # 28 seed deployments + 1 freeze
    │   └── utils.ts                   # date helpers, conflict detection, CSV
    ├── hooks/
    │   ├── useDeployments.ts          # fetch + realtime + CRUD
    │   ├── useFreezePeriods.ts
    │   ├── useFilters.ts              # URL-synced filter state
    │   ├── useTheme.ts                # dark mode toggle
    │   └── useKeyboardShortcuts.ts
    ├── context/AppContext.tsx         # global state provider
    ├── constants/{teams,environments}.ts
    ├── types/index.ts                 # all interfaces
    ├── components/
    │   ├── layout/      Header · Sidebar · StatsBar
    │   ├── calendar/    CalendarView · CalendarHeader · CalendarDayCell · DeploymentBadge · ConflictIndicator
    │   ├── timeline/    TimelineView · TimelineBar
    │   ├── week/        WeekView · WeekTimeSlot
    │   ├── deployments/ DeploymentModal · DeploymentDetail · DeploymentList · QuickStatusMenu
    │   ├── freeze/      FreezePeriodOverlay · FreezePeriodModal
    │   └── ui/          Modal · Toast · ToastContainer · Badge · Button · Select · Checkbox · Tooltip · Skeleton · ConfirmDialog · EmptyState · OnboardingTour · KeyboardShortcutsModal
    └── styles/print.css                # @media print rules
```

---

## Credits

Built for **Accenture MD&I — AI in Action event, May 2026** by the MD&I team.

License: internal use within Accenture Oracle Business Group.
