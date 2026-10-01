import { db } from '../db/index.js';
import type { PlayerInfo, RoomInfo, Specialty, GamePhase } from 'runtime/src/server/protocol.js';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `#${id}`;
}

export interface RoomState {
  roomId: string;
  hostPlayerId: string;
  players: Map<string, PlayerInfo>;
  phase: GamePhase;
  isSolo: boolean | null;
  caseId: string;
  caseTitle: string;
  maxPlayers: number;
  createdAt: number;
}

export class RoomManager {
  // In-memory cache synced with DB to avoid constant parsing
  private rooms = new Map<string, RoomState>();

  private loadRoomsFromDB() {
    // Clear out any 'waiting' rooms left over from a previous server crash. 
    // Waiting rooms cannot be meaningfully resumed and will just be ghosts in the lobby.
    db.prepare(`UPDATE rooms SET status = 'completed' WHERE status = 'waiting'`).run();

    const dbRooms = db.prepare('SELECT * FROM rooms').all() as any[];
    for (const r of dbRooms) {
      if (r.status === 'completed' || r.status === 'waiting') continue; // Don't load finished rooms into active mapping cache

      const dbPlayers = db.prepare('SELECT p.id, p.display_name, p.avatar_id, rp.role, rp.is_host FROM room_players rp JOIN profiles p ON rp.profile_id = p.id WHERE rp.room_id = ?').all(r.id) as any[];
      const playersMap = new Map<string, PlayerInfo>();
      for (const p of dbPlayers) {
        playersMap.set(p.id, {
          playerId: p.id,
          name: p.display_name,
          avatarId: p.avatar_id,
          specialty: p.role,
          isHost: p.is_host === 1
        });
      }

      this.rooms.set(r.id, {
        roomId: r.id,
        hostPlayerId: r.host_profile_id,
        players: playersMap,
        phase: r.status as GamePhase,
        isSolo: typeof r.is_solo === 'number' ? r.is_solo === 1 : null,
        caseId: r.current_case_id || 'case01',
        caseTitle: r.current_case_title || 'جديدة',
        maxPlayers: 3,
        createdAt: new Date(r.created_at).getTime()
      });
    }
  }

  constructor() {
    this.loadRoomsFromDB();
  }

  createRoom(hostPlayer: PlayerInfo, options?: { isSolo?: boolean }): RoomState {
    const isSolo = options?.isSolo ?? false;
    let roomId = generateRoomId();
    while (this.rooms.has(roomId)) {
      roomId = generateRoomId();
    }

    db.transaction(() => {
      db.prepare(`INSERT INTO rooms (id, host_profile_id, status, is_solo, current_case_id, current_case_title, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        roomId, hostPlayer.playerId, 'waiting', isSolo ? 1 : 0, 'case01', 'جديدة', new Date().toISOString()
      );
      db.prepare(`INSERT INTO room_players (room_id, profile_id, role, is_host, joined_at) VALUES (?, ?, ?, ?, ?)`).run(
        roomId, hostPlayer.playerId, hostPlayer.specialty || null, 1, new Date().toISOString()
      );
    })();

    const room: RoomState = {
      roomId,
      hostPlayerId: hostPlayer.playerId,
      players: new Map([[hostPlayer.playerId, { ...hostPlayer, isHost: true }]]),
      phase: 'waiting',
      isSolo,
      caseId: 'case01',
      caseTitle: 'جديدة',
      maxPlayers: 3,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, player: PlayerInfo): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const isReturning = room.players.has(player.playerId);

    if (!isReturning) {
      if (room.players.size >= room.maxPlayers) return null;
      if (room.phase !== 'waiting') return null;
    }

    if (!isReturning && player.specialty) {
      for (const [, p] of room.players) {
        if (p.specialty === player.specialty) {
          player.specialty = null;
          break;
        }
      }
    }

    const existingPlayer = room.players.get(player.playerId);
    const specialtyToSave = existingPlayer ? existingPlayer.specialty : (player.specialty || null);
    const isHostToSave = existingPlayer ? existingPlayer.isHost : false;

    db.prepare(`INSERT OR REPLACE INTO room_players (room_id, profile_id, role, is_host, joined_at) VALUES (?, ?, ?, ?, ?)`).run(
      roomId, player.playerId, specialtyToSave, isHostToSave ? 1 : 0, new Date().toISOString()
    );

    room.players.set(player.playerId, { 
      ...player, 
      specialty: specialtyToSave,
      isHost: isHostToSave
    });
    return room;
  }

  leaveRoom(roomId: string, playerId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players.delete(playerId);
    db.prepare(`DELETE FROM room_players WHERE room_id = ? AND profile_id = ?`).run(roomId, playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      // Wait to delete the room from DB or just mark completed? For now, we leave it but mark status
      db.prepare(`UPDATE rooms SET status = 'completed' WHERE id = ?`).run(roomId);
      return null;
    }

    if (room.hostPlayerId === playerId) {
      const newHost = room.players.values().next().value;
      if (newHost) {
        room.hostPlayerId = newHost.playerId;
        newHost.isHost = true;
        db.prepare(`UPDATE rooms SET host_profile_id = ? WHERE id = ?`).run(newHost.playerId, roomId);
        db.prepare(`UPDATE room_players SET is_host = 1 WHERE room_id = ? AND profile_id = ?`).run(roomId, newHost.playerId);
      }
    }

    return room;
  }

  closeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.rooms.delete(roomId);
    db.prepare(`UPDATE rooms SET status = 'completed' WHERE id = ?`).run(roomId);
  }

  selectSpecialty(roomId: string, playerId: string, specialty: Specialty): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    for (const [pid, p] of room.players) {
      if (pid !== playerId && p.specialty === specialty) return false;
    }

    const player = room.players.get(playerId);
    if (!player) return false;

    player.specialty = specialty;
    db.prepare(`UPDATE room_players SET role = ? WHERE room_id = ? AND profile_id = ?`).run(specialty, roomId, playerId);
    return true;
  }

  setPhase(roomId: string, phase: GamePhase): void {
    const room = this.rooms.get(roomId);
    if (room) {
        room.phase = phase;
        db.prepare(`UPDATE rooms SET status = ? WHERE id = ?`).run(phase, roomId);
    }
  }

  setCaseInfo(roomId: string, caseId: string, title: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
        room.caseId = caseId;
        room.caseTitle = title;
        db.prepare(`UPDATE rooms SET current_case_id = ?, current_case_title = ? WHERE id = ?`).run(caseId, title, roomId);
    }
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  listRooms(): RoomInfo[] {
    const list: RoomInfo[] = [];
    for (const room of this.rooms.values()) {
      if (room.phase === 'waiting') {
        list.push(this.toRoomInfo(room));
      }
    }
    return list;
  }

  listActiveRoomsForPlayer(playerId: string): RoomInfo[] {
    const list: RoomInfo[] = [];
    for (const room of this.rooms.values()) {
      if (room.phase === 'investigating' || room.phase === 'tribunal' || room.phase === 'results') {
        if (room.players.has(playerId)) {
          list.push(this.toRoomInfo(room));
        }
      }
    }
    return list;
  }

  toRoomInfo(room: RoomState): RoomInfo {
    const players: PlayerInfo[] = [];
    for (const p of room.players.values()) {
      players.push({ ...p });
    }
    return {
      roomId: room.roomId,
      hostName: room.players.get(room.hostPlayerId)?.name ?? 'Unknown',
      caseName: room.caseTitle,
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      players,
      phase: room.phase,
      isSolo: room.isSolo ?? room.players.size <= 1,
    };
  }
}

export const roomManager = new RoomManager();
