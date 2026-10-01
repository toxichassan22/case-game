import { describe, expect, it } from "vitest";
import { case01BlueprintConfig } from "../src/case01/config.js";
import { createCase01Runtime } from "../src/case01/runtime.js";
import { loadRegisteredCaseAdapter } from "../src/cases/registry.js";
import { buildRuntimeCaseAdapter } from "../src/engine/adapterBuilder.js";
import { createRuntime, type CoreEngine } from "../src/engine/runtime.js";
import { EVENT_NAME, PLAYER_ACTION_TYPE } from "../src/engine/constants.js";
import type { PlayerAction } from "../src/types.js";

const dialog = (sourceRef: string, interactionId: string): PlayerAction => ({
  type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION,
  source_ref: sourceRef,
  interaction_id: interactionId,
});

const presentEvidence = (sourceRef: string, evidenceId: string): PlayerAction => ({
  type: PLAYER_ACTION_TYPE.PRESENT_EVIDENCE,
  source_ref: sourceRef,
  interaction_id: evidenceId,
});

/** Unlock the case01 dispatched files and verify SCN-03 + DB-06. */
async function setupVerifiedEvidence(runtime: CoreEngine) {
  for (const step of [
    dialog("CHIEF-DESK", "REQ-EVIDENCE-01"),
    { type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "SCN-03" } as PlayerAction,
    { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-03" } as PlayerAction,
    { type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: "OBJ-02" } as PlayerAction,
    { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "DB-06" } as PlayerAction,
  ]) {
    const result = runtime.processAction(step);
    expect(result.accepted).toBe(true);
  }
}

describe("interrogation session state machine", () => {
  it("creates a probing session on the first dialog choice and records the question", async () => {
    const runtime = await createCase01Runtime();

    const result = runtime.processAction(dialog("INT-SHARIF-01", "Q03"));
    expect(result.accepted).toBe(true);

    const session = result.snapshot.interrogation_sessions["char_sharif"];
    expect(session).toBeDefined();
    expect(session.current_stage).toBe("probing");
    expect(session.asked_question_ids).toContain("Q03");
    expect(session.ended_early).toBe(false);
  });

  it("keeps sessions independent per character", async () => {
    const runtime = await createCase01Runtime();

    runtime.processAction(dialog("INT-SHARIF-01", "Q03"));
    runtime.processAction(dialog("INT-HATEM-01", "Q01"));

    const snapshot = runtime.getSnapshot();
    expect(snapshot.interrogation_sessions["char_sharif"].asked_question_ids).toEqual(["Q03"]);
    expect(snapshot.interrogation_sessions["char_hatem"].asked_question_ids).toEqual(["Q01"]);
  });

  it("survives a snapshot round-trip with stage, asked, and presented ids intact", async () => {
    const runtime = await createCase01Runtime();
    await setupVerifiedEvidence(runtime);
    runtime.processAction(presentEvidence("INT-HATEM-01", "SCN-03"));

    const snapshot = runtime.getSnapshot();
    const before = snapshot.interrogation_sessions["char_hatem"];
    expect(before.current_stage).toBe("pressure");
    expect(before.presented_evidence_ids).toEqual(["SCN-03"]);

    const restored = await createCase01Runtime();
    restored.loadSnapshot(snapshot);
    const after = restored.getSnapshot().interrogation_sessions["char_hatem"];
    expect(after).toEqual(before);
  });

  it("escalates probing → pressure → branching → collapse on verified evidence", async () => {
    const runtime = await createCase01Runtime();
    await setupVerifiedEvidence(runtime);

    // char_hatem: collapse threshold 4, lawyer_up 9 — collapses easily under verified evidence
    const first = runtime.processAction(presentEvidence("INT-HATEM-01", "SCN-03"));
    expect(first.accepted).toBe(true);
    expect(first.snapshot.interrogation_sessions["char_hatem"].current_stage).toBe("pressure");
    expect(
      first.emittedEvents.some((e) => e.event_name === EVENT_NAME.INTERROGATION_EVIDENCE_PRESENTED),
    ).toBe(true);

    const second = runtime.processAction(presentEvidence("INT-HATEM-01", "DB-06"));
    expect(second.snapshot.interrogation_sessions["char_hatem"].current_stage).toBe("branching");

    // One more nudge (neutral question) resolves the branching edge → collapse
    const third = runtime.processAction(dialog("INT-HATEM-01", "Q01"));
    const session = third.snapshot.interrogation_sessions["char_hatem"];
    expect(session.current_stage).toBe("collapse");
    expect(session.ended_early).toBe(true);
    expect(
      third.emittedEvents.some((e) => e.event_name === EVENT_NAME.INTERROGATION_COLLAPSED),
    ).toBe(true);

    // Session is closed: further questions are rejected without consuming a tick
    const tickBefore = third.snapshot.currentTick;
    const rejected = runtime.processAction(dialog("INT-HATEM-01", "Q02"));
    expect(rejected.accepted).toBe(false);
    expect(rejected.tickConsumed).toBe(false);
    expect(rejected.snapshot.currentTick).toBe(tickBefore);
  });

  it("counts re-presented evidence as spam and lawyers up at the spam limit", async () => {
    const runtime = await createCase01Runtime();

    // SCN-03 starts unverified — presenting it is weak leverage; repeating it is spam.
    const target = "INT-SHARIF-01";
    for (let i = 0; i < 3; i++) {
      const result = runtime.processAction(presentEvidence(target, "SCN-03"));
      expect(result.accepted).toBe(true);
    }

    const session = runtime.getSnapshot().interrogation_sessions["char_sharif"];
    // dialogue_spam_limit = 3 → forced silence
    expect(session.spam_score).toBe(3);
    expect(session.current_stage).toBe("lawyer_up");
    expect(session.ended_early).toBe(true);
  });

  it("rejects presenting locked evidence", async () => {
    const runtime = await createCase01Runtime();
    const result = runtime.processAction(presentEvidence("INT-HATEM-01", "DB-06"));

    expect(result.accepted).toBe(false);
    expect(result.tickConsumed).toBe(false);
    expect(result.snapshot.interrogation_sessions["char_hatem"]).toBeUndefined();
  });

  it("burns parallel empathetic options after an aggressive choice", async () => {
    const adapter = await loadRegisteredCaseAdapter("case01");
    const definition = structuredClone(adapter.definition);
    const sharif = definition.suspects.find((s) => s.character_id === "char_sharif")!;
    for (const option of sharif.dialogue_options ?? []) {
      option.tone = option.id === "Q03" ? "aggressive" : option.id === "Q06" ? "empathetic" : "neutral";
    }

    const runtime = createRuntime(buildRuntimeCaseAdapter(definition, case01BlueprintConfig));

    const aggressive = runtime.processAction(dialog("INT-SHARIF-01", "Q03"));
    expect(aggressive.accepted).toBe(true);
    const session = aggressive.snapshot.interrogation_sessions["char_sharif"];
    expect(session.aggression_score).toBe(2);
    expect(session.burned_choice_ids).toContain("Q06");

    // The burned option is unavailable for the rest of the session
    const burned = runtime.processAction(dialog("INT-SHARIF-01", "Q06"));
    expect(burned.accepted).toBe(false);
    expect(burned.tickConsumed).toBe(false);
    expect(burned.rejectionReason).toContain("unavailable");
  });

  it("emits stage events into the snapshot event trace", async () => {
    const runtime = await createCase01Runtime();
    await setupVerifiedEvidence(runtime);
    runtime.processAction(presentEvidence("INT-HATEM-01", "SCN-03"));

    const snapshot = runtime.getSnapshot();
    const stageEvents = snapshot.eventTrace.filter(
      (e) => e.event_name === EVENT_NAME.INTERROGATION_STAGE_ENTERED && e.source_ref === "INT-HATEM-01",
    );
    expect(stageEvents.length).toBeGreaterThanOrEqual(2); // probing (creation) + pressure
    expect(stageEvents.some((e) => e.interaction_id === "stage:pressure")).toBe(true);
  });
});
