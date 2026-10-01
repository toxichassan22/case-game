import type { RuntimeCaseDefinition, NextCaseRule } from "../types.js";
import type { EngineState } from "./store.js";

export interface RouteResolutionResult {
  rule_id: string;
  target_case_id: string;
  target_case_path: string;
  clarity_modifier: number;
  transition_reason: string;
}

export class RouteResolver {
  constructor(
    private readonly state: EngineState,
    private readonly definition: RuntimeCaseDefinition
  ) {}

  /**
   * Resolves the final route at the end of a case based on next_case_rules.
   */
  resolveRoute(): RouteResolutionResult | null {
    const rules = [...this.definition.next_case_rules].sort((a, b) => b.priority - a.priority);

    for (const rule of rules) {
      if (this.evaluateRule(rule)) {
        return {
          rule_id: rule.rule_id,
          target_case_id: rule.target_case_id,
          target_case_path: rule.target_case_path,
          clarity_modifier: rule.clarity_modifier,
          transition_reason: rule.transition_reason,
        };
      }
    }

    return null;
  }

  private evaluateRule(rule: NextCaseRule): boolean {
    // Check required flags (ALL)
    for (const flag of rule.required_flags_all) {
      if (!this.state.flags.has(flag)) return false;
    }

    // Check required flags (ANY)
    if (rule.required_flags_any.length > 0) {
      let anyMatch = false;
      for (const flag of rule.required_flags_any) {
        if (this.state.flags.has(flag)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
    }

    // Check blocked flags
    for (const flag of rule.blocked_flags) {
      if (this.state.flags.has(flag)) return false;
    }

    return true;
  }
}
