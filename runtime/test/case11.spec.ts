import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 11 Integration: The Echo", () => {
  let case11Definition: any;
  let case11Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case11/case11.json");
    const blueprintsPath = join(__dirname, "../../cases/case11/blueprints.json");

    case11Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case11Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case11Definition, case11Blueprints);
    engine = createRuntime(adapter);
  });

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "CASE11_SARAH_ARTICLE",
      interaction_id: "ARTICLE_ANALYSIS",
      expected_player_action: "review_document",
      required_result: "symmetry_operation_found",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-MED-11",
      interaction_id: "TOXICOLOGY_REVIEW",
      expected_player_action: "review_report",
      required_result: "no_medical_history_match",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      source_ref: "TIMELINE-BOARD",
      interaction_id: "LINK-11-01",
      expected_player_action: "connect_evidence",
      required_result: "shadow_silhouette_matched",
    } as any);
  }

  it("loads Case 11 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case11");
    expect(snapshot.evidenceStates["EVID-11-01"]).toBe("partial");
  });

  it("completes the authored article, toxicology, and timeline chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-11-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-11-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-11-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.source_ref === "TIMELINE-BOARD"
          && event.result === "shadow_silhouette_matched",
      ),
    ).toBe(true);
  });

  it("applies the provisional toxicology variant when queue pressure selects it", () => {
    engine.state.currentTick = 1;

    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "CASE11_SARAH_ARTICLE",
      interaction_id: "ARTICLE_ANALYSIS",
      expected_player_action: "review_document",
      required_result: "symmetry_operation_found",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-MED-11",
      interaction_id: "TOXICOLOGY_REVIEW",
      expected_player_action: "review_report",
      required_result: "no_medical_history_match",
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-11-02"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-11-02"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("records the queue-pressure delay notice on the article path before toxicology is verified", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "CASE11_SARAH_ARTICLE",
      interaction_id: "ARTICLE_ANALYSIS",
      expected_player_action: "review_document",
      required_result: "symmetry_operation_found",
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-11-01"]).toBe("verified");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with the trinity silencing motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-11-01",
        submitted_motive: "motive_trinity_silencing",
        submitted_method_or_timeline: "method_syndicate_liquidation",
        submitted_evidence_ids: ["EVID-11-01", "EVID-11-02", "EVID-11-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case11_resolved_true",
        "trinity_independently_confirmed",
        "operation_symmetry_named",
        "sarah_article_collected",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-11-01",
        submitted_motive: "motive_suicide",
        submitted_method_or_timeline: "method_syndicate_liquidation",
        submitted_evidence_ids: ["EVID-11-01", "EVID-11-02", "EVID-11-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case11_journalist_resolved",
        "case11_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case11_resolved_true",
        "trinity_independently_confirmed",
        "operation_symmetry_named",
        "sarah_article_collected",
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
