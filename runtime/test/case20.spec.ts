import { describe, it, expect, beforeEach } from "vitest";
import { createRuntime } from "../src/engine/runtime.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Case 20 Integration: The First Thread", () => {
  let case20Definition: any;
  let case20Blueprints: any;
  let adapter: any;
  let engine: any;

  beforeEach(() => {
    const casePath = join(__dirname, "../../cases/case20/case20.json");
    const blueprintsPath = join(__dirname, "../../cases/case20/blueprints.json");

    case20Definition = JSON.parse(readFileSync(casePath, "utf8"));
    case20Blueprints = JSON.parse(readFileSync(blueprintsPath, "utf8"));

    adapter = buildRuntimeCaseAdapter(case20Definition, case20Blueprints);
    engine = createRuntime(adapter);
  });

  function inspectLabSwabs() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE20_LAB_SWABS",
      interaction_id: "CHEMICAL_MATCH",
      expected_player_action: "inspect_object",
      required_result: "alchemist_base_confirmed",
    } as any);
  }

  function lockTarekTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-20-TAREK",
      expected_player_action: "lock_timeline_event",
      required_result: "tarek_engineer_profile_created",
    } as any);
  }

  function inspectEncryptedUsb() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE20_ENCRYPTED_USB",
      interaction_id: "DECRYPTION_ATTEMPT",
      expected_player_action: "inspect_object",
      required_result: "military_encryption_flagged",
    } as any);
  }

  function lockTargetsTimeline() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT,
      interaction_id: "LINK-20-TARGETS",
      expected_player_action: "lock_timeline_event",
      required_result: "future_targets_identified",
    } as any);
  }

  function completeAuthoredChain() {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectLabSwabs();
    lockTarekTimeline();
    inspectEncryptedUsb();
    lockTargetsTimeline();
  }

  it("loads case20 initial states accurately", () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.case_id).toBe("case20");
    expect(snapshot.evidenceStates["EVID-20-01"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-20-02"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-20-03"]).toBe("partial");
    expect(snapshot.evidenceStates["EVID-20-04"]).toBe("partial");
  });

  it("completes the authored lab, identity, usb, and future-target chain", () => {
    completeAuthoredChain();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-20-01"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-20-02"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-20-03"]).toBe("verified");
    expect(finalSnapshot.evidenceStates["EVID-20-04"]).toBe("verified");
    expect(
      finalSnapshot.eventTrace.some(
        (event: any) =>
          event.event_name === EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED
          && event.interaction_id === "LINK-20-TARGETS"
          && event.result === "future_targets_identified",
      ),
    ).toBe(true);
  });

  it("applies the provisional usb result when queue pressure selects it", () => {
    engine.processAction({
      type: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      source_ref: "TIMELINE-BOARD",
    } as any);
    inspectLabSwabs();
    lockTarekTimeline();
    inspectEncryptedUsb();

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.evidenceStates["EVID-20-03"]).toBe("verified");
    expect(finalSnapshot.evidenceQualities["EVID-20-03"]).toBe("provisional");
    expect(finalSnapshot.notices.some((notice: any) => notice.message.includes("النتيجة الحالية أولية"))).toBe(true);
  });

  it("blocks the lab-swab inspection when queue pressure selects the delay variant", () => {
    inspectEncryptedUsb();

    const blockedInspection = engine.processAction({
      type: PLAYER_ACTION_TYPE.INSPECT_OBJECT,
      source_ref: "CASE20_LAB_SWABS",
      interaction_id: "CHEMICAL_MATCH",
      expected_player_action: "inspect_object",
      required_result: "alchemist_base_confirmed",
    } as any);

    expect(blockedInspection.accepted).toBe(false);
    expect(blockedInspection.rejectionReason).toContain("تأخر تقرير الصياغة");
    expect(engine.getSnapshot().notices.some((notice: any) => notice.message.includes("تأخر تقرير الصياغة"))).toBe(true);
  });

  it("accepts the authored closure route with a syndicate taunt motive", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-20-01",
        submitted_motive: "motive_syndicate_taunt",
        submitted_method_or_timeline: "method_syndicate_lair",
        submitted_evidence_ids: ["EVID-20-01", "EVID-20-02", "EVID-20-03", "EVID-20-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "true_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case20_resolved_true",
        "case20_lair_discovered",
        "arc2_complete",
        "tarek_ansari_name",
        "encrypted_usb_collected",
        "five_future_targets",
      ]),
    );
  });

  it("grants only partial flags plus the false flag on false_success", () => {
    completeAuthoredChain();

    engine.processAction({
      type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE,
      attempt: {
        submitted_suspect: "SUSP-20-01",
        submitted_motive: "motive_evidence_destruction",
        submitted_method_or_timeline: "method_syndicate_lair",
        submitted_evidence_ids: ["EVID-20-01", "EVID-20-02", "EVID-20-03", "EVID-20-04"],
      },
    } as any);

    expect(engine.state.lastClosureDecision).toMatchObject({
      accepted: true,
      mode: "false_success",
    });
    expect(Array.from(engine.state.flags)).toEqual(
      expect.arrayContaining([
        "case20_lair_discovered",
        "arc2_complete",
        "case20_resolved_false",
      ]),
    );
    expect(Array.from(engine.state.flags)).not.toEqual(
      expect.arrayContaining([
        "case20_resolved_true",
        "tarek_ansari_name",
        "encrypted_usb_collected",
        "five_future_targets",
      ]),
    );
  });
});
