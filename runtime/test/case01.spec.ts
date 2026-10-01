import { beforeEach, describe, expect, it } from 'vitest';
import { createCase01Runtime } from '../src/case01/runtime.js';
import { loadRegisteredCaseAdapter } from '../src/cases/registry.js';
import { EVENT_NAME, FACT_TYPE, PLAYER_ACTION_TYPE } from '../src/engine/constants.js';
import { validateClosureAttempt } from '../src/engine/closureValidator.js';
import { createInitialState, recomputeClosureBuckets, setFact } from '../src/engine/store.js';
import type { RuntimeCaseAdapter } from '../src/types.js';

describe('Case 01 authored behavior', () => {
  let adapter: RuntimeCaseAdapter;

  beforeEach(async () => {
    adapter = await loadRegisteredCaseAdapter('case01');
  });

  function createClosureReadyState() {
    const state = createInitialState(adapter.definition);

    for (const evidenceId of ['SCN-03', 'EVID-PARTIAL-FALSE-ORIGIN-STORY', 'EVID-PARTIAL-LOCK']) {
      setFact(state, FACT_TYPE.EVIDENCE_VERIFIED, evidenceId, true);
      state.baseEvidenceStates[evidenceId] = 'verified';
      state.evidenceStates[evidenceId] = 'verified';
    }

    recomputeClosureBuckets(adapter.definition, state);
    return state;
  }

  it('rejects a wrong suspect even when the closure evidence is otherwise valid', () => {
    const outcome = validateClosureAttempt(adapter.definition, adapter.closureCatalog, createClosureReadyState(), {
      submitted_suspect: 'char_layla',
      submitted_motive: 'motive_embezzlement_black_ledger',
      submitted_method_or_timeline: 'method_arson_front_door',
      submitted_evidence_ids: ['SCN-03', 'EVID-PARTIAL-FALSE-ORIGIN-STORY', 'EVID-PARTIAL-LOCK'],
    });

    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.reason_codes).toContain('missing_culprit');
  });

  it('rejects a wrong method even when the culprit and motive are correct', () => {
    const outcome = validateClosureAttempt(adapter.definition, adapter.closureCatalog, createClosureReadyState(), {
      submitted_suspect: 'char_sharif',
      submitted_motive: 'motive_embezzlement_black_ledger',
      submitted_method_or_timeline: 'method_electrical_disguise',
      submitted_evidence_ids: ['SCN-03', 'EVID-PARTIAL-FALSE-ORIGIN-STORY', 'EVID-PARTIAL-LOCK'],
    });

    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.reason_codes).toContain('missing_method');
  });

  it('allows false_success only through an allowed weak motive and keeps the carryover flags out of closure', () => {
    const outcome = validateClosureAttempt(adapter.definition, adapter.closureCatalog, createClosureReadyState(), {
      submitted_suspect: 'char_sharif',
      submitted_motive: 'motive_insurance',
      submitted_method_or_timeline: 'method_arson_front_door',
      submitted_evidence_ids: ['SCN-03', 'EVID-PARTIAL-FALSE-ORIGIN-STORY', 'EVID-PARTIAL-LOCK'],
    });

    expect(outcome.decision).toMatchObject({
      accepted: true,
      mode: 'false_success',
    });
    expect(outcome.decision.granted_flags).toEqual(
      expect.arrayContaining([
        'case01_fire_resolved',
        'resolved_as_individual',
        'route_collaboration_completed',
        'case01_false_confidence_close',
      ]),
    );
    expect(outcome.decision.granted_flags).not.toEqual(
      expect.arrayContaining(['is_clockmaker_suspicious_1', 'kept_case01_camera_corruption_file']),
    );
  });

  it('keeps EVID-PARTIAL-LOCK non-final until the authored chain is complete', async () => {
    const runtime = await createCase01Runtime();

    expect(
      runtime.processAction({
        type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
        source_ref: 'CHIEF-DESK',
        interaction_id: 'REQ-EVIDENCE-01',
      }).accepted,
    ).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: 'SCN-03' }).accepted).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'SCN-03' }).accepted).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: 'OBJ-02' }).accepted).toBe(true);

    let snapshot = runtime.getSnapshot();
    expect(snapshot.evidenceStates['EVID-PARTIAL-LOCK']).toBe('contested');
    expect(snapshot.closureBuckets.crossRouteVerifiedIds).not.toContain('EVID-PARTIAL-LOCK');

    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'DB-06' }).accepted).toBe(true);

    snapshot = runtime.getSnapshot();
    expect(snapshot.evidenceStates['EVID-PARTIAL-LOCK']).toBe('partial');
    expect(snapshot.closureBuckets.crossRouteVerifiedIds).not.toContain('EVID-PARTIAL-LOCK');

    expect(
      runtime.processAction({
        type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
        source_ref: 'INT-SHARIF-01',
        interaction_id: 'Q06',
      }).accepted,
    ).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'SCN-04' }).accepted).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT, interaction_id: 'LOCK-EVENT-03' }).accepted).toBe(true);

    snapshot = runtime.getSnapshot();
    expect(snapshot.evidenceStates['EVID-PARTIAL-LOCK']).toBe('verified');
    expect(snapshot.closureBuckets.crossRouteVerifiedIds).toContain('EVID-PARTIAL-LOCK');
    expect(
      snapshot.eventTrace.some(
        (event: any) => event.event_name === EVENT_NAME.EVIDENCE_REINTERPRETED && event.source_ref === 'EVID-PARTIAL-LOCK',
      ),
    ).toBe(true);
  });

  it('returns authored PHS hints without consuming a tick', async () => {
    const runtime = await createCase01Runtime();

    const firstHint = runtime.processAction({ type: PLAYER_ACTION_TYPE.REQUEST_PHS });
    const secondHint = runtime.processAction({ type: PLAYER_ACTION_TYPE.REQUEST_PHS });

    expect(firstHint.tickConsumed).toBe(false);
    expect(secondHint.tickConsumed).toBe(false);
    expect(firstHint.emittedEvents[0].event_name).toBe(EVENT_NAME.PHS_HINT_REVEALED);
    expect(secondHint.emittedEvents[0].event_name).toBe(EVENT_NAME.PHS_HINT_REVEALED);

    expect(JSON.parse(firstHint.emittedEvents[0].result!).level).toBe('L1');
    expect(JSON.parse(secondHint.emittedEvents[0].result!).level).toBe('L2');
  });
});
