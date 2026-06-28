# AquaTrack Kenya — API

A thin Node (Express + `pg` + `ws`) layer that reads from the PostgreSQL schema
in `../db` and returns JSON in the exact shapes the frontend's `src/data.js` uses.
Swapping the mock for this API needs **no component changes** — only the data
source. Validated against PostgreSQL 16.

## Run

```bash
cd server
npm install
cp .env.example .env        # set DATABASE_URL + PORT
npm start                   # http://localhost:4000  (WebSocket on /ws)
```

`.env`:
```
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/aquatrack
PORT=4000
```

(Assumes `db/schema.sql` + `db/seed.sql` have been loaded — see `../db/README.md`.)

## REST endpoints

| Method & path | Returns (data.js shape) |
|---|---|
| `GET /api/health` | `{ ok, time }` |
| `GET /api/me?email=` | `{ currentUser, swimmers }` — followed swimmers + PB maps |
| `GET /api/swimmers/:id` | one swimmer `{ id, name, school, age, avatar, pbs }` |
| `GET /api/swimmers/:id/history?distance=50&stroke=freestyle` | trend points `[{ gala, time, delta, isPB }]` |
| `GET /api/swimmers/:id/videos` | `videos[]` with `stats` |
| `GET /api/galas` | `[{ id, name, venue, date, status }]` |
| `GET /api/galas/:id/results` | `eventLeaderboards[]` |
| `GET /api/galas/:id/standings` | `schoolStandings[]` |
| `GET /api/galas/:id/live` | the live-race object (`lanes`, `videoId`, `heatId`) |
| `GET /api/seasons/:year/rankings` | `seasonRankings[]` |
| `GET /api/schools` | `[{ id, name, location, rank, points }]` |
| `GET /api/schools/:id/competitions` | school drill-down `[{ name, placement, points, results }]` |

Times are returned as display strings (`"32.18"`, `"1:11.60"`); the DB stores
integer milliseconds and the API formats them.

## WebSocket — live race

Connect to `ws://localhost:4000/ws` and send:

```json
{ "subscribe": "<heatId>" }
```

`heatId` comes from `GET /api/galas/:id/live`. The server then streams the heat in
real time (sped up for demo): repeated `snapshot` messages, then one `final`.

```json
{ "type": "snapshot", "clock": 6.3,
  "lanes": [ { "lane": 1, "name": "Farrin Savage", "school": "Sailfish SC",
               "position": 1, "progress": 0.19, "finished": false,
               "finish": null, "isPB": true, "isCurrentChild": false }, … ] }
```

Each lane carries a live `position`, `progress` (0–1) and, once done, `finish`
(seconds). Finished lanes are ranked by time, so the `final` order is the true
result. A real timing system would push the same messages from finish-touch
hardware — the client contract is identical.

## Pointing the frontend at it

In `src/data.js`, replace the exported constants with `fetch` calls to these
endpoints (same property names), and in `LiveRaceView.jsx` replace the local
clock simulation with a WebSocket subscription to `/ws` that renders each
`snapshot`. No other component changes are required.

---

## Admin console (two tiers)

Served at **`http://localhost:4000/admin`** (single page, no build step). Setup
adds the `admins` table + two demo logins:

```bash
psql -d aquatrack -f ../db/admin.sql
JWT_SECRET=$(openssl rand -hex 32) npm start
```

| Role | Demo login | Capabilities |
|---|---|---|
| **master** | `admin@aquatrack.co.ke` / `ChangeMe123!` | superuser — create & remove school admins, **and edit any record in any school** (schools, swimmers, race times) |
| **school** | `brookhouse@aquatrack.co.ke` / `ChangeMe123!` | full control of its **own** school — the school's details, its swimmers (add/edit/delete/CSV), and those swimmers' race results/times |

A school admin is pinned to one school via `admins.school_id`; **scope is enforced
server-side from the JWT**, never from client input. A master has no `school_id`
and may act on every school. The console reflects the role: masters get a school
picker plus the admin-management panel; school admins land straight on their own
school's data.

### Endpoints (all require `Authorization: Bearer <token>` except login)

| Method & path | master | school | Purpose |
|---|---|---|---|
| `POST /api/admin/login`, `GET /api/admin/me` | ✓ | ✓ | auth / identity |
| `GET /api/admin/admins` · `POST` · `DELETE /:id` | ✓ | — | manage school admins |
| `GET /api/admin/schools` | all | own | list schools |
| `POST /api/admin/schools` | ✓ | — | create a new school |
| `PATCH /api/admin/schools/:id` | any | own | edit a school |
| `GET /api/admin/swimmers[?school_id=]` | all | own | list swimmers |
| `POST /api/admin/swimmers` | any school | own | add a swimmer |
| `PATCH /api/admin/swimmers/:id` | any | own | edit (master may also move schools) |
| `DELETE /api/admin/swimmers/:id` | any | own | delete swimmer (+ their results/videos) |
| `POST /api/admin/swimmers/bulk` | any school | own | CSV bulk upload |
| `GET /api/admin/swimmers/:id/results` | any | own | list a swimmer's race results |
| `PATCH /api/admin/results/:id` | any | own | edit a race time / placing / PB |

"own" = the admin's own school only (others → 403). Times accept display form
(`32.18`, `1:11.60`) and are stored as integer milliseconds. CSV headers:
`full_name, sex, date_of_birth`.

Create real master admins: `node scripts/create-admin.mjs <email> <password> [name]`.
School admins are created from the master console.

**Security:** bcrypt hashing, parameterized queries, JWT on every write route,
per-role + per-school scope checks on every record. Set a strong `JWT_SECRET`
and change the demo passwords in production.
