import { DEBUG_TRACE_KIND, FACT_TYPE } from "./constants.js";
import {
  addNotice,
  appendDebugTrace,
  eventKey,
  markEvidenceBaseState,
  setEvidenceEffectiveState,
  setFact,
  setFlag,
  type EngineState,
} from "./store.js";
import type {
  CaseEvidence,
  CompletionTrigger,
  DomainEvent,
  RuntimeCaseDefinition,
} from "../types.js";

interface IndexedTrigger {
  evidence: CaseEvidence;
  trigger: CompletionTrigger;
}

export class TriggerSystem {
  private triggersById = new Map<string, IndexedTrigger>();
  private triggerIdsByEventName = new Map<string, Set<string>>();
  private scheduledTriggerIdsByEventName = new Map<string, Set<string>>();

  constructor(
    private state: EngineState,
    private definition: RuntimeCaseDefinition,
  ) {
    this.buildIndexes();
  }

  private buildIndexes(): void {
    for (const evidence of this.definition.evidence_list) {
      for (const trigger of evidence.completion_triggers) {
        this.triggersById.set(trigger.trigger_id, { evidence, trigger });

        for (const condition of trigger.conditions) {
          const bucket = this.triggerIdsByEventName.get(condition.event_name) ?? new Set<string>();
          bucket.add(trigger.trigger_id);
          this.triggerIdsByEventName.set(condition.event_name, bucket);
        }

        if (trigger.scheduled_on_event) {
          const bucket = this.scheduledTriggerIdsByEventName.get(trigger.scheduled_on_event) ?? new Set<string>();
          bucket.add(trigger.trigger_id);
          this.scheduledTriggerIdsByEventName.set(trigger.scheduled_on_event, bucket);
        }
      }
    }
  }

  collectCandidateTriggerIds(events: DomainEvent[]): Set<string> {
    const candidateTriggerIds = new Set<string>();

    for (const event of events) {
      const matchingTriggerIds = this.triggerIdsByEventName.get(event.event_name);
      if (!matchingTriggerIds) {
        continue;
      }

      for (const triggerId of matchingTriggerIds) {
        candidateTriggerIds.add(triggerId);
      }
    }

    return candidateTriggerIds;
  }

  scheduleDelayedTriggers(events: DomainEvent[]): void {
    for (const event of events) {
      const scheduledTriggerIds = this.scheduledTriggerIdsByEventName.get(event.event_name);
      if (!scheduledTriggerIds) {
        continue;
      }

      for (const triggerId of scheduledTriggerIds) {
        if (this.state.completedTriggers.has(triggerId)) {
          continue;
        }

        const indexedTrigger = this.triggersById.get(triggerId);
        if (!indexedTrigger) {
          continue;
        }

        const alreadyScheduled = this.state.delayedTriggers.some((entry) => entry.trigger_id === triggerId);
        if (alreadyScheduled) {
          continue;
        }

        this.state.delayedTriggers.push({
          trigger_id: triggerId,
          evidence_id: indexedTrigger.evidence.evidence_id,
          due_tick: this.state.currentTick + indexedTrigger.trigger.delay_ticks,
        });

        appendDebugTrace(
          this.state,
          this.state.currentTick,
          DEBUG_TRACE_KIND.EFFECT_APPLIED,
          `Delayed trigger scheduled: ${triggerId}`,
          {
            evidence_id: indexedTrigger.evidence.evidence_id,
            due_tick: this.state.currentTick + indexedTrigger.trigger.delay_ticks,
          },
        );
      }
    }
  }

  resolveTriggers(initialCandidateTriggerIds: Set<string>): void {
    // First, check for lab triggers that depend on file opening
    this.resolveLabFileBasedTriggers();
    
    const candidates = new Set<string>([
      ...initialCandidateTriggerIds,
      ...this.state.delayedTriggers
        .filter((entry) => entry.due_tick <= this.state.currentTick)
        .map((entry) => entry.trigger_id),
    ]);
    let applied = true;

    while (applied) {
      applied = false;
      for (const triggerId of [...candidates]) {
        const indexedTrigger = this.triggersById.get(triggerId);
        if (!indexedTrigger || this.state.completedTriggers.has(triggerId)) {
          candidates.delete(triggerId);
          continue;
        }

        const { evidence, trigger } = indexedTrigger;
        if (trigger.scheduled_on_event) {
          const delayed = this.state.delayedTriggers.find((entry) => entry.trigger_id === triggerId);
          if (!delayed || delayed.due_tick > this.state.currentTick) {
            continue;
          }
        }

        if (!this.dependenciesVerified(evidence)) {
          continue;
        }

        if (!this.triggerSatisfied(trigger)) {
          continue;
        }

        this.applyTriggerOutcome(evidence, trigger);
        this.state.completedTriggers.add(triggerId);
        this.state.delayedTriggers = this.state.delayedTriggers.filter((entry) => entry.trigger_id !== triggerId);
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.TRIGGER_FIRED, `Trigger fired: ${triggerId}`, {
          evidence_id: evidence.evidence_id,
          on_complete: trigger.on_complete,
        });
        candidates.delete(triggerId);
        applied = true;
      }
    }
  }

  private resolveLabFileBasedTriggers(): void {
    // Find all lab triggers with due_tick === 0 (file-based)
    const labTriggers = this.state.delayedTriggers.filter(
      (entry) => entry.trigger_id.startsWith('lab_') && entry.due_tick === 0
    );

    for (const labTrigger of labTriggers) {
      const evidence = this.definition.evidence_list.find(e => e.evidence_id === labTrigger.evidence_id);
      
      // Support both single and multi-file dependencies
      const requiredFiles = evidence?.lab_unlock_requires_evidence_ids || 
                           (evidence?.lab_unlock_requires_evidence_id ? [evidence.lab_unlock_requires_evidence_id] : []);

      if (requiredFiles.length === 0) {
        continue; // Not a file-based trigger
      }

      // Check if ALL required files have been opened/verified
      const allFilesOpened = requiredFiles.every(fileId => 
        this.state.baseEvidenceStates[fileId] === 'verified' ||
        this.state.visitedSources.has(fileId)
      );

      if (allFilesOpened) {
        // Complete the lab analysis
        this.completeLabTrigger(labTrigger.trigger_id, labTrigger.evidence_id, requiredFiles);
      }
    }
  }

  private completeLabTrigger(triggerId: string, evidenceId: string, requiredFiles?: string[]): void {
    markEvidenceBaseState(this.state, evidenceId, "verified");
    setEvidenceEffectiveState(this.state, evidenceId, "verified");
    setFact(this.state, FACT_TYPE.EVIDENCE_VERIFIED, evidenceId, true);
    
    // Remove from delayed triggers
    this.state.delayedTriggers = this.state.delayedTriggers.filter(
      (entry) => entry.trigger_id !== triggerId
    );
    this.state.completedTriggers.add(triggerId);

    const evidence = this.definition.evidence_list.find(e => e.evidence_id === evidenceId);
    if (evidence) {
      // Send notification with required files info
      const filesMsg = requiredFiles && requiredFiles.length > 0 
        ? ` (required: ${requiredFiles.join(', ')})`
        : '';
      addNotice(this.state, this.state.currentTick, "lab_complete", 
        `${evidenceId} lab analysis complete${filesMsg}`);
      
      // Emit event for frontend to show auto-open prompt
      addNotice(this.state, this.state.currentTick, "lab_result_ready", 
        `🔬 نتيجة تحليل ${evidence.title} جاهزة! اضغط للمراجعة`);
    }
    
    appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.TRIGGER_FIRED, 
      `Lab trigger completed (file-based): ${triggerId}`, {
      evidence_id: evidenceId,
      required_files: requiredFiles,
    });
  }

  private dependenciesVerified(evidence: CaseEvidence): boolean {
    return evidence.depends_on_evidence_ids.every((evidenceId) => this.state.baseEvidenceStates[evidenceId] === "verified");
  }

  private triggerSatisfied(trigger: CompletionTrigger): boolean {
    const results = trigger.conditions.map((condition) =>
      this.state.observedEvents.has(
        eventKey({
          event_name: condition.event_name,
          source_ref: condition.source_ref,
          interaction_id: condition.interaction_id,
          result: condition.required_result,
        }),
      ),
    );

    return trigger.logic_operator === "all" ? results.every(Boolean) : results.some(Boolean);
  }

  private applyTriggerOutcome(evidence: CaseEvidence, trigger: CompletionTrigger): void {
    if (trigger.on_complete === "unlock_evidence") {
      if (this.state.baseEvidenceStates[evidence.evidence_id] === "locked") {
        markEvidenceBaseState(this.state, evidence.evidence_id, "partial");
        setEvidenceEffectiveState(this.state, evidence.evidence_id, "partial");
        addNotice(this.state, this.state.currentTick, "evidence_unlocked", `${evidence.evidence_id} unlocked`);
      }
      return;
    }

    if (trigger.on_complete === "upgrade_to_verified") {
      markEvidenceBaseState(this.state, evidence.evidence_id, "verified");
      setEvidenceEffectiveState(this.state, evidence.evidence_id, "verified");
      setFact(this.state, FACT_TYPE.EVIDENCE_VERIFIED, evidence.evidence_id, true);
      const feedback = this.definition.hidden_systems?.ui_feedback_rules?.find((rule) => rule.source_ref === evidence.evidence_id);
      if (feedback) {
        addNotice(this.state, this.state.currentTick, "ui_feedback", feedback.player_notice);
      }
      return;
    }

    if (trigger.on_complete === "set_flag_only") {
      const flags = (trigger.on_complete_params?.flags as string[]) || [];
      for (const f of flags) {
        setFlag(this.state, f);
      }

      setFact(this.state, FACT_TYPE.EVIDENCE_VERIFIED, evidence.evidence_id, true);
      markEvidenceBaseState(this.state, evidence.evidence_id, "verified");
      setEvidenceEffectiveState(this.state, evidence.evidence_id, "verified");
    }
  }
}
