import { EVENT_NAME, DEBUG_TRACE_KIND, SOURCE_TYPE } from "./constants.js";
import { appendDebugTrace, type EngineState } from "./store.js";
import type {
  RuntimeCaseDefinition,
  PlayerAction,
  DomainEvent,
  InterrogationSession,
  InterrogationStage,
  DialogTone,
  CaseCharacter,
} from "../types.js";
import {
  interrogationSourceRefToCharacterId,
  characterIdToInterrogationSourceRef,
} from "../utils/interrogationRefs.js";
import type { EventBus } from "./eventBus.js";

const DEFAULT_COLLAPSE_THRESHOLD = 7;
const DEFAULT_LAWYER_UP_THRESHOLD = 7;
const DEFAULT_AGGRESSION_TOLERANCE = 2;
const DEFAULT_SPAM_LIMIT = 4;

/** pressure_response values whose profile benefits from empathetic choices. */
const EMPATHY_RECEPTIVE_RESPONSES = new Set(["ramble", "collapse", "bargain", "confess_false"]);

const STAGE_TO_SUSPECT_STATE: Record<InterrogationStage, "normal" | "probing" | "pressure" | "branching" | "collapsing" | "lawyer_up"> = {
  probing: "probing",
  pressure: "pressure",
  branching: "branching",
  collapse: "collapsing",
  lawyer_up: "lawyer_up",
};

/**
 * Deterministic interrogation state machine per behavior.md §3.
 *
 * Sessions live in `state.interrogation_sessions` keyed by character_id and carry
 * the four scores (pressure / spam / aggression / profile_match) plus asked /
 * burned / locked choice tracking. Stages progress probing → pressure →
 * branching → collapse | lawyer_up.
 */
export class InterrogationSystem {
  constructor(
    private readonly state: EngineState,
    private readonly definition: RuntimeCaseDefinition,
    private readonly eventBus?: EventBus
  ) {}

  /**
   * Derived-systems pass: applies score deltas for the accepted action, then
   * evaluates stage transitions. Stage events are appended to emittedEvents so
   * they ship with the same tick broadcast.
   */
  applyInterrogationPressure(action: PlayerAction, emittedEvents: DomainEvent[]): void {
    if (action.type === "choose_dialog_option") {
      this.applyDialogChoice(action, emittedEvents);
    } else if (action.type === "present_evidence") {
      this.applyEvidencePresentation(action, emittedEvents);
    }
  }

  /** Validation support: is this character's session still open for input? */
  isSessionEnded(characterId: string): boolean {
    return this.state.interrogation_sessions[characterId]?.ended_early === true;
  }

  /** Validation support: is this choice burned or locked in the session? */
  isChoiceUnavailable(characterId: string, optionId: string): boolean {
    const session = this.state.interrogation_sessions[characterId];
    if (!session) return false;
    return session.burned_choice_ids.includes(optionId) || session.locked_choice_ids.includes(optionId);
  }

  private getOrCreateSession(characterId: string, emittedEvents: DomainEvent[]): InterrogationSession {
    let session = this.state.interrogation_sessions[characterId];
    if (!session) {
      session = {
        session_id: `${this.definition.case_id}:${characterId}`,
        character_id: characterId,
        current_stage: "probing",
        asked_question_ids: [],
        burned_choice_ids: [],
        locked_choice_ids: [],
        presented_evidence_ids: [],
        spam_score: 0,
        pressure_score: 0,
        profile_match_score: 0,
        aggression_score: 0,
        verified_evidence_presented: false,
        ended_early: false,
        last_action_tick: this.state.currentTick,
      };
      this.state.interrogation_sessions[characterId] = session;
      this.emitStageEvent(session, emittedEvents, null);
    }
    return session;
  }

  private findCharacter(characterId: string): CaseCharacter | undefined {
    return [
      ...this.definition.suspects,
      ...(this.definition.witnesses ?? []),
      ...(this.definition.related_persons ?? []),
    ].find((c) => c.character_id === characterId);
  }

  private resolveTone(character: CaseCharacter | undefined, optionId: string): DialogTone {
    const option = character?.dialogue_options?.find((o) => o.id === optionId);
    return option?.tone ?? "neutral";
  }

  private applyDialogChoice(action: Extract<PlayerAction, { type: "choose_dialog_option" }>, emittedEvents: DomainEvent[]): void {
    const characterId = interrogationSourceRefToCharacterId(action.source_ref);
    if (!characterId) return;

    const session = this.getOrCreateSession(characterId, emittedEvents);
    if (session.ended_early) return;

    const character = this.findCharacter(characterId);
    const optionId = action.interaction_id;
    const tone = this.resolveTone(character, optionId);

    session.asked_question_ids.push(optionId);
    session.last_action_tick = this.state.currentTick;

    switch (tone) {
      case "aggressive":
        session.pressure_score += 2;
        session.aggression_score += 2;
        this.burnParallelEmpatheticChoices(character, session);
        break;
      case "empathetic":
        if (character && EMPATHY_RECEPTIVE_RESPONSES.has(character.pressure_response ?? "")) {
          session.profile_match_score += 2;
          session.aggression_score = Math.max(0, session.aggression_score - 1);
        } else {
          session.profile_match_score -= 1;
          session.pressure_score = Math.max(0, session.pressure_score - 1);
        }
        break;
      case "precision":
        session.profile_match_score += 1;
        session.pressure_score += 1;
        break;
      case "neutral":
        break;
    }

    appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.RULE_APPLIED,
      `Dialog choice scored for ${characterId}`, { optionId, tone, session: this.scoreSnapshot(session) });

    this.evaluateSession(session, emittedEvents, action.interaction_id);
    this.syncDerivedViews(session);
  }

  private applyEvidencePresentation(action: Extract<PlayerAction, { type: "present_evidence" }>, emittedEvents: DomainEvent[]): void {
    const characterId = interrogationSourceRefToCharacterId(action.source_ref);
    if (!characterId) return;

    const session = this.getOrCreateSession(characterId, emittedEvents);
    if (session.ended_early) return;

    const evidenceId = action.interaction_id;
    session.last_action_tick = this.state.currentTick;

    if (session.presented_evidence_ids.includes(evidenceId)) {
      // Re-presenting the same evidence is repetition, not leverage
      session.spam_score += 1;
    } else {
      session.presented_evidence_ids.push(evidenceId);
      if (this.state.evidenceStates[evidenceId] === "verified") {
        session.pressure_score += 3;
        session.verified_evidence_presented = true;
      } else {
        session.spam_score += 1;
        session.profile_match_score -= 1;
      }
    }

    appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.RULE_APPLIED,
      `Evidence presented to ${characterId}`, { evidenceId, verified: session.verified_evidence_presented, session: this.scoreSnapshot(session) });

    this.evaluateSession(session, emittedEvents, action.interaction_id);
    this.syncDerivedViews(session);
  }

  /**
   * Aggressive choices burn the parallel empathetic options for the rest of the
   * session (behavior.md §Burned Choices). Burned options stay burned even if
   * scores later drop.
   */
  private burnParallelEmpatheticChoices(character: CaseCharacter | undefined, session: InterrogationSession): void {
    if (!character?.dialogue_options) return;
    for (const option of character.dialogue_options) {
      if (
        option.tone === "empathetic" &&
        !session.asked_question_ids.includes(option.id) &&
        !session.burned_choice_ids.includes(option.id)
      ) {
        session.burned_choice_ids.push(option.id);
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.RULE_APPLIED,
          `Empathetic choice burned in session ${session.session_id}`, { burned: option.id });
      }
    }
  }

  private evaluateSession(session: InterrogationSession, emittedEvents: DomainEvent[], actionId: string): void {
    if (session.ended_early) return;

    const character = this.findCharacter(session.character_id);
    const profile = character?.cognitive_profile;
    const tolerance = profile?.aggression_tolerance ?? DEFAULT_AGGRESSION_TOLERANCE;
    const spamLimit = this.definition.penalty_rules?.dialogue_spam_limit ?? DEFAULT_SPAM_LIMIT;

    // Relationship modifier from npc_global_memory shifts the effective thresholds
    const relationshipScore =
      this.state.globalMemory?.npc_global_memory?.[session.character_id]?.relationship_score ?? 0;
    const relationshipModifier = relationshipScore <= -3 ? 1 : relationshipScore >= 3 ? -1 : 0;
    const effectiveCollapse = (profile?.base_collapse_threshold ?? DEFAULT_COLLAPSE_THRESHOLD) + relationshipModifier;
    const effectiveLawyerUp = (profile?.base_lawyer_up_threshold ?? DEFAULT_LAWYER_UP_THRESHOLD) - relationshipModifier;

    // Forced silence: spam wall or aggression overflow ends the session at any stage
    if (session.spam_score >= spamLimit || session.aggression_score > tolerance) {
      this.transitionTo(session, "lawyer_up", emittedEvents);
      return;
    }

    switch (session.current_stage) {
      case "probing":
        if (session.verified_evidence_presented && session.pressure_score >= 3) {
          this.transitionTo(session, "pressure", emittedEvents);
        }
        break;
      case "pressure":
        if (session.pressure_score >= 5) {
          this.transitionTo(session, "branching", emittedEvents);
        }
        break;
      case "branching": {
        const resolutionScore =
          session.pressure_score + session.profile_match_score - session.aggression_score - session.spam_score;
        const resolutionScoreEffective = resolutionScore + this.microVariation(session, actionId);

        if (
          resolutionScoreEffective >= effectiveCollapse &&
          session.spam_score < spamLimit &&
          session.aggression_score <= tolerance
        ) {
          this.transitionTo(session, "collapse", emittedEvents);
        } else if (session.pressure_score >= effectiveLawyerUp && resolutionScoreEffective < effectiveCollapse) {
          this.transitionTo(session, "lawyer_up", emittedEvents);
        }
        break;
      }
      case "collapse":
      case "lawyer_up":
        break;
    }
  }

  private transitionTo(session: InterrogationSession, stage: InterrogationStage, emittedEvents: DomainEvent[]): void {
    if (session.current_stage === stage) return;
    const previous = session.current_stage;
    session.current_stage = stage;

    if (stage === "collapse" || stage === "lawyer_up") {
      session.ended_early = true;
    }

    appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.TRIGGER_FIRED,
      `Interrogation session ${session.session_id} stage ${previous} -> ${stage}`,
      { session: this.scoreSnapshot(session) });

    this.emitStageEvent(session, emittedEvents, stage);
    this.syncDerivedViews(session);
  }

  private emitStageEvent(session: InterrogationSession, emittedEvents: DomainEvent[], enteredStage: InterrogationStage | null): void {
    const sourceRef = characterIdToInterrogationSourceRef(session.character_id);
    const stage = enteredStage ?? session.current_stage;

    let eventName: DomainEvent["event_name"];
    let displayText: string;
    switch (stage) {
      case "pressure":
        eventName = EVENT_NAME.INTERROGATION_STAGE_ENTERED;
        displayText = "ازداد توتر المشتبه به — الاستجواب الآن في مرحلة الضغط.";
        break;
      case "branching":
        eventName = EVENT_NAME.INTERROGATION_STAGE_ENTERED;
        displayText = "وصل الاستجواب لمرحلة الحسم — كل رد قد يغيّر النتيجة.";
        break;
      case "collapse":
        eventName = EVENT_NAME.INTERROGATION_COLLAPSED;
        displayText = "المشتبه به انهار تحت الضغط وبدأ يكشف ما يعرفه.";
        break;
      case "lawyer_up":
        eventName = EVENT_NAME.INTERROGATION_LAWYER_UP;
        displayText = "المشتبه به رفض الاستمرار وطلب محاميه — انتهت الجلسة.";
        break;
      case "probing":
      default:
        eventName = EVENT_NAME.INTERROGATION_STAGE_ENTERED;
        displayText = "بدأت جلسة استجواب جديدة — مرحلة الاستكشاف.";
        break;
    }

    const event = this.eventBus?.createEvent(
      eventName,
      SOURCE_TYPE.INTERROGATION,
      sourceRef,
      `stage:${stage}`,
      "derived_pass",
      `stage:${stage}`,
      displayText,
    ) ?? {
      event_name: eventName,
      source_type: SOURCE_TYPE.INTERROGATION,
      source_ref: sourceRef,
      interaction_id: `stage:${stage}`,
      player_action: "derived_pass",
      result: `stage:${stage}`,
      display_text: displayText,
      tick: this.state.currentTick,
    };

    if (this.eventBus) {
      // Records into state.trace (→ snapshot.eventTrace) and dedupes via observedEvents
      this.eventBus.registerEvents([event], emittedEvents);
    } else {
      emittedEvents.push(event);
    }
  }

  /**
   * Deterministic micro-variation ∈ [-0.2, +0.2] derived from case, session,
   * tick, and action — applied only to the resolution edge in branching.
   */
  private microVariation(session: InterrogationSession, actionId: string): number {
    const input = `${this.definition.case_id}|${session.session_id}|${this.state.currentTick}|${actionId}`;
    let hash = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return ((hash % 1000) / 1000) * 0.4 - 0.2;
  }

  /** Keep the legacy flat views (suspectPressureScores / suspectStates) in sync for the UI. */
  private syncDerivedViews(session: InterrogationSession): void {
    this.state.suspectPressureScores[session.character_id] = session.pressure_score;
    this.state.suspectStates[session.character_id] = STAGE_TO_SUSPECT_STATE[session.current_stage];
  }

  private scoreSnapshot(session: InterrogationSession) {
    return {
      stage: session.current_stage,
      pressure: session.pressure_score,
      spam: session.spam_score,
      aggression: session.aggression_score,
      profile_match: session.profile_match_score,
      burned: session.burned_choice_ids.length,
    };
  }
}
