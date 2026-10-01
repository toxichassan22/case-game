export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  stats_json TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'player',
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  host_profile_id TEXT NOT NULL,
  status TEXT DEFAULT 'waiting',
  is_solo BOOLEAN,
  current_case_id TEXT,
  current_case_title TEXT,
  created_at TEXT,
  FOREIGN KEY (host_profile_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS room_players (
  room_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  role TEXT,
  is_host BOOLEAN DEFAULT 0,
  joined_at TEXT,
  PRIMARY KEY (room_id, profile_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS game_saves (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  save_version TEXT,
  engine_snapshot_json TEXT,
  global_state_json TEXT,
  board_state_json TEXT,
  case_history_json TEXT,
  case_id TEXT,
  current_tick INTEGER,
  saved_at TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS action_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  case_id TEXT,
  tick INTEGER,
  action_json TEXT NOT NULL,
  result_accepted BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
`;
