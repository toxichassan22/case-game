import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite DB
const db = new Database(dbPath, {
  // verbose: console.log
});

// Use WAL mode for better concurrency performance
db.pragma('journal_mode = WAL');

// Initialize Schema immediately on load to ensure tables exist for managers
db.exec(SCHEMA_SQL);

// ── Migrations ──────────────────────────────────────────────────────────────
// Safely add columns that may be missing in older database files.
// SQLite's `CREATE TABLE IF NOT EXISTS` won't add new columns to existing tables,
// so we need explicit ALTER TABLE statements guarded by a column-existence check.

function columnExists(table: string, column: string): boolean {
  const cols = db.pragma(`table_info(${table})`) as { name: string }[];
  return cols.some((c) => c.name === column);
}

if (!columnExists('rooms', 'current_case_title')) {
  db.exec(`ALTER TABLE rooms ADD COLUMN current_case_title TEXT`);
  console.log('[DB] Migration: added current_case_title to rooms');
}

if (!columnExists('rooms', 'is_solo')) {
  db.exec(`ALTER TABLE rooms ADD COLUMN is_solo BOOLEAN`);
  console.log('[DB] Migration: added is_solo to rooms');
}

if (!columnExists('chat_messages', 'specialty')) {
  db.exec(`ALTER TABLE chat_messages ADD COLUMN specialty TEXT`);
  console.log('[DB] Migration: added specialty to chat_messages');
}

export { db };
