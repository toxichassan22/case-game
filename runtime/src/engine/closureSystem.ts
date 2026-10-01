import { type EngineState } from "./store.js";
import { CLOSURE_REASON_CODE, type ClosureReasonCode } from "./closureReasonCodes.js";
import type {
  ClosureAttempt,
  ClosureCatalog,
  ClosureValidationMetrics,
  ClosureValidationOutcome,
  RuntimeCaseDefinition,
} from "../types.js";
import { calculateTrinityAwareness as _calculateTrinityAwareness, applyTrinityAwarenessUpdate as _applyTrinityAwarenessUpdate, DEFAULT_TRINITY_AWARENESS_CONFIG as _DEFAULT_TRINITY_AWARENESS_CONFIG } from "./trinityAwarenessCalculator.js";

export class ClosureSystem {
  constructor(
    private state: EngineState,
    private definition: RuntimeCaseDefinition,
    private closureCatalog: ClosureCatalog,
  ) {}

  validateClosureAttempt(attempt: ClosureAttempt): ClosureValidationOutcome {
    const reasonCodes: ClosureReasonCode[] = [];
    const uniqueEvidenceIds = [...new Set(attempt.submitted_evidence_ids)];
    const validatedEvidenceIds = uniqueEvidenceIds.filter(
      (evidenceId) =>
        this.state.verifiedEvidenceIds.has(evidenceId) && this.state.evidenceStates[evidenceId] === "verified",
    );
    const behavioralEvidence = validatedEvidenceIds.filter((evidenceId) =>
      this.state.closureBuckets.behavioralVerified.has(evidenceId),
    );
    const crossRouteEvidence = validatedEvidenceIds.filter((evidenceId) =>
      this.state.closureBuckets.crossRouteVerified.has(evidenceId),
    );
    const sharedEvidence = behavioralEvidence.filter((evidenceId) => crossRouteEvidence.includes(evidenceId));

    const culpritIsPresent = this.definition.closure_rules.requires_culprit
      ? this.closureCatalog.suspect_ids.includes(attempt.submitted_suspect)
      : true;
    const motiveIsPresent = this.definition.closure_rules.requires_motive
      ? [...this.definition.closure_rules.accepted_true_motive_ids, ...this.definition.closure_rules.false_success_motive_ids].includes(
          attempt.submitted_motive,
        )
      : true;
    const methodIsPresent = this.definition.closure_rules.requires_method_or_opportunity
      ? this.closureCatalog.method_ids.includes(attempt.submitted_method_or_timeline)
      : true;

    if (!culpritIsPresent) {
      reasonCodes.push(CLOSURE_REASON_CODE.MISSING_CULPRIT);
    }

    if (!motiveIsPresent) {
      reasonCodes.push(CLOSURE_REASON_CODE.MISSING_MOTIVE);
    }

    if (!methodIsPresent) {
      reasonCodes.push(CLOSURE_REASON_CODE.MISSING_METHOD);
    }

    if (validatedEvidenceIds.length < this.definition.closure_rules.minimum_evidence_count) {
      reasonCodes.push(CLOSURE_REASON_CODE.INSUFFICIENT_EVIDENCE_COUNT);
    }

    if (behavioralEvidence.length < this.definition.closure_rules.validate_closure.minimum_behavioral_chain_verified) {
      reasonCodes.push(CLOSURE_REASON_CODE.MISSING_BEHAVIORAL_CHAIN);
    }

    if (crossRouteEvidence.length < this.definition.closure_rules.validate_closure.minimum_cross_route_verified) {
      reasonCodes.push(CLOSURE_REASON_CODE.MISSING_CROSS_ROUTE_EVIDENCE);
    }

    if (this.definition.closure_rules.validate_closure.no_shared_evidence_between_roles && sharedEvidence.length > 0) {
      reasonCodes.push(CLOSURE_REASON_CODE.SHARED_EVIDENCE_USED_TWICE);
    }

    const metrics: ClosureValidationMetrics = {
      culprit_is_present: culpritIsPresent,
      motive_is_present: motiveIsPresent,
      method_is_present: methodIsPresent,
      submitted_verified_evidence_ids: validatedEvidenceIds,
      behavioral_evidence_ids: behavioralEvidence,
      cross_route_evidence_ids: crossRouteEvidence,
      shared_evidence_ids: sharedEvidence,
    };

    if (reasonCodes.length > 0) {
      return {
        decision: {
          accepted: false,
          mode: "rejected",
          reason_codes: this.normalizeRejectedCodes(reasonCodes),
          granted_flags: [],
        },
        metrics,
      };
    }

    const trueCulpritIds = this.definition.closure_rules.accepted_true_culprit_ids;
    const suspectMatchesTrueCulprit =
      !trueCulpritIds || trueCulpritIds.length === 0
        ? true
        : trueCulpritIds.includes(attempt.submitted_suspect);

    const isTrueSuccess =
      this.definition.closure_rules.accepted_true_motive_ids.includes(attempt.submitted_motive) &&
      suspectMatchesTrueCulprit;
    const grantedFlags = isTrueSuccess
      ? [...this.definition.outcome_flags.success]
      : [
          ...this.definition.outcome_flags.partial,
          this.definition.closure_rules.false_success_flag,
          ...(this.definition.closure_rules.false_success_flags_by_suspect?.[attempt.submitted_suspect] ?? []),
        ];

    // Carryover flags are now handled by triggers or specific outcome_flags in CaseDefinition

    return {
      decision: {
        accepted: true,
        mode: isTrueSuccess ? "true_success" : "false_success",
        reason_codes: [],
        granted_flags: [...new Set(grantedFlags)],
      },
      metrics,
    };
  }

  private normalizeRejectedCodes(reasonCodes: ClosureReasonCode[]): string[] {
    const configuredCodes = this.definition.closure_rules.validate_closure.rejected_submission_reason_codes;
    const allowed = new Set(configuredCodes);
    const directMatches = reasonCodes.filter((code) => allowed.has(code));

    if (directMatches.length > 0) {
      return directMatches;
    }

    const structuralCodes = reasonCodes.filter((code) =>
      code === CLOSURE_REASON_CODE.MISSING_CULPRIT
      || code === CLOSURE_REASON_CODE.MISSING_MOTIVE
      || code === CLOSURE_REASON_CODE.MISSING_METHOD
      || code === CLOSURE_REASON_CODE.INSUFFICIENT_EVIDENCE_COUNT,
    );

    if (structuralCodes.length > 0) {
      return structuralCodes;
    }

    return configuredCodes.length > 0 ? configuredCodes : reasonCodes;
  }
}
