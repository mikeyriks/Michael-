-- ═══════════════════════════════════════════════════════════════════════════
--  AquaTrack Kenya — PostgreSQL schema
--
--  Relational backing for the parent app. The shapes here match the mock
--  objects in the frontend's src/data.js (the "API contract") one-to-one:
--    swimmers, currentUser, galas, events, heats, lane results, videos,
--    school standings, season rankings, personal bests, onboarding consent,
--    notification preferences and subscriptions.
--
--  Times are stored as INTEGER milliseconds (e.g. 32.18s -> 32180) so they
--  sort correctly and personal-best deltas are exact; the app formats them.
--
--  Target: PostgreSQL 14+. Run with:  psql -d aquatrack -f schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- provides gen_random_uuid()

-- ─── Enumerated types ────────────────────────────────────────────────────────
CREATE TYPE relationship_type   AS ENUM ('parent', 'guardian', 'family', 'coach');
CREATE TYPE sex_type            AS ENUM ('female', 'male', 'other');
CREATE TYPE stroke_type         AS ENUM ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley');
CREATE TYPE event_category      AS ENUM ('boys', 'girls', 'mixed');
CREATE TYPE event_type          AS ENUM ('heat', 'final', 'timed_final', 'relay');
CREATE TYPE gala_status         AS ENUM ('upcoming', 'live', 'completed', 'canceled');
CREATE TYPE heat_status         AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE result_status       AS ENUM ('seeded', 'racing', 'finished', 'dsq', 'dns', 'scratched');
CREATE TYPE subscription_tier   AS ENUM ('free', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'expired');
CREATE TYPE device_platform     AS ENUM ('ios', 'android', 'web');

-- ─── Shared trigger: keep updated_at fresh ───────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
--  Reference / identity
-- ═══════════════════════════════════════════════════════════════════════════

-- Competition circuits (PIPSSA, KCAA, NCAA, Kenya Aquatics, …)
CREATE TABLE circuits (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

-- Schools and swim clubs
CREATE TABLE schools (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  location   text,
  is_club    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Parent / guardian accounts (the authenticated user)
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  text NOT NULL,
  email      text UNIQUE,
  phone      text UNIQUE,                      -- E.164, e.g. +254712345678
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_contact_chk CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Swimmers (the children being followed)
CREATE TABLE swimmers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  sex             sex_type,
  date_of_birth   date,
  school_id       uuid REFERENCES schools(id) ON DELETE SET NULL,
  school_name_raw text,                        -- for manually-added swimmers whose school isn't onboarded yet
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_swimmers_school ON swimmers(school_id);
CREATE TRIGGER trg_swimmers_updated BEFORE UPDATE ON swimmers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Parent ↔ swimmer follow + ODPC consent (the "family follow")
CREATE TABLE guardianships (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  swimmer_id           uuid NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  relationship         relationship_type NOT NULL,
  is_primary           boolean NOT NULL DEFAULT false,
  consent_granted_at   timestamptz,
  consent_withdrawn_at timestamptz,
  policy_version       text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, swimmer_id)
);
CREATE INDEX idx_guardianships_user    ON guardianships(user_id);
CREATE INDEX idx_guardianships_swimmer ON guardianships(swimmer_id);
COMMENT ON TABLE guardianships IS
  'Family-follow links a parent to a swimmer; carries the ODPC consent state (Kenya Data Protection Act).';

-- Immutable audit trail of consent changes (compliance)
CREATE TABLE consent_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardianship_id uuid NOT NULL REFERENCES guardianships(id) ON DELETE CASCADE,
  action          text NOT NULL CHECK (action IN ('granted', 'withdrawn')),
  policy_version  text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  note            text
);
CREATE INDEX idx_consent_events_guardianship ON consent_events(guardianship_id);

-- ═══════════════════════════════════════════════════════════════════════════
--  Competition structure: gala → event → heat → result
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE galas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  circuit_id     uuid REFERENCES circuits(id) ON DELETE SET NULL,
  host_school_id uuid REFERENCES schools(id)  ON DELETE SET NULL,
  venue          text,
  start_date     date NOT NULL,
  end_date       date,
  status         gala_status NOT NULL DEFAULT 'upcoming',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, start_date)
);
CREATE INDEX idx_galas_start ON galas(start_date);
CREATE TRIGGER trg_galas_updated BEFORE UPDATE ON galas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gala_id      uuid NOT NULL REFERENCES galas(id) ON DELETE CASCADE,
  title        text NOT NULL,                   -- 'Girls 11 · 50m Freestyle'
  category     event_category NOT NULL,
  age_group    text,                            -- '11', '12', 'open'
  distance_m   integer NOT NULL,
  stroke       stroke_type NOT NULL,
  event_type   event_type NOT NULL DEFAULT 'final',
  is_relay     boolean NOT NULL DEFAULT false,
  status       heat_status NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gala_id, title)
);
CREATE INDEX idx_events_gala ON events(gala_id);

CREATE TABLE heats (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  heat_number  integer NOT NULL,
  status       heat_status NOT NULL DEFAULT 'pending',
  started_at   timestamptz,
  completed_at timestamptz,
  UNIQUE (event_id, heat_number)
);
CREATE INDEX idx_heats_event ON heats(event_id);

-- One lane in one heat. Entrant is either an individual swimmer OR a relay team.
CREATE TABLE results (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heat_id           uuid NOT NULL REFERENCES heats(id)    ON DELETE CASCADE,
  lane_number       integer NOT NULL,
  swimmer_id        uuid REFERENCES swimmers(id) ON DELETE SET NULL,
  relay_school_id   uuid REFERENCES schools(id)  ON DELETE SET NULL,
  relay_label       text,                        -- 'Brookhouse A'
  finish_time_ms    integer,                      -- NULL until they touch the wall
  reaction_time_ms  integer,
  position          integer,                      -- final placing within the event
  is_personal_best  boolean NOT NULL DEFAULT false,
  status            result_status NOT NULL DEFAULT 'seeded',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (heat_id, lane_number),
  CONSTRAINT results_entrant_chk CHECK (swimmer_id IS NOT NULL OR relay_school_id IS NOT NULL),
  CONSTRAINT results_time_chk    CHECK (finish_time_ms IS NULL OR finish_time_ms > 0)
);
CREATE INDEX idx_results_heat    ON results(heat_id);
CREATE INDEX idx_results_swimmer ON results(swimmer_id);
CREATE TRIGGER trg_results_updated BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON COLUMN results.finish_time_ms IS 'Milliseconds; NULL while the swimmer is still in the water (drives the live race view).';

-- ═══════════════════════════════════════════════════════════════════════════
--  Media
-- ═══════════════════════════════════════════════════════════════════════════

-- Race videos. Linked to the specific swim (result) so "Watch this race" can deep-link.
CREATE TABLE videos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id        uuid REFERENCES results(id)  ON DELETE CASCADE,
  heat_id          uuid REFERENCES heats(id)    ON DELETE CASCADE,
  swimmer_id       uuid REFERENCES swimmers(id) ON DELETE SET NULL,
  title            text NOT NULL,
  storage_url      text,                          -- CDN / object-store key
  thumbnail_url    text,
  camera_angle     text,                          -- 'Camera 2 · Finish'
  duration_seconds integer,
  is_premium       boolean NOT NULL DEFAULT false, -- slow-mo / download gated to Premium
  published_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT videos_link_chk CHECK (result_id IS NOT NULL OR heat_id IS NOT NULL)
);
CREATE INDEX idx_videos_swimmer ON videos(swimmer_id);
CREATE INDEX idx_videos_result  ON videos(result_id);

-- ═══════════════════════════════════════════════════════════════════════════
--  Account: notifications, devices, subscriptions, reminders
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE notification_preferences (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push          boolean NOT NULL DEFAULT true,
  race_start    boolean NOT NULL DEFAULT true,
  personal_best boolean NOT NULL DEFAULT true,
  sms           boolean NOT NULL DEFAULT false,
  email         boolean NOT NULL DEFAULT false,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_notif_updated BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE devices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     device_platform NOT NULL,
  push_token   text NOT NULL UNIQUE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_devices_user ON devices(user_id);

CREATE TABLE subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier               subscription_tier   NOT NULL DEFAULT 'free',
  status             subscription_status NOT NULL DEFAULT 'active',
  price_kes          integer,                      -- 4500
  payment_method     text,                          -- 'mpesa'
  mpesa_phone        text,
  trial_ends_at      timestamptz,
  current_period_end timestamptz,
  canceled_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- "Remind me before my swimmer's heat"
CREATE TABLE race_reminders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  swimmer_id    uuid REFERENCES swimmers(id)          ON DELETE CASCADE,
  event_id      uuid REFERENCES events(id)            ON DELETE CASCADE,
  remind_before interval NOT NULL DEFAULT interval '5 minutes',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id, swimmer_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
--  Analytics views — these map directly to app screens
-- ═══════════════════════════════════════════════════════════════════════════

-- Profile: a swimmer's best time per stroke+distance (the PB grid)
CREATE VIEW v_personal_bests AS
SELECT r.swimmer_id,
       e.distance_m,
       e.stroke,
       MIN(r.finish_time_ms) AS best_time_ms
FROM results r
JOIN heats  h ON h.id = r.heat_id
JOIN events e ON e.id = h.event_id
WHERE r.status = 'finished'
  AND r.finish_time_ms IS NOT NULL
  AND r.swimmer_id IS NOT NULL
GROUP BY r.swimmer_id, e.distance_m, e.stroke;

-- Profile: the trend chart — every finished swim per swimmer+event over time,
-- with improvement vs the previous gala (negative delta = faster = better).
CREATE VIEW v_swimmer_event_history AS
SELECT r.swimmer_id,
       e.distance_m,
       e.stroke,
       g.id          AS gala_id,
       g.name        AS gala_name,
       g.start_date,
       r.finish_time_ms,
       r.finish_time_ms - LAG(r.finish_time_ms) OVER (
         PARTITION BY r.swimmer_id, e.distance_m, e.stroke
         ORDER BY g.start_date
       ) AS delta_ms,
       r.is_personal_best
FROM results r
JOIN heats  h ON h.id = r.heat_id
JOIN events e ON e.id = h.event_id
JOIN galas  g ON g.id = e.gala_id
WHERE r.status = 'finished'
  AND r.swimmer_id IS NOT NULL;

-- Results › Event tab: ordered leaderboard for each event
CREATE VIEW v_event_results AS
SELECT e.id        AS event_id,
       e.gala_id,
       e.title,
       r.id        AS result_id,
       r.position,
       r.lane_number,
       COALESCE(s.full_name, r.relay_label)        AS entrant,
       sc.name                                      AS school,
       r.finish_time_ms,
       r.is_personal_best,
       date_part('year', age(s.date_of_birth))::int AS age
FROM events  e
JOIN heats   h  ON h.event_id = e.id
JOIN results r  ON r.heat_id = h.id
LEFT JOIN swimmers s  ON s.id = r.swimmer_id
LEFT JOIN schools  sc ON sc.id = COALESCE(s.school_id, r.relay_school_id)
WHERE r.status = 'finished';

-- Results › School tab + school drill-down: points per school per gala (5/3/1)
CREATE VIEW v_school_gala_standings AS
WITH pts AS (
  SELECT g.id AS gala_id,
         COALESCE(s.school_id, r.relay_school_id) AS school_id,
         CASE r.position WHEN 1 THEN 5 WHEN 2 THEN 3 WHEN 3 THEN 1 ELSE 0 END AS points
  FROM results r
  JOIN heats  h ON h.id = r.heat_id
  JOIN events e ON e.id = h.event_id
  JOIN galas  g ON g.id = e.gala_id
  LEFT JOIN swimmers s ON s.id = r.swimmer_id
  WHERE r.status = 'finished' AND r.position IS NOT NULL
)
SELECT gala_id,
       school_id,
       SUM(points) AS points,
       RANK() OVER (PARTITION BY gala_id ORDER BY SUM(points) DESC) AS placement
FROM pts
WHERE school_id IS NOT NULL
GROUP BY gala_id, school_id;

-- Results › School tab (season totals): cumulative school points per season
CREATE VIEW v_school_season_standings AS
WITH per_gala AS (
  SELECT date_part('year', g.start_date)::int AS season,
         st.school_id,
         st.points
  FROM v_school_gala_standings st
  JOIN galas g ON g.id = st.gala_id
)
SELECT season,
       school_id,
       SUM(points) AS points,
       RANK() OVER (PARTITION BY season ORDER BY SUM(points) DESC) AS rank
FROM per_gala
GROUP BY season, school_id;

-- Results › Season tab: best time per swimmer per event across a season
CREATE VIEW v_season_rankings AS
SELECT date_part('year', g.start_date)::int AS season,
       e.category,
       e.age_group,
       e.distance_m,
       e.stroke,
       r.swimmer_id,
       MIN(r.finish_time_ms)   AS best_time_ms,
       COUNT(DISTINCT g.id)    AS galas
FROM results r
JOIN heats  h ON h.id = r.heat_id
JOIN events e ON e.id = h.event_id
JOIN galas  g ON g.id = e.gala_id
WHERE r.status = 'finished' AND r.swimmer_id IS NOT NULL
GROUP BY season, e.category, e.age_group, e.distance_m, e.stroke, r.swimmer_id;

COMMIT;
