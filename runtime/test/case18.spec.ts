import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 18 Integration: The Mask", () => {
  let case18Definition: any;
  let case18Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case18/case18.json");
    const blueprintsPath = join(__dirname, "../../cases/case18/blueprints.json");

    case18Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case18Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case18Definition, case18Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectWaterReport() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "LAB-TOX-18",
      interaction_id: "WATER_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "alchemist_toxin_matches",
    } as any);
  }

  function lockScriptTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-18-SCRIPT",
      expected_player_action: "lock_timeline_event",
      required_result: "trinity_play_identified",
    } as any);
  }

  function interrogateNabil() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-NABIL-01",
      interaction_id: "Q_POISON",
      expected_player_action: "interrogate",
      required_result: "blackmail_motive_revealed",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectWaterReport();
    lockScriptTimeline();
    interrogateNabil();
  }

  it("loads case18 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case18");
    expect(snapshot.evidenceStates["EVID-18-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-18-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-18-03"]).toBe("partial");
  });

  it("completes the authored toxicology, play-script, and nabil confession chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-18-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-18-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-18-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.INTERROGATION_NODE_UNLOCKED
          && event.source_ref === "INT-NABIL-01"
          && event.result === "blackmail_motive_revealed",
      ),
    ).toBe(true);
  });

  it("applies the provisional toxicology result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectWaterReport();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-18-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-18-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the play-script timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectWaterReport();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-18-SCRIPT",
      expected_player_action: "lock_timeline_event",
      required_result: "trinity_play_identified",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate silencing motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-18-01",
        submitted_motive: "motive_syndicate_silencing",
        submitted_method_or_timeline: "method_syndicate_silencing",
        submitted_evidence_ids: ["EVID-18-01", "EVID-18-02", "EVID-18-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case18_resolved_true",
        "case18_theater_resolved",
        "trinity_silences_storytellers",
        "play_script_collected",
        "blackmail_as_weapon",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-18-01",
        submitted_motive: "motive_workplace_jealousy",
        submitted_method_or_timeline: "method_syndicate_silencing",
        submitted_evidence_ids: ["EVID-18-01", "EVID-18-02", "EVID-18-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case18_theater_resolved",
        "case18_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case18_resolved_true",
        "trinity_silences_storytellers",
        "play_script_collected",
        "blackmail_as_weapon",
      ]),
    );
  });
});
