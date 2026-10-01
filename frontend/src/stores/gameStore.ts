// ── Game Store ────────────────────────────────────────────────────────
// Central game state using zustand. Holds room state, engine snapshot,
// chat messages, notifications. Updated via WebSocket messages.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { wsService } from '../services/websocket';
import type { RuntimeSnapshot, RuntimeCaseDefinition, PlayerAction, ClosureDecision, ClosureAttempt, PhsHint, DomainEvent } from '../../../runtime/src/types.js';
import { PLAYER_ACTION_TYPE } from '../../../runtime/src/engine/constants.js';
import { parseCaseNumber } from '../utils/caseProgress';

// Window data type for active windows
export interface WindowData {
  id: string;
  title: string;
  type: 'inbox' | 'board' | 'database' | 'evidence' | 'timeline' | 'workbench' | 'explorer' | 'warrant' | 'interrogation' | 'phs' | 'chat';
  payload?: any;
}

// Auto-save helper function
function autoSaveState(roomId: string, snapshot: RuntimeSnapshot | null) {
  if (!roomId || !snapshot) return;
  
  try {
    const saveData = {
      roomId,
      timestamp: Date.now(),
      evidenceStates: snapshot.evidenceStates,
      verifiedFacts: snapshot.verifiedFacts,
      eventTrace: snapshot.eventTrace,
      globalState: snapshot.globalState,
    };
    
    localStorage.setItem(`autosave_${roomId}`, JSON.stringify(saveData));
    console.log('[AutoSave] State saved for room:', roomId);
  } catch (error) {
    console.error('[AutoSave] Failed to save state:', error);
  }
}

// Re-export useful types from protocol
export type Specialty = 'timeline' | 'forensics' | 'behavioral';
export type GamePhase = 'lobby' | 'waiting' | 'investigating' | 'tribunal' | 'results' | 'shadow_message';

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

export interface ChatMessage {
  senderId: string;
  senderName: string;
  specialty: Specialty | null;
  message: string;
  timestamp: number;
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: number;
  evidenceId?: string;
  evidenceTitle?: string;
  fromName?: string;
}

export interface CaseSolution {
  culprit: string;
  motive: string;
  method: string;
  explanation: string;
}

export interface ArchivedCaseRecord {
  caseId: string;
  caseTitle: string;
  caseNumber: number | null;
  caseDefinition: RuntimeCaseDefinition;
  snapshot: RuntimeSnapshot;
  closureDecision: ClosureDecision | null;
  archivedAt: number;
}

export interface InboxMsg {
  id: string;
  sender: 'Chief Desk' | 'Forensics Hub' | 'player' | 'system';
  senderName: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface DialogueOption {
  id: string;
  text: string;
  response: string;
  nextOptions?: DialogueOption[];
  triggerActionId?: string;
  effects?: {
    unlock_evidence_ids?: string[];
    trust_modifier?: number;
    objective_hint?: string;
    requires_verified_evidence?: string[];
  };
  unlock_condition?: {
    requires_verified_evidence?: string[];
    requires_discovered_evidence?: string[];
    minimum_trust?: number;
    minimum_case_number?: number;
    hidden_by_default?: boolean;
  };
  category?: 'initial' | 'evidence_request' | 'investigation' | 'forensics' | 'aggressive';
  parent_category_id?: string;
}

const CASE_ARCHIVE_STORAGE_KEY = 'investigation-case-archive';

function readStoredCaseArchive(): { roomId: string | null; archives: ArchivedCaseRecord[] } {
  if (typeof window === 'undefined') {
    return { roomId: null, archives: [] };
  }

  try {
    const raw = window.sessionStorage.getItem(CASE_ARCHIVE_STORAGE_KEY);
    if (!raw) {
      return { roomId: null, archives: [] };
    }

    const parsed = JSON.parse(raw) as { roomId?: string | null; archives?: ArchivedCaseRecord[] };
    return {
      roomId: parsed.roomId ?? null,
      archives: parsed.archives ?? [],
    };
  } catch {
    return { roomId: null, archives: [] };
  }
}

function writeStoredCaseArchive(roomId: string | null, archives: ArchivedCaseRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    CASE_ARCHIVE_STORAGE_KEY,
    JSON.stringify({ roomId, archives }),
  );
}

function resolveArchiveForRoom(roomId: string): ArchivedCaseRecord[] {
  const stored = readStoredCaseArchive();
  return stored.roomId === roomId ? stored.archives : [];
}

interface BoardNode {
  id: string;
  label: string;
  type: 'evidence' | 'character' | 'note';
  specialty: Specialty | null;
  x: number;
  y: number;
  note?: string;
}

interface BoardLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

interface GameState {
  // Connection
  connected: boolean;
  mode: 'solo' | 'multiplayer' | null;

  // Room
  currentRoom: RoomInfo | null;
  playerId: string;

  // Game
  engineSnapshot: RuntimeSnapshot | null;
  caseDefinition: RuntimeCaseDefinition | null;
  caseArchive: ArchivedCaseRecord[];

  // Chat
  chatMessages: ChatMessage[];

  // Notifications
  notifications: GameNotification[];

  // Tribunal
  tribunalVotes: Record<string, boolean | null>;
  closureResult: ClosureDecision | null;

  // Board
  boardNodes: BoardNode[];
  boardLinks: BoardLink[];
  activeWindows: WindowData[];

  // Shadow
  shadowMessage: string | null;

  // Save
  lastSaveTime: number | null;
  isSaving: boolean;

  // Next Case Transition
  nextCaseLoading: boolean;
  tribunalSubmitting: boolean;

  // Actions
  setMode: (mode: 'solo' | 'multiplayer') => void;
  setPlayerId: (id: string) => void;
  setRoom: (room: RoomInfo | null) => void;
  setSnapshot: (snapshot: RuntimeSnapshot) => void;
  setCaseDefinition: (def: RuntimeCaseDefinition) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addNotification: (notif: Omit<GameNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setTribunalVotes: (votes: Record<string, boolean | null>) => void;
  setClosureResult: (result: ClosureDecision) => void;
  setShadowMessage: (msg: string | null) => void;
  setBoard: (nodes: BoardNode[], links: BoardLink[]) => void;
  setActiveWindows: (windows: WindowData[]) => void;
  setSaveState: (saving: boolean, time?: number) => void;
  reset: () => void;

  // WebSocket actions
  sendAction: (action: PlayerAction) => void;
  sendChat: (message: string) => void;
  shareEvidence: (evidenceId: string, targetPlayerId: string) => void;
  requestClosure: () => void;
  submitTribunalVote: (approve: boolean) => void;
  submitTribunalAccusation: (attempt: ClosureAttempt) => void;
  requestNextCase: () => void;
  dismissShadow: () => void;
  selectSpecialty: (specialty: Specialty) => void;
  updateBoard: (nodes: BoardNode[], links: BoardLink[]) => void;
  leaveRoom: () => void;
  closeRoom: () => void;
  requestHint: () => void;
  requestSolution: () => void;
  sendEvidenceToLab: (evidenceId: string) => void;
  verifyTimeline: (sequence: string[]) => void;
  joinRoom: (roomId: string, player: PlayerInfo) => void;
  hintRequests: string[];
  solutionRequests: string[];
  revealedHint: string | null;
  revealedSolution: CaseSolution | null;
  revealedPhsHint: PhsHint | null;

  // Inbox persistence
  inboxMessages: Record<string, InboxMsg[]>; // caseId -> messages
  inboxOptions: Record<string, DialogueOption[] | null>; // caseId -> options
  inboxSentOptionIds: Record<string, string[]>; // caseId -> sentOptionIds
  setInboxMessages: (caseId: string, messages: InboxMsg[]) => void;
  setInboxOptions: (caseId: string, options: DialogueOption[] | null) => void;
  addInboxSentOptionId: (caseId: string, optionId: string) => void;

  phsHintHistory: PhsHint[];
  activePhsHintIndex: number;
  navigatePhsHint: (direction: 'prev' | 'next') => void;
  openedEvidenceIds: string[]; 
  markEvidenceOpened: (id: string) => void;
}

const initialState = {
  connected: false,
  mode: null as 'solo' | 'multiplayer' | null,
  currentRoom: null as RoomInfo | null,
  playerId: '',
  engineSnapshot: null,
  caseDefinition: null,
  caseArchive: [] as ArchivedCaseRecord[],
  chatMessages: [] as ChatMessage[],
  notifications: [] as GameNotification[],
  tribunalVotes: {} as Record<string, boolean | null>,
  closureResult: null,
  boardNodes: [] as BoardNode[],
  boardLinks: [] as BoardLink[],
  activeWindows: [] as WindowData[],
  shadowMessage: null as string | null,
  lastSaveTime: null as number | null,
  isSaving: false,
  nextCaseLoading: false,
  tribunalSubmitting: false,
  hintRequests: [] as string[],
  solutionRequests: [] as string[],
  revealedHint: null as string | null,
  revealedSolution: null as CaseSolution | null,
  revealedPhsHint: null as PhsHint | null,
  phsHintHistory: [] as PhsHint[],
  inboxMessages: {} as Record<string, InboxMsg[]>,
  inboxOptions: {} as Record<string, DialogueOption[] | null>,
  inboxSentOptionIds: {} as Record<string, string[]>,
  activePhsHintIndex: -1,
  openedEvidenceIds: [] as string[],
};

// Persistence keys
const STORAGE_KEYS = {
  ROOM_ID: 'investigation_active_room_id',
  PLAYER_ID: 'investigation_active_player_id',
  PLAYER_NAME: 'investigation_active_player_name',
  PLAYER_AVATAR: 'investigation_active_player_avatar',
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMode: (mode) => set({ mode }),
      setPlayerId: (id) => set({ playerId: id }),
      setRoom: (room) => set({ currentRoom: room }),
      setSnapshot: (snapshot) => set((state) => {
        if (state.engineSnapshot && snapshot && state.engineSnapshot.currentTick === snapshot.currentTick) {
          return state;
        }
        return { engineSnapshot: snapshot };
      }),
      setCaseDefinition: (def) => set({ caseDefinition: def }),

      addChatMessage: (msg) => set((state) => {
        const isDuplicate = state.chatMessages.some(m => m.timestamp === msg.timestamp && m.senderId === msg.senderId && m.message === msg.message);
        if (isDuplicate) return state;
        return { chatMessages: [...state.chatMessages, msg] };
      }),

      addNotification: (notif) => set((state) => ({
        notifications: (() => {
          const now = Date.now();
          const duplicateWindowMs = 1500;
          const hasRecentDuplicate = state.notifications.some((existing) =>
            existing.type === notif.type
            && existing.message === notif.message
            && existing.evidenceId === notif.evidenceId
            && existing.evidenceTitle === notif.evidenceTitle
            && existing.fromName === notif.fromName
            && (now - existing.timestamp) < duplicateWindowMs,
          );

          if (hasRecentDuplicate) {
            return state.notifications;
          }

          return [
            ...state.notifications,
            { ...notif, id: `notif-${now}-${Math.random().toString(36).slice(2)}`, timestamp: now },
          ];
        })(),
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      setTribunalVotes: (votes) => set({ tribunalVotes: votes }),
      setClosureResult: (result) => set({ closureResult: result }),
      setShadowMessage: (msg) => set({ shadowMessage: msg }),
      setBoard: (nodes, links) => set({ boardNodes: nodes, boardLinks: links }),
      setActiveWindows: (windows) => set({ activeWindows: windows }),
      setSaveState: (saving, time) => set({ isSaving: saving, lastSaveTime: time ?? null }),
      
      markEvidenceOpened: (id: string) => set((state) => {
        if (state.openedEvidenceIds.includes(id)) return state;
        return { openedEvidenceIds: [...state.openedEvidenceIds, id] };
      }),

      setInboxMessages: (caseId, messages) => set((state) => ({
        inboxMessages: { ...state.inboxMessages, [caseId]: messages }
      })),
      setInboxOptions: (caseId, options) => set((state) => ({
        inboxOptions: { ...state.inboxOptions, [caseId]: options }
      })),
      addInboxSentOptionId: (caseId, optionId) => set((state) => {
        const current = state.inboxSentOptionIds[caseId] || [];
        if (current.includes(optionId)) return state;
        return {
          inboxSentOptionIds: { ...state.inboxSentOptionIds, [caseId]: [...current, optionId] }
        };
      }),

      reset: () => set(initialState),

      // ── WebSocket Actions ───────────────────────────────────────────────

      sendAction: (action) => {
        const { currentRoom, engineSnapshot } = get();
        if (!currentRoom) return;
        wsService.send('GAME_ACTION', { roomId: currentRoom.roomId, action });
        autoSaveState(currentRoom.roomId, engineSnapshot);
      },

      sendChat: (message) => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('CHAT_MESSAGE', { roomId: currentRoom.roomId, message });
      },

      shareEvidence: (evidenceId, targetPlayerId) => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('SHARE_EVIDENCE', { roomId: currentRoom.roomId, evidenceId, targetPlayerId });
      },

      requestClosure: () => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('REQUEST_CLOSURE', { roomId: currentRoom.roomId });
      },

      submitTribunalVote: (approve) => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('TRIBUNAL_VOTE', { roomId: currentRoom.roomId, approve });
      },

      submitTribunalAccusation: (attempt) => {
        const { currentRoom, tribunalSubmitting } = get();
        if (!currentRoom || tribunalSubmitting || currentRoom.phase !== 'tribunal') return;
        set({ tribunalSubmitting: true });
        wsService.send('TRIBUNAL_SUBMIT', { roomId: currentRoom.roomId, attempt });
      },

      requestNextCase: () => {
        const { currentRoom, nextCaseLoading } = get();
        if (!currentRoom || nextCaseLoading || currentRoom.phase !== 'results') return;
        set({ nextCaseLoading: true });
        wsService.send('NEXT_CASE', { roomId: currentRoom.roomId });
      },

      dismissShadow: () => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('DISMISS_SHADOW', { roomId: currentRoom.roomId });
        set({ shadowMessage: null });
      },

      updateBoard: (nodes, links) => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        set({ boardNodes: nodes, boardLinks: links });
        wsService.send('BOARD_UPDATE', { roomId: currentRoom.roomId, nodes, links });
      },

      selectSpecialty: (specialty) => {
        const { currentRoom } = get();
        if (!currentRoom) return;
        wsService.send('SELECT_SPECIALTY', { roomId: currentRoom.roomId, specialty });
      },

      leaveRoom: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          wsService.send('LEAVE_ROOM', { roomId: currentRoom.roomId });
        }
        localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
        writeStoredCaseArchive(null, []);
        set({
          ...initialState,
          currentRoom: null,
          engineSnapshot: null,
          caseDefinition: null,
        });
      },

      closeRoom: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          wsService.send('CLOSE_ROOM', { roomId: currentRoom.roomId });
        }
      },

      requestHint: () => {
        get().sendAction({ type: PLAYER_ACTION_TYPE.REQUEST_PHS });
      },

      requestSolution: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          // If the engine expects a top-level message, keep it but check if it should be an action
          wsService.send('REQUEST_SOLUTION', { roomId: currentRoom.roomId });
        }
      },
      
      sendEvidenceToLab: (evidenceId: string) => {
        const { currentRoom } = get();
        if (currentRoom) {
          wsService.send('GAME_ACTION', { 
            roomId: currentRoom.roomId, 
            action: { type: 'send_to_lab', source_ref: evidenceId } 
          });
        }
      },

      verifyTimeline: (sequence: string[]) => {
        const { currentRoom } = get();
        if (currentRoom) {
          wsService.send('GAME_ACTION', { 
            roomId: currentRoom.roomId, 
            action: { type: 'verify_timeline_sequence', sequence } 
          });
        }
      },

      joinRoom: (roomId, player) => {
        set({ playerId: player.playerId });
        wsService.send('JOIN_ROOM', { roomId, player });
      },

      navigatePhsHint: (direction) => {
        const { phsHintHistory, activePhsHintIndex } = get();
        if (phsHintHistory.length === 0) return;
        let newIndex = activePhsHintIndex;
        if (direction === 'prev' && activePhsHintIndex > 0) {
          newIndex = activePhsHintIndex - 1;
        } else if (direction === 'next' && activePhsHintIndex < phsHintHistory.length - 1) {
          newIndex = activePhsHintIndex + 1;
        }
        set({ activePhsHintIndex: newIndex });
      },
    }),
    {
      name: 'investigation-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chatMessages: state.chatMessages,
        notifications: state.notifications,
        inboxMessages: state.inboxMessages,
        inboxOptions: state.inboxOptions,
        inboxSentOptionIds: state.inboxSentOptionIds,
        phsHintHistory: state.phsHintHistory,
        openedEvidenceIds: state.openedEvidenceIds,
        caseArchive: state.caseArchive,
        boardNodes: state.boardNodes,
        boardLinks: state.boardLinks,
        activeWindows: state.activeWindows,
      }),
    }
  )
);

// ── WebSocket Event Wiring ────────────────────────────────────────────
// Call this once when the app initializes to bind WS events to the store.
// Returns a cleanup function to remove all listeners.

export function initGameStoreListeners(): () => void {
  const store = useGameStore;
  const unsubs: Array<() => void> = [];

  const addListener = <T>(event: string, handler: (payload: T) => void) => {
    const unsub = wsService.on(event, handler);
    unsubs.push(unsub);
    return unsub;
  };

  const archiveCurrentCase = () => {
    const currentState = store.getState();
    if (!currentState.caseDefinition || !currentState.engineSnapshot) {
      return;
    }

    const caseId = currentState.caseDefinition.case_id;
    if (currentState.caseArchive.some((entry) => entry.caseId === caseId)) {
      return;
    }

    const record: ArchivedCaseRecord = {
      caseId,
      caseTitle: currentState.caseDefinition.title,
      caseNumber: parseCaseNumber(caseId),
      caseDefinition: currentState.caseDefinition,
      snapshot: currentState.engineSnapshot,
      closureDecision: currentState.closureResult ?? currentState.engineSnapshot.lastClosureDecision ?? null,
      archivedAt: Date.now(),
    };

    const nextArchive = [...currentState.caseArchive, record].sort((left, right) => {
      const leftNumber = left.caseNumber ?? Number.MAX_SAFE_INTEGER;
      const rightNumber = right.caseNumber ?? Number.MAX_SAFE_INTEGER;
      return leftNumber - rightNumber;
    });

    writeStoredCaseArchive(currentState.currentRoom?.roomId ?? null, nextArchive);
    store.setState({ caseArchive: nextArchive });
  };

  addListener('_connected', () => {
    store.setState({ connected: true });
  });

  addListener('_disconnected', () => {
    store.setState({ connected: false, nextCaseLoading: false, tribunalSubmitting: false });
  });

  addListener('ROOM_CREATED', (payload: { room: RoomInfo }) => {
    localStorage.setItem(STORAGE_KEYS.ROOM_ID, payload.room.roomId);
    localStorage.setItem(STORAGE_KEYS.PLAYER_ID, store.getState().playerId);
    
    writeStoredCaseArchive(payload.room.roomId, []);
    store.setState({
      currentRoom: payload.room,
      mode: payload.room.isSolo ? 'solo' : 'multiplayer',
      engineSnapshot: null,
      caseDefinition: null,
      caseArchive: [],
      chatMessages: [],
      notifications: [],
      boardNodes: [],
      boardLinks: [],
      activeWindows: [],
      closureResult: null,
      tribunalVotes: {},
      shadowMessage: null,
      nextCaseLoading: false,
      tribunalSubmitting: false,
    });
  });

  addListener('ROOM_JOINED', (payload: { room: RoomInfo }) => {
    localStorage.setItem(STORAGE_KEYS.ROOM_ID, payload.room.roomId);
    localStorage.setItem(STORAGE_KEYS.PLAYER_ID, store.getState().playerId);

    store.setState({
      currentRoom: payload.room,
      mode: payload.room.isSolo ? 'solo' : 'multiplayer',
      engineSnapshot: null,
      caseDefinition: null,
      caseArchive: resolveArchiveForRoom(payload.room.roomId),
      chatMessages: [],
      notifications: [],
      boardNodes: [],
      boardLinks: [],
      activeWindows: [],
      closureResult: null,
      tribunalVotes: {},
      shadowMessage: null,
      nextCaseLoading: false,
      tribunalSubmitting: false,
    });
  });

  addListener('ROOM_UPDATED', (payload: { room: RoomInfo }) => {
    const currentState = store.getState();
    store.setState({
      currentRoom: payload.room,
      mode: payload.room.isSolo ? 'solo' : (currentState.mode || 'multiplayer')
    });
  });

  addListener('PLAYER_JOINED', (payload: { player: PlayerInfo; room: RoomInfo }) => {
    store.setState({ currentRoom: payload.room });
    store.getState().addNotification({
      message: `${payload.player.name} انضم للغرفة`,
      type: 'info',
    });
  });

  addListener('PLAYER_LEFT', (payload: { playerId: string; room: RoomInfo }) => {
    store.setState({ currentRoom: payload.room });
  });

  addListener('ROOM_CLOSED', () => {
    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    writeStoredCaseArchive(null, []);
    store.getState().reset();
    store.getState().addNotification({
      message: 'تم إغلاق الغرفة من قبل المضيف',
      type: 'warning',
    });
  });

  addListener('HOST_DISCONNECTED', (payload: { roomId: string; message: string }) => {
    console.log('[Host Disconnected] Host left the room:', payload.roomId);
    store.getState().addNotification({
      message: payload.message || 'غادر المضيف الغرفة. سيتم إغلاق الغرفة قريباً.',
      type: 'warning',
    });
    
    // Auto-redirect to lobby after 3 seconds
    setTimeout(() => {
      writeStoredCaseArchive(null, []);
      store.getState().reset();
      window.location.href = '/lobby';
    }, 3000);
  });

  addListener('GAME_STARTED', (payload: { room: RoomInfo; snapshot: RuntimeSnapshot; caseDefinition?: RuntimeCaseDefinition }) => {
    store.setState({
      currentRoom: payload.room,
      mode: payload.room.isSolo ? 'solo' : (store.getState().mode || 'multiplayer'),
      engineSnapshot: payload.snapshot,
      caseArchive: resolveArchiveForRoom(payload.room.roomId),
      closureResult: null,
      tribunalVotes: {},
      tribunalSubmitting: false,
      nextCaseLoading: false,
      boardNodes: [],
      boardLinks: [],
      activeWindows: [],
      ...(payload.caseDefinition ? { caseDefinition: payload.caseDefinition } : {})
    });
    
    // Clear the auto-open flag for new games
    try {
      localStorage.removeItem('hasAutoOpenedInbox');
    } catch (e) {
      console.error('[GAME_STARTED] Failed to clear hasAutoOpenedInbox:', e);
    }
  });

  let lastProcessedTick = 0;

  addListener('SNAPSHOT_UPDATE', (payload: { snapshot: RuntimeSnapshot }) => {
    const prevState = store.getState();
    store.setState({ engineSnapshot: payload.snapshot });

    // Detection logic for new Lab/Investigation events to trigger automated notifications 
    const newEvents = payload.snapshot.eventTrace.filter(ev => ev.tick > lastProcessedTick);
    if (newEvents.length > 0) {
      newEvents.forEach(ev => {
        if (ev.event_name === 'EVENT_EVIDENCE_VERIFIED') {
          const caseId = prevState.caseDefinition?.case_id || 'unknown';
          const evidence = prevState.caseDefinition?.evidence_list.find(e => e.evidence_id === ev.source_ref);
          const title = evidence?.title || ev.source_ref;
          
          // 1. Toast Notification
          store.getState().addNotification({
            message: `🔬 المختبر الجنائي: تمت مطابقة العينة [${title}] بنجاح. فحص النتائج متاح الآن.`,
            type: 'success',
            evidenceId: ev.source_ref,
            evidenceTitle: title
          });

          // 2. Immersive Audio Feedback
          try {
            const chime = new Audio('https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3');
            chime.volume = 0.4;
            chime.play().catch(() => {}); // Catch prevents console errors if user hasn't clicked yet
          } catch {
            // Audio might be blocked by browser policy until user interaction
          }

          // 3. Dynamic Dialogue Injection: Update Inbox options to reflect new discovery
          const currentInboxOptions = store.getState().inboxOptions[caseId] || [];
          const newDiscoveryOption: DialogueOption = {
            id: `disc-opt-${ev.source_ref}-${ev.tick}`,
            text: `استفسار حول نتائج العينة: [${title}]`,
            response: `تحليل العينة [${title}] يشير لاحتمالية وجود رابط مخفي. ${evidence?.summary ? `تذكر أن ${evidence.summary}` : ''} ابحث عن التقاطعات مع بقية الأدلة لفك اللغز.`,
            category: 'forensics',
            effects: {
              trust_modifier: 2,
              objective_hint: `تحقق من الروابط الجديدة لـ ${title} في لوحة الخيوط`
            }
          };

          // Inject as high priority (at the top if relevant, or just append)
          const updatedOptions = [newDiscoveryOption, ...currentInboxOptions.filter(o => o.id !== newDiscoveryOption.id)].slice(0, 5);
          store.getState().setInboxOptions(caseId, updatedOptions);
        }
      });
      lastProcessedTick = Math.max(...newEvents.map(e => e.tick));
    }
  });

  addListener('CHAT_BROADCAST', (payload: ChatMessage) => {
    store.getState().addChatMessage(payload);
  });

  addListener('EVIDENCE_SHARED', (payload: { fromPlayer: string; fromName: string; evidenceId: string; evidenceTitle: string }) => {
    store.getState().addNotification({
      message: `المحقق ${payload.fromName} شارك معك: ${payload.evidenceTitle}`,
      type: 'info',
      evidenceId: payload.evidenceId,
      evidenceTitle: payload.evidenceTitle,
      fromName: payload.fromName,
    });
  });

  addListener('CLOSURE_REQUESTED', (payload: { requestedBy: string; requestedByName: string }) => {
    store.getState().addNotification({
      message: `${payload.requestedByName} يطلب إغلاق القضية — صوّت الآن`,
      type: 'warning',
    });
  });

  addListener('TRIBUNAL_STARTED', (payload: { room: RoomInfo }) => {
    store.setState({ currentRoom: payload.room, tribunalSubmitting: false });
  });

  addListener('TRIBUNAL_VOTE_UPDATE', (payload: { votes: Record<string, boolean | null> }) => {
    store.setState({ tribunalVotes: payload.votes });
  });

  addListener('CLOSURE_RESULT', (payload: ClosureDecision) => {
    store.setState({ closureResult: payload, tribunalSubmitting: false });
  });

  addListener('NEXT_CASE_LOADED', (payload: { room: RoomInfo; caseTitle: string; snapshot: RuntimeSnapshot; caseDefinition?: RuntimeCaseDefinition }) => {
    archiveCurrentCase();
    store.setState({
      currentRoom: payload.room,
      nextCaseLoading: false,
      closureResult: null,
      tribunalVotes: {},
      tribunalSubmitting: false,
      engineSnapshot: payload.snapshot,
      ...(payload.caseDefinition ? { caseDefinition: payload.caseDefinition } : {})
    });
  });

  addListener('SHADOW_MESSAGE', (payload: { message: string }) => {
    store.setState({ shadowMessage: payload.message });
  });

  addListener('CONSENSUS_UPDATE', (payload: { hintRequests: string[]; solutionRequests: string[] }) => {
    store.setState({
      hintRequests: payload.hintRequests,
      solutionRequests: payload.solutionRequests,
    });
  });

  addListener('EVENT_PHS_HINT_REVEALED', (payload: DomainEvent) => {
    // Engine wraps the hint in a result string
    let phsHint: PhsHint | null = null;
    
    try {
      if (typeof payload.result === 'string') {
        phsHint = JSON.parse(payload.result) as unknown as PhsHint;
      }
    } catch {
      console.error('Failed to parse PHS hint result');
    }
      
    if (!phsHint) return;

    const prevHistory = store.getState().phsHintHistory;
    // Deduplicate
    const last = prevHistory[prevHistory.length - 1];
    const isDuplicate = last && last.level === phsHint.level && last.payload.text === phsHint.payload.text;
    
    if (!isDuplicate) {
      const newHistory = [...prevHistory, phsHint];
      store.setState({ 
        phsHintHistory: newHistory,
        activePhsHintIndex: newHistory.length - 1,
        revealedPhsHint: phsHint
      });
      store.getState().addNotification({
        message: '💡 تلقيت إرشادات جديدة من المكتب الرئيسي.',
        type: 'success',
      });
    }
  });

  addListener('HINT_REVEALED', (payload: { hint: string; phs_hint?: PhsHint }) => {
    const prevHistory = store.getState().phsHintHistory;
    let newHistory = prevHistory;
    if (payload.phs_hint) {
      // Deduplicate: skip if the last entry is identical (guards against double-fire from StrictMode)
      const last = prevHistory[prevHistory.length - 1];
      const isDuplicate = last
        && last.level === payload.phs_hint.level
        && last.payload.text === payload.phs_hint.payload.text;
      if (!isDuplicate) {
        newHistory = [...prevHistory, payload.phs_hint];
      }
    }
    store.setState({ 
      revealedHint: payload.hint,
      revealedPhsHint: payload.phs_hint || null,
      phsHintHistory: newHistory,
      activePhsHintIndex: newHistory.length - 1,
    });
    store.getState().addNotification({
      message: 'تم الكشف عن تلميحات جديدة!',
      type: 'success',
    });
  });

  addListener('SOLUTION_REVEALED', (payload: { solution: CaseSolution }) => {
    store.setState({ revealedSolution: payload.solution });
    store.getState().addNotification({
      message: 'تم الكشف عن حل القضية!',
      type: 'success',
    });
  });

  addListener('SAVE_CONFIRMED', (payload: { timestamp: number }) => {
    store.setState({ isSaving: false, lastSaveTime: payload.timestamp });
  });

  addListener('BOARD_SYNC', (payload: { nodes: BoardNode[]; links: BoardLink[] }) => {
    store.setState({ boardNodes: payload.nodes, boardLinks: payload.links });
  });

  addListener('NOTIFICATION', (payload: { message: string; type: 'info' | 'warning' | 'success' | 'error' }) => {
    store.getState().addNotification(payload);
  });

  addListener('ERROR', (payload: { code: string; message: string }) => {
    store.setState({ nextCaseLoading: false, tribunalSubmitting: false });
    store.getState().addNotification({
      message: payload.message,
      type: 'error',
    });
  });

  // Return cleanup function
  return () => {
    unsubs.forEach(unsub => unsub());
    unsubs.length = 0;
  };
}
