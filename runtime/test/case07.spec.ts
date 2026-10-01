import { describe, it, expect, beforeEach } from "vitest";
import { CoreEngine, createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import type { StaticCaseBlueprintConfig } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import type { DomainEvent, RuntimeCaseAdapter, RuntimeCaseDefinition } from "../src/types.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 07 Integration: The Secret Ink", () => {
  let case07Definition: RuntimeCaseDefinition;
  let case07Blueprints: StaticCaseBlueprintConfig;
  let adapter: RuntimeCaseAdapter;
  let engine: CoreEngine;

  beforeEach(() => {
    const casePath = join(__dirname, '../../cases/case07/case07.json');
    const blueprintsPath = join(__dirname, '../../cases/case07/blueprints.json');
    
    case07Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case07Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));
    
    adapter = buildRuntimeCaseAdapter(case07Definition, case07Blueprints);
    engine = createRuntime(adapter);
  });

  it("loads Case 07 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case07");
    expect(snapshot.evidenceStates["EVID-07-03"]).toBe("partial"); // USB Contracts is partial
  });

  it("upgrades the delayed forgery evidence after the follow-up interrogation tick", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-DOC-07",
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-GABER-01",
      interaction_id: "Q02",
    });

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.case_id).toBe("case07");
    expect(finalSnapshot.evidenceStates["EVID-07-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-07-03"]).toBe("verified");

    const events = finalSnapshot.eventTrace || [];
    expect(
      events.some(
        (event: DomainEvent) =>
          event.event_name === EVENT_NAME.EVIDENCE_VERIFIED
          && event.source_ref === "LAB-DOC-07"
          && event.result === "institutional_forgery_ink_detected",
      ),
    ).toBe(true);
  });

  it("applies the case05 carryover summary when usb_evidence_collected exists", () => {
    const engineWithCarryover = createRuntime(adapter, {
      globalFlags: ["usb_evidence_collected"],
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
      source_ref: "LAB-DOC-07",
    });

    const snapshot = engineWithCarryover.getSnapshot();
    expect(snapshot.evidenceSummaries["EVID-07-03"]).toContain("مصر الجديدة");
    expect(snapshot.flags).toContain("forgery_network_confirmed");
  });

  it("accepts the authored closure route to case08", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-DOC-07",
    });
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-GABER-01",
      interaction_id: "Q02",
    });

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-07-01",
        submitted_motive: "motive_conceal_forgery_network",
        submitted_method_or_timeline: "method_institutional_forgery_assault",
        submitted_evidence_ids: ["EVID-07-01", "EVID-07-02", "EVID-07-03"],
      }
    });

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toContain("case07_resolved_true");
  });
});
