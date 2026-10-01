import { db } from '../db/index.js';
import type { Specialty } from 'runtime/src/server/protocol.js';

export interface ChatMessage {
  id: number;
  room_id: string;
  profile_id: string;
  message: string;
  sent_at: string;
  // Included in broadcast
  senderName?: string;
  specialty?: Specialty | null;
}

export class ChatManager {
  saveMessage(roomId: string, profileId: string, message: string): ChatMessage | null {
    const sentAt = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO chat_messages (room_id, profile_id, message, sent_at)
      VALUES (?, ?, ?, ?)
    `).run(roomId, profileId, message, sentAt);

    return {
      id: Number(result.lastInsertRowid),
      room_id: roomId,
      profile_id: profileId,
      message,
      sent_at: sentAt
    };
  }

  getRecentMessages(roomId: string, limit: number = 100): ChatMessage[] {
    return db.prepare(`
      SELECT c.*, p.display_name as senderName, rp.role as specialty
      FROM chat_messages c
      JOIN profiles p ON c.profile_id = p.id
      LEFT JOIN room_players rp ON c.room_id = rp.room_id AND c.profile_id = rp.profile_id
      WHERE c.room_id = ?
      ORDER BY c.id ASC
      LIMIT ?
    `).all(roomId, limit) as ChatMessage[];
  }
}

export const chatManager = new ChatManager();
