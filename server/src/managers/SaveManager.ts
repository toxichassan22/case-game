import { db } from '../db/index.js';
import crypto from 'crypto';
import type { RuntimeSnapshot } from 'runtime/src/types.js';

export interface GameSave {
  id: string; // UUID
  room_id: string;
  save_version: string;
  engine_snapshot_json: string;
  global_state_json: string;
  board_state_json: string;
  case_history_json: string;
  case_id: string;
  current_tick: number;
  saved_at: string;
}

export class SaveManager {
  private saveVersion = 'v1.0';

  createSave(
    roomId: string, 
    snapshot: RuntimeSnapshot, 
    globalState: any, 
    boardState: any, 
    caseHistory: string[],
    caseId: string
  ): GameSave {
    const saveId = crypto.randomUUID();
    const savedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO game_saves(id, room_id, save_version, engine_snapshot_json, global_state_json, board_state_json, case_history_json, case_id, current_tick, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      saveId,
      roomId,
      this.saveVersion,
      JSON.stringify(snapshot),
      JSON.stringify(globalState || {}),
      JSON.stringify(boardState || {}),
      JSON.stringify(caseHistory || []),
      caseId,
      snapshot.currentTick,
      savedAt
    );
    
    this.cleanupOldSaves(roomId);

    return {
      id: saveId,
      room_id: roomId,
      save_version: this.saveVersion,
      engine_snapshot_json: JSON.stringify(snapshot),
      global_state_json: JSON.stringify(globalState),
      board_state_json: JSON.stringify(boardState),
      case_history_json: JSON.stringify(caseHistory),
      case_id: caseId,
      current_tick: snapshot.currentTick,
      saved_at: savedAt,
    };
  }

  private cleanupOldSaves(roomId: string): void {
    const keepLimit = 5;
    db.prepare(`
      DELETE FROM game_saves 
      WHERE room_id = ? AND id NOT IN (
        SELECT id FROM (
          SELECT id FROM game_saves 
          WHERE room_id = ? 
          ORDER BY saved_at DESC 
          LIMIT ?
        )
      )
    `).run(roomId, roomId, keepLimit);
  }

  getLatestSave(roomId: string): GameSave | undefined {
    return db.prepare(`
      SELECT * FROM game_saves 
      WHERE room_id = ? 
      ORDER BY saved_at DESC 
      LIMIT 1
    `).get(roomId) as GameSave | undefined;
  }
}

export const saveManager = new SaveManager();
