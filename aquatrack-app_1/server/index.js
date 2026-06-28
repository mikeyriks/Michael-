// ═══════════════════════════════════════════════════════════════════════════
//  AquaTrack Kenya — thin API
//
//  REST endpoints return JSON in the exact shapes the frontend's src/data.js
//  uses, so components consume real data with no changes. A WebSocket channel
//  streams a live race (lane finishes) for the Live race view.
//
//  Run:  npm install && DATABASE_URL=postgres://… npm start
// ═══════════════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { pool, formatTime, pbKey, ageFromDob, initials } from './db.js';
import mountAdmin from './admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Admin console (static) + admin API
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
mountAdmin(app);

const OUR_SCHOOL = 'Brookhouse School'; // demo "your school" highlight

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'internal_error', detail: e.message });
  });

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT now() AS time');
  res.json({ ok: true, time: rows[0].time });
}));

// ─── Swimmer helpers ──────────────────────────────────────────────────────────
async function swimmerWithPbs(swimmerId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.full_name, s.date_of_birth, sc.name AS school
       FROM swimmers s LEFT JOIN schools sc ON sc.id = s.school_id
      WHERE s.id = $1`,
    [swimmerId],
  );
  if (!rows[0]) return null;
  const s = rows[0];
  const pbRows = await pool.query(
    `SELECT distance_m, stroke, best_time_ms FROM v_personal_bests WHERE swimmer_id = $1`,
    [swimmerId],
  );
  const pbs = {};
  for (const p of pbRows.rows) {
    pbs[pbKey(p.distance_m, p.stroke)] = { time: formatTime(p.best_time_ms) };
  }
  return {
    id: s.id,
    name: s.full_name,
    school: s.school,
    age: ageFromDob(s.date_of_birth),
    avatar: initials(s.full_name),
    pbs,
  };
}

// ─── GET /api/me — current user + followed swimmers ───────────────────────────
app.get('/api/me', wrap(async (req, res) => {
  const email = req.query.email || 'joyce.kimani@example.com';
  const u = await pool.query('SELECT id, full_name, email FROM users WHERE email = $1', [email]);
  if (!u.rows[0]) return res.status(404).json({ error: 'not_found' });
  const user = u.rows[0];
  const links = await pool.query(
    `SELECT swimmer_id, is_primary FROM guardianships WHERE user_id = $1 ORDER BY is_primary DESC`,
    [user.id],
  );
  const swimmers = {};
  const ids = [];
  for (const l of links.rows) {
    const sw = await swimmerWithPbs(l.swimmer_id);
    if (sw) {
      sw.isCurrentChild = l.is_primary;
      swimmers[sw.id] = sw;
      ids.push(sw.id);
    }
  }
  res.json({
    currentUser: { id: user.id, name: user.full_name, email: user.email, swimmers: ids },
    swimmers,
  });
}));

// ─── GET /api/swimmers/:id ────────────────────────────────────────────────────
app.get('/api/swimmers/:id', wrap(async (req, res) => {
  const sw = await swimmerWithPbs(req.params.id);
  if (!sw) return res.status(404).json({ error: 'not_found' });
  res.json(sw);
}));

// ─── GET /api/swimmers/:id/history?distance=50&stroke=freestyle (trend chart) ─
app.get('/api/swimmers/:id/history', wrap(async (req, res) => {
  const { distance = 50, stroke = 'freestyle' } = req.query;
  const { rows } = await pool.query(
    `SELECT gala_name, start_date, finish_time_ms, delta_ms, is_personal_best
       FROM v_swimmer_event_history
      WHERE swimmer_id = $1 AND distance_m = $2 AND stroke = $3
      ORDER BY start_date`,
    [req.params.id, distance, stroke],
  );
  res.json(
    rows.map((r) => ({
      gala: new Date(r.start_date).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }),
      time: r.finish_time_ms / 1000,
      delta: r.delta_ms == null ? null : +(r.delta_ms / 1000).toFixed(2),
      isPB: r.is_personal_best,
    })),
  );
}));

// ─── GET /api/swimmers/:id/videos ─────────────────────────────────────────────
app.get('/api/swimmers/:id/videos', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT v.id, v.title, v.camera_angle, v.duration_seconds, v.is_premium,
            v.published_at, g.name AS gala_name,
            r.finish_time_ms, r.position, r.reaction_time_ms, r.is_personal_best,
            (SELECT COUNT(*) FROM results r2 WHERE r2.heat_id = r.heat_id) AS total_swimmers
       FROM videos v
       JOIN results r ON r.id = v.result_id
       JOIN heats h ON h.id = r.heat_id
       JOIN events e ON e.id = h.event_id
       JOIN galas g ON g.id = e.gala_id
      WHERE v.swimmer_id = $1
      ORDER BY v.published_at DESC`,
    [req.params.id],
  );
  res.json(
    rows.map((v, i) => ({
      id: v.id,
      title: v.title,
      galaName: v.gala_name,
      eventDate: v.published_at,
      duration: v.duration_seconds,
      cameraAngle: v.camera_angle,
      isLatest: i === 0,
      isPremium: v.is_premium,
      stats: {
        time: formatTime(v.finish_time_ms),
        position: v.position,
        totalSwimmers: Number(v.total_swimmers),
        reaction: v.reaction_time_ms ? (v.reaction_time_ms / 1000).toFixed(2) : null,
        isPB: v.is_personal_best,
      },
    })),
  );
}));

// ─── GET /api/galas ───────────────────────────────────────────────────────────
app.get('/api/galas', wrap(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, venue, start_date, status FROM galas ORDER BY start_date DESC`,
  );
  res.json(rows.map((g) => ({ id: g.id, name: g.name, venue: g.venue, date: g.start_date, status: g.status })));
}));

// ─── GET /api/galas/:id/results — eventLeaderboards shape ─────────────────────
app.get('/api/galas/:id/results', wrap(async (req, res) => {
  const events = await pool.query(
    `SELECT id, title, event_type, status FROM events
      WHERE gala_id = $1 AND is_relay = false ORDER BY created_at`,
    [req.params.id],
  );
  const out = [];
  for (const e of events.rows) {
    const r = await pool.query(
      `SELECT position, entrant, school, finish_time_ms, is_personal_best, age
         FROM v_event_results WHERE event_id = $1 ORDER BY position NULLS LAST`,
      [e.id],
    );
    out.push({
      eventId: e.id,
      title: e.title,
      eventType: e.event_type,
      isComplete: e.status === 'completed',
      rankings: r.rows.map((row) => ({
        position: row.position,
        name: row.entrant,
        school: row.school,
        age: row.age,
        time: formatTime(row.finish_time_ms),
        isPB: row.is_personal_best,
        isCurrentChild: row.school === OUR_SCHOOL && row.entrant.includes('Kimani'),
      })),
    });
  }
  res.json(out);
}));

// ─── GET /api/galas/:id/standings — schoolStandings shape ─────────────────────
app.get('/api/galas/:id/standings', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT sc.name, st.points, st.placement
       FROM v_school_gala_standings st JOIN schools sc ON sc.id = st.school_id
      WHERE st.gala_id = $1 ORDER BY st.placement`,
    [req.params.id],
  );
  res.json(
    rows.map((s) => ({
      rank: Number(s.placement),
      name: s.name,
      points: Number(s.points),
      change: 0, // requires a previous snapshot to compute; 0 for now
      isOurSchool: s.name === OUR_SCHOOL,
    })),
  );
}));

// ─── GET /api/galas/:id/live — the live race shape (+ heatId for the WS) ──────
app.get('/api/galas/:id/live', wrap(async (req, res) => {
  // The race currently in progress, else the most recent heat in this gala
  const heat = await pool.query(
    `SELECT h.id AS heat_id, h.heat_number, e.title, e.distance_m, e.gala_id,
            g.name AS gala, g.venue,
            (SELECT COUNT(*) FROM heats h2 WHERE h2.event_id = e.id) AS total_heats
       FROM heats h JOIN events e ON e.id = h.event_id JOIN galas g ON g.id = e.gala_id
      WHERE e.gala_id = $1
      ORDER BY (h.status = 'in_progress') DESC, h.started_at DESC NULLS LAST
      LIMIT 1`,
    [req.params.id],
  );
  if (!heat.rows[0]) return res.status(404).json({ error: 'no_race' });
  const h = heat.rows[0];
  const lanes = await pool.query(
    `SELECT r.lane_number AS lane, COALESCE(s.full_name, r.relay_label) AS name,
            sc.name AS school, r.finish_time_ms, r.is_personal_best
       FROM results r
       LEFT JOIN swimmers s ON s.id = r.swimmer_id
       LEFT JOIN schools sc ON sc.id = COALESCE(s.school_id, r.relay_school_id)
      WHERE r.heat_id = $1 ORDER BY r.lane_number`,
    [h.heat_id],
  );
  const video = await pool.query(
    `SELECT v.id FROM videos v JOIN results r ON r.id = v.result_id
      WHERE r.heat_id = $1 LIMIT 1`,
    [h.heat_id],
  );
  res.json({
    heatId: h.heat_id,
    event: h.title,
    heat: h.heat_number,
    totalHeats: Number(h.total_heats),
    gala: h.gala,
    venue: h.venue,
    distance: h.distance_m,
    videoId: video.rows[0]?.id || null,
    lanes: lanes.rows.map((l) => ({
      lane: l.lane,
      name: l.name,
      school: l.school,
      finish: l.finish_time_ms ? l.finish_time_ms / 1000 : null,
      isPB: l.is_personal_best,
      isCurrentChild: (l.name || '').includes('Kimani'),
    })),
  });
}));

// ─── GET /api/seasons/:year/rankings — seasonRankings shape ───────────────────
app.get('/api/seasons/:year/rankings', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT sr.distance_m, sr.stroke, sr.category, sr.age_group,
            sw.full_name, sc.name AS school, sr.best_time_ms, sr.galas
       FROM v_season_rankings sr
       JOIN swimmers sw ON sw.id = sr.swimmer_id
       LEFT JOIN schools sc ON sc.id = sw.school_id
      WHERE sr.season = $1
      ORDER BY sr.distance_m, sr.stroke, sr.best_time_ms`,
    [req.params.year],
  );
  // Group by event
  const byEvent = new Map();
  for (const r of rows) {
    const title = `${r.category[0].toUpperCase() + r.category.slice(1)} ${r.age_group} · ${r.distance_m}m ${r.stroke[0].toUpperCase() + r.stroke.slice(1)} · Season`;
    if (!byEvent.has(title)) byEvent.set(title, []);
    byEvent.get(title).push(r);
  }
  const out = [];
  for (const [title, list] of byEvent) {
    out.push({
      eventId: title.replace(/\s+/g, '_').toLowerCase(),
      title,
      rankings: list.map((r, i) => ({
        position: i + 1,
        name: r.full_name,
        school: r.school,
        time: formatTime(r.best_time_ms),
        galas: Number(r.galas),
        isCurrentChild: (r.full_name || '').includes('Kimani'),
      })),
    });
  }
  res.json(out);
}));

// ─── GET /api/schools ─────────────────────────────────────────────────────────
app.get('/api/schools', wrap(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.location, COALESCE(ss.rank, 999) AS rank, COALESCE(ss.points,0) AS points
       FROM schools s
       LEFT JOIN v_school_season_standings ss ON ss.school_id = s.id AND ss.season = 2026
      ORDER BY rank, s.name`,
  );
  res.json(rows.map((s) => ({ id: s.id, name: s.name, location: s.location, rank: Number(s.rank), points: Number(s.points) })));
}));

// ─── GET /api/schools/:id/competitions — the school drill-down ────────────────
app.get('/api/schools/:id/competitions', wrap(async (req, res) => {
  const galas = await pool.query(
    `SELECT DISTINCT g.id, g.name, g.venue, g.start_date
       FROM galas g
       JOIN events e ON e.gala_id = g.id
       JOIN heats h ON h.event_id = e.id
       JOIN results r ON r.heat_id = h.id
       LEFT JOIN swimmers s ON s.id = r.swimmer_id
      WHERE COALESCE(s.school_id, r.relay_school_id) = $1
      ORDER BY g.start_date DESC`,
    [req.params.id],
  );
  const out = [];
  for (const g of galas.rows) {
    const standing = await pool.query(
      `SELECT placement, points,
              (SELECT COUNT(*) FROM v_school_gala_standings x WHERE x.gala_id = $1) AS schools_count
         FROM v_school_gala_standings WHERE gala_id = $1 AND school_id = $2`,
      [g.id, req.params.id],
    );
    const results = await pool.query(
      `SELECT er.title AS event, er.entrant AS swimmer, er.finish_time_ms, er.position AS place, er.is_personal_best
         FROM v_event_results er
         JOIN events e ON e.id = er.event_id
        WHERE e.gala_id = $1 AND er.school = (SELECT name FROM schools WHERE id = $2)
        ORDER BY er.position
        LIMIT 6`,
      [g.id, req.params.id],
    );
    out.push({
      id: g.id,
      name: g.name,
      date: g.start_date,
      venue: g.venue,
      placement: standing.rows[0] ? Number(standing.rows[0].placement) : null,
      schoolsCount: standing.rows[0] ? Number(standing.rows[0].schools_count) : null,
      points: standing.rows[0] ? Number(standing.rows[0].points) : 0,
      results: results.rows.map((r) => ({
        event: r.event,
        swimmer: r.swimmer,
        time: formatTime(r.finish_time_ms),
        place: r.place,
        isPB: r.is_personal_best,
      })),
    });
  }
  res.json(out);
}));

// ═══════════════════════════════════════════════════════════════════════════
//  WebSocket — live race stream
//  Client connects to /ws and sends {"subscribe":"<heatId>"}. The server
//  replays the heat in real time (sped up): periodic snapshots with each lane's
//  live position/progress, then a final snapshot. A real timing system would
//  push the same messages from finish-touch hardware.
// ═══════════════════════════════════════════════════════════════════════════
// ─── Serve the built React app (production) ────────────────────────────────
// Registered after all /api routes. The SPA fallback excludes api/ws/admin.
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api|ws|admin).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const SPEED = 2.5;

wss.on('connection', (ws) => {
  let timer = null;
  ws.on('message', async (buf) => {
    let msg;
    try { msg = JSON.parse(buf.toString()); } catch { return; }
    if (!msg.subscribe) return;
    const { rows: lanes } = await pool.query(
      `SELECT r.lane_number AS lane, COALESCE(s.full_name, r.relay_label) AS name,
              sc.name AS school, r.finish_time_ms, r.is_personal_best
         FROM results r
         LEFT JOIN swimmers s ON s.id = r.swimmer_id
         LEFT JOIN schools sc ON sc.id = COALESCE(s.school_id, r.relay_school_id)
        WHERE r.heat_id = $1 ORDER BY r.lane_number`,
      [msg.subscribe],
    );
    if (!lanes.length) { ws.send(JSON.stringify({ type: 'error', error: 'no_such_heat' })); return; }
    const maxFinish = Math.max(...lanes.map((l) => l.finish_time_ms || 0)) / 1000;
    let clock = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      clock += 0.1 * SPEED;
      const snap = lanes.map((l) => {
        const fin = (l.finish_time_ms || 0) / 1000;
        const finished = clock >= fin;
        return {
          lane: l.lane, name: l.name, school: l.school,
          finished, progress: Math.min(clock / fin, 1),
          finish: finished ? fin : null, isPB: l.is_personal_best,
          isCurrentChild: (l.name || '').includes('Kimani'), _fin: fin,
        };
      });
      // Furthest-along first; once finished, the faster time ranks ahead.
      snap.sort((a, b) => b.progress - a.progress || a._fin - b._fin);
      snap.forEach((l, i) => { l.position = i + 1; delete l._fin; });
      const done = snap.every((l) => l.finished);
      ws.send(JSON.stringify({ type: done ? 'final' : 'snapshot', clock: +clock.toFixed(1), lanes: snap }));
      if (done) { clearInterval(timer); timer = null; }
    }, 100);
  });
  ws.on('close', () => timer && clearInterval(timer));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`AquaTrack API on http://localhost:${PORT}  (WS: /ws)`));
