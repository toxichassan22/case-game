import { validateDomainEvent } from "./eventValidation.js";
import { appendDebugTrace, eventKey, recordEvent, type EngineState } from "./store.js";
import { DEBUG_TRACE_KIND, type EVENT_NAME } from "./constants.js";
import type { DomainEvent, SourceType } from "../types.js";

export class EventBus {
  constructor(private state: EngineState) {}

  registerEvents(events: DomainEvent[], target: DomainEvent[] = []): DomainEvent[] {
    for (const event of events) {
      const validationError = validateDomainEvent(event);
      if (validationError) {
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.EVENT_REJECTED, validationError, {
          event_name: event.event_name,
        });
        throw new Error(validationError);
      }

      if (this.state.observedEvents.has(eventKey(event))) {
        continue;
      }

      recordEvent(this.state, event);
      target.push(event);
      appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.EVENT_EMITTED, `Event emitted: ${event.event_name}`, {
        source_ref: event.source_ref,
        interaction_id: event.interaction_id,
        result: event.result,
      });
    }

    return target;
  }

  createEvent(
    eventName: (typeof EVENT_NAME)[keyof typeof EVENT_NAME],
    sourceType: SourceType,
    sourceRef: string,
    interactionId: string,
    playerAction: DomainEvent["player_action"],
    result: string,
    displayText?: string,
  ): DomainEvent {
    return {
      event_name: eventName,
      source_type: sourceType,
      source_ref: sourceRef,
      interaction_id: interactionId,
      player_action: playerAction,
      result,
      display_text: displayText,
      tick: this.state.currentTick,
    };
  }
}
