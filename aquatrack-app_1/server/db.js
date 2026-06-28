// Database pool + the small adapters that turn DB rows (ms times, stroke enums)
// into the display shapes the frontend's src/data.js uses.

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new pg.Pool((() => {
  const connectionString =
    process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/aquatrack';
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  // Managed Postgres (Render, Railway, Neon…) needs SSL; local doesn't.
  const ssl = !isLocal && process.env.PGSSL !== 'disable' ? { rejectUnauthorized: false } : false;
  return { connectionString, ssl };
})());

// 32180 -> "32.18", 71600 -> "1:11.60", null -> null
export function formatTime(ms) {
  if (ms == null) return null;
  const totalSec = ms / 1000;
  if (totalSec < 60) return totalSec.toFixed(2);
  const m = Math.floor(totalSec / 60);
  const s = (totalSec - m * 60).toFixed(2).padStart(5, '0');
  return `${m}:${s}`;
}

const STROKE_CODE = {
  freestyle: 'FR',
  backstroke: 'BK',
  breaststroke: 'BR',
  butterfly: 'FL',
  medley: 'IM',
};

// (50, 'freestyle') -> "50FR"   — matches the keys in swimmer.pbs
export function pbKey(distanceM, stroke) {
  return `${distanceM}${STROKE_CODE[stroke] || stroke.toUpperCase()}`;
}

export function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
