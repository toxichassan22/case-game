import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/engine/store.js';
import { generatePhsHint } from '../src/engine/phsSystem.js';
import type { RuntimeCaseDefinition } from '../src/types.js';

describe('PHS System', () => {
  let mockDefinition: RuntimeCaseDefinition;

  beforeEach(() => {
    mockDefinition = {
      case_id: 'test-case',
      title: 'Test Case',
      evidence_list: [
        {
          evidence_id: 'EVID-CRIT-01',
          title: 'Critical Evidence 1',
          type: 'document',
          evidence_tier: 'critical',
          evidence_role: 'direct',
          state: 'partial',
          details: { text: 'Some details' },
          tags: [],
          summary: 'Critical evidence summary'
        },
        {
          evidence_id: 'EVID-SUP-01',
          title: 'Supporting Evidence',
          type: 'physical',
          evidence_tier: 'supporting',
          evidence_role: 'context',
          details: { text: 'Some details' },
          tags: [],
          summary: 'Supporting evidence summary'
        }
      ],
      closure_rules: {
        validate_closure: {
          minimum_behavioral_chain_verified: 1,
          minimum_cross_route_verified: 0,
          required_evidence_ids: ['EVID-CRIT-01']
        }
      }
    } as unknown as RuntimeCaseDefinition;
  });

  it('should start at L1 and highlight the first missing critical evidence', () => {
    const state = createInitialState(mockDefinition);
    const event = generatePhsHint(state, mockDefinition);

    expect(event).not.toBeNull();
    const hint = JSON.parse(event!.result);
    expect(hint.level).toBe('L1');
    expect(hint.type).toBe('highlight');
    expect(hint.payload.source_ref).toBe('EVID-CRIT-01');
    expect(state.phsState.currentLevel).toBe(1);
  });

  it('should progress to L2 if no progress is made', () => {
    const state = createInitialState(mockDefinition);
    
    // First request
    generatePhsHint(state, mockDefinition);
    
    // Second request (no progress)
    const event = generatePhsHint(state, mockDefinition);
    
    const hint = JSON.parse(event!.result);
    expect(hint.level).toBe('L2');
    expect(hint.type).toBe('note');
    expect(state.phsState.currentLevel).toBe(2);
  });

  it('should reset back to L1 if progress is made (new evidence verified)', () => {
    const state = createInitialState(mockDefinition);
    
    // First request (L1)
    generatePhsHint(state, mockDefinition);
    // Second request (L2)
    generatePhsHint(state, mockDefinition);
    expect(state.phsState.currentLevel).toBe(2);

    // Simulate progress
    state.verifiedEvidenceIds.add('EVID-SUP-01');
    
    // Third request after progress resets the hint ladder
    const event = generatePhsHint(state, mockDefinition);
    const hint = JSON.parse(event!.result);
    expect(hint.level).toBe('L1');
    expect(state.phsState.currentLevel).toBe(1);
    expect(state.phsState.lastVerifiedCount).toBe(1);
  });

  it('should correctly select authored terminal hints at cap without falling back to L<max>+', () => {
    const terminalDefinition = {
      ...mockDefinition,
      maxPhsLevels: 7,
      phs_hints: [
        {
          level: 'L7',
          type: 'highlight',
          payload: {
            text: 'TERMINAL AUTHOR HINT',
            source_ref: 'EVID-CRIT-01'
          }
        }
      ]
    } as any;

    const state = createInitialState(terminalDefinition);
    state.phsState.currentLevel = 7;
    state.phsState.lastProgressTick = 1;
    
    const event = generatePhsHint(state, terminalDefinition);
    const hint = JSON.parse(event!.result);
    
    expect(hint.level).toBe('L7');
    expect(hint.payload.text).toBe('TERMINAL AUTHOR HINT');
    expect(state.phsState.currentLevel).toBe(7);
  });

  it('should provide behavioral chain hints if all critical evidence is verified', () => {
    const state = createInitialState(mockDefinition);
    state.verifiedEvidenceIds.add('EVID-CRIT-01');
    
    const event = generatePhsHint(state, mockDefinition);
    const hint = JSON.parse(event!.result);
    
    expect(hint.payload.text).toContain('سلوك');
  });

  it('should use specific phs_hints from the definition if available', () => {
    const pDefinition = {
      ...mockDefinition,
      phs_hints: [
        {
          level: 'L1',
          type: 'highlight',
          payload: {
            text: 'CUSTOM L1 HINT',
            source_ref: 'EVID-CRIT-01'
          }
        }
      ]
    } as any;

    const state = createInitialState(pDefinition);
    const event = generatePhsHint(state, pDefinition);
    const hint = JSON.parse(event!.result);
    
    expect(hint.payload.text).toBe('CUSTOM L1 HINT');
  });
});
