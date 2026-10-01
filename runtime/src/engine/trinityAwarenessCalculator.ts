/**
 * Trinity Awareness Scoring Calculator
 * 
 * Calculates and updates the player's trinity_awareness_score based on:
 * - Outcome flags from case closures
 * - Diminishing returns per case
 * - Threshold-based retaliation triggers
 * 
 * Reference: schema.md - hidden_systems.trinity_awareness
 */

import { GlobalGameState } from '../types.js';

export interface TrinityAwarenessConfig {
  starting_score: number;
  minimum_score: number;
  allow_score_decay: boolean;
  early_detection_threshold: number;
  retaliation_thresholds: number[];
  diminishing_returns_per_case: boolean;
  diminishing_returns_curve: number[];
}

export interface TrinityAwarenessResult {
  previous_score: number;
  new_score: number;
  delta: number;
  threshold_reached: number | null;
  should_trigger_retaliation: boolean;
  flags_contributing: string[];
}

/**
 * Default configuration for Trinity awareness scoring
 */
export const DEFAULT_TRINITY_AWARENESS_CONFIG: TrinityAwarenessConfig = {
  starting_score: 0,
  minimum_score: 0,
  allow_score_decay: true,
  early_detection_threshold: 25,
  retaliation_thresholds: [25, 50, 75],
  diminishing_returns_per_case: true,
  diminishing_returns_curve: [1.0, 0.75, 0.5, 0.25]
};

/**
 * Flags that indicate Trinity awareness
 */
const TRINITY_AWARENESS_FLAGS: Record<string, number> = {
  // Clockmaker awareness
  'is_clockmaker_suspicious_1': 4,
  'is_clockmaker_suspicious': 5,
  'clockmaker_intervention_confirmed': 6,
  'clockmaker_infrastructure_1': 4,
  'clockmaker_infrastructure_2': 5,
  'clockmaker_infrastructure_3': 5,
  'clockmaker_tech_infiltration': 4,
  'clockmaker_digital_signature_match': 5,
  'clockmaker_digital_erasure': 5,
  'clockmaker_identity_infrastructure': 4,
  'clockmaker_identity_erasure': 5,
  'clockmaker_direct_attack': 7,
  'clockmaker_command_center_hint': 6,
  'symmetric_time_pattern_1': 3,
  'symmetric_time_pattern_2': 4,
  'symmetric_time_pattern_3': 5,
  'false_clockmaker_pattern_seen': 2,
  
  // Alchemist awareness
  'is_alchemist_suspicious': 5,
  'alchemist_compound_pattern_1': 4,
  'alchemist_compound_pattern_2': 5,
  'alchemist_compound_pattern_3': 6,
  'alchemist_compound_pattern_4': 6,
  'alchemist_supply_chain_hint': 4,
  'alchemist_supply_chain_confirmed': 5,
  'alchemist_source_identified': 7,
  'alchemist_source_destroyed': 5,
  'alchemist_covering_tracks': 5,
  'alchemist_new_compound': 6,
  'alchemist_mass_threat': 7,
  'alchemist_pharmacy_precision': 6,
  
  // Whisperer awareness
  'is_whisperer_suspicious': 5,
  'whisperer_echo_1': 4,
  'whisperer_phrase_detected_1': 4,
  'whisperer_phrase_detected_2': 5,
  'whisperer_pattern_forming': 5,
  'whisperer_manipulation_confirmed': 6,
  'whisperer_reframing_technique': 5,
  'whisperer_alchemist_collaboration': 6,
  'whisperer_alchemist_collaboration_2': 6,
  'whisperer_prison_access': 7,
  'whisperer_training_others': 7,
  'whisperer_identity_clue_1': 5,
  'yahya_under_suspicion': 5,
  
  // General Trinity awareness
  'trinity_pattern_detected': 8,
  'trinity_awareness_rising': 3,
  'trinity_awareness_falling': -2,
  'trinity_full_collaboration_seen': 8,
  'trinity_self_protection': 6,
  'trinity_testing_player': 7,
  'trinity_direct_attack': 8,
  'trinity_full_operation_documented': 8,
  'trinity_archive_discovered': 9,
  'trinity_philosophy_revealed': 10,
  'trinity_coordinated_attack_on_player': 8,
  'trinity_structure_fully_mapped': 10,
  'trinity_is_ideology': 9,
  'trinity_lineage_mapped': 8,
  'trinity_recruitment_exposed': 10,
  'empty_third_seat_hint_seen': 6,
  'empty_third_seat_discovered': 9,
  'third_seat_mystery_deepened': 5,
  'player_mirror_identity_revealed': 8,
  
  // Institutional corruption (supports Trinity awareness)
  'institutional_corruption_hint_1': 2,
  'institutional_corruption_hint_2': 3,
  'institutional_corruption_confirmed': 4,
  'institutional_corruption_deepening': 4,
  'institutional_network_expanding': 4,
  'institutional_network_confirmed': 5,
  'institutional_network_ground_level': 4,
  'institutional_network_rural_expansion': 4,
  
  // Shadow messages
  'shadow_message_1_received': 3,
  'shadow_message_2_received': 4,
  'shadow_message_3_received': 5,
  'shadow_message_4_received': 6,
  'shadow_message_final_setup': 7,
  'shadow_direct_contact': 8,
  'shadow_identity_confirmed_as_whisperer': 9
};

/**
 * Calculate Trinity awareness score after case closure
 * 
 * @param playerState - Current player state
 * @param outcomeFlags - Flags generated from case closure
 * @param caseNumber - Current case number (for diminishing returns)
 * @param config - Optional configuration (uses defaults if not provided)
 * @returns Result with new score and metadata
 */
export function calculateTrinityAwareness(
  gameState: GlobalGameState,
  outcomeFlags: string[],
  caseNumber: number,
  config: TrinityAwarenessConfig = DEFAULT_TRINITY_AWARENESS_CONFIG
): TrinityAwarenessResult {
  const previousScore = gameState.trinity_awareness_score ?? config.starting_score;
  const flagsContributing: string[] = [];
  let totalDelta = 0;
  
  // Calculate raw delta from flags
  for (const flag of outcomeFlags) {
    if (TRINITY_AWARENESS_FLAGS[flag] !== undefined) {
      const flagValue = TRINITY_AWARENESS_FLAGS[flag];
      flagsContributing.push(flag);
      totalDelta += flagValue;
    }
  }
  
  // Apply diminishing returns if enabled
  if (config.diminishing_returns_per_case && config.diminishing_returns_curve.length > 0) {
    const caseIndex = Math.min(caseNumber - 1, config.diminishing_returns_curve.length - 1);
    const multiplier = config.diminishing_returns_curve[caseIndex];
    totalDelta = totalDelta * multiplier;
  }
  
  // Calculate new score with bounds
  let newScore = Math.max(
    config.minimum_score,
    Math.min(100, previousScore + totalDelta)
  );
  
  // Allow score decay if configured
  if (config.allow_score_decay) {
    // Check for decay flags
    const hasDecayFlag = outcomeFlags.some(flag => 
      flag.includes('awareness_falling') || 
      flag.includes('false_success') ||
      flag.includes('ignored_alchemist')
    );
    
    if (hasDecayFlag) {
      const decayAmount = 3; // Fixed decay per case with misleading flags
      newScore = Math.max(config.minimum_score, newScore - decayAmount);
      totalDelta -= decayAmount;
    }
  }
  
  // Round to 2 decimal places
  newScore = Math.round(newScore * 100) / 100;
  totalDelta = Math.round(totalDelta * 100) / 100;
  
  // Check if any retaliation threshold was crossed
  let thresholdReached: number | null = null;
  for (const threshold of config.retaliation_thresholds) {
    if (previousScore < threshold && newScore >= threshold) {
      thresholdReached = threshold;
      break;
    }
  }
  
  // Determine if retaliation should trigger
  const shouldTriggerRetaliation = thresholdReached !== null;
  
  return {
    previous_score: previousScore,
    new_score: newScore,
    delta: totalDelta,
    threshold_reached: thresholdReached,
    should_trigger_retaliation: shouldTriggerRetaliation,
    flags_contributing: flagsContributing
  };
}

/**
 * Update player state with new Trinity awareness score
 * 
 * @param playerState - Player state to update
 * @param result - Calculation result from calculateTrinityAwareness
 * @returns Updated player state
 */
export function applyTrinityAwarenessUpdate(
  gameState: GlobalGameState,
  result: TrinityAwarenessResult
): GlobalGameState {
  return {
    ...gameState,
    trinity_awareness_score: result.new_score
  };
}

/**
 * Get current awareness tier based on score
 * 
 * @param score - Current Trinity awareness score
 * @returns Tier description
 */
export function getAwarenessTier(score: number): string {
  if (score >= 75) return 'tier_3_critical';
  if (score >= 50) return 'tier_2_elevated';
  if (score >= 25) return 'tier_1_early_detection';
  return 'tier_0_dormant';
}

/**
 * Check if player should see UI anomalies based on awareness
 * 
 * @param score - Current Trinity awareness score
 * @returns Whether anomalies should be enabled
 */
export function shouldEnableAnomalies(score: number): boolean {
  return score >= 25; // Early detection threshold
}

/**
 * Check if Trinity retaliation should activate
 * 
 * @param score - Current Trinity awareness score
 * @param config - Configuration with retaliation thresholds
 * @returns Active retaliation tier (0 if none)
 */
export function getActiveRetaliationTier(
  score: number,
  config: TrinityAwarenessConfig = DEFAULT_TRINITY_AWARENESS_CONFIG
): number {
  if (score >= (config.retaliation_thresholds[2] ?? 75)) return 3;
  if (score >= (config.retaliation_thresholds[1] ?? 50)) return 2;
  if (score >= (config.retaliation_thresholds[0] ?? 25)) return 1;
  return 0;
}
