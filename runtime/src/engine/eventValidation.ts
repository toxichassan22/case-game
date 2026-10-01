import { EVENT_NAME, PLAYER_ACTION_TYPE, SOURCE_TYPE } from "./constants.js";
import type { DomainEvent } from "../types.js";

const allowedEventNames = new Set<string>(Object.values(EVENT_NAME));
const allowedSourceTypes = new Set<string>(Object.values(SOURCE_TYPE));
const allowedPlayerActions = new Set<string>([...Object.values(PLAYER_ACTION_TYPE), "derived_pass"]);

export function validateDomainEvent(event: DomainEvent): string | null {
  if (!allowedEventNames.has(event.event_name)) {
    return `Unknown event name: ${event.event_name}`;
  }

  if (!allowedSourceTypes.has(event.source_type)) {
    return `Unknown source type: ${event.source_type}`;
  }

  if (!allowedPlayerActions.has(event.player_action)) {
    return `Unknown player action: ${event.player_action}`;
  }

  if (!event.source_ref) {
    return "Event source_ref is required";
  }

  if (!event.interaction_id) {
    return "Event interaction_id is required";
  }

  if (!event.result) {
    return "Event result is required";
  }

  if (!Number.isInteger(event.tick) || event.tick < 0) {
    return `Invalid event tick: ${event.tick}`;
  }

  return null;
}
