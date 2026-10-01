import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 12 Integration: The Voice in the House", () => {
  let case12Definition: any;
  let case12Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case12/case12.json");
    const blueprintsPath = join(__dirname, "../../cases/case12/blueprints.json");

    case12Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case12Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case12Definition, case12Blueprints);
    engine = createRuntime(adapter);
  });

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-MOHAMED-01",
      interaction_id: "Q02",
      expected_player_action: "interrogate",
      required_result: "phrase_symmetry_breaking_repeated",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-MOHAMED-01",
      interaction_id: "Q04",
      expected_player_action: "interrogate",
      required_result: "shadow_voice_therapy",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-12",
      interaction_id: "FINANCIAL_TRACE",
      expected_player_action: "review_report",
      required_result: "transfers_to_deceased",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
  }

  it("loads Case 12 with proper initial states", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case12");
    expect(snapshot.evidenceStates["EVID-12-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-12-02"]).toBe("locked");
  });

  it("completes the behavioral interrogation chain for the whisperer profile", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-MOHAMED-01",
      interaction_id: "Q02",
      expected_player_action: "interrogate",
      required_result: "phrase_symmetry_breaking_repeated",
    } as any);
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-MOHAMED-01",
      interaction_id: "Q04",
      expected_player_action: "interrogate",
      required_result: "shadow_voice_therapy",
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-12-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-12-02"]).toBe("verified");
  });

  it("verifies the delayed financial trail after one follow-up tick", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE,
      source_ref: "LAB-CYBER-12",
      interaction_id: "FINANCIAL_TRACE",
      expected_player_action: "review_report",
      required_result: "transfers_to_deceased",
    } as any);

    expect(engine.getSnapshot().evidenceStates["EVID-12-03"]).toBe("partial");

    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-12-03"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.EVIDENCE_VERIFIED
          && event.source_ref === "LAB-CYBER-12"
          && event.result === "transfers_to_deceased",
      ),
    ).toBe(true);
  });

  it("accepts the authored closure route with whisperer manipulation as the motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-12-01",
        submitted_motive: "motive_whisperer_manipulation",
        submitted_method_or_timeline: "method_proxy_family_murder",
        submitted_evidence_ids: ["EVID-12-01", "EVID-12-02", "EVID-12-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case12_resolved_true",
        "case12_family_resolved",
        "whisperer_escalation",
        "whisperer_second_confirmed",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-12-01",
        submitted_motive: "motive_temporary_insanity",
        submitted_method_or_timeline: "method_proxy_family_murder",
        submitted_evidence_ids: ["EVID-12-01", "EVID-12-02", "EVID-12-03"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case12_family_resolved",
        "case12_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case12_resolved_true",
        "whisperer_escalation",
        "whisperer_second_confirmed",
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
