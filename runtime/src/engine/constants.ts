export const SOURCE_TYPE = {
  INTERROGATION: "interrogation",
  REPORT: "report",
  DOCUMENT: "document",
  OBJECT: "object",
  PHYSICAL: "physical",
  VIDEO: "video",
  DIGITAL: "digital",
  STATEMENT: "statement",
  TIMELINE: "timeline",
  SYSTEM: "system",
  CLOSURE: "closure",
  SOURCE: "source",
} as const;

export type SourceType = (typeof SOURCE_TYPE)[keyof typeof SOURCE_TYPE];

export const EVENT_NAME = {
  SOURCE_OPENED: "EVENT_SOURCE_OPENED",
  DOCUMENT_REVIEWED: "EVENT_DOCUMENT_REVIEWED",
  EVIDENCE_VERIFIED: "EVENT_EVIDENCE_VERIFIED",
  INTERROGATION_NODE_UNLOCKED: "EVENT_INTERROGATION_NODE_UNLOCKED",
  TIMELINE_CONTRADICTION_CONFIRMED: "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
  DEEP_METADATA_REQUESTED: "EVENT_DEEP_METADATA_REQUESTED",
  CASE_SUBMISSION_ATTEMPT: "EVENT_CASE_SUBMISSION_ATTEMPT",
  EVIDENCE_REINTERPRETED: "EVENT_EVIDENCE_REINTERPRETED",
  CLOCKMAKER_REVEALED: "EVENT_CLOCKMAKER_REVEALED",
  PHS_HINT_REVEALED: "EVENT_PHS_HINT_REVEALED",
  LAB_ANALYSIS_STARTED: "EVENT_LAB_ANALYSIS_STARTED",
  TIMELINE_SEQUENCE_VERIFIED: "EVENT_TIMELINE_SEQUENCE_VERIFIED",
} as const;

export type EventName = (typeof EVENT_NAME)[keyof typeof EVENT_NAME];

export const PLAYER_ACTION_TYPE = {
  OPEN_SOURCE: "open_source",
  REVIEW_EVIDENCE: "review_evidence",
  INSPECT_OBJECT: "inspect_object",
  CHOOSE_DIALOG_OPTION: "choose_dialog_option",
  LOCK_TIMELINE_EVENT: "lock_timeline_event",
  REQUEST_DEEP_METADATA_RECOVERY: "request_deep_metadata_recovery",
  ATTEMPT_CASE_CLOSURE: "attempt_case_closure",
  REQUEST_PHS: "request_phs",
  SEND_TO_LAB: "send_to_lab",
  VERIFY_TIMELINE_SEQUENCE: "verify_timeline_sequence",
} as const;

export type PlayerActionType = (typeof PLAYER_ACTION_TYPE)[keyof typeof PLAYER_ACTION_TYPE];

export const FACT_TYPE = {
  EVIDENCE_VERIFIED: "evidence_verified",
  TIMELINE_LOCK: "timeline_lock",
  DIALOG_OPTION_USED: "dialog_option_used",
  LAB_PENDING: "lab_pending",
  TRUST_LEVEL: "trust_level",
} as const;

export type FactType = (typeof FACT_TYPE)[keyof typeof FACT_TYPE];

export const DEBUG_TRACE_KIND = {
  ACTION_ACCEPTED: "action_accepted",
  ACTION_REJECTED: "action_rejected",
  EVENT_EMITTED: "event_emitted",
  EVENT_REJECTED: "event_rejected",
  TRIGGER_FIRED: "trigger_fired",
  RULE_APPLIED: "rule_applied",
  VALIDATOR_CHECKS: "validator_checks",
  EFFECT_APPLIED: "effect_applied",
} as const;

export type DebugTraceKind = (typeof DEBUG_TRACE_KIND)[keyof typeof DEBUG_TRACE_KIND];
