import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 22 Integration: The Chain", () => {
  let case22Definition: any;
  let case22Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case22/case22.json");
    const blueprintsPath = join(__dirname, "../../cases/case22/blueprints.json");

    case22Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case22Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case22Definition, case22Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectStolenMeds() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE22_STOLEN_MEDS",
      interaction_id: "INVENTORY_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "compound_ingredients_confirmed",
    } as any);
  }

  function lockChainTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-22-CHAIN",
      expected_player_action: "lock_timeline_event",
      required_result: "three_day_logistics_pattern_established",
    } as any);
  }

  function inspectMissingMessage() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "FIN-MISSING-MESSAGE",
      interaction_id: "TEXT_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "voluntary_disappearance_induced",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectStolenMeds();
    lockChainTimeline();
    inspectMissingMessage();
  }

  it("loads case22 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case22");
    expect(snapshot.evidenceStates["EVID-22-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-22-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-22-03"]).toBe("partial");
  });

  it("completes the authored logistics-chain, inventory, and missing-message chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-22-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-22-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-22-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.interaction_id === "LINK-22-CHAIN"
          && event.result === "three_day_logistics_pattern_established",
      ),
    ).toBe(true);
  });

  it("applies the provisional inventory result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectStolenMeds();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-22-02"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-22-02"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the logistics timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectStolenMeds();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-22-CHAIN",
      expected_player_action: "lock_timeline_event",
      required_result: "three_day_logistics_pattern_established",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate logistics motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-22-01",
        submitted_motive: "motive_syndicate_logistics",
        submitted_method_or_timeline: "method_syndicate_arson",
        submitted_evidence_ids: ["EVID-22-01", "EVID-22-02", "EVID-22-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case22_resolved_true",
        "case22_chain_resolved",
        "trinity_orchestrated_ops",
        "supply_chain_identified",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-22-01",
        submitted_motive: "motive_random_crime_wave",
        submitted_method_or_timeline: "method_syndicate_arson",
        submitted_evidence_ids: ["EVID-22-01", "EVID-22-02", "EVID-22-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case22_chain_resolved",
        "case22_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case22_resolved_true",
        "trinity_orchestrated_ops",
        "supply_chain_identified",
      ]),
    );
  });
});
