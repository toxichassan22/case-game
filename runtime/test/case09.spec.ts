import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE, FACT_TYPE } from "../src/engine/constants.js";
import { setFact } from "../src/engine/store.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 09 Integration: The Eleventh Hour", () => {
  let case09Definition: any;
  let case09Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case09/case09.json');
    const blueprintsPath = join(__dirname, '../../cases/case09/blueprints.json');
    
    case09Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case09Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case09Definition, case09Blueprints);
    engine = createRuntime(adapter);
  });

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-09",
      interaction_id: "HARDWARE-ANALYSIS",
      expected_player_action: "review_report",
      required_result: "batch_number_matches_case08"
    });

    // Case09's queue-pressure delay can temporarily block the timing link.
    // Advance authored time with neutral opens until the delay expires.
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "INT-MAGDY-01",
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      source_ref: "TIMELINE-BOARD",
      interaction_id: "LINK-09-01-08",
      expected_player_action: "connect_evidence",
      required_result: "clockmaker_time_symmetry_unlocked"
    });
  }

  it("loads Case 09 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case09");
    expect(snapshot.evidenceStates["EVID-09-03"]).toBe("verified"); // Graffiti is verified initially
  });

  it("completes the hardware-and-timeline chain through authored actions", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case09");
    expect(finalSnapshot.evidenceStates["EVID-09-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-09-02"]).toBe("verified");
  });

  it("applies the case08 carryover summary when timing_obsession_noted exists", () => {
    const engineWithCarryover = createRuntime(adapter, {
      globalFlags: ["timing_obsession_noted"],
      playerProfile: {},
      cognitiveBiasScore: 0,
      trustLevels: { police_trust: 100 },
      hiddenNarrativeState: {},
      playerBehaviorLog: [],
      trinity_awareness_score: 0,
      vacant_trinity_role: null,
      first_case_closure_route: null,
      route_usage_stats: { timeline: 0, forensics: 0, behavioral: 0 },
      inventory_items: [],
      npc_global_memory: {},
    });

    engineWithCarryover.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-09",
    });

    const snapshot = engineWithCarryover.getSnapshot();
    expect(snapshot.evidenceSummaries["EVID-09-02"]).toContain("الاختراقات البنكية");
    expect(snapshot.flags).toContain("clockmaker_pattern_confirmed");
  });

  function verifyEvidence(id: string) {
    setFact(engine.state, FACT_TYPE.EVIDENCE_VERIFIED, id, true);
    engine.state.baseEvidenceStates[id] = 'verified';
    engine.state.evidenceStates[id] = 'verified';
  }

  it('should process a successful closure with the authored action path', () => {
    completeAuthoredChain();

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-09-01',
        submitted_motive: 'motive_clockmaker_coverup',
        submitted_method_or_timeline: 'method_evidence_tampering_bombing',
        submitted_evidence_ids: ['EVID-09-01', 'EVID-09-02', 'EVID-09-03']
      }
    };

    engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(Array.from(engine.state.flags).some(f => (f as string).includes('_resolved_true') || (f as string).includes('_chain_resolved'))).toBe(true);
  });

  it('should result in false_success when a wrong but plausible motive is chosen', () => {
    verifyEvidence('EVID-09-01');
    engine.state.closureBuckets.crossRouteVerified.add('EVID-09-01');
    verifyEvidence('EVID-09-02');
    engine.state.closureBuckets.crossRouteVerified.add('EVID-09-02');
    

    verifyEvidence('EVID-09-03');
    engine.state.closureBuckets.crossRouteVerified.add('EVID-09-03');
    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-09-01',
        submitted_motive: 'motive_police_corruption_coverup',
        submitted_method_or_timeline: 'method_evidence_tampering_bombing',
        submitted_evidence_ids: ['EVID-09-01', 'EVID-09-02', 'EVID-09-03']
      }
    };

    engine.processAction(action as any);
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
