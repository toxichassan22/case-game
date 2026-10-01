import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 10 Integration: The Silent Partner", () => {
  let case10Definition: any;
  let case10Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case10/case10.json');
    const blueprintsPath = join(__dirname, '../../cases/case10/blueprints.json');
    
    case10Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case10Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case10Definition, case10Blueprints);
    engine = createRuntime(adapter);
  });

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-MED-10",
      interaction_id: "COMPOUND-MATCH",
      expected_player_action: "review_report",
      required_result: "alchemist_compound_confirmed"
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE10_SECURITY_FOOTAGE_LOG",
      interaction_id: "DOWNTIME_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "symmetry_detected_0330"
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-DOC-10",
      interaction_id: "FINANCIAL-AUDIT",
      expected_player_action: "review_report",
      required_result: "laundering_network_identified"
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-SAMEH-01",
      interaction_id: "Q05",
      expected_player_action: "interrogate",
      required_result: "fear_of_the_network"
    } as any);
  }

  it("loads Case 10 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case10");
    expect(snapshot.evidenceStates["EVID-10-01"]).toBe("partial"); // Toxicology is partial
  });

  it("completes the authored evidence chain across all three routes", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case10");
    expect(finalSnapshot.evidenceStates["EVID-10-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-10-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-10-03"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-10-04"]).toBe("verified");
  });

  it("applies the provisional toxicology variant when queue pressure selects it", () => {
    engine.state.currentTick = 1;

    engine.processAction({ 
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, 
      source_ref: "LAB-MED-10",
      interaction_id: "COMPOUND-MATCH",
      expected_player_action: "review_report",
      required_result: "alchemist_compound_confirmed"
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-10-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-10-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the financial audit for one step when queue pressure selects the delay variant", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-MED-10",
      interaction_id: "COMPOUND-MATCH",
      expected_player_action: "review_report",
      required_result: "alchemist_compound_confirmed"
    } as any);

    const blockedAudit = engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-DOC-10",
      interaction_id: "FINANCIAL-AUDIT",
      expected_player_action: "review_report",
      required_result: "laundering_network_identified"
    } as any);

    expect(blockedAudit.accepted).toBe(false);
    expect(blockedAudit.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().evidenceStates["EVID-10-03"]).toBe("partial");
  });

  it('should process a successful closure with true motive', () => {
    completeAuthoredChain();

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-10-01',
        submitted_motive: 'motive_trinity_liquidation',
        submitted_method_or_timeline: 'method_syndicate_assassination',
        submitted_evidence_ids: ['EVID-10-01', 'EVID-10-02', 'EVID-10-04', 'EVID-10-03']
      }
    };

    engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(engine.state.lastClosureDecision?.mode).toBe("true_success");
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case10_resolved_true",
        "arc1_complete",
        "trinity_first_identified",
        "shadow_first_message",
        "trinity_awareness_maxed",
      ]),
    );
  });

  it('should result in false_success when a wrong but plausible motive is chosen', () => {
    completeAuthoredChain();

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: 'SUSP-10-01',
        submitted_motive: 'motive_partner_financial_dispute',
        submitted_method_or_timeline: 'method_syndicate_assassination',
        submitted_evidence_ids: ['EVID-10-01', 'EVID-10-02', 'EVID-10-04', 'EVID-10-03']
      }
    };

    engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(engine.state.lastClosureDecision?.mode).toBe("false_success");
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "arc1_complete",
        "case10_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "trinity_first_identified",
        "shadow_first_message",
        "trinity_awareness_maxed",
      ]),
    );
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
