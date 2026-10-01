import { WebSocket } from 'ws';
import type { ClientMessage, ServerMessage } from 'runtime/src/server/protocol.js';
import { roomManager } from '../managers/RoomManager.js';
import { engineHost } from '../managers/EngineHost.js';
import { profileManager } from '../managers/ProfileManager.js';
import { chatManager } from '../managers/ChatManager.js';


// Maps WebSocket → playerId
export const wsToPlayer = new Map<WebSocket, string>();
// Maps playerId → WebSocket
export const playerToWs = new Map<string, WebSocket>();
// Maps playerId → roomId
export const playerToRoom = new Map<string, string>();
// Maps WebSocket → playerId for players currently in the lobby
export const lobbyClients = new Map<WebSocket, string>();
// Maps playerId → timeout interval for disconnection grace period
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

import { loadRegisteredCaseResources } from 'runtime/src/cases/registry.js';
import { RouteResolver } from 'runtime/src/engine/routeResolver.js';
import { PLAYER_ACTION_TYPE } from 'runtime/src/engine/constants.js';




export function registerPlayer(ws: WebSocket, playerId: string): void {
  wsToPlayer.set(ws, playerId);
  playerToWs.set(playerId, ws);

  const timeout = disconnectTimeouts.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    disconnectTimeouts.delete(playerId);
  }
}

export function sendToClient(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function sendToPlayer(playerId: string, msg: ServerMessage): void {
  const ws = playerToWs.get(playerId);
  if (ws) sendToClient(ws, msg);
}

export function broadcastToRoom(roomId: string, msg: ServerMessage, excludePlayerId?: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  for (const [pid] of room.players) {
    if (pid !== excludePlayerId) {
      sendToPlayer(pid, msg);
    }
  }
}

export function broadcastToRoomAll(roomId: string, msg: ServerMessage): void {
  broadcastToRoom(roomId, msg);
}

export function broadcastSnapshots(roomId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  for (const [pid, player] of room.players) {
    const snapshot = engineHost.getFilteredSnapshot(roomId, room, player);
    if (snapshot) {
      sendToPlayer(pid, { type: 'SNAPSHOT_UPDATE', payload: { snapshot } });
    }
  }
}

export function broadcastToLobby(): void {
  const allRooms = roomManager.listRooms();
  for (const [ws, playerId] of lobbyClients) {
    const activeRooms = roomManager.listActiveRoomsForPlayer(playerId);
    sendToClient(ws, { type: 'LOBBY_UPDATE', payload: { allRooms, activeRooms } });
  }
}

import { z } from 'zod';

const playerInfoSchema = z.object({
  playerId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/, 'Invalid playerId format'),
  name: z.string().min(1).max(50),
  avatarId: z.string().min(1).max(50),
  specialty: z.enum(['timeline', 'forensics', 'behavioral']).nullable(),
  isHost: z.boolean()
});

const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CREATE_ROOM'), payload: z.object({ player: playerInfoSchema }) }),
  z.object({ type: z.literal('JOIN_ROOM'), payload: z.object({ roomId: z.string().min(1), player: playerInfoSchema }) }),
  z.object({ type: z.literal('LEAVE_ROOM'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('SELECT_SPECIALTY'), payload: z.object({ roomId: z.string().min(1), specialty: z.enum(['timeline', 'forensics', 'behavioral']) }) }),
  z.object({ type: z.literal('START_GAME'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('GAME_ACTION'), payload: z.object({ roomId: z.string().min(1), action: z.any() }) }), // Action validation is complex, kept as any for now
  z.object({ type: z.literal('CHAT_MESSAGE'), payload: z.object({ roomId: z.string().min(1), message: z.string().min(1).max(500) }) }),
  z.object({ type: z.literal('SHARE_EVIDENCE'), payload: z.object({ roomId: z.string().min(1), evidenceId: z.string().min(1), targetPlayerId: z.string().min(1) }) }),
  z.object({ type: z.literal('REQUEST_CLOSURE'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('BOARD_UPDATE'), payload: z.object({ 
    roomId: z.string().min(1), 
    nodes: z.array(z.any()),
    links: z.array(z.any())
  }) }),
  z.object({ type: z.literal('TRIBUNAL_VOTE'), payload: z.object({ roomId: z.string().min(1), approve: z.boolean() }) }),
  z.object({ type: z.literal('TRIBUNAL_SUBMIT'), payload: z.object({ roomId: z.string().min(1), attempt: z.any() }) }),
  z.object({ type: z.literal('NEXT_CASE'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('DISMISS_SHADOW'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('CLOSE_ROOM'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('REQUEST_HINT'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('REQUEST_SOLUTION'), payload: z.object({ roomId: z.string().min(1) }) }),
  z.object({ type: z.literal('SAVE_GAME'), payload: z.object({ roomId: z.string().min(1) }).optional() }),
  z.object({ type: z.literal('START_SOLO'), payload: z.object({ player: playerInfoSchema }) }),
  z.object({ type: z.literal('JOIN_LOBBY'), payload: z.object({ playerId: z.string().min(1) }) }),
  z.object({ type: z.literal('LEAVE_LOBBY'), payload: z.object({ playerId: z.string().min(1) }) }),
]);

export async function handleClientMessage(ws: WebSocket, rawMsg: any): Promise<void> {
  const parseResult = clientMessageSchema.safeParse(rawMsg);
  if (!parseResult.success) {
    console.warn('[WS] Validation failed:', parseResult.error.format());
    sendToClient(ws, { 
      type: 'ERROR', 
      payload: { 
        code: 'INVALID_FORMAT', 
        message: 'تنسيق الرسالة غير صالح أو البيانات ناقصة' 
      } 
    });
    return;
  }
  const msg = parseResult.data as ClientMessage;

  switch (msg.type) {
    case 'CREATE_ROOM': {
      const { player } = msg.payload;
      
      // Ensure profile exists in SQLite
      if (!profileManager.getProfile(player.playerId)) {
        profileManager.createProfile(player.playerId, player.name, player.avatarId);
      }

      registerPlayer(ws, player.playerId);
      const room = roomManager.createRoom(player, { isSolo: false });
      engineHost.createSession(room.roomId, false);
      playerToRoom.set(player.playerId, room.roomId);
      lobbyClients.delete(ws); // No longer in lobby
      sendToClient(ws, { type: 'ROOM_CREATED', payload: { room: roomManager.toRoomInfo(room) } });
      broadcastToLobby();
      break;
    }

    case 'JOIN_ROOM': {
      const { roomId, player } = msg.payload;

      if (!profileManager.getProfile(player.playerId)) {
        profileManager.createProfile(player.playerId, player.name, player.avatarId);
      }

      registerPlayer(ws, player.playerId);
      const room = roomManager.joinRoom(roomId, player);
      if (!room) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'JOIN_FAILED', message: 'لا يمكن الانضمام للغرفة' } });
        return;
      }
      playerToRoom.set(player.playerId, roomId);
      lobbyClients.delete(ws); // No longer in lobby
      sendToClient(ws, { type: 'ROOM_JOINED', payload: { room: roomManager.toRoomInfo(room) } });
      broadcastToRoom(roomId, { type: 'PLAYER_JOINED', payload: { player, room: roomManager.toRoomInfo(room) } }, player.playerId);
      broadcastToLobby();
      
      // Send chat history
      const history = chatManager.getRecentMessages(roomId);
      for (const chatMsg of history) {
        sendToPlayer(player.playerId, {
          type: 'CHAT_BROADCAST',
          payload: {
            senderId: chatMsg.profile_id,
            senderName: chatMsg.senderName || 'غير معروف',
            specialty: chatMsg.specialty || null,
            message: chatMsg.message,
            timestamp: new Date(chatMsg.sent_at).getTime(),
          }
        });
      }

      // Sync board
      const board = engineHost.getBoard(roomId);
      if (board) {
          sendToPlayer(player.playerId, { type: 'BOARD_SYNC', payload: board });
      }

      // Sync snapshot if game actually started
      if (room.phase !== 'waiting') {
        let session = engineHost.getSession(roomId);
        
        // If server restarted, session might not be in memory. Try restoring from DB.
        if (!session && room.caseId) {
            try {
                const { caseDefinition, blueprintConfig } = await loadRegisteredCaseResources(room.caseId);
                const isSolo = room.players.size <= 1; // Approximate for now, or fetch from room
                engineHost.restoreSession(roomId, caseDefinition, blueprintConfig, isSolo);
                session = engineHost.getSession(roomId);
            } catch (e) {
                console.error('[JOIN_ROOM] Failed to restore session:', e);
            }
        }

        if (session && session.engine && session.caseDefinition) {
            const filteredSnapshot = engineHost.getFilteredSnapshot(roomId, room, room.players.get(player.playerId)!);
            if (filteredSnapshot) {
              sendToPlayer(player.playerId, {
                type: 'GAME_STARTED',
                payload: { 
                    room: roomManager.toRoomInfo(room), 
                    snapshot: filteredSnapshot, 
                    caseDefinition: session.caseDefinition 
                }
              });
            } else {
              sendToPlayer(player.playerId, { type: 'ERROR', payload: { code: 'RESTORE_FAILED', message: 'تعذر استعادة حالة الجلسة لهذا المحقق.' } });
            }
        } else {
            sendToPlayer(player.playerId, { type: 'ERROR', payload: { code: 'RESTORE_FAILED', message: 'بيانات الجلسة غير قابلة للاسترداد. يرجى إنشاء غرفة جديدة.' } });
        }
      }

      break;
    }

    case 'LEAVE_ROOM': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      handlePlayerLeaveRoom(playerId, msg.payload.roomId);
      break;
    }

    case 'SELECT_SPECIALTY': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const success = roomManager.selectSpecialty(msg.payload.roomId, playerId, msg.payload.specialty);
      if (!success) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'SPECIALTY_TAKEN', message: 'التخصص مأخوذ بالفعل' } });
        return;
      }
      const room = roomManager.getRoom(msg.payload.roomId);
      if (room) {
        broadcastToRoomAll(msg.payload.roomId, { type: 'ROOM_UPDATED', payload: { room: roomManager.toRoomInfo(room) } });
      }
      break;
    }

    case 'START_GAME': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      await handleStartGame(msg.payload.roomId, playerId);
      break;
    }

    case 'START_SOLO': {
      const { player } = msg.payload;
      
      if (!profileManager.getProfile(player.playerId)) {
        profileManager.createProfile(player.playerId, player.name, player.avatarId);
      }

      registerPlayer(ws, player.playerId);
      const room = roomManager.createRoom(player, { isSolo: true });
      engineHost.createSession(room.roomId, true);
      playerToRoom.set(player.playerId, room.roomId);
      lobbyClients.delete(ws); // No longer in lobby
      await handleStartGame(room.roomId, player.playerId);
      broadcastToLobby();
      break;
    }

    case 'GAME_ACTION': {
      const session = engineHost.getSession(msg.payload.roomId);
      if (!session?.engine) return;
      
      const playerId = wsToPlayer.get(ws);
      const result = engineHost.processAction(msg.payload.roomId, msg.payload.action);
      
      if (result && result.accepted) {
        broadcastSnapshots(msg.payload.roomId);

        // Forward PHS hint events to the client — the SNAPSHOT_UPDATE alone
        // doesn't carry event data, so the frontend listener never fires.
        const phsEvent = result.emittedEvents.find(
          e => e.event_name === 'EVENT_PHS_HINT_REVEALED'
        );
        if (phsEvent) {
          broadcastToRoomAll(msg.payload.roomId, {
            type: 'EVENT_PHS_HINT_REVEALED',
            payload: phsEvent,
          });
        }
      } else if (result && result.rejectionReason && playerId) {
        // Send the exact rejection reason back to the client as an ERROR toast
        sendToPlayer(playerId, { 
          type: 'ERROR', 
          payload: { 
            code: 'ACTION_REJECTED', 
            message: `Action Rejected: ${result.rejectionReason}` 
          } 
        });
      }
      break;
    }

    case 'CHAT_MESSAGE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const room = roomManager.getRoom(msg.payload.roomId);
      if (!room) return;
      const sender = room.players.get(playerId);
      if (!sender) return;

      chatManager.saveMessage(msg.payload.roomId, playerId, msg.payload.message);

      broadcastToRoomAll(msg.payload.roomId, {
        type: 'CHAT_BROADCAST',
        payload: {
          senderId: playerId,
          senderName: sender.name,
          specialty: sender.specialty,
          message: msg.payload.message,
          timestamp: Date.now(),
        },
      });
      break;
    }

    case 'SHARE_EVIDENCE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      handleShareEvidence(playerId, msg.payload.roomId, msg.payload.evidenceId, msg.payload.targetPlayerId);
      break;
    }

    case 'REQUEST_CLOSURE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      handleClosureRequest(playerId, msg.payload.roomId);
      break;
    }

    case 'BOARD_UPDATE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const room = roomManager.getRoom(msg.payload.roomId);
      if (!room) return;
      
      // Broadcast board update to all players in the room
      broadcastToRoom(msg.payload.roomId, {
        type: 'BOARD_SYNC',
        payload: {
          nodes: msg.payload.nodes,
          links: msg.payload.links
        }
      });
      break;
    }

    case 'TRIBUNAL_VOTE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      handleTribunalVote(playerId, msg.payload.roomId, msg.payload.approve);
      break;
    }

    case 'TRIBUNAL_SUBMIT': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      handleTribunalSubmit(playerId, msg.payload.roomId, msg.payload.attempt);
      break;
    }

    case 'DISMISS_SHADOW': {
      const session = engineHost.getSession(msg.payload.roomId);
      if (session) {
        session.shadowMessagePending = null;
        roomManager.setPhase(msg.payload.roomId, 'investigating');
        const room = roomManager.getRoom(msg.payload.roomId);
        if (room) {
          broadcastToRoomAll(msg.payload.roomId, { type: 'ROOM_UPDATED', payload: { room: roomManager.toRoomInfo(room) } });
        }
      }
      break;
    }

    case 'NEXT_CASE': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const roomId = playerToRoom.get(playerId);
      if (!roomId) return;
      
      const currentRoom = roomManager.getRoom(roomId);
      if (!currentRoom) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'ROOM_NOT_FOUND', message: 'الغرفة غير موجودة' } });
        return;
      }
      
      if (currentRoom.hostPlayerId !== playerId) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'UNAUTHORIZED', message: 'فقط المضيف (Host) يمكنه الانتقال للقضية التالية' } });
        return;
      }

      if (currentRoom.phase !== 'results') {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'INVALID_PHASE', message: 'يمكن الانتقال للقضية التالية فقط من مرحلة النتائج' } });
        return;
      }

      const session = engineHost.getSession(roomId);
      if (!session || !session.engine || !session.caseDefinition) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'NO_SESSION', message: 'لا توجد جلسة نشطة' } });
        return;
      }

      const engineSnapshot = session.engine.getSnapshot();
      if (!engineSnapshot.lastClosureDecision?.accepted) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'CLOSURE_NOT_ACCEPTED', message: 'يجب قبول إغلاق القضية قبل الانتقال للتالية' } });
        return;
      }

      let nextCaseId = engineSnapshot.pendingTransitionContext?.target_case_id;

      if (!nextCaseId) {
        const resolver = new RouteResolver(session.engine.state, session.caseDefinition);
        const resolution = resolver.resolveRoute();

        if (!resolution) {
          sendToClient(ws, { type: 'ERROR', payload: { code: 'NO_NEXT_CASE', message: 'لا توجد قضية تالية متاحة بناءً على نتائجك' } });
          return;
        }
        nextCaseId = resolution.target_case_id;
      }
      const globalMemory = engineSnapshot.globalState;
      const history = [...session.caseHistory, session.currentCaseId!];

      try {
        const { caseDefinition, blueprintConfig } = await loadRegisteredCaseResources(nextCaseId);
        
        // Restart session atomically with global memory and history
        engineHost.safeStartGame(roomId, currentRoom.players.size === 1, caseDefinition, blueprintConfig, history, globalMemory);

        roomManager.setPhase(roomId, 'investigating');
        roomManager.setCaseInfo(roomId, nextCaseId, caseDefinition.title || 'القضية');

        const updatedRoom = roomManager.getRoom(roomId)!;
        const roomInfo = roomManager.toRoomInfo(updatedRoom);

        // Send NEXT_CASE_LOADED per player with filtered snapshot
        for (const [pid, player] of updatedRoom.players) {
          const filteredSnapshot = engineHost.getFilteredSnapshot(roomId, updatedRoom, player);
          if (filteredSnapshot) {
            sendToPlayer(pid, {
              type: 'NEXT_CASE_LOADED',
              payload: { 
                room: roomInfo, 
                caseTitle: caseDefinition.title || 'القضية', 
                snapshot: filteredSnapshot,
                caseDefinition 
              }
            });
          }
        }
      } catch (err) {
        console.error('[Server] Failed to load next case:', err);
        sendToClient(ws, { type: 'ERROR', payload: { code: 'LOAD_FAILED', message: 'فشل تحميل القضية التالية' } });
      }
      break;
    }

    case 'SAVE_GAME': {
      // Handled automatically internally mostly, but if manual requested:
      sendToClient(ws, { type: 'SAVE_CONFIRMED', payload: { timestamp: Date.now() } });
      break;
    }

    case 'BOARD_UPDATE': {
      engineHost.updateBoard(msg.payload.roomId, msg.payload.nodes, msg.payload.links);
      const playerId = wsToPlayer.get(ws);
      broadcastToRoom(msg.payload.roomId, {
        type: 'BOARD_SYNC',
        payload: { nodes: msg.payload.nodes, links: msg.payload.links },
      }, playerId);
      break;
    }

    case 'CLOSE_ROOM': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const room = roomManager.getRoom(msg.payload.roomId);
      if (!room || room.hostPlayerId !== playerId) {
        sendToClient(ws, { type: 'ERROR', payload: { code: 'UNAUTHORIZED', message: 'فقط المضيف يمكنه إغلاق الغرفة' } });
        return;
      }

      broadcastToRoomAll(msg.payload.roomId, { type: 'ROOM_CLOSED', payload: { roomId: msg.payload.roomId } });
      roomManager.closeRoom(msg.payload.roomId);
      engineHost.removeSession(msg.payload.roomId);
      broadcastToLobby();
      break;
    }

    case 'REQUEST_HINT': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const room = roomManager.getRoom(msg.payload.roomId);
      if (!room) return;

      const session = engineHost.getSession(msg.payload.roomId);
      if (!session || !session.caseDefinition) return;

      const hintRequests = engineHost.submitHintRequest(msg.payload.roomId, playerId);
      const totalPlayers = room.players.size;

      broadcastToRoomAll(msg.payload.roomId, {
        type: 'CONSENSUS_UPDATE',
        payload: {
          roomId: msg.payload.roomId,
          hintRequests,
          solutionRequests: session.solutionRequests ? Array.from(session.solutionRequests) : []
        }
      });

      if (engineHost.checkConsensus(msg.payload.roomId, totalPlayers, 'hint')) {
        const result = engineHost.processAction(msg.payload.roomId, { 
          type: PLAYER_ACTION_TYPE.REQUEST_PHS
        });

        if (result?.accepted) {
          const phsEvent = result.emittedEvents.find(e => e.event_name === 'EVENT_PHS_HINT_REVEALED');
          const hintPayload = phsEvent ? JSON.parse(phsEvent.result) : null;
          
          broadcastToRoomAll(msg.payload.roomId, {
            type: 'HINT_REVEALED',
            payload: { 
              hint: hintPayload?.payload?.text || 'لا توجد تلميحات متاحة حالياً.', 
              phs_hint: hintPayload 
            },
          });

          // Broadcast per-player filtered snapshots for PHS state update
          broadcastSnapshots(msg.payload.roomId);
        }
        
        session.hintRequests.clear();
      }
      break;
    }

    case 'REQUEST_SOLUTION': {
      const playerId = wsToPlayer.get(ws);
      if (!playerId) return;
      const room = roomManager.getRoom(msg.payload.roomId);
      if (!room) return;

      const session = engineHost.getSession(msg.payload.roomId);
      if (!session || !session.caseDefinition) return;

      const solutionRequests = engineHost.submitSolutionRequest(msg.payload.roomId, playerId);
      const totalPlayers = room.players.size;

      broadcastToRoomAll(msg.payload.roomId, {
        type: 'CONSENSUS_UPDATE',
        payload: {
          roomId: msg.payload.roomId,
          hintRequests: session.hintRequests ? Array.from(session.hintRequests) : [],
          solutionRequests
        }
      });

      if (engineHost.checkConsensus(msg.payload.roomId, totalPlayers, 'solution')) {
        const solution = session.caseDefinition.solution;
        if (solution) {
          broadcastToRoomAll(msg.payload.roomId, {
            type: 'SOLUTION_REVEALED',
            payload: { solution }
          });
          session.solutionRequests.clear();
        }
      }
      break;
    }

    case 'JOIN_LOBBY': {
      registerPlayer(ws, msg.payload.playerId);
      lobbyClients.set(ws, msg.payload.playerId);
      const allRooms = roomManager.listRooms();
      const activeRooms = roomManager.listActiveRoomsForPlayer(msg.payload.playerId);
      sendToClient(ws, { type: 'LOBBY_UPDATE', payload: { allRooms, activeRooms } });
      break;
    }

    case 'LEAVE_LOBBY': {
      lobbyClients.delete(ws);
      break;
    }
  }
}

export function handlePlayerDisconnect(ws: WebSocket): void {
  const playerId = wsToPlayer.get(ws);
  if (playerId) {
    const roomId = playerToRoom.get(playerId);
    wsToPlayer.delete(ws);
    playerToWs.delete(playerId);
    lobbyClients.delete(ws);

    if (roomId) {
      const room = roomManager.getRoom(roomId);
      
      if (room && room.hostPlayerId === playerId) {
        console.log(`[Host Disconnect] Host ${playerId} disconnected from room ${roomId}. Waiting for reconnect (60s)...`);
        
        // Notify all players that host is reconnecting
        broadcastToRoomAll(roomId, {
          type: 'NOTIFICATION',
          payload: {
            message: 'انقطع اتصال المضيف. بانتظار عودته للدراسة (60 ثانية)...',
            type: 'warning',
          },
        });
        
        // 60 seconds grace period for Host
        const timeout = setTimeout(() => {
          console.log(`[Host Timeout] Host ${playerId} failed to reconnect. Closing room ${roomId}.`);
          broadcastToRoomAll(roomId, {
            type: 'HOST_DISCONNECTED',
            payload: {
              roomId,
              message: 'غادر المضيف الغرفة بشكل نهائي. تم إغلاق الجلسة.',
            },
          });
          
          setTimeout(() => {
            broadcastToRoomAll(roomId, { type: 'ROOM_CLOSED', payload: { roomId } });
            roomManager.closeRoom(roomId);
            engineHost.removeSession(roomId);
            broadcastToLobby();
          }, 2000);
          
          playerToRoom.delete(playerId);
        }, 60000);
        
        disconnectTimeouts.set(playerId, timeout);
        return;
      }
      
      // Normal player disconnect - 30 seconds grace period
      const timeout = setTimeout(() => {
        handlePlayerLeaveRoom(playerId, roomId);
        disconnectTimeouts.delete(playerId);
      }, 30000);
      disconnectTimeouts.set(playerId, timeout);
    }
  }
}

function handlePlayerLeaveRoom(playerId: string, roomId: string): void {
  const room = roomManager.leaveRoom(roomId, playerId);
  playerToRoom.delete(playerId);
  if (room) {
    broadcastToRoomAll(roomId, { type: 'PLAYER_LEFT', payload: { playerId, room: roomManager.toRoomInfo(room) } });
    broadcastToLobby();
  } else {
    engineHost.removeSession(roomId);
    broadcastToLobby();
  }
}

async function handleStartGame(roomId: string, playerId: string): Promise<void> {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  if (room.hostPlayerId !== playerId && !engineHost.getSession(roomId)?.isSolo) return;

  try {
    const caseId = room.caseId || 'case01';
    const { caseDefinition, blueprintConfig } = await loadRegisteredCaseResources(caseId);

    // Check if recovery is possible
    const existingSession = engineHost.restoreSession(roomId, caseDefinition, blueprintConfig, engineHost.getSession(roomId)?.isSolo || false);
    
    if (!existingSession) {
        engineHost.startGame(roomId, caseDefinition, blueprintConfig);
    }
    
    roomManager.setPhase(roomId, 'investigating');
    roomManager.setCaseInfo(roomId, caseId, caseDefinition.title || 'القضية');

    const updatedRoom = roomManager.getRoom(roomId)!;
    const roomInfo = roomManager.toRoomInfo(updatedRoom);
    
    for (const [pid, player] of updatedRoom.players) {
      const filteredSnapshot = engineHost.getFilteredSnapshot(roomId, updatedRoom, player);
      if (filteredSnapshot) {
        sendToPlayer(pid, { 
          type: 'GAME_STARTED', 
          payload: { room: roomInfo, snapshot: filteredSnapshot, caseDefinition } 
        });
      }
    }
  } catch (err) {
    console.error('[Server] Failed to start game:', err);
    broadcastToRoomAll(roomId, {
      type: 'NOTIFICATION',
      payload: { message: 'فشل في بدء اللعبة', type: 'error' },
    });
  }
}

function handleShareEvidence(fromPlayerId: string, roomId: string, evidenceId: string, targetPlayerId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  const sender = room.players.get(fromPlayerId);
  if (!sender) return;

  const session = engineHost.getSession(roomId);
  const evidenceTitle = session?.caseDefinition?.evidence_list.find(e => e.evidence_id === evidenceId)?.title ?? evidenceId;

  const msg: ServerMessage = {
    type: 'EVIDENCE_SHARED',
    payload: {
      fromPlayer: fromPlayerId,
      fromName: sender.name,
      evidenceId,
      evidenceTitle,
    },
  };

  if (targetPlayerId === 'all') {
    broadcastToRoom(roomId, msg, fromPlayerId);
  } else {
    sendToPlayer(targetPlayerId, msg);
  }
}

function handleClosureRequest(playerId: string, roomId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  const player = room.players.get(playerId);
  if (!player) return;

  const session = engineHost.getSession(roomId);
  if (!session) return;

  if (session.isSolo) {
    roomManager.setPhase(roomId, 'tribunal');
    broadcastToRoomAll(roomId, { type: 'TRIBUNAL_STARTED', payload: { room: roomManager.toRoomInfo(room) } });
    return;
  }

  broadcastToRoomAll(roomId, {
    type: 'CLOSURE_REQUESTED',
    payload: { requestedBy: playerId, requestedByName: player.name },
  });

  const playerIds = Array.from(room.players.keys());
  engineHost.startTribunal(roomId, playerId, playerIds);
}

function handleTribunalVote(playerId: string, roomId: string, approve: boolean): void {
  const votes = engineHost.submitVote(roomId, playerId, approve);
  broadcastToRoomAll(roomId, { type: 'TRIBUNAL_VOTE_UPDATE', payload: { votes } });

  const check = engineHost.checkTribunalComplete(roomId);
  if (check.complete) {
    if (check.approved) {
      roomManager.setPhase(roomId, 'tribunal');
      const room = roomManager.getRoom(roomId);
      if (room) {
        broadcastToRoomAll(roomId, { type: 'TRIBUNAL_STARTED', payload: { room: roomManager.toRoomInfo(room) } });
      }
    } else {
      engineHost.endTribunal(roomId);
      broadcastToRoomAll(roomId, {
        type: 'NOTIFICATION',
        payload: { message: 'تم رفض طلب إغلاق القضية بأغلبية الأصوات', type: 'warning' },
      });
    }
  }
}

function handleTribunalSubmit(playerId: string, roomId: string, attempt: any): void {
  const room = roomManager.getRoom(roomId);
  
  if (!room || !room.players.has(playerId)) {
    sendToPlayer(playerId, { type: 'ERROR', payload: { code: 'UNAUTHORIZED', message: 'غير مصرح لك بتنفيذ هذا الإجراء' } });
    return;
  }

  if (room.phase !== 'tribunal') {
    sendToPlayer(playerId, { type: 'ERROR', payload: { code: 'INVALID_PHASE', message: 'يمكن تقديم الاتهام فقط أثناء مرحلة المحاكمة' } });
    return;
  }

  if (!engineHost.canSubmitTribunal(roomId)) {
    sendToPlayer(playerId, { type: 'ERROR', payload: { code: 'VOTING_INCOMPLETE', message: 'لم تكتمل عملية التصويت بعد' } });
    return;
  }

  const result = engineHost.processAction(roomId, {
    type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
    attempt,
  });

  if (!result) return;

  const snapshot = engineHost.getRawSnapshot(roomId);
  const closureDecision = snapshot?.lastClosureDecision;

  if (closureDecision) {
    broadcastToRoomAll(roomId, {
      type: 'CLOSURE_RESULT',
      payload: {
        accepted: closureDecision.accepted,
        mode: closureDecision.mode,
        reason_codes: closureDecision.reason_codes,
        granted_flags: closureDecision.granted_flags,
      },
    });

    const session = engineHost.getSession(roomId);
    if (!session) return;

    if (closureDecision.accepted) {
      roomManager.setPhase(roomId, 'results');
    } else {
      if (!session.isSolo) {
        roomManager.setPhase(roomId, 'investigating');
      }
    }

    engineHost.endTribunal(roomId);

    const room = roomManager.getRoom(roomId);
    if (room) {
      broadcastToRoomAll(roomId, { type: 'ROOM_UPDATED', payload: { room: roomManager.toRoomInfo(room) } });
    }
  }
}
