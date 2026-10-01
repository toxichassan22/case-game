import { EVENT_NAME, DEBUG_TRACE_KIND } from "./constants.js";
import { appendDebugTrace, type EngineState } from "./store.js";
import type { RuntimeCaseDefinition, PlayerAction, DomainEvent } from "../types.js";
import { interrogationSourceRefToCharacterId } from "../utils/interrogationRefs.js";

export class InterrogationSystem {
  constructor(
    private readonly state: EngineState,
    private readonly definition: RuntimeCaseDefinition
  ) {}

  /**
   * Updates pressure score for a suspect based on player action or events.
   */
  applyInterrogationPressure(action: PlayerAction, emittedEvents: DomainEvent[]): void {
    if (action.type !== "choose_dialog_option" && action.type !== "review_evidence") {
      return;
    }

    if (action.type === "choose_dialog_option") {
      const suspectId = interrogationSourceRefToCharacterId(action.source_ref);
      if (suspectId) {
        this.incrementPressure(suspectId, this.getDialogPressureDelta(action.interaction_id));
      }
    }
    
    for (const event of emittedEvents) {
      if (event.event_name === EVENT_NAME.EVIDENCE_VERIFIED) {
        // Verifying evidence in front of a suspect increases pressure
        // We'll assume the player is "confronting" the current suspect if they are in an interrogation.
        // This is a simplified version of the full state machine.
        const currentSuspectId = this.findCurrentSuspect();
        if (currentSuspectId) {
          this.incrementPressure(currentSuspectId, 2);
        }
      }
    }

    this.updateSuspectStates();
  }

  private getDialogPressureDelta(interactionId: string): number {
    const normalized = interactionId.toUpperCase();
    if (normalized.includes("AGGRESSIVE") || ["Q03", "Q05", "Q09"].includes(normalized)) {
      return 2;
    }

    if (normalized.includes("EMPATHY") || normalized.includes("RAPPORT")) {
      return 0;
    }

    return 1;
  }

  private incrementPressure(suspectId: string, delta: number): void {
    if (!this.state.suspectPressureScores[suspectId]) {
      this.state.suspectPressureScores[suspectId] = 0;
    }
    this.state.suspectPressureScores[suspectId] += delta;
    
    appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.RULE_APPLIED, 
      `Pressure increased for ${suspectId}`, { delta, newScore: this.state.suspectPressureScores[suspectId] });
  }

  private updateSuspectStates(): void {
    for (const suspect of this.definition.suspects) {
      const score = this.state.suspectPressureScores[suspect.character_id] || 0;
      const profile = suspect.cognitive_profile;
      
      let newState: "normal" | "collapsing" | "lawyer_up" = "normal";
      
      const trust = this.state.globalMemory?.trustLevels?.[suspect.character_id] || 0;
      const effectiveCollapse = profile.base_collapse_threshold + (trust * profile.rapport_affinity);
      const effectiveLawyerUp = profile.base_lawyer_up_threshold - (trust * profile.aggression_tolerance);

      if (score >= effectiveCollapse) {
        newState = "collapsing";
      } else if (score >= effectiveLawyerUp) {
        newState = "lawyer_up";
      }

      if (this.state.suspectStates[suspect.character_id] !== newState) {
        const oldState = this.state.suspectStates[suspect.character_id] || "normal";
        this.state.suspectStates[suspect.character_id] = newState;
        
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.TRIGGER_FIRED, 
          `Suspect ${suspect.character_id} transitioned state`, { from: oldState, to: newState });
      }
    }
  }

  private findCurrentSuspect(): string | null {
    return this.state.currentInterrogationSuspectId;
  }
}
