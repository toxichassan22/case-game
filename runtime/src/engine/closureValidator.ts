import type {
  ClosureAttempt,
  ClosureCatalog,
  ClosureValidationOutcome,
  RuntimeCaseDefinition,
} from "../types.js";
import type { EngineState } from "./store.js";
import { ClosureSystem } from "./closureSystem.js";

export function validateClosureAttempt(
  definition: RuntimeCaseDefinition,
  closureCatalog: ClosureCatalog,
  state: EngineState,
  attempt: ClosureAttempt,
): ClosureValidationOutcome {
  return new ClosureSystem(state, definition, closureCatalog).validateClosureAttempt(attempt);
}
