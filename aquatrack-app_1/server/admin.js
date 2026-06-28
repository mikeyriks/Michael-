// ═══════════════════════════════════════════════════════════════════════════
//  Admin API — two tiers, full record access
//
//    master  → superuser: manage school admins AND act on any record in any
//              school (schools, swimmers, race results/times).
//    school  → full control within its OWN school: the school's details, its
//              swimmers, and those swimmers' race results. Nothing else.
//
//  Login issues a JWT carrying { role, school_id }. Every data route checks
//  access server-side from the token — never from client input.
// ═══════════════════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, formatTime } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const TOKEN_TTL = '8h';

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (e.status) return res.status(e.status).json({ error: e.code || 'error' });
    console.error(e);
    res.status(500).json({ error: 'internal_error', detail: e.message });
  });
const deny = (status, code) => { const e = new Error(code); e.status = status; e.code = code; return e; };

function requireAdmin(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'invalid_token' }); }
}
const requireMaster = (req, res, next) =>
  req.admin?.role === 'master' ? next() : res.status(403).json({ error: 'master_only' });

const isMaster = (req) => req.admin.role === 'master';

// Throw 403 unless the admin may act on this school.
function assertSchool(req, schoolId) {
  if (isMaster(req)) return;
  if (!schoolId || schoolId !== req.admin.school_id) throw deny(403, 'outside_your_school');
}
// Resolve which school a write targets: school admins are pinned to their own.
function targetSchool(req, explicit) {
  if (!isMaster(req)) return req.admin.school_id;
  return explicit || null;
}

function normSex(v) {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  if (['f', 'female', 'girl'].includes(s)) return 'female';
  if (['m', 'male', 'boy'].includes(s)) return 'male';
  if (['o', 'other', 'x'].includes(s)) return 'other';
  return null;
}
function normDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
const asBool = (v) =>
  v === true || ['true', '1', 'yes', 'y', 'club'].includes(String(v).trim().toLowerCase());
// "32.18" -> 32180 ; "1:11.60" -> 71600
function parseTimeToMs(v) {
  if (v == null || v === '') return undefined;        // undefined = leave unchanged
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).trim();
  if (s.includes(':')) { const [m, sec] = s.split(':'); return Math.round((parseInt(m, 10) * 60 + parseFloat(sec)) * 1000); }
  return Math.round(parseFloat(s) * 1000);
}

export default function mountAdmin(app) {
  // ── Login / identity ──
  app.post('/api/admin/login', wrap(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
    const { rows } = await pool.query(
      `SELECT a.*, s.name AS school_name FROM admins a LEFT JOIN schools s ON s.id = a.school_id
        WHERE lower(a.email) = lower($1)`, [email]);
    const admin = rows[0];
    if (!admin || !bcrypt.compareSync(password, admin.password_hash))
      return res.status(401).json({ error: 'invalid_credentials' });
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role, school_id: admin.school_id },
      JWT_SECRET, { expiresIn: TOKEN_TTL });
    res.json({ token, admin: { id: admin.id, email: admin.email, full_name: admin.full_name, role: admin.role, school: admin.school_name } });
  }));

  app.get('/api/admin/me', requireAdmin, wrap(async (req, res) => {
    let school = null;
    if (req.admin.school_id) {
      const { rows } = await pool.query('SELECT name FROM schools WHERE id = $1', [req.admin.school_id]);
      school = rows[0]?.name || null;
    }
    res.json({ admin: { email: req.admin.email, role: req.admin.role, school } });
  }));

  // ════════════════════════ MASTER: manage school admins ════════════════════
  app.get('/api/admin/admins', requireAdmin, requireMaster, wrap(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT a.id, a.email, a.full_name, a.created_at, s.name AS school
         FROM admins a LEFT JOIN schools s ON s.id = a.school_id
        WHERE a.role = 'school' ORDER BY s.name, a.email`);
    res.json(rows);
  }));

  app.post('/api/admin/admins', requireAdmin, requireMaster, wrap(async (req, res) => {
    const { email, password, full_name = null, school, location = null } = req.body || {};
    if (!email || !password || !school) return res.status(400).json({ error: 'email_password_school_required' });
    if (String(password).length < 8) return res.status(400).json({ error: 'password_too_short' });
    const exists = await pool.query('SELECT 1 FROM admins WHERE lower(email) = lower($1)', [email]);
    if (exists.rows[0]) return res.status(409).json({ error: 'email_taken' });
    const sc = await pool.query(
      `INSERT INTO schools (name, location) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET location = COALESCE(EXCLUDED.location, schools.location)
       RETURNING id, name`, [String(school).trim(), location]);
    const hash = bcrypt.hashSync(String(password), 10);
    const { rows } = await pool.query(
      `INSERT INTO admins (email, password_hash, full_name, role, school_id)
       VALUES ($1, $2, $3, 'school', $4) RETURNING id, email, full_name`,
      [String(email).trim(), hash, full_name, sc.rows[0].id]);
    res.status(201).json({ ...rows[0], school: sc.rows[0].name });
  }));

  app.delete('/api/admin/admins/:id', requireAdmin, requireMaster, wrap(async (req, res) => {
    const { rows } = await pool.query(`DELETE FROM admins WHERE id = $1 AND role = 'school' RETURNING id`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found_or_not_school_admin' });
    res.json({ ok: true, id: rows[0].id });
  }));

  // ════════════════════════ SCHOOLS ══════════════════════════════════════════
  // master: all schools · school admin: only its own
  app.get('/api/admin/schools', requireAdmin, wrap(async (req, res) => {
    const params = []; let filter = '';
    if (!isMaster(req)) { filter = 'WHERE s.id = $1'; params.push(req.admin.school_id); }
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.location, s.is_club,
              (SELECT COUNT(*) FROM swimmers w WHERE w.school_id = s.id) AS swimmers
         FROM schools s ${filter} ORDER BY s.name`, params);
    res.json(rows);
  }));

  // master only: create a brand-new school
  app.post('/api/admin/schools', requireAdmin, requireMaster, wrap(async (req, res) => {
    const { name, location = null, is_club = false } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name_required' });
    const { rows } = await pool.query(
      `INSERT INTO schools (name, location, is_club) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location, is_club = EXCLUDED.is_club
       RETURNING id, name, location, is_club`, [String(name).trim(), location, asBool(is_club)]);
    res.status(201).json(rows[0]);
  }));

  // update any school (master) / own school (school admin)
  app.patch('/api/admin/schools/:id', requireAdmin, wrap(async (req, res) => {
    assertSchool(req, req.params.id);
    const { name, location, is_club } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE schools SET name = COALESCE($2,name), location = COALESCE($3,location),
              is_club = COALESCE($4,is_club) WHERE id = $1 RETURNING id, name, location, is_club`,
      [req.params.id, name ?? null, location ?? null, is_club == null ? null : asBool(is_club)]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  }));

  // convenience for a school admin's own school
  app.get('/api/admin/school', requireAdmin, wrap(async (req, res) => {
    const id = isMaster(req) ? req.query.school_id : req.admin.school_id;
    if (!id) return res.status(400).json({ error: 'school_id_required' });
    assertSchool(req, id);
    const { rows } = await pool.query('SELECT id, name, location, is_club FROM schools WHERE id = $1', [id]);
    res.json(rows[0] || null);
  }));

  // ════════════════════════ SWIMMERS ═════════════════════════════════════════
  async function swimmerSchool(id) {
    const { rows } = await pool.query('SELECT school_id FROM swimmers WHERE id = $1', [id]);
    return rows[0] ? rows[0].school_id : undefined;
  }

  app.get('/api/admin/swimmers', requireAdmin, wrap(async (req, res) => {
    const params = []; let filter = '';
    if (!isMaster(req)) { filter = 'WHERE w.school_id = $1'; params.push(req.admin.school_id); }
    else if (req.query.school_id) { filter = 'WHERE w.school_id = $1'; params.push(req.query.school_id); }
    const { rows } = await pool.query(
      `SELECT w.id, w.full_name, w.sex, w.date_of_birth, w.school_id,
              COALESCE(sc.name, w.school_name_raw) AS school,
              date_part('year', age(w.date_of_birth))::int AS age,
              (SELECT COUNT(*) FROM results r WHERE r.swimmer_id = w.id) AS results
         FROM swimmers w LEFT JOIN schools sc ON sc.id = w.school_id
         ${filter} ORDER BY w.full_name`, params);
    res.json(rows);
  }));

  app.post('/api/admin/swimmers', requireAdmin, wrap(async (req, res) => {
    const { full_name, sex, date_of_birth, school_id } = req.body || {};
    if (!full_name || !String(full_name).trim()) return res.status(400).json({ error: 'full_name_required' });
    const sid = targetSchool(req, school_id);
    if (!sid) return res.status(400).json({ error: 'school_id_required' });
    assertSchool(req, sid);
    const { rows } = await pool.query(
      `INSERT INTO swimmers (full_name, sex, date_of_birth, school_id) VALUES ($1,$2,$3,$4)
       RETURNING id, full_name, sex, date_of_birth, school_id`,
      [String(full_name).trim(), normSex(sex), normDate(date_of_birth), sid]);
    res.status(201).json(rows[0]);
  }));

  app.patch('/api/admin/swimmers/:id', requireAdmin, wrap(async (req, res) => {
    const current = await swimmerSchool(req.params.id);
    if (current === undefined) return res.status(404).json({ error: 'not_found' });
    assertSchool(req, current);
    const { full_name, sex, date_of_birth, school_id } = req.body || {};
    // Only master may move a swimmer to a different school.
    let newSchool = null, moveSchool = false;
    if (school_id !== undefined && isMaster(req)) { moveSchool = true; newSchool = school_id; }
    const { rows } = await pool.query(
      `UPDATE swimmers SET
         full_name     = COALESCE($2, full_name),
         sex           = COALESCE($3, sex),
         date_of_birth = COALESCE($4, date_of_birth),
         school_id     = CASE WHEN $5 THEN $6 ELSE school_id END
       WHERE id = $1 RETURNING id, full_name, sex, date_of_birth, school_id`,
      [req.params.id, full_name ?? null,
       sex === undefined ? null : normSex(sex),
       date_of_birth === undefined ? null : normDate(date_of_birth),
       moveSchool, newSchool]);
    res.json(rows[0]);
  }));

  app.delete('/api/admin/swimmers/:id', requireAdmin, wrap(async (req, res) => {
    const current = await swimmerSchool(req.params.id);
    if (current === undefined) return res.status(404).json({ error: 'not_found' });
    assertSchool(req, current);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM videos  WHERE swimmer_id = $1', [req.params.id]);
      await client.query('DELETE FROM results WHERE swimmer_id = $1', [req.params.id]);
      await client.query('DELETE FROM swimmers WHERE id = $1', [req.params.id]);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
    res.json({ ok: true });
  }));

  app.post('/api/admin/swimmers/bulk', requireAdmin, wrap(async (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const sid = targetSchool(req, req.body?.school_id);
    if (!sid) return res.status(400).json({ error: 'school_id_required' });
    assertSchool(req, sid);
    let created = 0; const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = (r.full_name || r.name || '').trim();
      if (!name) { errors.push({ row: i + 1, error: 'full_name_required' }); continue; }
      try {
        await pool.query(
          `INSERT INTO swimmers (full_name, sex, date_of_birth, school_id) VALUES ($1,$2,$3,$4)`,
          [name, normSex(r.sex), normDate(r.date_of_birth || r.dob), sid]);
        created++;
      } catch (e) { errors.push({ row: i + 1, error: e.message }); }
    }
    res.json({ received: rows.length, created, errors });
  }));

  // ════════════════════════ RESULTS (race records / times) ═══════════════════
  // List a swimmer's results (scope by the swimmer's school)
  app.get('/api/admin/swimmers/:id/results', requireAdmin, wrap(async (req, res) => {
    const current = await swimmerSchool(req.params.id);
    if (current === undefined) return res.status(404).json({ error: 'not_found' });
    assertSchool(req, current);
    const { rows } = await pool.query(
      `SELECT r.id, e.title AS event, g.name AS gala, g.start_date,
              r.finish_time_ms, r.position, r.is_personal_best, r.status
         FROM results r
         JOIN heats  h ON h.id = r.heat_id
         JOIN events e ON e.id = h.event_id
         JOIN galas  g ON g.id = e.gala_id
        WHERE r.swimmer_id = $1 ORDER BY g.start_date DESC`, [req.params.id]);
    res.json(rows.map((r) => ({
      id: r.id, event: r.event, gala: r.gala, date: r.start_date,
      time: formatTime(r.finish_time_ms), finish_time_ms: r.finish_time_ms,
      position: r.position, is_personal_best: r.is_personal_best, status: r.status,
    })));
  }));

  // Update a race result (time / position / PB / status). master: any; school: own swimmers (or own relay)
  app.patch('/api/admin/results/:id', requireAdmin, wrap(async (req, res) => {
    if (!isMaster(req)) {
      const ok = await pool.query(
        `SELECT 1 FROM results r LEFT JOIN swimmers s ON s.id = r.swimmer_id
          WHERE r.id = $1 AND ($2 IN (s.school_id, r.relay_school_id))`,
        [req.params.id, req.admin.school_id]);
      if (!ok.rows[0]) throw deny(403, 'outside_your_school');
    }
    const { time, finish_time_ms, position, is_personal_best, status } = req.body || {};
    let ms = finish_time_ms;
    if (ms === undefined) ms = parseTimeToMs(time);      // undefined => unchanged
    const { rows } = await pool.query(
      `UPDATE results SET
         finish_time_ms   = COALESCE($2, finish_time_ms),
         position         = COALESCE($3, position),
         is_personal_best = COALESCE($4, is_personal_best),
         status           = COALESCE($5, status)
       WHERE id = $1
       RETURNING id, finish_time_ms, position, is_personal_best, status`,
      [req.params.id, ms ?? null, position ?? null,
       is_personal_best == null ? null : asBool(is_personal_best), status ?? null]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json({ ...rows[0], time: formatTime(rows[0].finish_time_ms) });
  }));
}
