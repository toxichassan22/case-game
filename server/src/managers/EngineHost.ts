import { CoreEngine, createRuntime } from 'runtime/src/engine/runtime.js';
import { buildRuntimeCaseAdapter } from 'runtime/src/engine/adapterBuilder.js';
import type { GlobalGameState, PlayerAction, RuntimeCaseDefinition, RuntimeSnapshot } from 'runtime/src/types.js';
import type { StaticCaseBlueprintConfig } from 'runtime/src/engine/adapterBuilder.js';
import type { BoardNode, BoardLink, PlayerInfo } from 'runtime/src/server/protocol.js';
import { filterSnapshotForPlayer } from './PerspectiveFilter.js';
import { saveManager } from './SaveManager.js';
import type { RoomState } from './RoomManager.js';


const DEFAULT_GLOBAL_STATE: GlobalGameState = {
  globalFlags: [],
  playerProfile: {},
  cognitiveBiasScore: 0,
  trustLevels: {},
  hiddenNarrativeState: {},
  playerBehaviorLog: [],
  trinity_awareness_score: 0,
  vacant_trinity_role: null,
  first_case_closure_route: null,
  route_usage_stats: {
    timeline: 0,
    forensics: 0,
    behavioral: 0,
  },
  inventory_items: [],
  npc_global_memory: {},
};

export interface GameSessionState {
  engine: CoreEngine | null;
  caseDefinition: RuntimeCaseDefinition | null;
  boardNodes: BoardNode[];
  boardLinks: BoardLink[];
  isSolo: boolean;
  currentCaseId: string | null;
  caseHistory: string[];
  globalGameState: GlobalGameState;
  tribunalVotes: Map<string, boolean | null>;
  tribunalActive: boolean;
  closureRequester: string | null;
  shadowMessagePending: string | null;
  hintRequests: Set<string>;
  solutionRequests: Set<string>;
}

export class EngineHost {
  private sessions = new Map<string, GameSessionState>();

  createSession(roomId: string, isSolo: boolean): GameSessionState {
    const session: GameSessionState = {
      engine: null,
      caseDefinition: null,
      boardNodes: [],
      boardLinks: [],
      isSolo,
      currentCaseId: null,
      caseHistory: [],
      globalGameState: DEFAULT_GLOBAL_STATE,
      tribunalVotes: new Map(),
      tribunalActive: false,
      closureRequester: null,
      shadowMessagePending: null,
      hintRequests: new Set(),
      solutionRequests: new Set(),
    };
    this.sessions.set(roomId, session);
    return session;
  }

  getSession(roomId: string): GameSessionState | undefined {
    return this.sessions.get(roomId);
  }

  removeSession(roomId: string): void {
    this.sessions.delete(roomId);
  }

  startGame(
    roomId: string,
    caseDefinition: RuntimeCaseDefinition,
    blueprintConfig: StaticCaseBlueprintConfig,
    caseHistory: string[] = [],
    globalMemory?: GlobalGameState,
  ): RuntimeSnapshot | null {
    const session = this.sessions.get(roomId);
    if (!session) return null;

    const adapter = buildRuntimeCaseAdapter(caseDefinition, blueprintConfig);
    session.engine = createRuntime(adapter, globalMemory);
    session.caseDefinition = caseDefinition;
    session.currentCaseId = caseDefinition.case_id;
    session.caseHistory = caseHistory;
    session.globalGameState = globalMemory || DEFAULT_GLOBAL_STATE;

    const snapshot = session.engine.getSnapshot();
    
    // Initial Save
    saveManager.createSave(roomId, snapshot, snapshot.globalState, { nodes: session.boardNodes, links: session.boardLinks }, session.caseHistory, caseDefinition.case_id);

    return snapshot;
  }

  /**
   * Builds and validates the new runtime BEFORE overwriting the existing session.
   * This ensures that if adapter building fails, the room remains in its previous state.
   */
  safeStartGame(
    roomId: string,
    isSolo: boolean,
    caseDefinition: RuntimeCaseDefinition,
    blueprintConfig: StaticCaseBlueprintConfig,
    caseHistory: string[] = [],
    globalMemory?: GlobalGameState,
  ): RuntimeSnapshot {
    // 1. Build and validate first (atomic step)
    const adapter = buildRuntimeCaseAdapter(caseDefinition, blueprintConfig);
    const engine = createRuntime(adapter, globalMemory);

    // 2. Commit swap on success
    let session = this.sessions.get(roomId);
    if (!session) {
      session = this.createSession(roomId, isSolo);
    }

    session.engine = engine;
    session.caseDefinition = caseDefinition;
    session.currentCaseId = caseDefinition.case_id;
    session.caseHistory = caseHistory;
    session.globalGameState = globalMemory || DEFAULT_GLOBAL_STATE;
    session.isSolo = isSolo;
    
    // Reset transient tribunal/shadow state for the new case
    session.tribunalActive = false;
    session.tribunalVotes.clear();
    session.closureRequester = null;
    session.shadowMessagePending = null;
    session.hintRequests.clear();
    session.solutionRequests.clear();

    const snapshot = engine.getSnapshot();
    
    // Initial Save for the new case
    saveManager.createSave(
      roomId,
      snapshot,
      snapshot.globalState,
      { nodes: session.boardNodes, links: session.boardLinks },
      session.caseHistory,
      caseDefinition.case_id
    );

    return snapshot;
  }

  // Load from DB if node server restarted but game was ongoing
  restoreSession(roomId: string,
    caseDefinition: RuntimeCaseDefinition,
    blueprintConfig: StaticCaseBlueprintConfig,
    isSolo: boolean
  ): RuntimeSnapshot | null {
      const latestSave = saveManager.getLatestSave(roomId);
      const session = this.createSession(roomId, isSolo);
      
      if (!latestSave) return null;

      const engineSnapshot = JSON.parse(latestSave.engine_snapshot_json) as RuntimeSnapshot;
      const globalState = JSON.parse(latestSave.global_state_json || '{}');
      const boardState = JSON.parse(latestSave.board_state_json || '{"nodes":[], "links":[]}');
      const caseHistory = JSON.parse(latestSave.case_history_json || '[]');

      session.boardNodes = boardState.nodes || [];
      session.boardLinks = boardState.links || [];
      session.caseHistory = caseHistory;
      session.currentCaseId = latestSave.case_id;
      session.globalGameState = globalState;

      const adapter = buildRuntimeCaseAdapter(caseDefinition, blueprintConfig);
      session.engine = createRuntime(adapter, globalState);
      
      if (latestSave.case_id !== caseDefinition.case_id) {
        console.warn(`[EngineHost] Case ID mismatch during restore: save=${latestSave.case_id}, target=${caseDefinition.case_id}`);
        // We still load the snapshot if possible, but the mismatch is notable.
      }

      if (engineSnapshot && session.engine) {
         session.engine.loadSnapshot(engineSnapshot);
      }
      session.caseDefinition = caseDefinition;

      return session.engine.getSnapshot();
  }

  processAction(roomId: string, action: PlayerAction) {
    const session = this.sessions.get(roomId);
    if (!session?.engine || !session.caseDefinition) return null;

    const result = session.engine.processAction(action);
    if (result && result.accepted) {
      const snapshot = session.engine.getSnapshot();
      session.globalGameState = snapshot.globalState;
      // Auto-save on valid tick
      saveManager.createSave(
          roomId, 
          snapshot, 
          snapshot.globalState, 
          { nodes: session.boardNodes, links: session.boardLinks }, 
          session.caseHistory,
          session.caseDefinition.case_id
      );
    }
    
    return result;
  }

  getFilteredSnapshot(
    roomId: string,
    room: RoomState,
    player: PlayerInfo,
  ): RuntimeSnapshot | null {
    const session = this.sessions.get(roomId);
    if (!session?.engine || !session.caseDefinition) return null;

    const snapshot = session.engine.getSnapshot();
    const allPlayers = Array.from(room.players.values());

    return filterSnapshotForPlayer(
      snapshot,
      session.caseDefinition,
      player,
      allPlayers,
      session.isSolo,
    );
  }

  getRawSnapshot(roomId: string): RuntimeSnapshot | null {
    const session = this.sessions.get(roomId);
    if (!session?.engine) return null;
    return session.engine.getSnapshot();
  }

  // ── Tribunal ────────────────────────────────────────────────────────

  startTribunal(roomId: string, requesterId: string, playerIds: string[]): void {
    const session = this.sessions.get(roomId);
    if (!session) return;

    session.tribunalActive = true;
    session.closureRequester = requesterId;
    session.tribunalVotes = new Map();
    for (const pid of playerIds) {
      session.tribunalVotes.set(pid, null);
    }
  }

  submitVote(roomId: string, playerId: string, approve: boolean): Record<string, boolean | null> {
    const session = this.sessions.get(roomId);
    if (!session) return {};

    session.tribunalVotes.set(playerId, approve);
    const result: Record<string, boolean | null> = {};
    for (const [pid, vote] of session.tribunalVotes) {
      result[pid] = vote;
    }
    return result;
  }

  checkTribunalComplete(roomId: string): { complete: boolean; approved: boolean } {
    const session = this.sessions.get(roomId);
    if (!session) return { complete: false, approved: false };

    let approveCount = 0;
    let rejectCount = 0;
    let pending = 0;

    for (const vote of session.tribunalVotes.values()) {
      if (vote === null) pending++;
      else if (vote) approveCount++;
      else rejectCount++;
    }

    if (pending > 0) return { complete: false, approved: false };

    const total = approveCount + rejectCount;
    return { complete: true, approved: approveCount > total / 2 };
  }

  endTribunal(roomId: string): void {
    const session = this.sessions.get(roomId);
    if (!session) return;
    session.tribunalActive = false;
    session.closureRequester = null;
    session.tribunalVotes.clear();
  }

  canSubmitTribunal(roomId: string): boolean {
    const session = this.sessions.get(roomId);
    if (!session) return false;
    if (session.isSolo) return true;
    
    const check = this.checkTribunalComplete(roomId);
    return check.complete && check.approved;
  }

  // ── Board State ─────────────────────────────────────────────────────

  updateBoard(roomId: string, nodes: BoardNode[], links: BoardLink[]): void {
    const session = this.sessions.get(roomId);
    if (!session) return;
    session.boardNodes = nodes;
    session.boardLinks = links;
    
    // Auto-save board updates without bumping tick (since it doesn't processAction)
    if (session.engine && session.caseDefinition) {
        const snapshot = session.engine.getSnapshot();
        saveManager.createSave(
            roomId,
            snapshot,
            snapshot.globalState,
            { nodes, links },
            session.caseHistory,
            session.caseDefinition.case_id
        );
    }
  }

  getBoard(roomId: string): { nodes: BoardNode[]; links: BoardLink[] } | null {
    const session = this.sessions.get(roomId);
    if (!session) return null;
    return { nodes: session.boardNodes, links: session.boardLinks };
  }

  // ── Consensus (Hints/Solutions) ───────────────────────────────────

  submitHintRequest(roomId: string, playerId: string): string[] {
    const session = this.sessions.get(roomId);
    if (!session) return [];
    session.hintRequests.add(playerId);
    return Array.from(session.hintRequests);
  }

  submitSolutionRequest(roomId: string, playerId: string): string[] {
    const session = this.sessions.get(roomId);
    if (!session) return [];
    session.solutionRequests.add(playerId);
    return Array.from(session.solutionRequests);
  }

  checkConsensus(roomId: string, totalCount: number, type: 'hint' | 'solution'): boolean {
    const session = this.sessions.get(roomId);
    if (!session) return false;
    const requests = type === 'hint' ? session.hintRequests : session.solutionRequests;
    return requests.size >= totalCount;
  }
}

export const engineHost = new EngineHost();
