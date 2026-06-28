// One-time database setup for a fresh deploy.
//   node scripts/db-setup.mjs
// Loads schema + seed if the schema isn't there yet, then ensures admin accounts.
// Safe to run again: schema/seed are skipped once tables exist; admin.sql is idempotent.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '..', '..', 'db');
const read = (f) => fs.readFileSync(path.join(dbDir, f), 'utf8');

async function tableExists(name) {
  const { rows } = await pool.query('SELECT to_regclass($1) AS r', [name]);
  return rows[0].r != null;
}

try {
  if (!(await tableExists('public.swimmers'))) {
    console.log('→ Loading schema.sql'); await pool.query(read('schema.sql'));
    console.log('→ Loading seed.sql');   await pool.query(read('seed.sql'));
  } else {
    console.log('✓ Schema already present — skipping schema & seed');
  }
  console.log('→ Ensuring admin accounts (admin.sql)'); await pool.query(read('admin.sql'));
  console.log('✓ Database ready');
  await pool.end();
} catch (e) {
  console.error('✗ db-setup failed:', e.message);
  process.exit(1);
}
