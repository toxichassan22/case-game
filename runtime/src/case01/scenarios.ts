import { PLAYER_ACTION_TYPE } from "../engine/constants.js";
import type { ClosureAttempt, PlayerAction } from "../types.js";

export interface ScenarioDefinition {
  name: string;
  description: string;
  steps: PlayerAction[];
}

const trueClosure: ClosureAttempt = {
  submitted_suspect: "char_sharif",
  submitted_motive: "motive_embezzlement_black_ledger",
  submitted_method_or_timeline: "method_arson_front_door",
  submitted_evidence_ids: ["SCN-03", "EVID-PARTIAL-FALSE-ORIGIN-STORY", "EVID-PARTIAL-LOCK"],
};

const falseClosure: ClosureAttempt = {
  submitted_suspect: "char_sharif",
  submitted_motive: "motive_insurance",
  submitted_method_or_timeline: "method_arson_front_door",
  submitted_evidence_ids: ["SCN-03", "EVID-PARTIAL-FALSE-ORIGIN-STORY", "EVID-PARTIAL-LOCK"],
};

const noBehaviorClosure: ClosureAttempt = {
  submitted_suspect: "char_sharif",
  submitted_motive: "motive_insurance",
  submitted_method_or_timeline: "method_arson_front_door",
  submitted_evidence_ids: ["SCN-03", "SCN-04", "EVID-PARTIAL-LOCK"],
};

export const scenarioDefinitions: Record<string, ScenarioDefinition> = {
  full_success: {
    name: "full_success",
    description: "نجاح كامل مع behavioral chain + cross-route evidence.",
    steps: [
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "CHIEF-DESK", interaction_id: "REQ-EVIDENCE-01" },
      { type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "INT-SHARIF-01", interaction_id: "Q03" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: "OBJ-02" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "DB-06" },
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "INT-SHARIF-01", interaction_id: "Q06" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-04" },
      { type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT, interaction_id: "LOCK-EVENT-03" },
      { type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE, attempt: trueClosure },
    ],
  },
  false_success: {
    name: "false_success",
    description: "إغلاق قانوني بدافع ضعيف مع hook انتقال إلى case02.",
    steps: [
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "CHIEF-DESK", interaction_id: "REQ-EVIDENCE-01" },
      { type: PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY, source_ref: "EVID-SUP-CCTV-CORRUPTION" },
      { type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "INT-SHARIF-01", interaction_id: "Q03" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: "OBJ-02" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "DB-06" },
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "INT-SHARIF-01", interaction_id: "Q06" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-04" },
      { type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT, interaction_id: "LOCK-EVENT-03" },
      { type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE, attempt: falseClosure },
    ],
  },
  missing_behavioral_chain: {
    name: "missing_behavioral_chain",
    description: "رفض الإغلاق لغياب behavioral chain رغم وجود cross-route evidence.",
    steps: [
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "CHIEF-DESK", interaction_id: "REQ-EVIDENCE-01" },
      { type: PLAYER_ACTION_TYPE.OPEN_SOURCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-03" },
      { type: PLAYER_ACTION_TYPE.INSPECT_OBJECT, source_ref: "OBJ-02" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "DB-06" },
      { type: PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION, source_ref: "INT-SHARIF-01", interaction_id: "Q06" },
      { type: PLAYER_ACTION_TYPE.REVIEW_EVIDENCE, source_ref: "SCN-04" },
      { type: PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT, interaction_id: "LOCK-EVENT-03" },
      { type: PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE, attempt: noBehaviorClosure },
    ],
  },
};
