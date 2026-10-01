import { db } from '../db/index.js';

export interface Profile {
  id: string; // UUID
  display_name: string;
  avatar_id: string;
  stats_json: string; // JSON string
  created_at: string;
}

export class ProfileManager {
  createProfile(id: string, displayName: string, avatarId: string): Profile {
    const stmt = db.prepare(`
      INSERT INTO profiles (id, display_name, avatar_id, stats_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const statsJSON = JSON.stringify({ cases_solved: 0, win_rate: 0, favorite_route: null, total_ticks: 0 });
    const createdAt = new Date().toISOString();
    stmt.run(id, displayName, avatarId, statsJSON, createdAt);
    
    return this.getProfile(id)!;
  }

  getProfile(id: string): Profile | undefined {
    const stmt = db.prepare(`SELECT * FROM profiles WHERE id = ?`);
    return stmt.get(id) as Profile | undefined;
  }

  updateProfile(id: string, updates: Partial<Profile>): void {
    const profile = this.getProfile(id);
    if (!profile) return;
    
    const stmt = db.prepare(`
      UPDATE profiles 
      SET display_name = ?, avatar_id = ?, stats_json = ? 
      WHERE id = ?
    `);
    
    stmt.run(
      updates.display_name ?? profile.display_name,
      updates.avatar_id ?? profile.avatar_id,
      updates.stats_json ?? profile.stats_json,
      id
    );
  }
}

export const profileManager = new ProfileManager();
