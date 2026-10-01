import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 14 Integration: The Budget", () => {
  let case14Definition: any;
  let case14Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case14/case14.json");
    const blueprintsPath = join(__dirname, "../../cases/case14/blueprints.json");

    case14Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case14Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case14Definition, case14Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectSamples() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE14_MEDICARE_SAMPLES",
      interaction_id: "BARCODE_CHECK",
      expected_player_action: "inspect_evidence",
      required_result: "barcode_unregistered",
    } as any);
  }

  function reviewChemistry() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CHEM-14",
      interaction_id: "SPECTRAL_MATCH_03",
      expected_player_action: "review_report",
      required_result: "chemical_signature_matched",
    } as any);
  }

  function interviewHamdy() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-HAMDY-01",
      interaction_id: "Q_SALES_REP",
      expected_player_action: "interrogate",
      required_result: "ahmed_identified",
    } as any);
  }

  function completeAuthoredChain() {
    inspectSamples();
    reviewChemistry();
    interviewHamdy();
  }

  it("loads case14 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case14");
    expect(snapshot.evidenceStates["EVID-14-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-14-02"]).toBe("locked");
    expect(snapshot.evidenceStates["EVID-14-03"]).toBe("partial");
  });

  it("completes the authored counterfeit drugs, chemistry, and interview chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-14-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-14-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-14-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.INTERROGATION_NODE_UNLOCKED
          && event.source_ref === "INT-HAMDY-01"
          && event.result === "ahmed_identified",
      ),
    ).toBe(true);
  });

  it("applies the provisional chemistry result when the legacy queue trigger selects it", () => {
    inspectSamples();
    reviewChemistry();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-14-02"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-14-02"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks a repeat inspection when the legacy queue trigger selects the delay variant", () => {
    inspectSamples();
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);

    reviewChemistry();

    const blockedInspection = engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE14_MEDICARE_SAMPLES",
      interaction_id: "BARCODE_CHECK",
      expected_player_action: "inspect_evidence",
      required_result: "barcode_unregistered",
    } as any);

    expect(blockedInspection.accepted).toBe(false);
    expect(blockedInspection.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate profit motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-14-01",
        submitted_motive: "motive_syndicate_profit",
        submitted_method_or_timeline: "method_institutional_corruption",
        submitted_evidence_ids: ["EVID-14-01", "EVID-14-02", "EVID-14-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case14_resolved_true",
        "case14_budget_resolved",
        "pharma_network_regenerating",
        "ahmed_middleman_identified",
        "five_victims_critical",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-14-01",
        submitted_motive: "motive_administrative_negligence",
        submitted_method_or_timeline: "method_institutional_corruption",
        submitted_evidence_ids: ["EVID-14-01", "EVID-14-02", "EVID-14-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case14_budget_resolved",
        "case14_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case14_resolved_true",
        "pharma_network_regenerating",
        "ahmed_middleman_identified",
        "five_victims_critical",
      ]),
    );
  });
});
