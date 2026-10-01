import {
  appendDebugTrace,
  clearFlag,
  hasFact,
  setEvidenceEffectiveState,
  setFlag,
  type EngineState,
} from "./store.js";
import { DEBUG_TRACE_KIND, EVENT_NAME, SOURCE_TYPE } from "./constants.js";
import type { DomainEvent, EvidenceReinterpretationRule, ReinterpretationPredicate, RuntimeCaseDefinition } from "../types.js";
import type { EventBus } from "./eventBus.js";

export class ReinterpretationSystem {
  constructor(
    private state: EngineState,
    private definition: RuntimeCaseDefinition,
    private eventBus: EventBus,
  ) {}

  runEvidenceReinterpretation(emittedEvents: DomainEvent[]): DomainEvent[] {
    const targetEvidenceIds = new Set(
      this.definition.hidden_systems.evidence_reinterpretation_rules.map((rule) => rule.target_evidence_id),
    );

    for (const evidenceId of targetEvidenceIds) {
      const evidence = this.definition.evidence_list.find((entry) => entry.evidence_id === evidenceId);
      if (!evidence) {
        continue;
      }

      const baseState = this.state.baseEvidenceStates[evidenceId];
      setEvidenceEffectiveState(this.state, evidenceId, baseState);
      this.state.evidenceTags[evidenceId] = [...evidence.tags];
      this.state.evidenceRoles[evidenceId] = evidence.evidence_role;
      this.state.evidenceSummaries[evidenceId] = baseState === "verified" && evidence.upgraded_summary
        ? evidence.upgraded_summary
        : evidence.summary;
    }

    for (const rule of this.definition.hidden_systems.evidence_reinterpretation_rules) {
      // Optimization: Only run if relevant facts changed
      if (rule.depends_on_facts && rule.depends_on_facts.length > 0) {
        const changed = emittedEvents.some((event) => rule.depends_on_facts?.includes(`${event.event_name}:${event.source_ref}`));
        if (!changed && !rule.recompute_each_tick) {
            continue;
        }
      }

      const nextEvents = this.applyRule(rule);
      this.eventBus.registerEvents(nextEvents, emittedEvents);
    }

    return emittedEvents;
  }

  private applyRule(rule: EvidenceReinterpretationRule): DomainEvent[] {
    const matchesTrue = rule.state_predicates_true.every((p) => this.evaluatePredicate(p));
    const matchesFalse = rule.on_false_if_any?.some((p) => this.evaluatePredicate(p)) ?? false;

    if (matchesTrue) {
      return this.applyResult(rule.target_evidence_id, rule.on_true);
    }

    if (matchesFalse) {
      return this.applyResult(rule.target_evidence_id, rule.on_false);
    }

    return [];
  }

  private evaluatePredicate(predicate: any): boolean {
    const factType = predicate.fact_type;
    const ref = predicate.ref;
    const expected = predicate.equals;

    if (factType === "global_flag") {
      return this.state.globalMemory.globalFlags.includes(ref) === expected;
    }

    if (factType === "local_flag") {
      return this.state.flags.has(ref) === expected;
    }

    return hasFact(this.state, factType, ref) === expected;
  }

  private applyResult(
    evidenceId: string,
    result: EvidenceReinterpretationRule["on_true"],
  ): DomainEvent[] {
    const previousState = this.state.evidenceStates[evidenceId];
    const previousInterpretation = this.state.evidenceInterpretations[evidenceId];
    const emitted: DomainEvent[] = [];

    if (result.set_evidence_summary) {
      this.state.evidenceSummaries[evidenceId] = result.set_evidence_summary;
    }

    if (result.set_evidence_tags) {
      this.state.evidenceTags[evidenceId] = [...new Set([...this.state.evidenceTags[evidenceId], ...result.set_evidence_tags])];
    }

    if (result.set_evidence_role) {
      this.state.evidenceRoles[evidenceId] = result.set_evidence_role;
    }

    if (result.set_evidence_state) {
      const baseState = this.state.baseEvidenceStates[evidenceId];
      const nextState = baseState === "verified"
        ? "verified"
        : result.set_evidence_state === "verified"
          ? baseState
          : result.set_evidence_state;
      setEvidenceEffectiveState(this.state, evidenceId, nextState);
    }

    for (const flag of result.set_flags ?? []) {
      setFlag(this.state, flag);
    }

    for (const flag of result.clear_flags ?? []) {
      clearFlag(this.state, flag);
    }

    const flagsChanged = (result.set_flags?.length ?? 0) > 0 || (result.clear_flags?.length ?? 0) > 0;

    if (
      result.emit_event &&
      (previousState !== this.state.evidenceStates[evidenceId] ||
        previousInterpretation !== this.state.evidenceInterpretations[evidenceId] ||
        flagsChanged)
    ) {
      appendDebugTrace(
        this.state,
        this.state.currentTick,
        DEBUG_TRACE_KIND.RULE_APPLIED,
        `Reinterpretation rule applied to ${evidenceId}`,
        {
          evidence_id: evidenceId,
          previous_state: previousState,
          next_state: this.state.evidenceStates[evidenceId],
          previous_interpretation: previousInterpretation,
          next_interpretation: this.state.evidenceInterpretations[evidenceId],
        },
      );
      emitted.push(
        this.eventBus.createEvent(
          result.emit_event as typeof EVENT_NAME.EVIDENCE_REINTERPRETED,
          SOURCE_TYPE.SYSTEM,
          evidenceId,
          "reinterpretation",
          "derived_pass",
          this.state.evidenceInterpretations[evidenceId],
        ),
      );
    }

    return emitted;
  }
}
