# One-Shot Prompt — MD&I Deployment Calendar (React + Vite + Tailwind)

create .venv, install any dependencies needed and put everything about this project under C:\Users\lanze.avellanoza\OneDrive - Accenture\Documents\Git Repository\claude-code-mastery-project-starter-kit\MD&I-Deployment-Calendar

---

## PROMPT START

Build a **fully functional, production-grade Deployment Calendar web application** for the Accenture Oracle Business Group — Market Development & Innovations (MD&I) division. This app will be deployed to **GitHub Pages** as a static site (built with Vite) with **Supabase** as the live persistent backend database.

---

### 1. PROJECT CONTEXT

This is a deployment coordination tool for Accenture MD&I — a division that builds and maintains multiple Oracle-based accelerator tools for clients. Teams frequently deploy to shared environments (Dev, Test, UAT, Staging, Prod), and deployment collisions between teams are a recurring problem. This calendar gives the entire group visibility into who is deploying what, where, and when.

**Tool teams that deploy:**
- **IDM** — Intelligent Data Migration
- **DQA** — Data Quality Accelerator
- **RMT** — Release Management Tool
- **PRT** — Payroll Tool
- **CDP** — Cloud Deployment Platform
- **MyConcerto** — Accenture's proprietary orchestration tool
- **NEXUS** — Integration hub

**Target environments:**
- Development
- Test / QA
- UAT (User Acceptance Testing)
- Staging / Pre-Prod
- Production

---

### 2. TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Framework | **React 18+** with functional components + hooks | No class components |
| Build | **Vite** | Fast dev server, builds to static `dist/` for GitHub Pages |
| Styling | **Tailwind CSS v3+** | Utility-first. Custom theme via `tailwind.config.js` |
| Animations | **Framer Motion** (`npm i framer-motion`) | For orchestrated page transitions, modals, list animations |
| Database | **Supabase** (`npm i @supabase/supabase-js`) | Free tier. `anon` key is safe to expose in frontend |
| Date utils | **date-fns** (`npm i date-fns`) | Lightweight date manipulation |
| Icons | **Lucide React** (`npm i lucide-react`) | Clean, consistent icon set |
| CSV export | **papaparse** (`npm i papaparse`) | For CSV download feature |
| Hosting | **GitHub Pages** | Serve built static files from `dist/` |
| Language | **TypeScript** | Strict mode, no `any` |

**Vite config for GitHub Pages** — set `base` in `vite.config.ts`:
```ts
export default defineConfig({
  base: '/deployment-calendar/',  // matches GitHub repo name
  plugins: [react()],
})
```

**Supabase setup instructions to include in README:**
1. Create free account at supabase.com
2. Create new project
3. Run the SQL schema (provided in `/sql/schema.sql`)
4. Copy project URL + anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. `npm run build` → deploy `dist/` to GitHub Pages

---

### 3. DESIGN SYSTEM — ACCENTURE THEME

**Aesthetic direction:** Corporate-luxury meets modern dashboard. Think Bloomberg Terminal meets Linear.app — clean, information-dense, but with elegant typography and confident color usage. Dark mode should feel premium, not just "inverted."

**Tailwind config — extend with Accenture palette:**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accenture: {
          50:  '#F3E5FF',
          100: '#E0B3FF',
          200: '#C266FF',
          300: '#B84DFF',
          400: '#A100FF',  // PRIMARY
          500: '#8A00DB',
          600: '#7B00CF',
          700: '#5C0099',
          800: '#460073',
          900: '#2E004D',
        },
        surface: {
          light: {
            primary:   '#FFFFFF',
            secondary: '#F4F4F6',
            tertiary:  '#EAEAEF',
          },
          dark: {
            primary:   '#0D0D1A',
            secondary: '#1A1A2E',
            tertiary:  '#252540',
          },
        },
        team: {
          idm:        '#A100FF',
          dqa:        '#00B140',
          rmt:        '#0070F3',
          prt:        '#F5A623',
          cdp:        '#E4002B',
          myconcerto: '#00C2CE',
          nexus:      '#FF6B35',
        },
        status: {
          success:  '#00B140',
          warning:  '#F5A623',
          danger:   '#E4002B',
          info:     '#0070F3',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card:  '12px',
        btn:   '8px',
        pill:  '999px',
      },
      animation: {
        'fade-in-up':   'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
```

**Google Fonts to load (in `index.html`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Per-team color mapping (use as a constant):**
```ts
// src/constants/teams.ts
export const TEAMS = {
  IDM:        { label: 'IDM',        fullName: 'Intelligent Data Migration',  color: '#A100FF', bg: 'bg-team-idm' },
  DQA:        { label: 'DQA',        fullName: 'Data Quality Accelerator',    color: '#00B140', bg: 'bg-team-dqa' },
  RMT:        { label: 'RMT',        fullName: 'Release Management Tool',     color: '#0070F3', bg: 'bg-team-rmt' },
  PRT:        { label: 'PRT',        fullName: 'Payroll Tool',                color: '#F5A623', bg: 'bg-team-prt' },
  CDP:        { label: 'CDP',        fullName: 'Cloud Deployment Platform',   color: '#E4002B', bg: 'bg-team-cdp' },
  MyConcerto: { label: 'MyConcerto', fullName: 'Orchestration Tool',          color: '#00C2CE', bg: 'bg-team-myconcerto' },
  NEXUS:      { label: 'NEXUS',      fullName: 'Integration Hub',             color: '#FF6B35', bg: 'bg-team-nexus' },
} as const;
```

**Animation strategy with Framer Motion:**
- `<AnimatePresence>` for mounting/unmounting modals and view switches
- `motion.div` with staggered `transition={{ delay: index * 0.05 }}` for list items and calendar day cards
- Layout animations for filter open/close
- `whileHover={{ scale: 1.03 }}` on calendar day cells
- `whileTap={{ scale: 0.97 }}` on buttons
- Smooth view transition between Calendar / Timeline / Week via shared layout IDs

---

### 4. FILE / COMPONENT STRUCTURE

```
deployment-calendar/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── .env.example                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .gitignore
├── sql/
│   └── schema.sql                        # Supabase table creation + seed data
├── src/
│   ├── main.tsx                          # React root mount
│   ├── App.tsx                           # Top-level layout, providers, routing
│   ├── index.css                         # Tailwind directives + custom base styles
│   │
│   ├── lib/
│   │   ├── supabase.ts                   # Supabase client init
│   │   ├── database.ts                   # Typed CRUD functions (getDeployments, createDeployment, etc.)
│   │   └── utils.ts                      # Date helpers, conflict detection, CSV export
│   │
│   ├── hooks/
│   │   ├── useDeployments.ts             # Fetch + subscribe to real-time deployment data
│   │   ├── useFreezePeriods.ts           # Fetch + manage freeze periods
│   │   ├── useFilters.ts                 # Filter state management
│   │   ├── useTheme.ts                   # Dark mode toggle with localStorage + system pref
│   │   └── useKeyboardShortcuts.ts       # Global keyboard shortcut handler
│   │
│   ├── context/
│   │   └── AppContext.tsx                # Global state: deployments, filters, active view, modals
│   │
│   ├── constants/
│   │   ├── teams.ts                      # Team definitions, colors, labels
│   │   └── environments.ts               # Environment list and ordering
│   │
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces: Deployment, FreezePeriod, Filter, etc.
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                # App title, Accenture logo, view toggle, theme toggle, shortcuts
│   │   │   ├── Sidebar.tsx               # Filter panel (team, env, status, risk)
│   │   │   └── StatsBar.tsx              # Dashboard stats: counts, conflicts, next deployment countdown
│   │   │
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx          # Monthly grid — main calendar component
│   │   │   ├── CalendarHeader.tsx        # Month/year title, nav arrows, today button
│   │   │   ├── CalendarDayCell.tsx       # Individual day cell with deployment badges
│   │   │   ├── DeploymentBadge.tsx       # Team-colored pill badge on a day
│   │   │   └── ConflictIndicator.tsx     # Warning badge when same env + same day for 2+ teams
│   │   │
│   │   ├── timeline/
│   │   │   ├── TimelineView.tsx          # Gantt-style horizontal bars grouped by team
│   │   │   └── TimelineBar.tsx           # Individual deployment bar
│   │   │
│   │   ├── week/
│   │   │   ├── WeekView.tsx              # 7-day view with hourly time slots
│   │   │   └── WeekTimeSlot.tsx          # Individual time block
│   │   │
│   │   ├── deployments/
│   │   │   ├── DeploymentModal.tsx        # Add / Edit deployment form modal
│   │   │   ├── DeploymentDetail.tsx       # Full detail view of a single deployment
│   │   │   ├── DeploymentList.tsx         # List of deployments for a selected day
│   │   │   └── QuickStatusMenu.tsx        # Right-click quick status change
│   │   │
│   │   ├── freeze/
│   │   │   ├── FreezePeriodOverlay.tsx    # Striped overlay on frozen calendar days
│   │   │   └── FreezePeriodModal.tsx      # Add / Edit freeze period
│   │   │
│   │   └── ui/
│   │       ├── Modal.tsx                  # Reusable modal wrapper with Framer Motion
│   │       ├── Toast.tsx                  # Toast notification component
│   │       ├── ToastContainer.tsx         # Toast stack manager (top-right)
│   │       ├── Badge.tsx                  # Reusable colored badge/pill
│   │       ├── Button.tsx                 # Styled button variants (primary, secondary, danger, ghost)
│   │       ├── Select.tsx                 # Styled dropdown select
│   │       ├── Checkbox.tsx              # Filter checkbox with team color dot
│   │       ├── Tooltip.tsx                # Hover tooltip component
│   │       ├── Skeleton.tsx              # Loading skeleton with shimmer
│   │       ├── ConfirmDialog.tsx          # "Are you sure?" confirmation modal
│   │       ├── EmptyState.tsx             # Friendly empty state illustration
│   │       ├── OnboardingTour.tsx         # First-visit tooltip tour (4 steps)
│   │       └── KeyboardShortcutsModal.tsx # "?" help modal showing all shortcuts
│   │
│   └── styles/
│       └── print.css                      # @media print styles for Ctrl+P
│
└── README.md
```

---

### 5. DATABASE SCHEMA (Supabase PostgreSQL)

Create the file `sql/schema.sql` with:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Deployments table
create table deployments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  team text not null check (team in ('IDM', 'DQA', 'RMT', 'PRT', 'CDP', 'MyConcerto', 'NEXUS')),
  environment text not null check (environment in ('Development', 'Test / QA', 'UAT', 'Staging', 'Production')),
  deploy_date date not null,
  deploy_time_start time,
  deploy_time_end time,
  status text not null default 'Scheduled' check (status in ('Scheduled', 'In Progress', 'Completed', 'Failed', 'Cancelled', 'Rolled Back')),
  owner text not null,
  risk_level text default 'Low' check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  rollback_plan text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Freeze periods table
create table freeze_periods (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  reason text,
  start_date date not null,
  end_date date not null,
  affected_environments text[] default '{}',
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow all for anon — this is a demo/team app)
alter table deployments enable row level security;
alter table freeze_periods enable row level security;

create policy "Allow all access to deployments" on deployments for all using (true) with check (true);
create policy "Allow all access to freeze_periods" on freeze_periods for all using (true) with check (true);

-- Enable realtime subscriptions
alter publication supabase_realtime add table deployments;
alter publication supabase_realtime add table freeze_periods;

-- Indexes for fast calendar queries
create index idx_deployments_date on deployments(deploy_date);
create index idx_deployments_team on deployments(team);
create index idx_deployments_env on deployments(environment);
create index idx_freeze_dates on freeze_periods(start_date, end_date);
```

---

### 6. SEED DATA — 2 SAMPLE MONTHS

Generate **realistic sample deployment data** for the current month and next month. Include at least **25-30 deployment entries** spread across all 7 teams and all 5 environments. Make it feel like a real active project group:

**Patterns to include:**
- **IDM** has frequent deployments to UAT (migration testing cycles) — at least 5 entries
- **DQA** deploys to Test/QA almost weekly — steady cadence
- **RMT** has a major **Production release** mid-current-month, with a preceding Staging deployment 2 days before
- **PRT** and **IDM** both deploy to **UAT on the same day** — this is a deliberate conflict scenario (at least 2 conflicts)
- **CDP** deploys to Staging then Production with a 3-day gap — a staged rollout pattern
- **MyConcerto** has one deployment marked as **"Failed"** with a rollback_plan note: "Revert to v3.2.1 — run rollback-myconcerto.sh"
- **NEXUS** has one **"Cancelled"** deployment with a note: "Postponed — dependency on RMT 25B not ready"
- Mix of risk levels: mostly Low/Medium, but 2–3 High and 1 Critical (the RMT prod release)
- Various owners: use realistic names like "Lanze", "Miguel", "Sarah", "Raj", "Aiko", "Priya", "James"
- A few deployments with descriptions and rollback plans filled in, others with just the basics

**Include 1 freeze period:**
```sql
INSERT INTO freeze_periods (title, reason, start_date, end_date, affected_environments) VALUES
('Client UAT Freeze — ACME Corp', 'ACME Corp conducting final UAT sign-off. No deployments to Production or UAT during this window.', '2026-05-25', '2026-05-30', ARRAY['UAT', 'Production']);
```

Insert all seed data in the `schema.sql` file after table definitions.

---

### 7. FEATURES — CORE

**7.1 Calendar View (Main Screen)**
- Monthly grid calendar as the primary view (like Google Calendar's month view)
- Each day cell shows deployment badges — colored pills per team using `team.color`
- Days with 3+ deployments show a "+N more" overflow badge
- Click a day → slide-in side panel showing all deployments for that day (use `<AnimatePresence>`)
- Click a specific deployment → full detail modal
- Month navigation with `←` / `→` arrows and a "Today" button
- Current day highlighted with a `ring-2 ring-accenture-400` border
- Days outside current month shown at reduced opacity
- Staggered fade-in animation on calendar grid mount (100ms delay per row)

**7.2 Deployment Entry Form (Modal)**
- Beautiful modal with `framer-motion` enter/exit (scale + fade)
- Fields:
  - Title (text input)
  - Team (styled dropdown with team color dots)
  - Environment (styled dropdown)
  - Date (native date input or custom date picker)
  - Start Time / End Time (time inputs)
  - Owner (text input)
  - Risk Level (segmented control: Low / Medium / High / Critical with color coding)
  - Description (textarea)
  - Rollback Plan (textarea, collapsible "Advanced" section)
  - Notes (textarea)
- Form validation with inline error messages
- Edit mode: same modal, pre-filled with existing data
- Delete: red button in edit mode → confirmation dialog

**7.3 Conflict Detection**
- Run conflict check on every calendar render: same `environment` + same `deploy_date` for 2+ different `team` values
- Display a `⚠️` conflict indicator on the day cell (pulsing badge with `animate-pulse-soft`)
- In deployment detail view, show a warning banner:
  - "⚠️ Conflict: IDM and PRT are both deploying to UAT on May 24. Consider staggering."
- Conflict count shown in StatsBar

**7.4 Freeze Period Display**
- Frozen day cells get a diagonal stripe pattern overlay (CSS `repeating-linear-gradient`)
- Hover tooltip: "Frozen: Client UAT Freeze — ACME Corp"
- When creating a deployment during a freeze, show a yellow warning banner in the form (not a block — just a warning)
- Freeze period management via a settings gear icon → separate modal

**7.5 Filters & Search**
- Sidebar with filter groups:
  - **Teams**: checkboxes with colored dots (all 7 teams)
  - **Environments**: checkboxes (all 5)
  - **Status**: checkboxes
  - **Risk Level**: checkboxes
- "Select All" / "Clear All" per group
- Active filter count badge on the sidebar toggle button
- Search bar at top: filters by deployment title or owner name (debounced 300ms)
- All filters apply in real-time — non-matching deployments fade out on the calendar (opacity 0.2 transition)
- Filter state preserved in URL query params (shareable filtered views)

**7.6 Stats Dashboard (StatsBar)**
- Horizontal bar at the top below the header, showing:
  - Total deployments this month (number)
  - By status: Scheduled / In Progress / Completed / Failed (small colored dots + counts)
  - Conflict count (with ⚠️ icon, red if > 0)
  - Most active team this month (team badge)
  - Next upcoming deployment: "[Title] by [Owner] — in [X] days" with countdown
- Animate numbers on mount with a count-up effect

**7.7 Dark Mode Toggle**
- Toggle button in header: Sun/Moon icon from Lucide
- Uses `class` strategy in Tailwind (`darkMode: 'class'`)
- On toggle: add/remove `dark` class on `<html>`
- Save preference to `localStorage`
- Default to system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- All colors swap smoothly with `transition-colors duration-300` on the `<body>`

---

### 8. FEATURES — EXTRA (WOW FACTOR)

**8.1 Timeline View (Gantt-style)**
- View toggle in header: Calendar | Timeline | Week (segmented control)
- Timeline renders horizontal bars on a date axis
- Rows grouped by team (7 rows, team-colored)
- Each bar is a deployment — width proportional to date span (or 1 day minimum)
- Overlapping bars on the same row are vertically stacked
- Conflicts between teams are visually obvious when bars from different rows align on the same date
- Smooth animated transition when switching between views using `<AnimatePresence mode="wait">`

**8.2 Week View**
- 7-column grid with hourly time slots (6am–10pm)
- Deployments positioned by `deploy_time_start` and `deploy_time_end`
- If no time set, show as an all-day bar at the top
- Navigate weeks with arrows
- Useful for seeing time-based deployment conflicts

**8.3 Real-time Updates**
- Subscribe to Supabase real-time channel for `deployments` table on mount
- On INSERT/UPDATE/DELETE events, update React state automatically
- Show toast notification: "✅ New deployment added: [title] by [owner]"
- Use the `useDeployments` hook to manage subscription lifecycle

**8.4 Export to CSV**
- Button in header: "Export" with download icon
- Uses `papaparse` to generate CSV from current filtered view
- Columns: Date, Team, Environment, Title, Owner, Status, Risk Level, Description
- Filename: `deployments-may-2026.csv`

**8.5 Keyboard Shortcuts**
- `N` — Open new deployment modal
- `T` — Toggle dark/light theme
- `←` / `→` — Previous / next month (when no modal is open)
- `F` — Focus search/filter bar
- `1` / `2` / `3` — Switch view: Calendar / Timeline / Week
- `Esc` — Close any open modal
- `?` — Show keyboard shortcuts help modal
- Implement via `useKeyboardShortcuts` hook with `useEffect` on `keydown`

**8.6 Quick Status Update**
- Right-click a deployment badge → context menu with status options
- Click a status → updates immediately via Supabase
- Toast confirmation: "Status updated to Completed ✅"
- Fallback for mobile: long-press triggers the same menu

**8.7 Print-Friendly View**
- `print.css` with `@media print` rules
- Hides sidebar, filters, header nav
- Calendar renders in full-page layout
- All deployment details listed below the calendar grid
- Header reads: "Accenture MD&I — Deployment Calendar — [Month Year]"

**8.8 Onboarding Tour**
- On first visit (check `localStorage` flag):
  - Step 1: Highlight calendar → "Navigate months and click any day to see deployments"
  - Step 2: Highlight "+" button → "Add a new deployment here"
  - Step 3: Highlight filters sidebar → "Filter by team, environment, or status"
  - Step 4: Highlight theme toggle → "Switch between light and dark mode. Press ? for all shortcuts"
- Each step is a focused tooltip with a "Next" / "Skip" button
- Uses a semi-transparent overlay to dim the rest of the page
- Animated with Framer Motion

---

### 9. RESPONSIVE DESIGN

- **Desktop (1280px+):** Full calendar grid + sidebar filters visible + stats bar
- **Tablet (768–1279px):** Calendar grid + collapsible filter drawer (hamburger icon toggles)
- **Mobile (< 768px):**
  - Replaces calendar grid with a scrollable list view grouped by date
  - Floating action button (FAB) bottom-right for "Add deployment"
  - Bottom sheet for filters instead of sidebar
  - Swipe left/right to navigate months
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

---

### 10. ACCESSIBILITY

- All interactive elements are keyboard-navigable (tab order, focus rings)
- Modals trap focus while open (`focus-trap` pattern)
- ARIA labels on all icon-only buttons (`aria-label="Toggle dark mode"`)
- ARIA roles on modal (`role="dialog"`, `aria-modal="true"`)
- Color is never the only indicator — always paired with icon or text
- Sufficient contrast in both themes (WCAG AA: 4.5:1 for text, 3:1 for large text)
- `aria-live="polite"` on toast container for screen reader announcements
- Skip-to-content link at top of page

---

### 11. SUPABASE CLIENT SETUP

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Running in demo mode with local data.')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null
```

**Important:** If Supabase is not configured (no env vars), the app should still work using local state seeded with the same sample data. This way the app demos perfectly even without a database connection. Show a subtle banner: "Running in demo mode — connect Supabase for live data."

---

### 12. README.md

Include a polished README with:
- **Project title:** "MD&I Deployment Calendar"
- **One-line description:** "A real-time deployment coordination calendar for the Accenture Oracle MD&I team."
- **Screenshot placeholder** section
- **Tech stack** badges (React, Vite, Tailwind, Supabase, TypeScript)
- **Quick start:**
  ```bash
  git clone https://github.com/[user]/deployment-calendar.git
  cd deployment-calendar
  npm install
  cp .env.example .env    # Fill in Supabase credentials
  npm run dev              # Local dev at localhost:5173
  npm run build            # Build for production
  ```
- **Supabase setup** section with step-by-step
- **GitHub Pages deployment** section:
  ```bash
  npm run build
  # Push dist/ contents to gh-pages branch, or configure GitHub Actions
  ```
- **Feature list** with checkmarks
- **Keyboard shortcuts** reference table
- **Credits:** "Built for Accenture MD&I — AI in Action event, May 2026"

---

### 13. IMPLEMENTATION PRIORITIES

Build in this exact order to ensure working output at every stage:

1. **Project setup** — Vite + React + Tailwind + TypeScript config, folder structure, base layout
2. **Design system** — Tailwind theme config, fonts loading, CSS variables, dark mode class setup
3. **Type definitions** — All TypeScript interfaces in `types/index.ts`
4. **Reusable UI components** — Button, Badge, Modal, Toast, Select, Skeleton
5. **Calendar grid** — CalendarView with month navigation, day cells rendering (static, no data yet)
6. **Supabase connection** — Client init, typed CRUD functions, demo mode fallback
7. **Data layer hooks** — `useDeployments`, `useFreezePeriods` with loading/error states
8. **Deployment display on calendar** — Render badges per day, "+N more" overflow
9. **Add/Edit/Delete modal** — Full deployment form with validation
10. **Conflict detection** — Logic + visual indicators on calendar + warning banners
11. **Filter sidebar** — All filter groups, real-time apply, search bar
12. **Stats dashboard** — StatsBar component with calculated metrics
13. **Dark mode toggle** — Theme hook, localStorage, system preference detection
14. **Freeze periods** — Overlay display, management modal, deployment form warning
15. **Timeline view** — Gantt chart with team rows, animated view switching
16. **Week view** — Hourly grid, time-positioned deployments
17. **Real-time subscriptions** — Supabase channel, auto-update state, toast notifications
18. **All wow features** — CSV export, keyboard shortcuts, quick status, print styles, onboarding tour
19. **Seed data SQL** — 25–30 realistic entries + 1 freeze period
20. **Final polish** — All animations, responsive breakpoints, accessibility audit, README

---

## PROMPT END
