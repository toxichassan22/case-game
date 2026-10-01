import type {
  ClosureDecision,
  DebugTraceEntry,
  DomainEvent,
  EvidenceQuality,
  EvidenceState,
  GlobalGameState,
  InterrogationSession,
  RuntimeCaseDefinition,
  PhsState,
  RuntimeNotice,
  RuntimeSnapshot,
  ScheduledEffect,
  SuspectState,
  TransitionContext,
} from "../types.js";
import { FACT_TYPE } from "./constants.js";

export interface DelayedTriggerState {
  trigger_id: string;
  evidence_id: string;
  due_tick: number;
}

export interface PendingQualityState {
  target_ref: string;
  quality: EvidenceQuality;
  duration_ticks: number;
  notice: string;
}

export interface ActiveQualityState {
  target_ref: string;
  quality: EvidenceQuality;
  active_until_tick: number;
}

export interface ReviewDelayState {
  target_ref: string;
  blocked_until_tick: number;
  notice: string;
}

export interface EngineState {
  currentTick: number;
  visitedSources: Set<string>;
  verifiedFacts: Set<string>;
  verifiedEvidenceIds: Set<string>;
  observedEvents: Set<string>;
  trace: DomainEvent[];
  debugTrace: DebugTraceEntry[];
  baseEvidenceStates: Record<string, EvidenceState>;
  evidenceStates: Record<string, EvidenceState>;
  evidenceQualities: Record<string, EvidenceQuality>;
  evidenceInterpretations: Record<string, string>;
  evidenceSummaries: Record<string, string>;
  evidenceTags: Record<string, string[]>;
  evidenceRoles: Record<string, string>;
  closureBuckets: {
    behavioralVerified: Set<string>;
    crossRouteVerified: Set<string>;
  };
  flags: Set<string>;
  notices: RuntimeNotice[];
  delayedTriggers: DelayedTriggerState[];
  completedTriggers: Set<string>;
  pendingQualities: Record<string, PendingQualityState>;
  activeQualities: Record<string, ActiveQualityState>;
  reviewBlocks: Record<string, ReviewDelayState>;
  currentInterrogationSuspectId: string | null;
  lastClosureDecision: ClosureDecision | null;
  pendingTransitionContext: TransitionContext | null;
  globalMemory: GlobalGameState;
  forensicsQueuePressure: number;
  suspectPressureScores: Record<string, number>;
  suspectStates: Record<string, SuspectState>;
  interrogation_sessions: Record<string, InterrogationSession>;
  phsState: PhsState;
}

export function createInitialState(
  definition: RuntimeCaseDefinition,
  globalMemory?: GlobalGameState,
  initialFacts?: string[],
): EngineState {
  const baseEvidenceStates: Record<string, EvidenceState> = {};
  const evidenceStates: Record<string, EvidenceState> = {};
  const evidenceQualities: Record<string, EvidenceQuality> = {};
  const evidenceInterpretations: Record<string, string> = {};
  const evidenceSummaries: Record<string, string> = {};
  const evidenceTags: Record<string, string[]> = {};
  const evidenceRoles: Record<string, string> = {};
  const verifiedFacts = new Set<string>(initialFacts ?? []);
  const verifiedEvidenceIds = new Set<string>();

  for (const evidence of definition.evidence_list) {
    const initialState = evidence.locked ? "locked" : evidence.state;
    baseEvidenceStates[evidence.evidence_id] = initialState;
    evidenceStates[evidence.evidence_id] = initialState;
    evidenceQualities[evidence.evidence_id] = "final";
    evidenceInterpretations[evidence.evidence_id] = "default";
    evidenceSummaries[evidence.evidence_id] = evidence.summary;
    evidenceTags[evidence.evidence_id] = [...evidence.tags];
    evidenceRoles[evidence.evidence_id] = evidence.evidence_role;

    if (initialState === "verified") {
      verifiedFacts.add(factKey(FACT_TYPE.EVIDENCE_VERIFIED, evidence.evidence_id));
      verifiedEvidenceIds.add(evidence.evidence_id);
    }
  }

  return {
    currentTick: 0,
    visitedSources: new Set<string>(),
    verifiedFacts,
    verifiedEvidenceIds,
    observedEvents: new Set<string>(),
    trace: [],
    debugTrace: [],
    baseEvidenceStates,
    evidenceStates,
    evidenceQualities,
    evidenceInterpretations,
    evidenceSummaries,
    evidenceTags,
    evidenceRoles,
    closureBuckets: {
      behavioralVerified: new Set<string>(),
      crossRouteVerified: new Set<string>(),
    },
    flags: new Set<string>(),
    notices: [],
    delayedTriggers: [],
    completedTriggers: new Set<string>(),
    pendingQualities: {},
    activeQualities: {},
    reviewBlocks: {},
    currentInterrogationSuspectId: null,
    lastClosureDecision: null,
    pendingTransitionContext: null,
    forensicsQueuePressure: 0,
    suspectPressureScores: {},
    suspectStates: {},
    interrogation_sessions: {},
    globalMemory: globalMemory ?? {
      globalFlags: [],
      playerProfile: {},
      cognitiveBiasScore: 0,
      trustLevels: { police_trust: 100 },
      hiddenNarrativeState: {},
      playerBehaviorLog: [],
      trinity_awareness_score: 0,
      vacant_trinity_role: null,
      first_case_closure_route: null,
      route_usage_stats: {
        timeline: 0,
        forensics: 0,
        behavioral: 0
      },
      inventory_items: [],
      npc_global_memory: {}
    },
    phsState: {
      currentLevel: 1,
      lastProgressTick: 0,
      lastVerifiedCount: 0,
      lastClosureBucketSize: 0,
      activeHint: null,
    },
  };
}

function cloneInterrogationSessions(
  sessions: Record<string, InterrogationSession>,
): Record<string, InterrogationSession> {
  const cloned: Record<string, InterrogationSession> = {};
  for (const [key, session] of Object.entries(sessions)) {
    cloned[key] = {
      ...session,
      asked_question_ids: [...session.asked_question_ids],
      burned_choice_ids: [...session.burned_choice_ids],
      locked_choice_ids: [...session.locked_choice_ids],
      presented_evidence_ids: [...(session.presented_evidence_ids ?? [])],
    };
  }
  return cloned;
}

export function addNotice(state: EngineState, tick: number, code: string, message: string): void {
  state.notices.push({ tick, code, message });
}

export function appendDebugTrace(
  state: EngineState,
  tick: number,
  kind: DebugTraceEntry["kind"],
  message: string,
  data?: Record<string, unknown>,
): void {
  state.debugTrace.push({ tick, kind, message, data });
}

export function setFlag(state: EngineState, flag: string): void {
  state.flags.add(flag);
}

export function upsertGlobalFlag(state: EngineState, flag: string): void {
  if (!state.globalMemory.globalFlags.includes(flag)) {
    state.globalMemory.globalFlags.push(flag);
  }
}

export function clearFlag(state: EngineState, flag: string): void {
  state.flags.delete(flag);
}

export function recordBehavior(state: EngineState, tag: string, metadata?: Record<string, unknown>): void {
  state.globalMemory.playerBehaviorLog.push({
    tick: state.currentTick,
    action_type: "recorded",
    behavior_tag: tag,
    metadata,
  });
}

export function factKey(factType: string, ref: string): string {
  return `${factType}:${ref}`;
}

export function eventKey(event: Pick<DomainEvent, "event_name" | "source_ref" | "interaction_id" | "result">): string {
  return `${event.event_name}|${event.source_ref}|${event.interaction_id}|${event.result}`;
}

export function setFact(state: EngineState, factType: string, ref: string, value: boolean): void {
  const key = factKey(factType, ref);
  if (value) {
    state.verifiedFacts.add(key);
    if (factType === FACT_TYPE.EVIDENCE_VERIFIED) {
      state.verifiedEvidenceIds.add(ref);
    }
    return;
  }

  state.verifiedFacts.delete(key);
  if (factType === FACT_TYPE.EVIDENCE_VERIFIED) {
    state.verifiedEvidenceIds.delete(ref);
  }
}

export function hasFact(state: EngineState, factType: string, ref: string): boolean {
  return state.verifiedFacts.has(factKey(factType, ref));
}

export function recordEvent(state: EngineState, event: DomainEvent): void {
  state.trace.push(event);
  state.observedEvents.add(eventKey(event));
}

export function markEvidenceBaseState(state: EngineState, evidenceId: string, newState: EvidenceState): void {
  state.baseEvidenceStates[evidenceId] = newState;
}

export function setEvidenceEffectiveState(state: EngineState, evidenceId: string, newState: EvidenceState): void {
  state.evidenceStates[evidenceId] = newState;
}

export function recomputeClosureBuckets(definition: RuntimeCaseDefinition, state: EngineState): void {
  const behavioral = new Set<string>();
  const crossRoute = new Set<string>();

  for (const evidenceId of definition.closure_rules.validate_closure.behavioral_chain_evidence_ids) {
    if (state.verifiedEvidenceIds.has(evidenceId) && state.evidenceStates[evidenceId] === "verified") {
      behavioral.add(evidenceId);
    }
  }

  for (const evidenceId of definition.closure_rules.validate_closure.cross_route_evidence_ids) {
    if (state.verifiedEvidenceIds.has(evidenceId) && state.evidenceStates[evidenceId] === "verified") {
      crossRoute.add(evidenceId);
    }
  }

  state.closureBuckets.behavioralVerified = behavioral;
  state.closureBuckets.crossRouteVerified = crossRoute;
}

export function createSnapshot(definition: RuntimeCaseDefinition, state: EngineState): RuntimeSnapshot {
  const scheduledEffects: ScheduledEffect[] = [];

  for (const delayed of state.delayedTriggers) {
    scheduledEffects.push({
      kind: "delayed_trigger",
      target_ref: delayed.evidence_id,
      until_tick: delayed.due_tick,
      detail: delayed.trigger_id,
    });
  }

  for (const delay of Object.values(state.reviewBlocks)) {
    scheduledEffects.push({
      kind: "review_delay",
      target_ref: delay.target_ref,
      until_tick: delay.blocked_until_tick,
      detail: delay.notice,
    });
  }

  for (const pending of Object.values(state.pendingQualities)) {
    scheduledEffects.push({
      kind: "pending_quality",
      target_ref: pending.target_ref,
      until_tick: pending.duration_ticks,
      detail: pending.notice,
    });
  }

  for (const active of Object.values(state.activeQualities)) {
    scheduledEffects.push({
      kind: "active_quality",
      target_ref: active.target_ref,
      until_tick: active.active_until_tick,
      detail: active.quality,
    });
  }

  scheduledEffects.sort((left, right) => {
    if (left.until_tick !== right.until_tick) {
      return left.until_tick - right.until_tick;
    }

    return left.target_ref.localeCompare(right.target_ref);
  });

  return {
    case_id: definition.case_id,
    currentTick: state.currentTick,
    verifiedFacts: [...state.verifiedFacts].sort(),
    eventTrace: [...state.trace],
    closureBuckets: {
      verifiedEvidenceIds: [...state.verifiedEvidenceIds].sort(),
      behavioralVerifiedIds: [...state.closureBuckets.behavioralVerified].sort(),
      crossRouteVerifiedIds: [...state.closureBuckets.crossRouteVerified].sort(),
    },
    evidenceStates: sortRecord(state.evidenceStates),
    evidenceQualities: sortRecord(state.evidenceQualities),
    evidenceInterpretations: sortRecord(state.evidenceInterpretations),
    evidenceSummaries: sortRecord(state.evidenceSummaries),
    evidenceTags: sortRecord(state.evidenceTags),
    evidenceRoles: sortRecord(state.evidenceRoles),
    flags: [...state.flags].sort(),
    notices: [...state.notices],
    scheduledEffects,
    debugTrace: [...state.debugTrace],
    visitedSources: [...state.visitedSources],
    completedTriggers: [...state.completedTriggers],
    lastClosureDecision: state.lastClosureDecision,
    pendingTransitionContext: state.pendingTransitionContext,
    globalState: { ...state.globalMemory },
    suspectPressureScores: { ...state.suspectPressureScores },
    suspectStates: { ...state.suspectStates },
    interrogation_sessions: cloneInterrogationSessions(state.interrogation_sessions),
    phsState: { ...state.phsState },
  };
}

export function applySnapshot(state: EngineState, snapshot: RuntimeSnapshot): void {
  state.currentTick = snapshot.currentTick;
  state.verifiedFacts = new Set(snapshot.verifiedFacts);
  state.trace = [...snapshot.eventTrace];
  
  // Rebuild observedEvents from trace
  state.observedEvents.clear();
  for (const event of state.trace) {
    state.observedEvents.add(eventKey(event));
  }

  state.evidenceStates = { ...snapshot.evidenceStates };
  state.evidenceQualities = { ...snapshot.evidenceQualities };
  state.evidenceInterpretations = { ...snapshot.evidenceInterpretations };
  state.evidenceSummaries = { ...snapshot.evidenceSummaries };
  state.evidenceTags = { ...snapshot.evidenceTags };
  state.evidenceRoles = { ...snapshot.evidenceRoles };

  state.verifiedEvidenceIds = new Set(snapshot.closureBuckets.verifiedEvidenceIds);
  state.closureBuckets.behavioralVerified = new Set(snapshot.closureBuckets.behavioralVerifiedIds);
  state.closureBuckets.crossRouteVerified = new Set(snapshot.closureBuckets.crossRouteVerifiedIds);

  state.flags = new Set(snapshot.flags);
  state.notices = [...snapshot.notices];
  state.visitedSources = new Set(snapshot.visitedSources || []);
  state.completedTriggers = new Set(snapshot.completedTriggers || []);
  state.debugTrace = [...snapshot.debugTrace];
  state.lastClosureDecision = snapshot.lastClosureDecision ? { ...snapshot.lastClosureDecision } : null;
  state.pendingTransitionContext = snapshot.pendingTransitionContext ? { ...snapshot.pendingTransitionContext } : null;
  state.globalMemory = { ...snapshot.globalState };
  state.suspectPressureScores = { ...snapshot.suspectPressureScores };
  state.suspectStates = { ...snapshot.suspectStates };
  state.interrogation_sessions = cloneInterrogationSessions(snapshot.interrogation_sessions ?? {});
  state.phsState = { ...snapshot.phsState };

  // Restore scheduled effects
  state.delayedTriggers = [];
  state.pendingQualities = {};
  state.activeQualities = {};
  state.reviewBlocks = {};

  for (const effect of snapshot.scheduledEffects) {
    switch (effect.kind) {
      case "delayed_trigger":
        state.delayedTriggers.push({
          trigger_id: effect.detail,
          evidence_id: effect.target_ref,
          due_tick: effect.until_tick,
        });
        break;
      case "pending_quality":
        state.pendingQualities[effect.target_ref] = {
          target_ref: effect.target_ref,
          quality: "provisional", // Detail is just notice message, we assume provisional for pending
          duration_ticks: effect.until_tick,
          notice: effect.detail,
        };
        break;
      case "active_quality":
        state.activeQualities[effect.target_ref] = {
          target_ref: effect.target_ref,
          quality: effect.detail as EvidenceQuality,
          active_until_tick: effect.until_tick,
        };
        break;
      case "review_delay":
        state.reviewBlocks[effect.target_ref] = {
          target_ref: effect.target_ref,
          blocked_until_tick: effect.until_tick,
          notice: effect.detail,
        };
        break;
    }
  }
}

function sortRecord<T>(value: Record<string, T>): Record<string, T> {
  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(entries) as Record<string, T>;
}
