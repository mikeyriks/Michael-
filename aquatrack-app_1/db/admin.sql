-- ═══════════════════════════════════════════════════════════════════════════
--  AquaTrack Kenya — admin accounts (two-tier: master + school)
--
--  Run after schema.sql:  psql -d aquatrack -f admin.sql
--
--  Roles:
--    master  — can ONLY create and remove school admins (onboards schools)
--    school  — scoped to one school; manages that school's swimmers & details
--
--  Seeds:
--    master:  admin@aquatrack.co.ke        / ChangeMe123!
--    school:  brookhouse@aquatrack.co.ke   / ChangeMe123!  (Brookhouse School)
--  CHANGE THESE IN PRODUCTION.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,                 -- bcrypt
  full_name     text,
  role          text NOT NULL DEFAULT 'school',
  school_id     uuid REFERENCES schools(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Evolve older installs (previous single-tier 'admin' role, no school_id)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES schools(id) ON DELETE CASCADE;
UPDATE admins SET role = 'master' WHERE role NOT IN ('master', 'school');

ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_chk;
ALTER TABLE admins ADD  CONSTRAINT admins_role_chk CHECK (role IN ('master', 'school'));
-- A school admin must be tied to a school; a master must not.
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_scope_chk;
ALTER TABLE admins ADD  CONSTRAINT admins_scope_chk
  CHECK ((role = 'master' AND school_id IS NULL) OR (role = 'school' AND school_id IS NOT NULL));

DROP TRIGGER IF EXISTS trg_admins_updated ON admins;
CREATE TRIGGER trg_admins_updated BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Demo master (password: ChangeMe123!)
INSERT INTO admins (email, password_hash, full_name, role)
VALUES ('admin@aquatrack.co.ke',
        '$2b$10$E.11V1ZaqCYtN8xMAv0kOO6msP5nbXZFJ6ga/3AkXXTmWKBw3LmiS',
        'Master Admin', 'master')
ON CONFLICT (email) DO UPDATE SET role = 'master', school_id = NULL;

-- Demo school admin for Brookhouse (password: ChangeMe123!)
INSERT INTO admins (email, password_hash, full_name, role, school_id)
SELECT 'brookhouse@aquatrack.co.ke',
       '$2b$10$E.11V1ZaqCYtN8xMAv0kOO6msP5nbXZFJ6ga/3AkXXTmWKBw3LmiS',
       'Brookhouse Admin', 'school', s.id
FROM schools s WHERE s.name = 'Brookhouse School'
ON CONFLICT (email) DO NOTHING;

COMMIT;
