import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 17 Integration: The Revolving Door", () => {
  let case17Definition: any;
  let case17Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case17/case17.json");
    const blueprintsPath = join(__dirname, "../../cases/case17/blueprints.json");

    case17Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case17Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case17Definition, case17Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectUsbMalware() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE17_USB_MALWARE",
      interaction_id: "CODE_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "clockmaker_signature_found",
    } as any);
  }

  function lockTelegramTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-17-TG",
      expected_player_action: "lock_timeline_event",
      required_result: "egyptian_ip_metadata_verified",
    } as any);
  }

  function lockTargetsTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-17-TARGETS",
      expected_player_action: "lock_timeline_event",
      required_result: "player_file_access_identified",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectUsbMalware();
    lockTelegramTimeline();
    lockTargetsTimeline();
  }

  it("loads case17 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case17");
    expect(snapshot.evidenceStates["EVID-17-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-17-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-17-03"]).toBe("locked");
  });

  it("completes the authored backdoor, telegram metadata, and player-targeting chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-17-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-17-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-17-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.interaction_id === "LINK-17-TARGETS"
          && event.result === "player_file_access_identified",
      ),
    ).toBe(true);
  });

  it("applies the provisional malware-analysis result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectUsbMalware();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-17-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-17-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the target timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectUsbMalware();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-17-TARGETS",
      expected_player_action: "lock_timeline_event",
      required_result: "player_file_access_identified",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate infiltration motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-17-01",
        submitted_motive: "motive_syndicate_infiltration",
        submitted_method_or_timeline: "method_syndicate_infiltration",
        submitted_evidence_ids: ["EVID-17-01", "EVID-17-02", "EVID-17-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case17_resolved_true",
        "case17_hack_resolved",
        "clockmaker_inside_system",
        "player_file_compromised",
        "clock_zero_username",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-17-01",
        submitted_motive: "motive_hacktivist_prank",
        submitted_method_or_timeline: "method_syndicate_infiltration",
        submitted_evidence_ids: ["EVID-17-01", "EVID-17-02", "EVID-17-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case17_hack_resolved",
        "case17_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case17_resolved_true",
        "clockmaker_inside_system",
        "player_file_compromised",
        "clock_zero_username",
      ]),
    );
  });
});
