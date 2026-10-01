import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 02 Integration: The Clockmaker's Echo", () => {
  let case02Definition: any;
  let case02Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case02/case02.json');
    const blueprintsPath = join(__dirname, '../../cases/case02/blueprints.json');
    
    case02Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case02Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case02Definition, case02Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 02 with initial state", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case02");
    expect(snapshot.evidenceStates["BK-OBJ-01"]).toBe("partial");
    expect(snapshot.evidenceStates["BK-DOC-01"]).toBe("verified");
    expect(engine.definition.solution?.explanation).toBeDefined();
  });

  it("inherits global flags and triggers 'Mirror' reinterpretation", () => {
    // Stage 2: Simulate carryover flag from Case 01
    const globalMemory = {
      globalFlags: ["is_clockmaker_suspicious_1"],
      playerProfile: {},
      cognitiveBiasScore: 0,
      trustLevels: {},
      hiddenNarrativeState: {},
      playerBehaviorLog: [],
      trinity_awareness_score: 0,
      vacant_trinity_role: null,
      first_case_closure_route: null,
      route_usage_stats: {
        timeline: 0,
        forensics: 0,
        behavioral: 0,
      },
      inventory_items: [],
      npc_global_memory: {},
    };
    
    const engineWithMemory = createRuntime(adapter, globalMemory, ["fact_case01_video_analyzed"]);
    
    
    // Force a tick to run reinterpretation
    engineWithMemory.processAction({ type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "BK-OBJ-01" });
    
    const finalSnapshot = engineWithMemory.getSnapshot();
    expect(finalSnapshot.flags).toContain("clockmaker_intervention_confirmed");
    expect(finalSnapshot.eventTrace.some((e: any) => e.event_name === "EVENT_CLOCKMAKER_REVEALED")).toBe(true);
    
    // Verify evidence reinterpretation side effects
    expect(finalSnapshot.evidenceSummaries["BK-OBJ-01"]).toContain("كيميائي");
  });

  it("should accept valid case closure for Case 02", () => {
    // Fill buckets via verifiedEvidenceIds and state
    engine.state.verifiedEvidenceIds.add("BK-OBJ-01");
    engine.state.verifiedEvidenceIds.add("BK-DOC-01");
    engine.state.verifiedEvidenceIds.add("BK-SRC-01");

    // Must set BOTH base and effective because reinterpretation resets effective to base
    engine.state.baseEvidenceStates["BK-OBJ-01"] = "verified";
    engine.state.baseEvidenceStates["BK-DOC-01"] = "verified";
    engine.state.baseEvidenceStates["BK-SRC-01"] = "verified";
    engine.state.evidenceStates["BK-OBJ-01"] = "verified";
    engine.state.evidenceStates["BK-DOC-01"] = "verified";
    engine.state.evidenceStates["BK-SRC-01"] = "verified";

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "char_ibrahim_giar",
        submitted_motive: "motive_insurance_fraud",
        submitted_method_or_timeline: "magnetic_pulse",
        submitted_evidence_ids: ["BK-OBJ-01", "BK-DOC-01", "BK-SRC-01"] 
      }
    };

    const _result = engine.processAction(action as any);
    expect(engine.state.lastClosureDecision?.accepted).toBe(true);
    expect(engine.state.lastClosureDecision?.mode).toBe("false_success");
  });

  it("falls back to the configured narrative rejection code when route proof is missing", () => {
    const definition = structuredClone(case02Definition);
    definition.closure_rules.minimum_evidence_count = 1;
    const isolatedAdapter = buildRuntimeCaseAdapter(definition, case02Blueprints);
    const isolatedEngine = createRuntime(isolatedAdapter);

    const action = {
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "char_ibrahim_giar",
        submitted_motive: "motive_insurance_fraud",
        submitted_method_or_timeline: "magnetic_pulse",
        submitted_evidence_ids: ["BK-DOC-01"]
      }
    };

    isolatedEngine.processAction(action as any);

    expect(isolatedEngine.state.lastClosureDecision?.accepted).toBe(false);
    expect(isolatedEngine.state.lastClosureDecision?.reason_codes).toEqual(["missing_clockmaker_link"]);
  });
});
