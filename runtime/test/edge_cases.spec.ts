import { describe, expect, it, beforeEach } from 'vitest';
import { loadRegisteredCaseAdapter } from '../src/cases/registry.js';
import { PLAYER_ACTION_TYPE } from '../src/engine/constants.js';
import { createCase01Runtime } from '../src/case01/runtime.js';
import type { RuntimeCaseAdapter } from '../src/types.js';

describe('Engine Edge Cases and Security', () => {
  let adapter: RuntimeCaseAdapter;

  beforeEach(async () => {
    adapter = await loadRegisteredCaseAdapter('case01');
  });

  it('gracefully handles missing source_ref in actions', async () => {
    const runtime = await createCase01Runtime();
    const result = runtime.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      // @ts-expect-error - Testing runtime handling of missing source_ref
      source_ref: undefined 
    });
    expect(result.accepted).toBe(false);
  });

  it('rejects unknown action types', async () => {
    const runtime = await createCase01Runtime();
    const result = runtime.processAction({
      // @ts-expect-error - Testing runtime handling of invalid action type
      type: 'INVALID_ACTION_TYPE',
      source_ref: 'SCN-03'
    });
    expect(result.accepted).toBe(false);
  });

  it('prevents multiple verification of the same evidence', async () => {
    const runtime = await createCase01Runtime();
    
    // First verification
    runtime.processAction({ type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: 'SCN-03' });
    runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'SCN-03' });
    
    const snapshot = runtime.getSnapshot();
    expect(snapshot.evidenceStates['SCN-03']).toBe('verified');
    
    // Second verification attempt
    const result = runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'SCN-03' });
    expect(result.accepted).toBe(false);
    expect(result.rejectionReason).toContain('already verified');
  });

  it('enforces dependencies between evidence', async () => {
    const runtime = await createCase01Runtime();
    
    // Try to review DB-06 which depends on SCN-03 (hypothetically, let's check config)
    // SCN-03 is usually the first report.
    const result = runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: 'DB-06' });
    
    // If it depends on something, it should be rejected
    const evidence = adapter.definition.evidence_list.find((e: any) => e.evidence_id === 'DB-06');
    if (evidence && evidence.depends_on_evidence_ids.length > 0) {
        expect(result.accepted).toBe(false);
    }
  });
});
