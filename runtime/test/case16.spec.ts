import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 16 Integration: The Red Thread", () => {
  let case16Definition: any;
  let case16Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case16/case16.json");
    const blueprintsPath = join(__dirname, "../../cases/case16/blueprints.json");

    case16Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case16Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case16Definition, case16Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectTaxDocs() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE16_TAX_DOCS",
      interaction_id: "INK_SPECTROSCOPY",
      expected_player_action: "inspect_object",
      required_result: "trinity_ink_identified",
    } as any);
  }

  function lockGpsTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-16-GPS",
      expected_player_action: "lock_timeline_event",
      required_result: "gps_spoofing_confirmed",
    } as any);
  }

  function inspectThreatSms() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE16_THREAT_SMS",
      interaction_id: "TEXT_ANALYSIS",
      expected_player_action: "inspect_object",
      required_result: "whisperer_manipulation_tactics",
    } as any);
  }

  function interviewWael() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
      source_ref: "INT-WAEL-01",
      interaction_id: "Q_MOTIVE",
      expected_player_action: "interrogate",
      required_result: "past_crimes_as_threat",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectTaxDocs();
    lockGpsTimeline();
    inspectThreatSms();
    interviewWael();
  }

  it("loads case16 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case16");
    expect(snapshot.evidenceStates["EVID-16-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-16-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-16-03"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-16-04"]).toBe("partial");
  });

  it("completes the authored forged-tax, gps, threat-sms, and interrogation chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-16-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-16-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-16-03"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-16-04"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.INTERROGATION_NODE_UNLOCKED
          && event.source_ref === "INT-WAEL-01"
          && event.result === "past_crimes_as_threat",
      ),
    ).toBe(true);
  });

  it("applies the provisional tax-doc result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectTaxDocs();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-16-01"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-16-01"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the GPS timeline link when the legacy queue trigger selects the delay variant", () => {
    inspectTaxDocs();

    const blockedTimeline = engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-16-GPS",
      expected_player_action: "lock_timeline_event",
      required_result: "gps_spoofing_confirmed",
    } as any);

    expect(blockedTimeline.accepted).toBe(false);
    expect(blockedTimeline.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate extortion motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-16-01",
        submitted_motive: "motive_syndicate_extortion",
        submitted_method_or_timeline: "method_syndicate_extortion",
        submitted_evidence_ids: ["EVID-16-01", "EVID-16-02", "EVID-16-03", "EVID-16-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case16_resolved_true",
        "trinity_operates_nationally",
        "gps_spoofing_confirmed",
        "trinity_uses_past_crimes_as_threats",
        "manal_safe",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-16-01",
        submitted_motive: "motive_local_blackmail",
        submitted_method_or_timeline: "method_syndicate_extortion",
        submitted_evidence_ids: ["EVID-16-01", "EVID-16-02", "EVID-16-03", "EVID-16-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "manal_safe",
        "case16_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case16_resolved_true",
        "trinity_operates_nationally",
        "gps_spoofing_confirmed",
        "trinity_uses_past_crimes_as_threats",
      ]),
    );
  });
});
