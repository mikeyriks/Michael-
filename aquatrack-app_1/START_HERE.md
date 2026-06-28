# AquaTrack Kenya — Parent App (full package)

Live race results, video replays, leaderboards and personal-best tracking for
parents of school swimmers in Kenya. This package contains everything: the
frontend app, a runnable database, and a zero-setup preview.

---

## What's in here

```
aquatrack-app/
├─ AquaTrack-standalone.html   ← double-click to try the whole app, no setup
├─ START_HERE.md               ← you are here
├─ DEPLOY.md                   ← host it on Render/Railway (one service hosts everything)
├─ render.yaml                 ← Render blueprint (web service + Postgres)
├─ README.md                   ← Phase-2 build plan & API-endpoint mapping
├─ index.html, vite.config.js, tailwind.config.js, package.json …  (build config)
├─ src/                        ← the React app
│  ├─ App.jsx                  ← root: auth + guest, tab nav, bottom-sheet stack
│  ├─ data.js                  ← mock data = the API contract (mirrors the DB)
│  ├─ pages/                   ← Live, Results, Videos, Profile
│  │  └─ onboarding/           ← 6-screen signup (Welcome → … → Done)
│  ├─ components/              ← Header, TabBar, LaneRow, Sheet, SheetHost,
│  │                             LiveRaceView, OnboardingHeader
│  └─ lib/onboarding.js        ← session + guest-mode persistence
├─ server/                     ← thin REST + WebSocket API (Node/Express/pg/ws)
│  ├─ index.js                 ← routes + live-race WebSocket
│  ├─ admin.js                 ← admin auth + write/upload endpoints
│  ├─ db.js                    ← pg pool + ms→display formatters
│  ├─ public/admin.html        ← staff admin console (served at /admin)
│  ├─ scripts/create-admin.mjs ← create real admin accounts
│  └─ README.md                ← endpoint list + how to wire the frontend
└─ db/                         ← PostgreSQL database
   ├─ schema.sql               ← tables, types, constraints, indexes, views
   ├─ seed.sql                 ← demo data matching the app
   ├─ admin.sql                ← admin table + demo admin login
   ├─ erd.mermaid              ← entity-relationship diagram
   └─ README.md                ← DB run guide + screen→table mapping
```

---

## Three ways to run it

**1. Just look at it (no install).**
Open `AquaTrack-standalone.html` by double-clicking. Everything works —
onboarding, guest mode, live race, drill-downs — on sample data, in any browser.

**2. Dev server (live-reload, PWA, installable).**
```bash
npm install
npm run dev          # open the printed http://localhost:5173
```
On your phone (same Wi-Fi) open `http://<your-computer-ip>:5173` to feel it as a
phone app; it installs to the home screen as a PWA.

**3. The database + API (a running product).**
```bash
createdb aquatrack
psql -d aquatrack -f db/schema.sql -f db/seed.sql      # load schema + demo data
psql -d aquatrack -f db/admin.sql                      # admin table + demo admin login

cd server && npm install
cp .env.example .env          # point DATABASE_URL at the db above
npm start                     # API on http://localhost:4000, WebSocket on /ws
```
Validated on PostgreSQL 16. The **admin console** is at `http://localhost:4000/admin`
with two tiers: a **master** superuser that manages school admins and can edit any
record in any school (`admin@aquatrack.co.ke`), and **school** admins with full
control of their own school's swimmers and race times (`brookhouse@aquatrack.co.ke`)
— both `ChangeMe123!` in the demo. See `db/README.md` and `server/README.md`.

---

## How the pieces connect

The frontend renders from `src/data.js`. The **shape** of every object there is the
API contract; `server/` returns those exact shapes from the database in `db/`. The
wiring is a straight line:

```
PostgreSQL (db/schema.sql)
      │
      ▼
  server/  →  REST + WebSocket, returns JSON in the src/data.js shapes
      │
      ▼
  React app  →  components consume it unchanged
```

Concretely: `swimmers`/`guardianships` back the family-follow and Profile;
`galas → events → heats → results` back Live, Results and the live race (a lane's
`finish_time_ms` is `NULL` until the swimmer touches the wall — that's what makes
the live view live); `videos.result_id` is what lets "Watch this race" deep-link to
the right clip; the `v_*` views map one-to-one to the Results tabs and the Profile
trend chart. Swapping mock data for the real API needs **no component changes**.

---

## What the app does today

- **Onboarding** — 6 screens with slide transitions, a real OTP error state, and a
  celebratory finish. ODPC consent is captured and audited.
- **Guest mode** — "Browse as a guest" lets a parent explore on sample data, with a
  clear path to create an account.
- **Live** — a live race view: a running clock, a leaderboard that re-orders as
  swimmers finish, a live video feed, then a final state linking to the replay.
- **Results** — Event / School / Season tabs; tap a school to drill into its
  competitions → that competition's results → an individual swimmer.
- **Videos** — gallery + player with play/pause, share, and slow-mo (Premium).
- **Profile** — PB grid, improvement trend chart, family switcher, and a full set of
  working account screens (notifications, privacy, help, subscription).
- **Responsive** — full-bleed on phones, a centered web-app column on larger screens.
- **PWA** — installable, offline-capable (dev/preview builds).

The frontend ships on mock data so it runs with zero setup; `db/` + `server/` are
the live backend, and pointing the app at the API needs no component changes
(see `server/README.md`).
