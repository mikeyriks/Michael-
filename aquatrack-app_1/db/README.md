# AquaTrack Kenya — Database

PostgreSQL schema backing the parent app. The table and view shapes match the
frontend's `src/data.js` (the "API contract"), so the API layer can map rows to
the existing component props with no UI changes.

Validated on **PostgreSQL 16**.

## Run it

```bash
createdb aquatrack
psql -d aquatrack -f schema.sql   # types, tables, constraints, indexes, triggers, views
psql -d aquatrack -f seed.sql     # demo data mirroring the app
```

`schema.sql` is wrapped in a transaction; if anything fails it rolls back clean.

## Design notes

- **Times are integer milliseconds** (`32.18s → 32180`). They sort correctly and
  personal-best deltas are exact; the app formats them for display.
- **`results`** is one lane in one heat. The entrant is either an individual
  `swimmer_id` **or** a relay (`relay_school_id` + `relay_label`) — enforced by a
  CHECK. `finish_time_ms` is `NULL` while a swimmer is still in the water, which is
  exactly what drives the live race view.
- **Consent (ODPC):** `guardianships` carries the live consent state; every change
  is also appended to `consent_events` for an immutable audit trail (Kenya Data
  Protection Act).
- **Standings are derived, not stored.** `v_school_gala_standings` computes points
  from results (5 / 3 / 1 for gold / silver / bronze) so they can never drift out of
  sync. For very large datasets, convert the views to `MATERIALIZED VIEW`s and
  refresh after each heat.
- **Guest mode** is intentionally not a table — guests have no server-side record;
  the app treats guest as a client-only state until they create an account.

## What each screen reads

| App screen | Source |
|---|---|
| Live race / Live tab | `heats`, `results` (live `finish_time_ms`), `events`, `galas` |
| Results › Event | `v_event_results` |
| Results › School (+ school drill-down) | `v_school_gala_standings`, `v_school_season_standings` |
| Results › Season | `v_season_rankings` |
| Videos / "Watch this race" deep-link | `videos` (joined via `result_id`) |
| Profile › PB grid | `v_personal_bests` |
| Profile › trend chart | `v_swimmer_event_history` (`delta_ms` = improvement) |
| Profile › family switcher | `guardianships` → `swimmers` |
| Onboarding consent | `guardianships`, `consent_events` |
| Notifications panel | `notification_preferences` |
| Subscription / upgrade | `subscriptions` |
| Race reminders | `race_reminders` |
| Push delivery | `devices` |

## Tables

`circuits`, `schools`, `users`, `swimmers`, `guardianships`, `consent_events`,
`galas`, `events`, `heats`, `results`, `videos`, `notification_preferences`,
`devices`, `subscriptions`, `race_reminders`.

## Views

`v_personal_bests`, `v_swimmer_event_history`, `v_event_results`,
`v_school_gala_standings`, `v_school_season_standings`, `v_season_rankings`.
