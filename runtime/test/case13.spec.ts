import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 13 Integration: The Drowned", () => {
  let case13Definition: any;
  let case13Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case13/case13.json");
    const blueprintsPath = join(__dirname, "../../cases/case13/blueprints.json");

    case13Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case13Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case13Definition, case13Blueprints);
    engine = createRuntime(adapter);
  });

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-13",
      interaction_id: "CHEMICAL_ANALYSIS",
      expected_player_action: "review_report",
      required_result: "paralysis_toxin_identified",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      source_ref: "TIMELINE-BOARD",
      interaction_id: "LINK-13-CCTV",
      expected_player_action: "connect_evidence",
      required_result: "six_minute_outage_verified",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "CASE13_KAMAL_NOTES",
      interaction_id: "PAGES_RESTORED",
      expected_player_action: "review_document",
      required_result: "institution_link_found",
    } as any);
  }

  it("loads Case 13 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case13");
    expect(snapshot.evidenceStates["EVID-13-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-13-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-13-03"]).toBe("partial");
  });

  it("completes the authored toxin, timeline, and notes chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-13-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-13-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-13-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.source_ref === "TIMELINE-BOARD"
          && event.result === "six_minute_outage_verified",
      ),
    ).toBe(true);
  });

  it("applies the provisional toxicology variant when queue pressure selects it", () => {
    engine.state.currentTick = 1;

    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-13",
      interaction_id: "CHEMICAL_ANALYSIS",
      expected_player_action: "review_report",
      required_result: "paralysis_toxin_identified",
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-13-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-13-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks Kamal's notes for one step when queue pressure selects the delay variant", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-TOX-13",
      interaction_id: "CHEMICAL_ANALYSIS",
      expected_player_action: "review_report",
      required_result: "paralysis_toxin_identified",
    } as any);

    const blockedNotes = engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "CASE13_KAMAL_NOTES",
      interaction_id: "PAGES_RESTORED",
      expected_player_action: "review_document",
      required_result: "institution_link_found",
    } as any);

    expect(blockedNotes.accepted).toBe(false);
    expect(blockedNotes.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().evidenceStates["EVID-13-02"]).toBe("partial");
  });

  it("accepts the authored closure route with trinity assassination as the motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-13-01",
        submitted_motive: "motive_trinity_assassination",
        submitted_method_or_timeline: "method_syndicate_assassination",
        submitted_evidence_ids: ["EVID-13-01", "EVID-13-02", "EVID-13-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case13_resolved_true",
        "case13_drowned_resolved",
        "whisperer_narrowed_to_institution",
        "kamal_notes_collected",
        "trinity_kills_investigators",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-13-01",
        submitted_motive: "motive_insurance_fraud",
        submitted_method_or_timeline: "method_syndicate_assassination",
        submitted_evidence_ids: ["EVID-13-01", "EVID-13-02", "EVID-13-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case13_drowned_resolved",
        "case13_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case13_resolved_true",
        "whisperer_narrowed_to_institution",
        "kamal_notes_collected",
        "trinity_kills_investigators",
      ]),
    );
  });

  it("should progress PHS levels returning hint payloads", () => {
    const result = engine.processAction({ type: PLAYER_ACTION_TYPE.REQUEST_PHS } as any);

    expect(result.emittedEvents.some((event: any) => event.event_name === EVENT_NAME.PHS_HINT_REVEALED)).toBe(true);

    const hintEvent = result.emittedEvents.find((event: any) => event.event_name === EVENT_NAME.PHS_HINT_REVEALED);
    const hint = JSON.parse(hintEvent.result!);
    expect(hint.level).toBeDefined();
    expect(hint.payload).toBeDefined();
  });
});
