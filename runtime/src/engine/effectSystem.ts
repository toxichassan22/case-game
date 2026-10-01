import { DEBUG_TRACE_KIND, FACT_TYPE, PLAYER_ACTION_TYPE } from "./constants.js";
import { addNotice, appendDebugTrace, hasFact, type EngineState } from "./store.js";
import type { CaseEvidence, PlayerAction, RuntimeCaseDefinition } from "../types.js";

export class EffectSystem {
  constructor(
    private state: EngineState,
    private definition: RuntimeCaseDefinition,
  ) {}

  expireEffects(): void {
    for (const [targetRef, active] of Object.entries(this.state.activeQualities)) {
      if (this.state.currentTick >= active.active_until_tick) {
        delete this.state.activeQualities[targetRef];
        this.state.evidenceQualities[targetRef] = "final";
        appendDebugTrace(
          this.state,
          this.state.currentTick,
          DEBUG_TRACE_KIND.EFFECT_APPLIED,
          `Quality effect expired for ${targetRef}`,
          {
            target_ref: targetRef,
          },
        );
      }
    }

    for (const [targetRef, block] of Object.entries(this.state.reviewBlocks)) {
      if (this.state.currentTick > block.blocked_until_tick) {
        delete this.state.reviewBlocks[targetRef];
        appendDebugTrace(
          this.state,
          this.state.currentTick,
          DEBUG_TRACE_KIND.EFFECT_APPLIED,
          `Review block cleared for ${targetRef}`,
          {
            target_ref: targetRef,
          },
        );
      }
    }
  }

  isForensicsBlocked(): boolean {
    return this.state.forensicsQueuePressure > 3; // Threshold from old logic
  }

  applyForensicsPressure(action: PlayerAction, wasTriggerEvidenceVerifiedBeforeAction?: boolean): void {
    // PHS requests must never trigger forensics pressure
    if (action.type === PLAYER_ACTION_TYPE.REQUEST_PHS) return;

    const rules = this.definition.hidden_systems.forensics_queue_pressure_rules;
    if (!rules.enabled) {
      return;
    }

    if (!actionMatchesQueuePressureTrigger(this.definition, action)) {
      return;
    }

    const triggerEvidenceRef = getQueuePressureTriggerEvidenceRef(this.definition);
    if (!triggerEvidenceRef) {
      return;
    }

    const wasTriggerEvidenceVerified = wasTriggerEvidenceVerifiedBeforeAction
      ?? hasFact(this.state, FACT_TYPE.EVIDENCE_VERIFIED, triggerEvidenceRef);

    if (!wasTriggerEvidenceVerified) {
      this.state.forensicsQueuePressure += rules.pressure_increment ?? 1;
      
      // Seed now depends on pressure level
      const seedVal = this.generateSeed(this.definition.case_id);
      const selector = seedVal % 2 === 0 ? "seed_tick_mod_2_eq_0" : "seed_tick_mod_2_eq_1";
      const variant = rules.deterministic_variants.find((entry) => entry.selector === selector);

      if (variant) {
        addNotice(this.state, this.state.currentTick, variant.variant_id, variant.visible_notice);
        appendDebugTrace(
          this.state,
          this.state.currentTick,
          DEBUG_TRACE_KIND.EFFECT_APPLIED,
          "Forensics queue pressure applied",
          {
            variant_id: variant.variant_id,
            target_ref: variant.effect.target_ref,
            effect: variant.effect,
          },
        );

        if (variant.effect.result_quality && variant.effect.duration_ticks) {
          const nextQualityState = {
            target_ref: variant.effect.target_ref,
            quality: variant.effect.result_quality,
            duration_ticks: variant.effect.duration_ticks,
            notice: variant.visible_notice,
          };

          if (this.state.baseEvidenceStates[variant.effect.target_ref] === "verified") {
            this.state.activeQualities[variant.effect.target_ref] = {
              target_ref: variant.effect.target_ref,
              quality: variant.effect.result_quality,
              active_until_tick: this.state.currentTick + variant.effect.duration_ticks,
            };
            this.state.evidenceQualities[variant.effect.target_ref] = variant.effect.result_quality;
          } else {
            this.state.pendingQualities[variant.effect.target_ref] = nextQualityState;
          }
        }

        if (variant.effect.delay_ticks) {
          this.state.reviewBlocks[variant.effect.target_ref] = {
            target_ref: variant.effect.target_ref,
            blocked_until_tick: this.state.currentTick + variant.effect.delay_ticks,
            notice: variant.visible_notice,
          };
        }
      }
    }
  }

  private generateSeed(_caseId: string): number {
    return this.state.currentTick;
  }
}

export function getQueuePressureTriggerEvidenceRef(definition: RuntimeCaseDefinition): string | null {
  const triggerWhen = definition.hidden_systems.forensics_queue_pressure_rules.trigger_when;
  return triggerWhen.before_evidence_verified?.trim()
    || triggerWhen.evidence_id?.trim()
    || null;
}

export function actionMatchesQueuePressureTrigger(
  definition: RuntimeCaseDefinition,
  action: PlayerAction,
): boolean {
  const normalizedRuleAction = normalizeActionType(
    definition.hidden_systems.forensics_queue_pressure_rules.trigger_when.action,
  );

  if (normalizedRuleAction === "queue_evidence") {
    return matchesLegacyQueuedEvidenceTrigger(definition, action);
  }

  return normalizeActionType(action.type) === normalizedRuleAction;
}

function matchesLegacyQueuedEvidenceTrigger(
  definition: RuntimeCaseDefinition,
  action: PlayerAction,
): boolean {
  const legacyEvidenceId = definition.hidden_systems.forensics_queue_pressure_rules.trigger_when.evidence_id?.trim();
  if (!legacyEvidenceId) {
    return false;
  }

  if (
    action.type !== PLAYER_ACTION_TYPE.REVIEW_EVIDENCE
    && action.type !== PLAYER_ACTION_TYPE.INSPECT_OBJECT
  ) {
    return false;
  }

  const queueableRefs = collectQueueableRefsForEvidence(definition, legacyEvidenceId);
  return queueableRefs.has(action.source_ref);
}

function collectQueueableRefsForEvidence(
  definition: RuntimeCaseDefinition,
  evidenceId: string,
): Set<string> {
  const evidence = definition.evidence_list.find((entry) => entry.evidence_id === evidenceId);
  if (!evidence) {
    return new Set<string>();
  }

  const refs = new Set<string>();
  addEvidenceQueueableRefs(refs, evidence);
  return refs;
}

function addEvidenceQueueableRefs(target: Set<string>, evidence: CaseEvidence): void {
  target.add(evidence.evidence_id);
  target.add(evidence.content_ref);

  for (const trigger of evidence.completion_triggers) {
    for (const condition of trigger.conditions) {
      target.add(condition.source_ref);
    }
  }
}

function normalizeActionType(actionType: string): string {
  return actionType.trim().toLowerCase();
}
