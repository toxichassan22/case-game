export const CLOSURE_REASON_CODE = {
  MISSING_CULPRIT: "missing_culprit",
  MISSING_MOTIVE: "missing_motive",
  MISSING_METHOD: "missing_method",
  INSUFFICIENT_EVIDENCE_COUNT: "insufficient_evidence_count",
  MISSING_BEHAVIORAL_CHAIN: "missing_behavioral_chain",
  MISSING_CROSS_ROUTE_EVIDENCE: "missing_cross_route_evidence",
  SHARED_EVIDENCE_USED_TWICE: "shared_evidence_used_twice",
} as const;

export type ClosureReasonCode = (typeof CLOSURE_REASON_CODE)[keyof typeof CLOSURE_REASON_CODE];

export const CLOSURE_REASON_CODES: ClosureReasonCode[] = Object.values(CLOSURE_REASON_CODE);
