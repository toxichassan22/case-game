import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE, FACT_TYPE } from "../src/engine/constants.js";
import { setFact } from "../src/engine/store.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 03 Integration: A Pill of Lead", () => {
  let case03Definition: any;
  let case03Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case03/case03.json');
    const blueprintsPath = join(__dirname, '../../cases/case03/blueprints.json');
    
    case03Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case03Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case03Definition, case03Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 03 with initial state", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case03");
    expect(snapshot.evidenceStates["EVID-03-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-03-03"]).toBe("verified");
  });

  it("verifies evidence EVID-03-01 through LAB-TOX-03 report", () => {
    // 1. Inspect the medicine box to schedule the delayed trigger (emits EVENT_EVIDENCE_VERIFIED)
    const _a1 = engine.processAction({ 
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, 
      source_ref: "CASE03_MED_BOX",
      interaction_id: "INSPECT",
      expected_player_action: "inspect_object",
      required_result: "packaging_anomaly_detected"
    });
    
    // 2. Wait 2 ticks (valid actions) to advance the delayed trigger
    const _a2 = engine.processAction({ 
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, 
      source_ref: "CASE03_VICTIM_PHONE",
      interaction_id: "CALL-LOG",
      expected_player_action: "review_evidence",
      required_result: "dummy_call_logged"
    });
    const _a3 = engine.processAction({ 
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, 
      source_ref: "CASE03_ADEL_FINANCE",
      interaction_id: "TRANSFER-RECEIPT",
      expected_player_action: "review_evidence",
      required_result: "transfer_to_middleman_confirmed"
    });

    // 3. Review the lab report at T+3 to satisfy the trigger conditions
    const _a4 = engine.processAction({ 
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, 
      source_ref: "LAB-TOX-03",
      interaction_id: "RESULT-READY",
      expected_player_action: "review_report",
      required_result: "cyanide_analog_detected"
    });
    
    const finalSnapshot = engine.getSnapshot();
    
    // Assert case hasn't broken
    expect(finalSnapshot.case_id).toBe("case03");
    
    // Assert evidence transitioned to verified
    expect(finalSnapshot.evidenceStates["EVID-03-01"]).toBe("verified");
    
    // Assert the verification event was emitted
    const events = finalSnapshot.eventTrace || [];
    expect(events.some((e: any) => e.event_name === EVENT_NAME.EVIDENCE_VERIFIED)).toBe(true);
  });

  function verifyEvidence(id: string) {
    setFact(engine.state, FACT_TYPE.EVIDENCE_VERIFIED, id, true);
    engine.state.baseEvidenceStates[id] = 'verified';
    engine.state.evidenceStates[id] = 'verified';
  }

  it('should process a successful closure with true motive', () => {
    // Satisfy cross route
    verifyEvidence('EVID-03-01');
    engine.state.closureBuckets.crossRouteVerified.add('EVID-03-01');
    // Satisfy behavioral
    verifyEvidence('EVID-03-02');
    verifyEvidence('EVID-03-03');
    
    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-03-01',
        submitted_motive: 'motive_adel_debts_extortion',
        submitted_method_or_timeline: 'method_chemical_poisoning',
        submitted_evidence_ids: ['EVID-03-01', 'EVID-03-02', 'EVID-03-03']
      }
    };

    const _result = engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    // Should contain true resolve flag usually caseXX_resolved_true
    expect(Array.from(engine.state.flags).some(f => (f as string).includes('_resolved_true') || (f as string).includes('_chain_resolved'))).toBe(true);
  });

  it('should result in false_success when a wrong but plausible motive is chosen', () => {
    verifyEvidence('EVID-03-01');
    engine.state.closureBuckets.crossRouteVerified.add('EVID-03-01');
    verifyEvidence('EVID-03-02');
    verifyEvidence('EVID-03-03');

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-03-01',
        submitted_motive: 'motive_natural_heart_attack',
        submitted_method_or_timeline: 'method_chemical_poisoning',
        submitted_evidence_ids: ['EVID-03-01', 'EVID-03-02', 'EVID-03-03']
      }
    };

    const _result = engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(Array.from(engine.state.flags).some(f => (f as string).includes('_resolved_false'))).toBe(true);
  });

  it('should progress PHS levels returning hint payloads', () => {
    const action1 = { type: PLAYER_ACTION_TYPE.REQUEST_PHS };
    const result1 = engine.processAction(action1 as any);
    
    // Sometimes no authored hint so it falls back to dynamic, but the event is always emitted
    expect(result1.emittedEvents.some((e: any) => e.event_name === EVENT_NAME.PHS_HINT_REVEALED)).toBe(true);
    
    // Depending on the mocked state, level 1 or higher will be given
    const hintEvent = result1.emittedEvents.find((e: any) => e.event_name === EVENT_NAME.PHS_HINT_REVEALED);
    const hint = JSON.parse(hintEvent.result!);
    expect(hint.level).toBeDefined();
    expect(hint.payload).toBeDefined();
  });
});
