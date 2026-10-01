import type { DebugTraceKind, EventName, FactType, PlayerActionType, SourceType } from "./engine/constants.js";
export type { DebugTraceKind, EventName, FactType, PlayerActionType, SourceType };

export type EvidenceState = "locked" | "partial" | "verified" | "contested" | "corrupted";
export type EvidenceQuality = "final" | "provisional";
export type SuspectState = "normal" | "collapsing" | "lawyer_up";
export type PhsHintLevel = "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7+";
export type PhsHintType = "highlight" | "note" | "message" | "direct";

export interface PhsHint {
  level: PhsHintLevel;
  type: PhsHintType;
  payload: {
    text: string;
    source_ref?: string;
    metadata?: {
      reason?: string;
      [key: string]: unknown;
    };
  };
}

export interface PhsState {
  currentLevel: number;
  lastProgressTick: number;
  lastVerifiedCount: number;
  lastClosureBucketSize: number;
  activeHint: PhsHint | null;
}

export interface CognitiveProfileDefinition {
  base_collapse_threshold: number;
  base_lawyer_up_threshold: number;
  aggression_tolerance: number;
  rapport_affinity: number;
  evidence_rigidity: number;
}

export interface FixedTimelineEvent {
  time: string;
  character: string;
  description: string;
  type?: string;
}

export interface RouteWeight {
  timeline: number;
  forensics: number;
  behavioral: number;
}

export interface TriggerCondition {
  event_name: EventName;
  source_type: SourceType;
  source_ref: string;
  interaction_id: string;
  expected_player_action: PlayerActionType | string;
  required_result: string;
}

export interface CompletionTrigger {
  trigger_id: string;
  availability_mode: string;
  delay_ticks: number;
  scheduled_on_event: EventName | null;
  logic_operator: "all" | "any";
  conditions: TriggerCondition[];
  on_complete: "unlock_evidence" | "upgrade_to_verified" | "set_flag_only";
  on_complete_params?: Record<string, unknown>;
}

export interface CaseEvidence {
  evidence_id: string;
  case_id: string;
  title: string;
  type: string;
  evidence_tier: string;
  evidence_role: string;
  summary: string;
  content_ref: string;
  locked: boolean;
  requires_warrant: boolean;
  state: EvidenceState;
  requires_route_collaboration: string[];
  depends_on_evidence_ids: string[];
  completion_triggers: CompletionTrigger[];
  upgraded_summary: string;
  report_body?: string;
  image_url?: string;
  audio_url?: string;
  video_url?: string;
  penalty_if_mishandled: string[];
  tags: string[];
  route_weight: RouteWeight;
  grand_truth_axis: string[];
  ui_action?: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.REVIEW_EVIDENCE | typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.INSPECT_OBJECT;
  lab_unlock_requires_evidence_id?: string; // File that must be opened to unlock lab results (single)
  lab_unlock_requires_evidence_ids?: string[]; // Files that must be opened (multiple)
}

export interface ValidateClosureRules {
  minimum_behavioral_chain_verified: number;
  minimum_cross_route_verified: number;
  no_shared_evidence_between_roles: boolean;
  behavioral_chain_evidence_ids: string[];
  cross_route_evidence_ids: string[];
  rejected_submission_reason_codes: string[];
}

export interface ClosureRules {
  requires_culprit: boolean;
  requires_motive: boolean;
  requires_method_or_opportunity: boolean;
  minimum_evidence_count: number;
  accepted_true_motive_ids: string[];
  accepted_true_method_ids?: string[];
  false_success_motive_ids: string[];
  false_success_flag: string;
  validate_closure: ValidateClosureRules;
  available_motive_descriptions?: Record<string, string>;
  available_method_descriptions?: Record<string, string>;
}

export interface ReinterpretationPredicate {
  fact_type: FactType | string;
  ref: string;
  equals: boolean;
}

export interface ReinterpretationResult {
  set_interpretation_key?: string;
  set_evidence_state?: EvidenceState;
  set_evidence_summary?: string;
  set_evidence_tags?: string[];
  set_evidence_role?: string;
  clear_flags?: string[];
  set_flags?: string[];
  emit_event?: string;
}

export interface EvidenceReinterpretationRule {
  rule_id: string;
  target_evidence_id: string;
  evaluation_mode: "state_based";
  recompute_each_tick: boolean;
  depends_on_facts?: string[];
  state_predicates_true: ReinterpretationPredicate[];
  on_true: ReinterpretationResult;
  on_false_if_any?: ReinterpretationPredicate[];
  on_false: ReinterpretationResult;
}

export interface QueuePressureVariant {
  variant_id: string;
  selector: string;
  effect: {
    target_ref: string;
    result_quality?: EvidenceQuality;
    duration_ticks?: number;
    delay_ticks?: number;
  };
  visible_notice: string;
}

export interface ForensicsQueuePressureRules {
  enabled: boolean;
  pressure_increment?: number;
  requires_player_facing_explanation: boolean;
  trigger_when: {
    action: string;
    before_evidence_verified?: string;
    evidence_id?: string;
  };
  deterministic_variants: QueuePressureVariant[];
}

export interface UiFeedbackRule {
  rule_id?: string;
  when_event?: string;
  source_ref: string;
  player_notice: string;
}

export interface SoftExposurePredicate {
  fact_type: FactType | string;
  ref: string;
  equals: boolean;
}

export interface SoftExposureRule {
  rule_id: string;
  source_ref: string;
  when_any: SoftExposurePredicate[];
  surface_stub?: {
    title: string;
    badge: string;
    folder: string;
  };
  player_toast?: string;
  required_visibility?: boolean;
}

export interface HiddenSystems {
  ui_anomalies?: UIAnomaliesConfig;
  route_collaboration?: RouteCollaborationConfig;
  evidence_reinterpretation_rules: EvidenceReinterpretationRule[];
  forensics_queue_pressure_rules: ForensicsQueuePressureRules;
  ui_feedback_rules: UiFeedbackRule[];
  soft_exposure_rules?: SoftExposureRule[];
  trinity_awareness?: TrinityAwarenessConfig;
  trinity_retaliation?: TrinityRetaliationConfig;
  vacant_role_resolution?: VacantRoleResolutionConfig;
}

export interface RouteCollaborationConfig {
  minimum_required_chains: number;
  shared_evidence_completion_required: boolean;
  critical_evidence_requires_alternative_paths: boolean;
  minimum_alternative_trigger_sets_for_critical_evidence: number;
}

export interface TrinityAwarenessSource {
  source_id: string;
  source_ref: string;
  delta: number;
  player_action: string;
}

export interface TrinityRetaliationRule {
  rule_id: string;
  threshold: number;
  primary_role: string;
  proxy_role: string;
  response_type: string;
  source_ref: string;
  visible_effect: string;
}

export interface TrinityAwarenessConfig {
  starting_score: number;
  minimum_score: number;
  allow_score_decay: boolean;
  early_detection_threshold: number;
  retaliation_thresholds: number[];
  diminishing_returns_per_case: boolean;
  diminishing_returns_curve: number[];
}

export interface TrinityRetaliationConfig {
  vacant_role_mode: string;
  proxy_cover_enabled: boolean;
  cooldown_ticks: number;
  max_events_per_case: number;
  stacking_rules: {
    allow_same_tick_stack: boolean;
    priority_mode: string;
    duplicate_event_policy: string;
  };
}

export interface VacantRoleResolutionConfig {
  primary_source: string;
  tie_breaker_order: string[];
  default_role: string;
}

export interface TransitionContextHook {
  hook_id: string;
  target_case_id: string;
  required_flags_all: string[];
  blocked_flags: string[];
  effect_type: string;
  effect_payload: Record<string, unknown>;
  player_facing_intent: string;
}

export interface OutcomeFlags {
  success: string[];
  partial: string[];
  failure: string[];
}

export interface DialogOption {
  id: string;
  text: string;
  is_locked?: boolean;
}

export interface UIAnomalyEvent {
  anomaly_id: string;
  trigger_flag: string;
  trigger_event: string;
  target_ui_element: string;
  effect_type: 'text_morph' | 'visual_glitch' | 'shadow_appearance' | 'audio_distortion';
  original_text?: string;
  morphed_text?: string;
  glitch_type?: string;
  description_text?: string;
  duration_ms: number;
  severity?: 'subtle' | 'moderate' | 'obvious';
  revert?: boolean;
  max_triggers_per_case: number;
  description: string;
}

export interface ParanoiaIntensity {
  level: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  escalation_rule?: string;
}

export interface UIAnomaliesConfig {
  allowed_events: UIAnomalyEvent[];
  paranoia_intensity: ParanoiaIntensity;
}

export interface CaseCharacter {
  character_id: string;
  name: string;
  role_in_case?: string;
  relationship_to_victim?: string;
  occupation?: string;
  public_profile?: string;
  image_url?: string;
  audio_url?: string;
  MBTI_Type?: string | null;
  cognitive_profile?: CognitiveProfileDefinition;
  pressure_response?: string;
  deception_style?: string;
  speech_register?: string;
  favorite_phrases?: string[];
  verbal_tells?: string[];
  local_function?: string;
  recurring_npc?: boolean;
  grand_truth_relevance?: string[];
  hidden_affiliations?: string[];
  dialogue_options?: DialogOption[];
}

export interface Suspect extends CaseCharacter {
  cognitive_profile: CognitiveProfileDefinition;
  pressure_response: string;
  dialogue_options?: DialogOption[];
}

export interface NextCaseRule {
  rule_id: string;
  priority: number;
  required_flags_all: string[];
  required_flags_any: string[];
  blocked_flags: string[];
  target_case_id: string;
  target_case_path: string;
  clarity_modifier: number;
  transition_reason: string;
}

export interface InboxBrief {
  sender: string;
  subject: string;
  message: string;
  audio_url?: string;
}

export interface RuntimeCaseDefinition {
  case_id: string;
  title: string;
  inbox_brief?: string | InboxBrief;
  evidence_list: CaseEvidence[];
  suspects: Suspect[];
  witnesses?: CaseCharacter[];
  related_persons?: CaseCharacter[];
  closure_rules: ClosureRules;
  hidden_systems: HiddenSystems;
  transition_context_hooks: TransitionContextHook[];
  outcome_flags: OutcomeFlags;
  next_case_rules: NextCaseRule[];
  timeline_events?: FixedTimelineEvent[];
  timeline_blueprints?: TimelineBlueprint[];
  hints?: string[];
  phs_hints?: PhsHint[];
  maxPhsLevels?: number;
  solution?: {
    culprit: string;
    motive: string;
    method: string;
    explanation: string;
  };
  /**
   * Derived at adapter build time (not authored): dialog option IDs that have a
   * dialog blueprint response, keyed by interrogation source_ref (e.g. "INT-SHARIF-01").
   * The client uses this to know which authored dialogue options actually produce a reply.
   */
  supported_dialog_options?: Record<string, string[]>;
}

export interface ClosureAttempt {
  submitted_suspect: string;
  submitted_motive: string;
  submitted_method_or_timeline: string;
  submitted_evidence_ids: string[];
}

export interface TransitionContext {
  hook_id: string;
  target_case_id: string;
  effect_type: string;
  effect_payload: Record<string, unknown>;
  player_facing_intent: string;
}

export interface PlayerBehaviorEntry {
  tick: number;
  action_type: string;
  behavior_tag: string; // e.g., "rush_to_closure", "ignored_behavioral_evidence"
  metadata?: Record<string, unknown>;
}

export interface GlobalGameState {
  globalFlags: string[];
  playerProfile: Record<string, unknown>;
  cognitiveBiasScore: number;
  trustLevels: Record<string, number>;
  hiddenNarrativeState: Record<string, unknown>;
  playerBehaviorLog: PlayerBehaviorEntry[];
  trinity_awareness_score: number;
  vacant_trinity_role: "timeline" | "forensics" | "behavioral" | null;
  first_case_closure_route: "timeline" | "forensics" | "behavioral" | null;
  route_usage_stats: {
    timeline: number;
    forensics: number;
    behavioral: number;
  };
  inventory_items: Array<{
    evidence_id: string;
    source_case_id: string;
    type: string;
    retained_reason: string;
    usable_in_future_cases: boolean;
  }>;
  npc_global_memory: Record<string, {
    relationship_score: number;
    trust_level: number;
    resentment_flags: string[];
    wrongly_accused_case_ids: string[];
    helped_by_player_case_ids: string[];
    known_secrets: string[];
    last_seen_case_id: string | null;
    last_outcome_summary: string | null;
  }>;
}

export interface ClosureDecision {
  accepted: boolean;
  mode: "true_success" | "false_success" | "rejected";
  reason_codes: string[];
  granted_flags: string[];
}

export type PlayerAction =
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.OPEN_SOURCE; source_ref: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.REVIEW_EVIDENCE; source_ref: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.INSPECT_OBJECT; source_ref: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.CHOOSE_DIALOG_OPTION; source_ref: string; interaction_id: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.LOCK_TIMELINE_EVENT; interaction_id: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.REQUEST_DEEP_METADATA_RECOVERY; source_ref: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.REQUEST_PHS }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.SEND_TO_LAB; source_ref: string }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.VERIFY_TIMELINE_SEQUENCE }
  | { type: typeof import("./engine/constants.js").PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE; attempt: ClosureAttempt };

export interface DomainEvent {
  event_name: EventName;
  source_type: SourceType;
  source_ref: string;
  interaction_id: string;
  player_action: PlayerActionType | "derived_pass";
  result: string;
  display_text?: string;
  tick: number;
}

export interface DebugTraceEntry {
  tick: number;
  kind: DebugTraceKind;
  message: string;
  data?: Record<string, unknown>;
}

export interface RuntimeNotice {
  tick: number;
  code: string;
  message: string;
}

export interface ScheduledEffect {
  kind: "delayed_trigger" | "review_delay" | "pending_quality" | "active_quality";
  target_ref: string;
  until_tick: number;
  detail: string;
}

export interface RuntimeSnapshot {
  case_id: string;
  currentTick: number;
  verifiedFacts: string[];
  eventTrace: DomainEvent[];
  closureBuckets: {
    verifiedEvidenceIds: string[];
    behavioralVerifiedIds: string[];
    crossRouteVerifiedIds: string[];
  };
  evidenceStates: Record<string, EvidenceState>;
  evidenceQualities: Record<string, EvidenceQuality>;
  evidenceInterpretations: Record<string, string>;
  evidenceSummaries: Record<string, string>;
  visitedSources: string[];
  completedTriggers: string[];
  evidenceTags: Record<string, string[]>;
  evidenceRoles: Record<string, string>;
  flags: string[];
  notices: RuntimeNotice[];
  scheduledEffects: ScheduledEffect[];
  debugTrace: DebugTraceEntry[];
  lastClosureDecision?: ClosureDecision | null;
  pendingTransitionContext: TransitionContext | null;
  globalState: GlobalGameState;
  suspectPressureScores: Record<string, number>;
  suspectStates: Record<string, SuspectState>;
  phsState: PhsState;
}

export interface ProcessedActionResult {
  accepted: boolean;
  tickConsumed: boolean;
  rejectionReason: string | null;
  emittedEvents: DomainEvent[];
  changedEvidence: string[];
  debugEntries: DebugTraceEntry[];
  snapshot: RuntimeSnapshot;
  routeResolution?: {
    rule_id: string;
    target_case_id: string;
    target_case_path: string;
    clarity_modifier: number;
    transition_reason: string;
  };
}

export interface ReviewBlueprint {
  source_ref: string;
  source_type: SourceType;
  interaction_id: string;
  required_result: string;
  verifies_evidence: boolean;
}

export interface DialogBlueprint {
  source_ref: string;
  interaction_id: string;
  required_result: string;
  display_text?: string;
}

export interface TimelineBlueprint {
  id: string;
  interaction_id: string;
  required_result: string;
  title: string;
  prerequisites: string[];
}

export interface ClosureCatalog {
  suspect_ids: string[];
  method_ids: string[];
}

export interface RuntimeCaseAdapter {
  definition: RuntimeCaseDefinition;
  closureCatalog: ClosureCatalog;
  openableSources: Set<string>;
  reviewBlueprints: Map<string, ReviewBlueprint>;
  inspectBlueprints: Map<string, ReviewBlueprint>;
  dialogBlueprints: Map<string, DialogBlueprint>;
  timelineBlueprints: Map<string, TimelineBlueprint>;
  getRelatedEvidenceIds(sourceRef: string): string[];
  inferSourceType(sourceRef: string): SourceType;
}

export type Case01Adapter = RuntimeCaseAdapter;

export interface ClosureValidationMetrics {
  culprit_is_present: boolean;
  motive_is_present: boolean;
  method_is_present: boolean;
  submitted_verified_evidence_ids: string[];
  behavioral_evidence_ids: string[];
  cross_route_evidence_ids: string[];
  shared_evidence_ids: string[];
}

export interface ClosureValidationOutcome {
  decision: ClosureDecision;
  metrics: ClosureValidationMetrics;
}
