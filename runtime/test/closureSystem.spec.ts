import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, recomputeClosureBuckets, type EngineState } from '../src/engine/store.js';
import { ClosureSystem } from '../src/engine/closureSystem.js';
import type { CaseEvidence, ClosureAttempt, ClosureCatalog, RuntimeCaseDefinition } from '../src/types.js';

function mkEvidence(evidence_id: string): CaseEvidence {
  return {
    evidence_id,
    case_id: 'test-case',
    title: evidence_id,
    type: 'document',
    evidence_tier: 'critical',
    evidence_role: 'prove',
    summary: '',
    content_ref: evidence_id,
    locked: false,
    requires_warrant: false,
    state: 'partial',
    requires_route_collaboration: [],
    depends_on_evidence_ids: [],
    completion_triggers: [],
    upgraded_summary: '',
    penalty_if_mishandled: [],
    tags: [],
    route_weight: { timeline: 0.34, forensics: 0.33, behavioral: 0.33 },
    grand_truth_axis: [],
  };
}

function mkDefinition(overrides?: {
  acceptedTrueCulpritIds?: string[] | undefined;
  behavioralIds?: string[];
  crossRouteIds?: string[];
}): RuntimeCaseDefinition {
  return {
    case_id: 'test-case',
    title: 'Test Case',
    evidence_list: [
      mkEvidence('EVID-A'),
      mkEvidence('EVID-B'),
      mkEvidence('EVID-BEHAV-01'),
      mkEvidence('EVID-CROSS-01'),
    ],
    suspects: [],
    closure_rules: {
      requires_culprit: true,
      requires_motive: true,
      requires_method_or_opportunity: true,
      minimum_evidence_count: 3,
      accepted_true_motive_ids: ['motive_true'],
      accepted_true_culprit_ids: overrides && 'acceptedTrueCulpritIds' in overrides
        ? overrides.acceptedTrueCulpritIds
        : ['char_real'],
      false_success_motive_ids: ['motive_false'],
      false_success_flag: 'test_false_close',
      false_success_flags_by_suspect: { char_decoy: ['accused_wrong_flag'] },
      validate_closure: {
        minimum_behavioral_chain_verified: 1,
        minimum_cross_route_verified: 1,
        no_shared_evidence_between_roles: true,
        behavioral_chain_evidence_ids: overrides?.behavioralIds ?? ['EVID-BEHAV-01'],
        cross_route_evidence_ids: overrides?.crossRouteIds ?? ['EVID-CROSS-01'],
        rejected_submission_reason_codes: [
          'missing_culprit',
          'missing_motive',
          'missing_method',
          'insufficient_evidence_count',
          'missing_behavioral_chain',
          'missing_cross_route_evidence',
          'shared_evidence_used_twice',
        ],
      },
    },
    hidden_systems: {
      evidence_reinterpretation_rules: [],
      forensics_queue_pressure_rules: {
        enabled: false,
        requires_player_facing_explanation: false,
        trigger_when: { action: 'none' },
        deterministic_variants: [],
      },
      ui_feedback_rules: [],
    },
    transition_context_hooks: [],
    outcome_flags: {
      success: ['flag_clean', 'flag_true_culprit'],
      partial: ['flag_partial'],
      failure: [],
    },
    next_case_rules: [],
  };
}

const CATALOG: ClosureCatalog = {
  suspect_ids: ['char_real', 'char_decoy'],
  method_ids: ['method_x'],
};

function verifyAll(state: EngineState, definition: RuntimeCaseDefinition, ids: string[]): void {
  for (const id of ids) {
    state.verifiedEvidenceIds.add(id);
    state.evidenceStates[id] = 'verified';
  }
  recomputeClosureBuckets(definition, state);
}

function mkAttempt(overrides?: Partial<ClosureAttempt>): ClosureAttempt {
  return {
    submitted_suspect: 'char_real',
    submitted_motive: 'motive_true',
    submitted_method_or_timeline: 'method_x',
    submitted_evidence_ids: ['EVID-BEHAV-01', 'EVID-CROSS-01', 'EVID-A'],
    ...overrides,
  };
}

describe('ClosureSystem', () => {
  let definition: RuntimeCaseDefinition;
  let state: EngineState;
  let system: ClosureSystem;

  beforeEach(() => {
    definition = mkDefinition();
    state = createInitialState(definition);
    verifyAll(state, definition, ['EVID-A', 'EVID-B', 'EVID-BEHAV-01', 'EVID-CROSS-01']);
    system = new ClosureSystem(state, definition, CATALOG);
  });

  it('grants true_success only when both culprit and motive are true', () => {
    const outcome = system.validateClosureAttempt(mkAttempt());
    expect(outcome.decision.accepted).toBe(true);
    expect(outcome.decision.mode).toBe('true_success');
    expect(outcome.decision.granted_flags).toEqual(expect.arrayContaining(['flag_clean', 'flag_true_culprit']));
  });

  it('downgrades a wrong-person accusation with the true motive to false_success', () => {
    const outcome = system.validateClosureAttempt(mkAttempt({ submitted_suspect: 'char_decoy' }));
    expect(outcome.decision.accepted).toBe(true);
    expect(outcome.decision.mode).toBe('false_success');
    expect(outcome.decision.granted_flags).toEqual(
      expect.arrayContaining(['flag_partial', 'test_false_close', 'accused_wrong_flag']),
    );
  });

  it('grants per-suspect flags when the decoy is convicted with a false motive', () => {
    const outcome = system.validateClosureAttempt(
      mkAttempt({ submitted_suspect: 'char_decoy', submitted_motive: 'motive_false' }),
    );
    expect(outcome.decision.mode).toBe('false_success');
    expect(outcome.decision.granted_flags).toContain('accused_wrong_flag');
  });

  it('does not grant suspect flags when the real culprit is accused with a false motive', () => {
    const outcome = system.validateClosureAttempt(mkAttempt({ submitted_motive: 'motive_false' }));
    expect(outcome.decision.mode).toBe('false_success');
    expect(outcome.decision.granted_flags).not.toContain('accused_wrong_flag');
  });

  it('rejects a suspect outside the closure catalog', () => {
    const outcome = system.validateClosureAttempt(mkAttempt({ submitted_suspect: 'char_bystander' }));
    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.mode).toBe('rejected');
    expect(outcome.decision.reason_codes).toContain('missing_culprit');
    expect(outcome.decision.granted_flags).toHaveLength(0);
  });

  it('rejects an unknown motive', () => {
    const outcome = system.validateClosureAttempt(mkAttempt({ submitted_motive: 'motive_unknown' }));
    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.reason_codes).toContain('missing_motive');
  });

  it('rejects when verified evidence count is below the minimum', () => {
    const outcome = system.validateClosureAttempt(
      mkAttempt({ submitted_evidence_ids: ['EVID-BEHAV-01', 'EVID-CROSS-01'] }),
    );
    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.reason_codes).toContain('insufficient_evidence_count');
  });

  it('rejects when the behavioral chain member is missing', () => {
    const outcome = system.validateClosureAttempt(
      mkAttempt({ submitted_evidence_ids: ['EVID-CROSS-01', 'EVID-A', 'EVID-B'] }),
    );
    expect(outcome.decision.reason_codes).toContain('missing_behavioral_chain');
  });

  it('rejects when the cross-route member is missing', () => {
    const outcome = system.validateClosureAttempt(
      mkAttempt({ submitted_evidence_ids: ['EVID-BEHAV-01', 'EVID-A', 'EVID-B'] }),
    );
    expect(outcome.decision.reason_codes).toContain('missing_cross_route_evidence');
  });

  it('rejects evidence shared across both role lists when configured', () => {
    const sharedDef = mkDefinition({ behavioralIds: ['EVID-A'], crossRouteIds: ['EVID-A'] });
    const sharedState = createInitialState(sharedDef);
    verifyAll(sharedState, sharedDef, ['EVID-A', 'EVID-B', 'EVID-BEHAV-01']);
    const sharedSystem = new ClosureSystem(sharedState, sharedDef, CATALOG);

    const outcome = sharedSystem.validateClosureAttempt(
      mkAttempt({ submitted_evidence_ids: ['EVID-A', 'EVID-B', 'EVID-BEHAV-01'] }),
    );
    expect(outcome.decision.reason_codes).toContain('shared_evidence_used_twice');
  });

  it('keeps legacy motive-only verdicts when accepted_true_culprit_ids is absent', () => {
    const legacyDef = mkDefinition({ acceptedTrueCulpritIds: undefined });
    const legacyState = createInitialState(legacyDef);
    verifyAll(legacyState, legacyDef, ['EVID-A', 'EVID-B', 'EVID-BEHAV-01', 'EVID-CROSS-01']);
    const legacySystem = new ClosureSystem(legacyState, legacyDef, CATALOG);

    const outcome = legacySystem.validateClosureAttempt(mkAttempt({ submitted_suspect: 'char_decoy' }));
    expect(outcome.decision.mode).toBe('true_success');
  });
});
