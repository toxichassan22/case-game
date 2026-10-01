import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 21 Integration: The First Name", () => {
  let case21Definition: any;
  let case21Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case21/case21.json");
    const blueprintsPath = join(__dirname, "../../cases/case21/blueprints.json");

    case21Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case21Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case21Definition, case21Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectTornList() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE21_TORN_LIST",
      interaction_id: "PAPER_TEAR_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "name_intentionally_removed",
    } as any);
  }

  function lockThesisTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-21-THESIS",
      expected_player_action: "lock_timeline_event",
      required_result: "thesis_matches_poison",
    } as any);
  }

  function inspectToxicology() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "LAB-TOX-21",
      interaction_id: "TOXICOLOGY_REVIEW",
      expected_player_action: "inspect_object",
      required_result: "signature_poison_used_openly",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectTornList();
    lockThesisTimeline();
    inspectToxicology();
  }

  it("loads case21 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case21");
    expect(snapshot.evidenceStates["EVID-21-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-21-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-21-03"]).toBe("partial");
  });

  it("completes the authored torn-list, thesis, and toxicology chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-21-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-21-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-21-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.EVIDENCE_VERIFIED
          && event.source_ref === "LAB-TOX-21"
          && event.result === "signature_poison_used_openly",
      ),
    ).toBe(true);
  });

  it("applies the provisional torn-list result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectTornList();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-21-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-21-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the thesis timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectTornList();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-21-THESIS",
      expected_player_action: "lock_timeline_event",
      required_result: "thesis_matches_poison",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with an ego motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-21-01",
        submitted_motive: "motive_ego",
        submitted_method_or_timeline: "method_syndicate_silencing",
        submitted_evidence_ids: ["EVID-21-01", "EVID-21-02", "EVID-21-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case21_resolved_true",
        "case21_professor_resolved",
        "alchemist_was_student",
        "torn_name_clue",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-21-01",
        submitted_motive: "motive_professional_jealousy",
        submitted_method_or_timeline: "method_syndicate_silencing",
        submitted_evidence_ids: ["EVID-21-01", "EVID-21-02", "EVID-21-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case21_professor_resolved",
        "case21_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case21_resolved_true",
        "alchemist_was_student",
        "torn_name_clue",
      ]),
    );
  });
});
