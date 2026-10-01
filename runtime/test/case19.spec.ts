import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 19 Integration: The Pit", () => {
  let case19Definition: any;
  let case19Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case19/case19.json");
    const blueprintsPath = join(__dirname, "../../cases/case19/blueprints.json");

    case19Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case19Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case19Definition, case19Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectLandDeed() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE19_LAND_DEED",
      interaction_id: "INK_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "forgery_ink_matches_case05",
    } as any);
  }

  function lockMaghrabyTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-19-MAGHRABY",
      expected_player_action: "lock_timeline_event",
      required_result: "maghraby_funding_confirmed",
    } as any);
  }

  function interrogateSafwat() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-SAFWAT-01",
      interaction_id: "Q_PROTECTION",
      expected_player_action: "interrogate",
      required_result: "protection_fear_revealed",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectLandDeed();
    lockMaghrabyTimeline();
    interrogateSafwat();
  }

  it("loads case19 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case19");
    expect(snapshot.evidenceStates["EVID-19-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-19-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-19-03"]).toBe("partial");
  });

  it("completes the authored forged-land, finance-link, and safwat confession chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-19-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-19-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-19-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.INTERROGATION_NODE_UNLOCKED
          && event.source_ref === "INT-SAFWAT-01"
          && event.result === "protection_fear_revealed",
      ),
    ).toBe(true);
  });

  it("applies the provisional land-deed result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectLandDeed();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-19-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-19-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the Maghraby timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectLandDeed();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-19-MAGHRABY",
      expected_player_action: "lock_timeline_event",
      required_result: "maghraby_funding_confirmed",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate funding motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-19-01",
        submitted_motive: "motive_syndicate_funding",
        submitted_method_or_timeline: "method_syndicate_artifacts_smuggling",
        submitted_evidence_ids: ["EVID-19-01", "EVID-19-02", "EVID-19-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case19_resolved_true",
        "case19_artifacts_resolved",
        "trinity_economics_mapped",
        "forgery_covers_antiquities",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-19-01",
        submitted_motive: "motive_accidental_death",
        submitted_method_or_timeline: "method_syndicate_artifacts_smuggling",
        submitted_evidence_ids: ["EVID-19-01", "EVID-19-02", "EVID-19-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case19_artifacts_resolved",
        "case19_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case19_resolved_true",
        "trinity_economics_mapped",
        "forgery_covers_antiquities",
      ]),
    );
  });
});
