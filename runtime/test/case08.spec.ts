import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 08 Integration: The Inverted Face", () => {
  let case08Definition: any;
  let case08Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case08/case08.json');
    const blueprintsPath = join(__dirname, '../../cases/case08/blueprints.json');
    
    case08Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case08Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case08Definition, case08Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 08 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case08");
    expect(snapshot.evidenceStates["EVID-08-01"]).toBe("partial"); // Bank records
  });

  it("verifies the timeline clue through bank-pattern inspection", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE08_BANK_RECORDS",
      interaction_id: "PATTERN_MATCH",
      expected_player_action: "inspect_object",
      required_result: "perfect_time_symmetry_found"
    });

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case08");
    expect(finalSnapshot.evidenceStates["EVID-08-01"]).toBe("verified");

    const events = finalSnapshot.eventTrace || [];
    expect(
      events.some(
        (event: any) =>
          event.event_name === EVENT_NAME.EVIDENCE_VERIFIED
          && event.source_ref === "CASE08_BANK_RECORDS"
          && event.result === "perfect_time_symmetry_found",
      ),
    ).toBe(true);
  });

  it("completes the malware and interrogation chain to unlock all closure evidence", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE08_BANK_RECORDS",
      interaction_id: "PATTERN_MATCH",
      expected_player_action: "inspect_object",
      required_result: "perfect_time_symmetry_found"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-08",
      interaction_id: "REVERSE-ENGINEER",
      expected_player_action: "review_report",
      required_result: "clockmaker_variables_uncovered"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-SAYED-01",
      interaction_id: "Q04",
    });

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-08-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-08-03"]).toBe("verified");
  });

  it("accepts the authored closure route to case09", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE08_BANK_RECORDS",
      interaction_id: "PATTERN_MATCH",
      expected_player_action: "inspect_object",
      required_result: "perfect_time_symmetry_found"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-08",
      interaction_id: "REVERSE-ENGINEER",
      expected_player_action: "review_report",
      required_result: "clockmaker_variables_uncovered"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-SAYED-01",
      interaction_id: "Q04",
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-08-01",
        submitted_motive: "motive_clockmaker_field_test",
        submitted_method_or_timeline: "method_digital_identity_theft",
        submitted_evidence_ids: ["EVID-08-01", "EVID-08-02", "EVID-08-03"],
      }
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toContain("case08_resolved_true");
  });
});
