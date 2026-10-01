// ── Server ↔ Client Protocol ──────────────────────────────────────────
// Typed WebSocket message definitions for the investigation game server.

import type { ClosureAttempt, PlayerAction, RuntimeSnapshot } from '../types.js';

// ── Specialty / Phase Enums ───────────────────────────────────────────

export type Specialty = 'timeline' | 'forensics' | 'behavioral';
export type GamePhase = 'lobby' | 'waiting' | 'investigating' | 'tribunal' | 'results' | 'shadow_message';

// ── Player / Room Models ──────────────────────────────────────────────

export interface PlayerInfo {
  playerId: string;
  name: string;
  avatarId: string;
  specialty: Specialty | null;
  isHost: boolean;
}

export interface RoomInfo {
  roomId: string;
  hostName: string;
  caseName: string;
  playerCount: number;
  maxPlayers: number;
  players: PlayerInfo[];
  phase: GamePhase;
  isSolo?: boolean;
}

// ── Client → Server Messages ─────────────────────────────────────────

export type ClientMessage =
  | { type: 'CREATE_ROOM'; payload: { player: PlayerInfo } }
  | { type: 'JOIN_ROOM'; payload: { roomId: string; player: PlayerInfo } }
  | { type: 'LEAVE_ROOM'; payload: { roomId: string } }
  | { type: 'SELECT_SPECIALTY'; payload: { roomId: string; specialty: Specialty } }
  | { type: 'START_GAME'; payload: { roomId: string } }
  | { type: 'GAME_ACTION'; payload: { roomId: string; action: PlayerAction } }
  | { type: 'CHAT_MESSAGE'; payload: { roomId: string; message: string } }
  | { type: 'SHARE_EVIDENCE'; payload: { roomId: string; evidenceId: string; targetPlayerId: string | 'all' } }
  | { type: 'REQUEST_CLOSURE'; payload: { roomId: string } }
  | { type: 'TRIBUNAL_VOTE'; payload: { roomId: string; approve: boolean } }
  | { type: 'TRIBUNAL_SUBMIT'; payload: { roomId: string; attempt: ClosureAttempt } }
  | { type: 'NEXT_CASE'; payload: { roomId: string } }
  | { type: 'DISMISS_SHADOW'; payload: { roomId: string } }
  | { type: 'SAVE_GAME'; payload: { roomId: string } }
  | { type: 'BOARD_UPDATE'; payload: { roomId: string; nodes: BoardNode[]; links: BoardLink[] } }
  | { type: 'START_SOLO'; payload: { player: PlayerInfo } }
  | { type: 'CLOSE_ROOM'; payload: { roomId: string } }
  | { type: 'REQUEST_HINT'; payload: { roomId: string } }
  | { type: 'REQUEST_SOLUTION'; payload: { roomId: string } }
  | { type: 'JOIN_LOBBY'; payload: { playerId: string } }
  | { type: 'LEAVE_LOBBY'; payload: { playerId: string } };

// ── Server → Client Messages ─────────────────────────────────────────

export type ServerMessage =
  | { type: 'ROOM_CREATED'; payload: { room: RoomInfo } }
  | { type: 'ROOM_JOINED'; payload: { room: RoomInfo } }
  | { type: 'ROOM_UPDATED'; payload: { room: RoomInfo } }
  | { type: 'PLAYER_JOINED'; payload: { player: PlayerInfo; room: RoomInfo } }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string; room: RoomInfo } }
  | { type: 'GAME_STARTED'; payload: { room: RoomInfo; snapshot: RuntimeSnapshot; caseDefinition?: any } }
  | { type: 'SNAPSHOT_UPDATE'; payload: { snapshot: RuntimeSnapshot } }
  | { type: 'CHAT_BROADCAST'; payload: { senderId: string; senderName: string; specialty: Specialty | null; message: string; timestamp: number } }
  | { type: 'EVIDENCE_SHARED'; payload: { fromPlayer: string; fromName: string; evidenceId: string; evidenceTitle: string } }
  | { type: 'CLOSURE_REQUESTED'; payload: { requestedBy: string; requestedByName: string } }
  | { type: 'TRIBUNAL_STARTED'; payload: { room: RoomInfo } }
  | { type: 'TRIBUNAL_VOTE_UPDATE'; payload: { votes: Record<string, boolean | null> } }
  | { type: 'CLOSURE_RESULT'; payload: { accepted: boolean; mode: string; reason_codes: string[]; granted_flags: string[]; submitted_suspect: string | null; submitted_motive: string | null; submitted_method_or_timeline: string | null } }
  | { type: 'NEXT_CASE_LOADED'; payload: { room: RoomInfo; caseTitle: string; snapshot: RuntimeSnapshot; caseDefinition?: any } }
  | { type: 'SHADOW_MESSAGE'; payload: { message: string } }
  | { type: 'SAVE_CONFIRMED'; payload: { timestamp: number } }
  | { type: 'BOARD_SYNC'; payload: { nodes: BoardNode[]; links: BoardLink[] } }
  | { type: 'NOTIFICATION'; payload: { message: string; type: 'info' | 'warning' | 'success' | 'error' } }
  | { type: 'ROOM_CLOSED'; payload: { roomId: string } }
  | { type: 'HOST_DISCONNECTED'; payload: { roomId: string; message: string } }
  | { type: 'CONSENSUS_UPDATE'; payload: { roomId: string; hintRequests: string[]; solutionRequests: string[] } }
  | { type: 'HINT_REVEALED'; payload: { hint: string; phs_hint?: import('../types.js').PhsHint } }
  | { type: 'EVENT_PHS_HINT_REVEALED'; payload: import('../types.js').DomainEvent }
  | { type: 'SOLUTION_REVEALED'; payload: { solution: any } }
  | { type: 'LOBBY_UPDATE'; payload: { allRooms: RoomInfo[]; activeRooms: RoomInfo[] } }
  | { type: 'ERROR'; payload: { code: string; message: string } };

// ── String Board Shared Models ────────────────────────────────────────

export interface BoardNode {
  id: string;
  label: string;
  type: 'evidence' | 'character' | 'note';
  specialty: Specialty | null;
  x: number;
  y: number;
}

export interface BoardLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}
