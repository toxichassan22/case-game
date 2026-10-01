import {
  FACT_TYPE,
  PLAYER_ACTION_TYPE,
  SOURCE_TYPE,
  EVENT_NAME,
  DEBUG_TRACE_KIND,
} from "./constants.js";
import { generatePhsHint } from "./phsSystem.js";
import {
  appendDebugTrace,
  markEvidenceBaseState,
  recordBehavior,
  setEvidenceEffectiveState,
  setFact,
  type EngineState,
} from "./store.js";
import type {
  DomainEvent,
  PlayerAction,
  ReviewBlueprint,
  RuntimeCaseAdapter,
} from "../types.js";
import { interrogationSourceRefToCharacterId } from "../utils/interrogationRefs.js";
import type { EventBus } from "./eventBus.js";

export class ActionProcessor {
  constructor(
    private state: EngineState,
    private adapter: RuntimeCaseAdapter,
    private eventBus: EventBus,
  ) {}

  validateAction(action: PlayerAction): string | null {

    switch (action.type) {
      case PLAYER_ACTION_TYPE.OPEN_SOURCE:
        return this.adapter.openableSources.has(action.source_ref) ? null : `Unknown source: ${action.source_ref}`;
      case PLAYER_ACTION_TYPE.REVIEW_EVIDENCE: {
        if (!this.adapter.reviewBlueprints.has(action.source_ref)) {
          return `Review blueprint missing: ${action.source_ref}`;
        }
        const block = this.findActiveReviewBlock(action.source_ref);
        if (block && this.state.currentTick <= block.blocked_until_tick) {
          return block.notice;
        }
        if (this.state.baseEvidenceStates[action.source_ref] === "verified") {
          return `Evidence already verified: ${action.source_ref}`;
        }
        if (this.state.baseEvidenceStates[action.source_ref] === "locked") {
          return `Evidence is locked: ${action.source_ref}`;
        }
        return null;
      }
      case PLAYER_ACTION_TYPE.INSPECT_OBJECT: {
        if (!this.adapter.inspectBlueprints.has(action.source_ref)) {
          return `Inspect blueprint missing: ${action.source_ref}`;
        }
        const block = this.findActiveReviewBlock(action.source_ref);
        if (block && this.state.currentTick <= block.blocked_until_tick) {
          return block.notice;
        }
        if (this.state.baseEvidenceStates[action.source_ref] === "verified") {
          return `Object already verified: ${action.source_ref}`;
        }
        if (this.state.baseEvidenceStates[action.source_ref] === "locked") {
          return `Object is locked: ${action.source_ref}`;
        }
        return null;
      }
      case PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION:
        if (!this.adapter.dialogBlueprints.has(`${action.source_ref}:${action.interaction_id}`)) {
          return `Dialogue blueprint missing: ${action.source_ref}:${action.interaction_id}`;
        }
        if (this.state.verifiedFacts.has(`${FACT_TYPE.DIALOG_OPTION_USED}:${action.source_ref}:${action.interaction_id}`)) {
          return `Dialogue option already used: ${action.interaction_id}`;
        }
        return null;
      case PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT:
        if (!this.adapter.timelineBlueprints.has(action.interaction_id)) {
          return `Timeline blueprint missing: ${action.interaction_id}`;
        }
        {
          const block = this.findActiveReviewBlock(action.interaction_id);
          if (block && this.state.currentTick <= block.blocked_until_tick) {
            return block.notice;
          }
        }
        return null;
      case PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY:
      case PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE:
      case PLAYER_ACTION_TYPE.REQUEST_PHS:
        return null;
      case PLAYER_ACTION_TYPE.SEND_TO_LAB:
        if (this.state.baseEvidenceStates[action.source_ref] === "verified") return "Evidence already verified";
        if (this.state.verifiedFacts.has(`${FACT_TYPE.LAB_PENDING}:${action.source_ref}`)) return "Already in lab queue";
        return null;
      case PLAYER_ACTION_TYPE.VERIFY_TIMELINE_SEQUENCE:
        return null; // Sequence validation happens in apply
    }

    return `Unknown action type: ${String((action as { type?: unknown }).type ?? "<missing>")}`;
  }

  applyAction(action: PlayerAction): DomainEvent[] {
    switch (action.type) {
      case PLAYER_ACTION_TYPE.OPEN_SOURCE:
        this.state.visitedSources.add(action.source_ref);
        return [
          this.eventBus.createEvent(
            EVENT_NAME.SOURCE_OPENED,
            this.adapter.inferSourceType(action.source_ref),
            action.source_ref,
            "OPEN",
            action.type,
            "source_opened",
          ),
        ];
      case PLAYER_ACTION_TYPE.REVIEW_EVIDENCE:
        if (this.adapter.reviewBlueprints.get(action.source_ref)?.source_type === SOURCE_TYPE.REPORT) {
            recordBehavior(this.state, "forensics_scan_count");
        }
        return this.applyEvidenceReview(action.source_ref, this.adapter.reviewBlueprints.get(action.source_ref)!);
      case PLAYER_ACTION_TYPE.INSPECT_OBJECT:
        return this.applyEvidenceReview(action.source_ref, this.adapter.inspectBlueprints.get(action.source_ref)!);
      case PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION: {
        const blueprint = this.adapter.dialogBlueprints.get(`${action.source_ref}:${action.interaction_id}`);
        const suspectId = interrogationSourceRefToCharacterId(action.source_ref);
        if (suspectId) {
          this.state.currentInterrogationSuspectId = suspectId;
        }
        setFact(this.state, FACT_TYPE.DIALOG_OPTION_USED, `${action.source_ref}:${action.interaction_id}`, true);
        
        return [
          this.eventBus.createEvent(
            EVENT_NAME.INTERROGATION_NODE_UNLOCKED,
            SOURCE_TYPE.INTERROGATION,
            action.source_ref,
            action.interaction_id,
            action.type,
            blueprint?.required_result || "جاري التحليل... لا يوجد رد محدد حالياً.",
            blueprint?.display_text,
          ),
        ];
      }
      case PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT: {
        const blueprint = this.adapter.timelineBlueprints.get(action.interaction_id)!;
        setFact(this.state, FACT_TYPE.TIMELINE_LOCK, blueprint.interaction_id, true);
        return [
          this.eventBus.createEvent(
            EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED,
            SOURCE_TYPE.TIMELINE,
            "TIMELINE-BOARD",
            blueprint.interaction_id,
            action.type,
            blueprint.required_result,
          ),
        ];
      }
      case PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY: {
        // Requesting deep metadata for any evidence that supports it
        const events: DomainEvent[] = [];
        const evidence = this.adapter.definition.evidence_list.find(e => e.evidence_id === action.source_ref);
        if (evidence && evidence.tags.includes('grand_truth_seed')) {
          events.push(this.eventBus.createEvent(
            EVENT_NAME.DEEP_METADATA_REQUESTED,
            SOURCE_TYPE.REPORT,
            action.source_ref,
            "REQUEST-DEEP",
            PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY,
            "requested",
          ));
        }
        return events;
      }
      case PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE:
        return [
          this.eventBus.createEvent(
            EVENT_NAME.CASE_SUBMISSION_ATTEMPT,
            SOURCE_TYPE.CLOSURE,
            this.adapter.definition.case_id,
            "SUBMIT",
            action.type,
            action.attempt.submitted_motive,
          ),
        ];
      case PLAYER_ACTION_TYPE.REQUEST_PHS: {
        const event = generatePhsHint(this.state, this.adapter.definition);
        return event ? [event] : [];
      }
      case PLAYER_ACTION_TYPE.SEND_TO_LAB: {
        setFact(this.state, FACT_TYPE.LAB_PENDING, action.source_ref, true);
        
        // Find the evidence definition to check if it requires a specific file to be opened
        const evidence = this.adapter.definition.evidence_list.find(e => e.evidence_id === action.source_ref);
        const requiredFileId = evidence?.lab_unlock_requires_evidence_id;
        
        if (requiredFileId) {
          // Store the required file ID in delayedTriggers for later checking
          this.state.delayedTriggers.push({
            trigger_id: `lab_${action.source_ref}`,
            evidence_id: action.source_ref,
            due_tick: 0, // Not using tick-based, using file-based
          });
        } else {
          // Fallback to tick-based if no file requirement (backward compatibility)
          this.state.delayedTriggers.push({
            trigger_id: `lab_${action.source_ref}`,
            evidence_id: action.source_ref,
            due_tick: this.state.currentTick + 5,
          });
        }
        
        return [
          this.eventBus.createEvent(
            EVENT_NAME.LAB_ANALYSIS_STARTED,
            this.adapter.inferSourceType(action.source_ref),
            action.source_ref,
            "LAB-QUEUE",
            action.type,
            "analysis_started",
          ),
        ];
      }
      case PLAYER_ACTION_TYPE.VERIFY_TIMELINE_SEQUENCE: {
         // Placeholder for sequence verification logic
         return [
           this.eventBus.createEvent(
             EVENT_NAME.TIMELINE_SEQUENCE_VERIFIED,
             SOURCE_TYPE.TIMELINE,
             "TIMELINE-BOARD",
             "VERIFY",
             action.type,
             "sequence_checked",
           ),
         ];
      }
    }

    return [];
  }

  private applyEvidenceReview(sourceRef: string, blueprint: ReviewBlueprint): DomainEvent[] {
    const playerAction =
      blueprint.source_type === SOURCE_TYPE.OBJECT ? PLAYER_ACTION_TYPE.INSPECT_OBJECT : PLAYER_ACTION_TYPE.REVIEW_EVIDENCE;
    const events: DomainEvent[] = [
      this.eventBus.createEvent(
        EVENT_NAME.DOCUMENT_REVIEWED,
        blueprint.source_type,
        sourceRef,
        blueprint.interaction_id,
        playerAction,
        "opened",
      ),
    ];

    markEvidenceBaseState(this.state, sourceRef, "verified");
    setEvidenceEffectiveState(this.state, sourceRef, "verified");
    setFact(this.state, FACT_TYPE.EVIDENCE_VERIFIED, sourceRef, true);

    const pendingTargets = new Set([sourceRef, ...this.adapter.getRelatedEvidenceIds(sourceRef)]);
    for (const targetRef of pendingTargets) {
      const pendingQuality = this.state.pendingQualities[targetRef];
      if (!pendingQuality) {
        continue;
      }

      this.state.activeQualities[targetRef] = {
        target_ref: targetRef,
        quality: pendingQuality.quality,
        active_until_tick: this.state.currentTick + pendingQuality.duration_ticks,
      };
      delete this.state.pendingQualities[targetRef];
      this.state.evidenceQualities[targetRef] = this.state.activeQualities[targetRef]!.quality;
      appendDebugTrace(
        this.state,
        this.state.currentTick,
        DEBUG_TRACE_KIND.EFFECT_APPLIED,
        `Applied queued quality effect to ${targetRef}`,
        {
          target_ref: targetRef,
          quality: this.state.activeQualities[targetRef]?.quality,
        },
      );
    }

    this.state.evidenceQualities[sourceRef] = this.state.activeQualities[sourceRef]?.quality ?? "final";

    if (blueprint.verifies_evidence) {
      events.push(
        this.eventBus.createEvent(
          EVENT_NAME.EVIDENCE_VERIFIED,
          blueprint.source_type,
          sourceRef,
          blueprint.interaction_id,
          playerAction,
          blueprint.required_result,
        ),
      );
    }

    return events;
  }

  private findActiveReviewBlock(sourceRef: string) {
    const directBlock = this.state.reviewBlocks[sourceRef];
    if (directBlock) {
      return directBlock;
    }

    // If the player is opening a concrete evidence node, don't inherit review
    // blocks from downstream evidence that merely depends on it.
    if (this.adapter.definition.evidence_list.some((evidence) => evidence.evidence_id === sourceRef)) {
      return undefined;
    }

    return this.adapter
      .getRelatedEvidenceIds(sourceRef)
      .filter((targetRef) => targetRef !== sourceRef)
      .map((targetRef) => this.state.reviewBlocks[targetRef])
      .find((candidate) => Boolean(candidate));
  }
}
