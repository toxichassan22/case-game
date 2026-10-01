import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 06 Integration: Breaking Symmetry", () => {
  let case06Definition: any;
  let case06Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case06/case06.json');
    const blueprintsPath = join(__dirname, '../../cases/case06/blueprints.json');
    
    case06Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case06Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case06Definition, case06Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 06 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case06");
    expect(snapshot.evidenceStates["EVID-06-02"]).toBe("partial"); // Suicide note is partial
  });

  it("upgrades the rope evidence through the tracing interaction", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE06_ROPE",
      interaction_id: "TRACING",
      expected_player_action: "inspect_object",
      required_result: "recent_cash_purchase_unrelated_to_victim"
    });

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case06");
    expect(finalSnapshot.evidenceStates["EVID-06-01"]).toBe("verified");

    const events = finalSnapshot.eventTrace || [];
    expect(
      events.some(
        (event: any) =>
          event.event_name === EVENT_NAME.EVIDENCE_VERIFIED
          && event.source_ref === "CASE06_ROPE"
          && event.result === "recent_cash_purchase_unrelated_to_victim",
      ),
    ).toBe(true);
  });

  it("accepts the authored closure route after rope and linguistics verification", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE06_ROPE",
      interaction_id: "TRACING",
      expected_player_action: "inspect_object",
      required_result: "recent_cash_purchase_unrelated_to_victim"
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-LING-06",
      interaction_id: "SEMANTIC-ANALYSIS",
      expected_player_action: "review_report",
      required_result: "stylistic_mismatch_detected"
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-06-NONE",
        submitted_motive: "motive_psychological_manipulation_murder",
        submitted_method_or_timeline: "method_psychological_manipulation_murder",
        submitted_evidence_ids: ["EVID-06-01", "EVID-06-02", "EVID-06-03"],
      }
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toContain("case06_whisperer_first_sighting");
  });
});
