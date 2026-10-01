import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 04 Integration: The Perfect Employee", () => {
  let case04Definition: any;
  let case04Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case04/case04.json');
    const blueprintsPath = join(__dirname, '../../cases/case04/blueprints.json');
    
    case04Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case04Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case04Definition, case04Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 04 with initial state", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case04");
    expect(snapshot.evidenceStates["EVID-04-01"]).toBe("partial");
  });

  it("verifies evidence EVID-04-02 through dusting interaction", () => {
    // Simulate player inspecting and dusting the keyset
    const _res = engine.processAction({ 
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, 
      source_ref: "CASE04_KEYSET",
      interaction_id: "DUSTING",
      expected_player_action: "inspect_object",
      required_result: "keys_wiped_clean"
    });
    
    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case04");
    expect(finalSnapshot.evidenceStates["EVID-04-02"]).toBe("verified");
    
    const events = finalSnapshot.eventTrace || [];
    expect(events.some((e: any) => e.event_name === EVENT_NAME.EVIDENCE_VERIFIED)).toBe(true);
  });
});
