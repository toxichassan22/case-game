import { describe, expect, it } from "vitest";
import { case01BlueprintConfig } from "../src/case01/config.js";
import { scenarioDefinitions } from "../src/case01/scenarios.js";
import { createCase01Runtime } from "../src/case01/runtime.js";
import { loadRegisteredCaseAdapter } from "../src/cases/registry.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE, SOURCE_TYPE } from "../src/engine/constants.js";
import { validateClosureAttempt } from "../src/engine/closureValidator.js";
import { validateDomainEvent } from "../src/engine/eventValidation.js";
import { createInitialState, recomputeClosureBuckets, setFact } from "../src/engine/store.js";

describe("case01 runtime vertical slice", () => {
  it("loads case01 through the generic adapter contract", async () => {
    const adapter = await loadRegisteredCaseAdapter("case01");

    expect(adapter.openableSources.has("INT-SHARIF-01")).toBe(true);
    expect(adapter.openableSources.has("TIMELINE-BOARD")).toBe(true);
    expect(adapter.reviewBlueprints.get("SCN-03")).toMatchObject({
      source_ref: "SCN-03",
      interaction_id: "ORIGIN-CONFIRMED",
    });
    expect(adapter.inferSourceType("TIMELINE-BOARD")).toBe(SOURCE_TYPE.TIMELINE);
    expect(adapter.inferSourceType("DB-06")).toBe(SOURCE_TYPE.DOCUMENT);
  });

  it("accepts the full success scenario", async () => {
    const runtime = await createCase01Runtime();

    for (const step of scenarioDefinitions.full_success.steps) {
      const result = runtime.processAction(step);
      expect(result.accepted).toBe(true);
    }

    const snapshot = runtime.getSnapshot();
    expect(snapshot.evidenceStates["EVID-PARTIAL-FALSE-ORIGIN-STORY"]).toBe("verified");
    expect(snapshot.evidenceStates["EVID-PARTIAL-LOCK"]).toBe("verified");
    expect(snapshot.flags).not.toContain("case01_false_confidence_close");
    expect(snapshot.flags).not.toContain("layla_lock_suspicion_active");
    expect(snapshot.lastClosureDecision).toMatchObject({ accepted: true, mode: "true_success" });
    expect(snapshot.debugTrace.some((entry) => entry.kind === "trigger_fired" && String(entry.message).includes("trig_lock_primary"))).toBe(true);
    expect(
      snapshot.eventTrace.some(
        (event: any) => event.event_name === EVENT_NAME.EVIDENCE_REINTERPRETED && event.source_ref === "EVID-PARTIAL-LOCK",
      ),
    ).toBe(true);
  });

  it("accepts false success and exposes the case02 transition hook", async () => {
    const runtime = await createCase01Runtime();

    for (const step of scenarioDefinitions.false_success.steps) {
      const result = runtime.processAction(step);
      expect(result.accepted).toBe(true);
    }

    const snapshot = runtime.getSnapshot();
    expect(snapshot.lastClosureDecision).toMatchObject({ accepted: true, mode: "false_success" });
    expect(snapshot.flags).toContain("case01_fire_resolved");
    expect(snapshot.flags).toContain("case01_false_confidence_close");
    expect(snapshot.pendingTransitionContext).toMatchObject({ hook_id: "hook_case02_false_confidence", target_case_id: "case02" });
    expect(snapshot.notices.some((notice: any) => notice.message.includes("ضغط"))).toBe(true);
    expect(snapshot.debugTrace.some((entry) => entry.kind === "validator_checks")).toBe(true);
  });

  it("rejects closure when the behavioral chain is missing", async () => {
    const runtime = await createCase01Runtime();

    for (const step of scenarioDefinitions.missing_behavioral_chain.steps) {
      const result = runtime.processAction(step);
      expect(result.accepted).toBe(true);
    }

    const snapshot = runtime.getSnapshot();
    expect(snapshot.lastClosureDecision).toMatchObject({ accepted: false, mode: "rejected" });
    expect(snapshot.lastClosureDecision?.reason_codes).toContain("missing_behavioral_chain");
    expect(snapshot.flags).not.toContain("case01_fire_resolved");
  });

  it("rejects shared evidence when validator buckets overlap", async () => {
    const adapter = await loadRegisteredCaseAdapter("case01");
    const definition = structuredClone(adapter.definition);
    definition.closure_rules.validate_closure.behavioral_chain_evidence_ids = ["EVID-PARTIAL-LOCK"];
    definition.closure_rules.validate_closure.cross_route_evidence_ids = ["EVID-PARTIAL-LOCK"];

    const state = createInitialState(definition);
    state.evidenceStates["EVID-PARTIAL-LOCK"] = "verified";
    state.baseEvidenceStates["EVID-PARTIAL-LOCK"] = "verified";
    state.evidenceStates["SCN-03"] = "verified";
    state.baseEvidenceStates["SCN-03"] = "verified";
    state.evidenceStates["SCN-04"] = "verified";
    state.baseEvidenceStates["SCN-04"] = "verified";

    setFact(state, "evidence_verified", "EVID-PARTIAL-LOCK", true);
    setFact(state, "evidence_verified", "SCN-03", true);
    setFact(state, "evidence_verified", "SCN-04", true);
    recomputeClosureBuckets(definition, state);

    const outcome = validateClosureAttempt(definition, adapter.closureCatalog, state, {
      submitted_suspect: "char_sharif",
      submitted_motive: "motive_insurance",
      submitted_method_or_timeline: "method_arson_front_door",
      submitted_evidence_ids: ["EVID-PARTIAL-LOCK", "SCN-03", "SCN-04"],
    });

    expect(outcome.decision.accepted).toBe(false);
    expect(outcome.decision.reason_codes).toContain("shared_evidence_used_twice");
  });

  it("rejects duplicate blueprint keys in the generic adapter builder", async () => {
    const adapter = await loadRegisteredCaseAdapter("case01");
    const definition = adapter.definition;

    expect(() =>
      buildRuntimeCaseAdapter(definition, {
        ...case01BlueprintConfig,
        reviewBlueprints: [...(case01BlueprintConfig.blueprints?.review ?? []), case01BlueprintConfig.blueprints!.review![0]],
      }),
    ).toThrowError(/Duplicate review blueprint: SCN-03/);
  });

  it("reject_invalid_review_flow_without_consuming_a_tick", async () => {
    const runtime = await createCase01Runtime();
    const result = runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "DB-06" });

    expect(result.accepted).toBe(false);
    expect(result.tickConsumed).toBe(false);
    expect(result.rejectionReason).toContain("locked");
    expect(result.snapshot.currentTick).toBe(0);
    expect(result.debugEntries.some((entry) => entry.kind === "action_rejected")).toBe(true);
  });

  it("rejects unknown action types without crashing or consuming a tick", async () => {
    const runtime = await createCase01Runtime();
    const result = runtime.processAction({ type: "CHOOSE_DIALOG_OPTION", source_ref: "CHIEF-DESK", interaction_id: "REQ-EVIDENCE-01" } as unknown as import('../src/types.js').PlayerAction);

    expect(result.accepted).toBe(false);
    expect(result.tickConsumed).toBe(false);
    expect(result.rejectionReason).toContain("Unknown action type");
    expect(result.snapshot.currentTick).toBe(0);
    expect(result.debugEntries.some((entry) => entry.kind === "action_rejected")).toBe(true);
  });

  it("rejects delayed forensic review until the queue pressure clears", async () => {
    const runtime = await createCase01Runtime();

    expect(
      runtime.processAction({
        type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
        source_ref: "CHIEF-DESK",
        interaction_id: "REQ-EVIDENCE-01",
      }).accepted,
    ).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "SCN-03" }).accepted).toBe(true);
    expect(
      runtime.processAction({
        type: PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY,
        source_ref: "EVID-SUP-CCTV-CORRUPTION",
      }).accepted,
    ).toBe(true);
    expect(runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-03" }).accepted).toBe(true);

    const blocked = runtime.processAction({ type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-04" });
    expect(blocked.accepted).toBe(false);
    expect(blocked.rejectionReason).toContain("تأخر");
    expect(blocked.tickConsumed).toBe(false);
  });

  it("rejects invalid domain events before they enter the runtime trace", () => {
    const error = validateDomainEvent({
      event_name: EVENT_NAME.SOURCE_OPENED,
      source_type: "bad-source-type" as never,
      source_ref: "SCN-03",
      interaction_id: "OPEN",
      player_action: PLAYER_ACTION_TYPE.OPEN_SOURCE,
      result: "source_opened",
      tick: 1,
    });

    expect(error).toContain("Unknown source type");
  });
});
