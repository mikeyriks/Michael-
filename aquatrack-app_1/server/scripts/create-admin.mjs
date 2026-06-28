// Create or update an admin: node scripts/create-admin.mjs <email> <password> [fullName]
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const [, , email, password, fullName = 'Admin'] = process.argv;
if (!email || !password) {
  console.error('usage: node scripts/create-admin.mjs <email> <password> [fullName]');
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 10);
await pool.query(
  `INSERT INTO admins (email, password_hash, full_name)
   VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name`,
  [email, hash, fullName],
);
console.log('admin upserted:', email);
await pool.end();
