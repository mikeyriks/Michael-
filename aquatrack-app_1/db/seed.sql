-- ═══════════════════════════════════════════════════════════════════════════
--  AquaTrack Kenya — seed data
--
--  Mirrors the frontend mock (src/data.js): the Kimani family, the schools,
--  the PIPSSA Invitational gala with the Girls 11 · 50m Freestyle race (the
--  six lanes from the live view), plus earlier galas so the PB grid, the
--  Profile trend chart, and the school standings all populate.
--
--  Run after schema.sql:  psql -d aquatrack -f seed.sql
--  Idempotent-ish: safe to run once on a fresh schema.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── Circuits ────────────────────────────────────────────────────────────────
INSERT INTO circuits (code, name) VALUES
  ('PIPSSA', 'Public & Independent Prep Schools Swimming Assoc.'),
  ('KCAA',   'Kenya Catholic Athletics Association'),
  ('NCAA',   'Nairobi County Aquatics Association'),
  ('KAS',    'Kenya Aquatics');

-- ─── Schools ─────────────────────────────────────────────────────────────────
INSERT INTO schools (name, location, is_club) VALUES
  ('Brookhouse School',          'Karen, Nairobi',     false),
  ('Hillcrest International',     'Karen, Nairobi',     false),
  ('Aga Khan Academy',           'Parklands, Nairobi', false),
  ('Banda School',               'Lang''ata, Nairobi', false),
  ('Peponi School',              'Ruiru',              false),
  ('Braeburn Garden Estate',     'Thigiri, Nairobi',   false),
  ('St Christopher''s',          'Karen, Nairobi',     false),
  ('Sailfish SC',                'Nairobi',            true),
  ('Hydra SC',                   'Nairobi',            true);

-- ─── Parent + swimmers + family follow ──────────────────────────────────────
INSERT INTO users (full_name, email, phone) VALUES
  ('Joyce Kimani', 'joyce.kimani@example.com', '+254712345678');

INSERT INTO swimmers (full_name, sex, date_of_birth, school_id) VALUES
  ('Sarah Kimani', 'female', DATE '2014-06-15', (SELECT id FROM schools WHERE name = 'Brookhouse School')),
  ('David Kimani', 'male',   DATE '2016-09-10', (SELECT id FROM schools WHERE name = 'Brookhouse School'));

-- External swimmers who appear in races / rankings
INSERT INTO swimmers (full_name, sex, date_of_birth, school_id) VALUES
  ('Farrin Savage', 'female', DATE '2014-03-02', (SELECT id FROM schools WHERE name = 'Sailfish SC')),
  ('Amy Ojee',      'female', DATE '2014-08-21', (SELECT id FROM schools WHERE name = 'Aga Khan Academy')),
  ('Sofie Pauwels', 'female', DATE '2014-11-05', (SELECT id FROM schools WHERE name = 'Banda School')),
  ('Caitlyn Oyaro', 'female', DATE '2014-01-19', (SELECT id FROM schools WHERE name = 'Hillcrest International')),
  ('Naisula Maina', 'female', DATE '2014-07-30', (SELECT id FROM schools WHERE name = 'Hydra SC')),
  ('Aaliya Karim',  'female', DATE '2013-12-11', (SELECT id FROM schools WHERE name = 'Aga Khan Academy')),
  ('Wanjiru Maina', 'female', DATE '2012-05-22', (SELECT id FROM schools WHERE name = 'Brookhouse School'));

-- Joyce follows both her children, with ODPC consent recorded
INSERT INTO guardianships (user_id, swimmer_id, relationship, is_primary, consent_granted_at, policy_version)
SELECT u.id, s.id, 'parent', (s.full_name = 'Sarah Kimani'), TIMESTAMPTZ '2026-05-18 09:00:00+03', 'v1.2'
FROM users u, swimmers s
WHERE u.email = 'joyce.kimani@example.com'
  AND s.full_name IN ('Sarah Kimani', 'David Kimani');

INSERT INTO consent_events (guardianship_id, action, policy_version)
SELECT g.id, 'granted', 'v1.2' FROM guardianships g;

-- Account state
INSERT INTO notification_preferences (user_id, push, race_start, personal_best, sms, email)
SELECT id, true, true, true, false, false FROM users WHERE email = 'joyce.kimani@example.com';

INSERT INTO subscriptions (user_id, tier, status, price_kes, payment_method)
SELECT id, 'free', 'active', 4500, 'mpesa' FROM users WHERE email = 'joyce.kimani@example.com';

-- ─── Galas (this season) ─────────────────────────────────────────────────────
INSERT INTO galas (name, circuit_id, host_school_id, venue, start_date, status) VALUES
  ('NCAA Regional Meet',     (SELECT id FROM circuits WHERE code='NCAA'),   NULL, 'Nairobi Academy Pool',     DATE '2026-01-25', 'completed'),
  ('Kenya Aquatics Champs',  (SELECT id FROM circuits WHERE code='KAS'),    NULL, 'Kasarani Aquatics Centre', DATE '2026-02-08', 'completed'),
  ('KCAA County Gala',       (SELECT id FROM circuits WHERE code='KCAA'),   NULL, 'Aga Khan Sports Complex',  DATE '2026-03-15', 'completed'),
  ('PIPSSA Invitational',    (SELECT id FROM circuits WHERE code='PIPSSA'),
       (SELECT id FROM schools WHERE name='Brookhouse School'),                  'Moi Educational Centre',   DATE '2026-04-27', 'live');

-- ═══════════════════════════════════════════════════════════════════════════
--  Helper: insert an event + single heat, return nothing (referenced by name)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── PIPSSA · Girls 11 · 50m Freestyle (the live race, heat 4) ───────────────
INSERT INTO events (gala_id, title, category, age_group, distance_m, stroke, event_type, status)
SELECT id, 'Girls 11 · 50m Freestyle', 'girls', '11', 50, 'freestyle', 'final', 'completed'
FROM galas WHERE name = 'PIPSSA Invitational';

INSERT INTO heats (event_id, heat_number, status, started_at, completed_at)
SELECT e.id, 4, 'completed', TIMESTAMPTZ '2026-04-27 09:38:12+03', TIMESTAMPTZ '2026-04-27 09:38:46+03'
FROM events e JOIN galas g ON g.id = e.gala_id
WHERE g.name = 'PIPSSA Invitational' AND e.title = 'Girls 11 · 50m Freestyle';

WITH h AS (
  SELECT hh.id AS heat_id
  FROM heats hh
  JOIN events e ON e.id = hh.event_id
  JOIN galas  g ON g.id = e.gala_id
  WHERE g.name = 'PIPSSA Invitational' AND e.title = 'Girls 11 · 50m Freestyle' AND hh.heat_number = 4
)
INSERT INTO results (heat_id, lane_number, swimmer_id, finish_time_ms, reaction_time_ms, position, is_personal_best, status)
SELECT h.heat_id, v.lane, s.id, v.t, v.rt, v.pos, v.pb, 'finished'
FROM h
JOIN (VALUES
  (1, 'Farrin Savage', 31420, 680, 1, true),
  (3, 'Sarah Kimani',  32180, 710, 2, true),
  (2, 'Amy Ojee',      32740, 740, 3, false),
  (5, 'Sofie Pauwels', 33050, 780, 4, false),
  (4, 'Caitlyn Oyaro', 33410, 720, 5, true),
  (6, 'Naisula Maina', 33980, 810, 6, false)
) AS v(lane, name, t, rt, pos, pb) ON true
JOIN swimmers s ON s.full_name = v.name;

-- ─── PIPSSA · Girls 11 · 100m Freestyle ──────────────────────────────────────
INSERT INTO events (gala_id, title, category, age_group, distance_m, stroke, event_type, status)
SELECT id, 'Girls 11 · 100m Freestyle', 'girls', '11', 100, 'freestyle', 'final', 'completed'
FROM galas WHERE name = 'PIPSSA Invitational';

INSERT INTO heats (event_id, heat_number, status)
SELECT e.id, 1, 'completed'
FROM events e JOIN galas g ON g.id = e.gala_id
WHERE g.name = 'PIPSSA Invitational' AND e.title = 'Girls 11 · 100m Freestyle';

WITH h AS (
  SELECT hh.id AS heat_id
  FROM heats hh JOIN events e ON e.id = hh.event_id JOIN galas g ON g.id = e.gala_id
  WHERE g.name='PIPSSA Invitational' AND e.title='Girls 11 · 100m Freestyle' AND hh.heat_number=1
)
INSERT INTO results (heat_id, lane_number, swimmer_id, finish_time_ms, position, is_personal_best, status)
SELECT h.heat_id, v.lane, s.id, v.t, v.pos, v.pb, 'finished'
FROM h
JOIN (VALUES
  (1, 'Farrin Savage', 68420, 1, false),
  (3, 'Sarah Kimani',  71600, 2, true),
  (5, 'Sofie Pauwels', 73180, 3, true),
  (2, 'Amy Ojee',      74820, 4, false)
) AS v(lane, name, t, pos, pb) ON true
JOIN swimmers s ON s.full_name = v.name;

-- ─── PIPSSA · Mixed relay (school-level result, no individual swimmer) ────────
INSERT INTO events (gala_id, title, category, age_group, distance_m, stroke, event_type, is_relay, status)
SELECT id, 'Mixed · 4×50m Freestyle Relay', 'mixed', 'open', 200, 'freestyle', 'relay', true, 'completed'
FROM galas WHERE name = 'PIPSSA Invitational';

INSERT INTO heats (event_id, heat_number, status)
SELECT e.id, 1, 'completed'
FROM events e JOIN galas g ON g.id = e.gala_id
WHERE g.name='PIPSSA Invitational' AND e.title='Mixed · 4×50m Freestyle Relay';

WITH h AS (
  SELECT hh.id AS heat_id
  FROM heats hh JOIN events e ON e.id = hh.event_id JOIN galas g ON g.id = e.gala_id
  WHERE g.name='PIPSSA Invitational' AND e.title='Mixed · 4×50m Freestyle Relay' AND hh.heat_number=1
)
INSERT INTO results (heat_id, lane_number, relay_school_id, relay_label, finish_time_ms, position, status)
SELECT h.heat_id, v.lane, (SELECT id FROM schools WHERE name = v.school), v.label, v.t, v.pos, 'finished'
FROM h
JOIN (VALUES
  (3, 'Brookhouse School',      'Brookhouse A', 138400, 1),
  (4, 'Hillcrest International', 'Hillcrest A',  140100, 2),
  (2, 'Aga Khan Academy',       'Aga Khan A',   141900, 3)
) AS v(lane, school, label, t, pos) ON true;

-- ─── Sarah's history for the trend chart: 50m FR across earlier galas ────────
-- (one finished swim per gala; times improve toward her 32.18 PB at PIPSSA)
DO $$
DECLARE
  rec   RECORD;
  v_eid uuid;
  v_hid uuid;
  v_sid uuid := (SELECT id FROM swimmers WHERE full_name = 'Sarah Kimani');
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('NCAA Regional Meet',    34820, false),
      ('Kenya Aquatics Champs', 33020, false),
      ('KCAA County Gala',      33550, false)
    ) AS t(gala, t_ms, pb)
  LOOP
    INSERT INTO events (gala_id, title, category, age_group, distance_m, stroke, event_type, status)
    SELECT id, 'Girls 11 · 50m Freestyle', 'girls', '11', 50, 'freestyle', 'final', 'completed'
    FROM galas WHERE name = rec.gala
    RETURNING id INTO v_eid;

    INSERT INTO heats (event_id, heat_number, status) VALUES (v_eid, 1, 'completed')
    RETURNING id INTO v_hid;

    INSERT INTO results (heat_id, lane_number, swimmer_id, finish_time_ms, position, is_personal_best, status)
    VALUES (v_hid, 3, v_sid, rec.t_ms, 2, rec.pb, 'finished');
  END LOOP;
END $$;

-- ─── Sarah's 50m Backstroke PB (KCAA) for the PB grid ────────────────────────
INSERT INTO events (gala_id, title, category, age_group, distance_m, stroke, event_type, status)
SELECT id, 'Girls 11 · 50m Backstroke', 'girls', '11', 50, 'backstroke', 'final', 'completed'
FROM galas WHERE name = 'KCAA County Gala';

INSERT INTO heats (event_id, heat_number, status)
SELECT e.id, 1, 'completed' FROM events e JOIN galas g ON g.id=e.gala_id
WHERE g.name='KCAA County Gala' AND e.title='Girls 11 · 50m Backstroke';

INSERT INTO results (heat_id, lane_number, swimmer_id, finish_time_ms, position, is_personal_best, status)
SELECT hh.id, 3, (SELECT id FROM swimmers WHERE full_name='Sarah Kimani'), 38940, 3, true, 'finished'
FROM heats hh JOIN events e ON e.id=hh.event_id JOIN galas g ON g.id=e.gala_id
WHERE g.name='KCAA County Gala' AND e.title='Girls 11 · 50m Backstroke' AND hh.heat_number=1;

-- ─── Videos (linked to Sarah's PIPSSA swims) ─────────────────────────────────
INSERT INTO videos (result_id, heat_id, swimmer_id, title, camera_angle, duration_seconds, is_premium, storage_url)
SELECT r.id, r.heat_id, r.swimmer_id,
       e.title, 'Camera 2 · Finish', 32, false, 's3://aquatrack-videos/pipssa/sarah-50fr.mp4'
FROM results r
JOIN heats  h ON h.id = r.heat_id
JOIN events e ON e.id = h.event_id
JOIN galas  g ON g.id = e.gala_id
JOIN swimmers s ON s.id = r.swimmer_id
WHERE g.name='PIPSSA Invitational' AND e.title='Girls 11 · 50m Freestyle' AND s.full_name='Sarah Kimani';

INSERT INTO videos (result_id, heat_id, swimmer_id, title, camera_angle, duration_seconds, is_premium, storage_url)
SELECT r.id, r.heat_id, r.swimmer_id,
       e.title, 'Camera 1 · Overhead', 73, false, 's3://aquatrack-videos/pipssa/sarah-100fr.mp4'
FROM results r
JOIN heats  h ON h.id = r.heat_id
JOIN events e ON e.id = h.event_id
JOIN galas  g ON g.id = e.gala_id
JOIN swimmers s ON s.id = r.swimmer_id
WHERE g.name='PIPSSA Invitational' AND e.title='Girls 11 · 100m Freestyle' AND s.full_name='Sarah Kimani';

-- A race reminder for Sarah's next heat
INSERT INTO race_reminders (user_id, swimmer_id, event_id)
SELECT (SELECT id FROM users WHERE email='joyce.kimani@example.com'),
       (SELECT id FROM swimmers WHERE full_name='Sarah Kimani'),
       e.id
FROM events e JOIN galas g ON g.id=e.gala_id
WHERE g.name='PIPSSA Invitational' AND e.title='Girls 11 · 100m Freestyle';

COMMIT;
