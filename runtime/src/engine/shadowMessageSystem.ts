/**
 * The Shadow Messaging System
 * 
 * Delivers mysterious messages from "الظل" (The Shadow) at specific case milestones.
 * These messages comment on player progress and hint at the larger Trinity conspiracy.
 * 
 * Reference: story.md - Shadow messages at cases 10, 20, 30, 40, 50
 */

import { GlobalGameState } from '../types.js';

export interface ShadowMessage {
  case_number: number;
  message_ar: string;
  message_en: string;
  requires_flags?: string[];
  blocks_if_flags?: string[];
  terminal_effect?: 'normal' | 'glitch' | 'encrypted';
  follow_up_action?: 'none' | 'reveal_innocent_list' | 'open_dialogue';
}

export interface ShadowMessageDelivery {
  delivered: boolean;
  delivered_at_case: number | null;
  player_response?: 'defiant' | 'analytical' | 'silent' | 'curious';
  trinity_awareness_delta: number;
}

/**
 * All Shadow messages across the game
 */
export const SHADOW_MESSAGES: ShadowMessage[] = [
  {
    case_number: 10,
    message_ar: "عشر قضايا. مش بطال. بس إنت لسه بتشوف السطح.",
    message_en: "Ten cases. Not bad. But you're still seeing the surface.",
    terminal_effect: 'normal',
    follow_up_action: 'none'
  },
  {
    case_number: 20,
    message_ar: "20 قضية. بدأت تشوف. السؤال: هل هتحب اللي هتلاقينه؟",
    message_en: "20 cases. You're starting to see. The question is: will you like what you find?",
    terminal_effect: 'glitch',
    follow_up_action: 'none'
  },
  {
    case_number: 30,
    message_ar: "عرفتنا... ولا عرفنا نفسك؟",
    message_en: "Did you discover us... or did you discover yourself?",
    terminal_effect: 'glitch',
    follow_up_action: 'none'
  },
  {
    case_number: 40,
    message_ar: "أربعين. دلوقتي عرفت واحد. فاضل اتنين... ولا فاضل واحد؟",
    message_en: "Forty. Now you know one. Two left... or just one?",
    requires_flags: ['first_trinity_member_identified'],
    terminal_effect: 'encrypted',
    follow_up_action: 'none'
  },
  {
    case_number: 50,
    message_ar: "خمسين قضية. في كل واحدة، المجرم كان بيقول 'مكنش عندي اختيار.' وإنت بتقول 'أنا اخترت العدالة.' بس هل إنت فعلاً اخترت؟ ولا إحنا اخترنالك؟",
    message_en: "Fifty cases. In each one, the criminal said 'I had no choice.' And you say 'I chose justice.' But did you really choose? Or did we choose you?",
    requires_flags: ['arc5_completed'],
    terminal_effect: 'encrypted',
    follow_up_action: 'reveal_innocent_list'
  },
  {
    case_number: 58,
    message_ar: "إنت فاكر إنك كنت بتحقق فينا؟ إحنا كنا بنحقق فيك.",
    message_en: "You thought you were investigating us? We were investigating you.",
    requires_flags: ['job_interview_revealed'],
    terminal_effect: 'normal',
    follow_up_action: 'open_dialogue'
  }
];

/**
 * Check if a Shadow message should be delivered for the current case
 */
export function shouldDeliverShadowMessage(
  caseNumber: number,
  globalFlags: string[]
): ShadowMessage | null {
  const message = SHADOW_MESSAGES.find(m => m.case_number === caseNumber);
  
  if (!message) return null;
  
  // Check required flags
  if (message.requires_flags) {
    const hasAllRequired = message.requires_flags.every(flag => 
      globalFlags.includes(flag)
    );
    if (!hasAllRequired) return null;
  }
  
  // Check blocking flags
  if (message.blocks_if_flags) {
    const hasAnyBlocking = message.blocks_if_flags.some(flag => 
      globalFlags.includes(flag)
    );
    if (hasAnyBlocking) return null;
  }
  
  return message;
}

/**
 * Get Shadow message content with formatting
 */
export function formatShadowMessage(message: ShadowMessage): string {
  const prefix = message.terminal_effect === 'encrypted' ? '[DECRYPTED] ' : '';
  const glitch = message.terminal_effect === 'glitch' ? '\n[SYSTEM INTERFERENCE DETECTED]\n' : '';
  
  return `${glitch}${prefix}>>> الظل (The Shadow) <<<\n\n${message.message_ar}\n\n[${message.message_en}]`;
}

/**
 * Update global state after Shadow message delivery
 */
export function deliverShadowMessage(
  gameState: GlobalGameState,
  message: ShadowMessage,
  playerResponse: 'defiant' | 'analytical' | 'silent' | 'curious' = 'analytical'
): GlobalGameState {
  const awarenessDelta = calculateAwarenessDelta(message, playerResponse);
  
  return {
    ...gameState,
    hiddenNarrativeState: {
      ...gameState.hiddenNarrativeState,
      [`shadow_message_${message.case_number}_delivered`]: true,
      [`shadow_message_${message.case_number}_response`]: playerResponse,
      shadow_messages_count: (gameState.hiddenNarrativeState.shadow_messages_count as number || 0) + 1
    },
    trinity_awareness_score: Math.max(0, Math.min(100, 
      gameState.trinity_awareness_score + awarenessDelta
    ))
  };
}

/**
 * Calculate awareness delta based on message and player response
 */
function calculateAwarenessDelta(
  message: ShadowMessage,
  playerResponse: 'defiant' | 'analytical' | 'silent' | 'curious'
): number {
  let baseDelta = 5;
  
  // Later messages give more awareness
  if (message.case_number >= 50) baseDelta = 10;
  else if (message.case_number >= 30) baseDelta = 8;
  else if (message.case_number >= 20) baseDelta = 6;
  
  // Player response modifier
  switch (playerResponse) {
    case 'analytical':
      return baseDelta + 5; // Rewards thoughtful engagement
    case 'curious':
      return baseDelta + 3;
    case 'defiant':
      return baseDelta; // Neutral
    case 'silent':
      return baseDelta - 2; // Slightly less for non-engagement
    default:
      return baseDelta;
  }
}

/**
 * Get the hidden innocent list (Case 50 special payload)
 */
export function getInnocentListPayload(): {
  description: string;
  innocent_names: string[];
  cases_affected: number[];
} {
  return {
    description: "قائمة بالأبرياء الذين أُدينوا بسبب تلاعب الثالوث",
    innocent_names: [
      "أحمد السيد - Case 05",
      "مريم حسن - Case 12",
      "خالد عمر - Case 18"
    ],
    cases_affected: [5, 12, 18]
  };
}

/**
 * Check if player has already received a specific Shadow message
 */
export function hasReceivedShadowMessage(
  gameState: GlobalGameState,
  caseNumber: number
): boolean {
  return gameState.hiddenNarrativeState[`shadow_message_${caseNumber}_delivered`] === true;
}

/**
 * Get player's historical response to a Shadow message
 */
export function getPlayerShadowResponse(
  gameState: GlobalGameState,
  caseNumber: number
): 'defiant' | 'analytical' | 'silent' | 'curious' | null {
  return gameState.hiddenNarrativeState[`shadow_message_${caseNumber}_response`] as any || null;
}
