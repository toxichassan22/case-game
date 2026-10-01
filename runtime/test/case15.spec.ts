import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 15 Integration: The Fifth Cell", () => {
  let case15Definition: any;
  let case15Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case15/case15.json");
    const blueprintsPath = join(__dirname, "../../cases/case15/blueprints.json");

    case15Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case15Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case15Definition, case15Blueprints);
    engine = createRuntime(adapter);
  });

  function reviewFood() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-15",
      interaction_id: "FOOD_ANALYSIS",
      expected_player_action: "review_report",
      required_result: "tasteless_toxin_identified",
    } as any);
  }

  function lockCctvTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-15-CCTV",
      expected_player_action: "lock_timeline_event",
      required_result: "six_minute_outage_verified",
    } as any);
  }

  function lockPhoneTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-15-PHONE",
      expected_player_action: "lock_timeline_event",
      required_result: "spoofed_caller_id_verified",
    } as any);
  }

  function inspectWallMessage() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE15_WALL_MESSAGE",
      interaction_id: "MESSAGE_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "whisperer_taunt_identified",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    reviewFood();
    lockCctvTimeline();
    lockPhoneTimeline();
    inspectWallMessage();
  }

  it("loads case15 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case15");
    expect(snapshot.evidenceStates["EVID-15-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-15-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-15-03"]).toBe("locked");
    expect(snapshot.evidenceStates["EVID-15-04"]).toBe("partial");
  });

  it("completes the authored toxicology, timeline, and wall-message chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-15-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-15-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-15-03"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-15-04"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.interaction_id === "LINK-15-PHONE"
          && event.result === "spoofed_caller_id_verified",
      ),
    ).toBe(true);
  });

  it("applies the provisional food-analysis result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    reviewFood();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-15-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-15-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the CCTV timeline link when the legacy queue trigger selects the delay variant", () => {
    reviewFood();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-15-CCTV",
      expected_player_action: "lock_timeline_event",
      required_result: "six_minute_outage_verified",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with the trinity message motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-15-01",
        submitted_motive: "motive_trinity_message",
        submitted_method_or_timeline: "method_syndicate_message",
        submitted_evidence_ids: ["EVID-15-01", "EVID-15-02", "EVID-15-03", "EVID-15-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case15_resolved_true",
        "case15_cell_resolved",
        "trinity_coordinated_attack",
        "trinity_knows_player",
        "case15_pattern_set",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-15-01",
        submitted_motive: "motive_accidental_poisoning",
        submitted_method_or_timeline: "method_syndicate_message",
        submitted_evidence_ids: ["EVID-15-01", "EVID-15-02", "EVID-15-03", "EVID-15-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case15_cell_resolved",
        "case15_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case15_resolved_true",
        "trinity_coordinated_attack",
        "trinity_knows_player",
        "case15_pattern_set",
      ]),
    );
  });
});
