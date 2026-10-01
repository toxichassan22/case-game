import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 05 Integration: The Archive", () => {
  let case05Definition: any;
  let case05Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case05/case05.json');
    const blueprintsPath = join(__dirname, '../../cases/case05/blueprints.json');
    
    case05Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case05Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case05Definition, case05Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 05 with proper initial conditions", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case05");
    expect(snapshot.evidenceStates["EVID-05-02"]).toBe("partial"); // USB is partial
  });

  it("upgrades the toxicology clue after the authored lab delay", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_BODY_NECK",
      interaction_id: "MICROSCOPIC-EXAM",
      expected_player_action: "inspect_object",
      required_result: "puncture_mark_found"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-05",
      interaction_id: "RESULT-READY",
      expected_player_action: "review_report",
      required_result: "artificial_cardiac_arrest_toxin"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_HIDDEN_USB",
      interaction_id: "DECRYPT",
      expected_player_action: "inspect_object",
      required_result: "forgery_network_uncovered"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_CIGARETTE",
      interaction_id: "COLLECT-DNA",
      expected_player_action: "inspect_object",
      required_result: "dna_swab_obtained"
    });

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case05");
    expect(finalSnapshot.evidenceStates["EVID-05-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-05-02"]).toBe("verified");

    const events = finalSnapshot.eventTrace || [];
    expect(events.some((e: any) => e.event_name === EVENT_NAME.EVIDENCE_VERIFIED)).toBe(true);
  });

  it("accepts the authored closure route to case06", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_BODY_NECK",
      interaction_id: "MICROSCOPIC-EXAM",
      expected_player_action: "inspect_object",
      required_result: "puncture_mark_found"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-05",
      interaction_id: "RESULT-READY",
      expected_player_action: "review_report",
      required_result: "artificial_cardiac_arrest_toxin"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_HIDDEN_USB",
      interaction_id: "DECRYPT",
      expected_player_action: "inspect_object",
      required_result: "forgery_network_uncovered"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE05_CIGARETTE",
      interaction_id: "COLLECT-DNA",
      expected_player_action: "inspect_object",
      required_result: "dna_swab_obtained"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-DNA-05",
      interaction_id: "DNA-MATCH",
      expected_player_action: "review_report",
      required_result: "dna_matches_essam"
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-05-01",
        submitted_motive: "motive_conceal_forgery",
        submitted_method_or_timeline: "method_institutional_forgery_homocide",
        submitted_evidence_ids: ["EVID-05-01", "EVID-05-02", "EVID-05-03"],
      }
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toContain("case05_correct_closure");
  });
});
