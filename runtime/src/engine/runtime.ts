import { ActionProcessor } from "./actionProcessor.js";
import { ClosureSystem } from "./closureSystem.js";
import { FACT_TYPE, PLAYER_ACTION_TYPE, DEBUG_TRACE_KIND } from "./constants.js";
import { EffectSystem, getQueuePressureTriggerEvidenceRef } from "./effectSystem.js";
import { InterrogationSystem } from "./interrogationSystem.js";
import { RouteResolver } from "./routeResolver.js";
import { EventBus } from "./eventBus.js";
import { ReinterpretationSystem } from "./reinterpretationSystem.js";
import { engineLogger } from "./logger.js";
import {
  appendDebugTrace,
  createInitialState,
  createSnapshot,
  recomputeClosureBuckets,
  recordBehavior,
  setFlag,
  upsertGlobalFlag,
  applySnapshot,
  addNotice,
  type EngineState,
} from "./store.js";
import { TriggerSystem } from "./triggerSystem.js";
import { generatePhsHint } from "./phsSystem.js";
import type {
  DomainEvent,
  GlobalGameState,
  PlayerAction,
  ProcessedActionResult,
  RuntimeCaseAdapter,
  RuntimeCaseDefinition,
  RuntimeSnapshot,
  TransitionContext,
} from "../types.js";

export class CoreEngine {
  readonly adapter: RuntimeCaseAdapter;
  readonly definition: RuntimeCaseDefinition;
  readonly state: EngineState;

  private readonly eventBus: EventBus;
  private readonly actionProcessor: ActionProcessor;
  private readonly triggerSystem: TriggerSystem;
  private readonly effectSystem: EffectSystem;
  private readonly reinterpretationSystem: ReinterpretationSystem;
  private readonly closureSystem: ClosureSystem;
  private readonly interrogationSystem: InterrogationSystem;
  private readonly routeResolver: RouteResolver;

  constructor(
    adapter: RuntimeCaseAdapter,
    globalMemory?: GlobalGameState,
    initialFacts?: string[],
  ) {
    this.adapter = adapter;
    this.definition = adapter.definition;
    this.state = createInitialState(this.definition, globalMemory, initialFacts);

    this.eventBus = new EventBus(this.state);
    this.actionProcessor = new ActionProcessor(this.state, this.adapter, this.eventBus);
    this.triggerSystem = new TriggerSystem(this.state, this.definition);
    this.effectSystem = new EffectSystem(this.state, this.definition);
    this.reinterpretationSystem = new ReinterpretationSystem(this.state, this.definition, this.eventBus);
    this.closureSystem = new ClosureSystem(this.state, this.definition, this.adapter.closureCatalog);
    this.interrogationSystem = new InterrogationSystem(this.state, this.definition, this.eventBus);
    this.routeResolver = new RouteResolver(this.state, this.definition);

    recomputeClosureBuckets(this.definition, this.state);
  }

  getSnapshot(): RuntimeSnapshot {
    return createSnapshot(this.definition, this.state);
  }

  loadSnapshot(snapshot: RuntimeSnapshot): void {
    applySnapshot(this.state, snapshot);
    recomputeClosureBuckets(this.definition, this.state);
  }

  processAction(action: PlayerAction): ProcessedActionResult {
    try {
      const validationError = this.actionProcessor.validateAction(action);
      if (validationError) {
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.ACTION_REJECTED, validationError, {
          action_type: action.type,
        });
        return {
          accepted: false,
          tickConsumed: false,
          rejectionReason: validationError,
          emittedEvents: [],
          changedEvidence: [],
          debugEntries: this.debugEntriesForTick(this.state.currentTick),
          snapshot: this.getSnapshot(),
        };
      }

      // REQUEST_PHS: state-safe path — skip tick, triggers, effects, pressure
      if (action.type === PLAYER_ACTION_TYPE.REQUEST_PHS) {
        const hintEvent = generatePhsHint(this.state, this.definition);
        const emittedEvents: DomainEvent[] = hintEvent ? [hintEvent] : [];
        return {
          accepted: true,
          tickConsumed: false,
          rejectionReason: null,
          emittedEvents,
          changedEvidence: [],
          debugEntries: this.debugEntriesForTick(this.state.currentTick),
          snapshot: this.getSnapshot(),
        };
      }

      const before = this.getSnapshot();
      const pressureTriggerRef = getQueuePressureTriggerEvidenceRef(this.definition);
      const wasPressureEvidenceVerified = pressureTriggerRef
        ? this.state.verifiedFacts.has(`${FACT_TYPE.EVIDENCE_VERIFIED}:${pressureTriggerRef}`)
        : false;
      this.state.currentTick += 1;
      appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.ACTION_ACCEPTED, `Accepted action ${action.type}`, {
        action_type: action.type,
      });

      // Apply Action
      const emittedEvents = this.eventBus.registerEvents(this.actionProcessor.applyAction(action));

      // Resolve Triggers
      const candidateTriggerIds = this.triggerSystem.collectCandidateTriggerIds(emittedEvents);
      this.triggerSystem.scheduleDelayedTriggers(emittedEvents);
      this.triggerSystem.resolveTriggers(candidateTriggerIds);

      // Reinterpretation
      this.reinterpretationSystem.runEvidenceReinterpretation(emittedEvents);

      // Maintenance
      recomputeClosureBuckets(this.definition, this.state);

      if (action.type === PLAYER_ACTION_TYPE.ATTEMPT_CASE_CLOSURE) {
        const outcome = this.closureSystem.validateClosureAttempt(action.attempt);
        this.state.lastClosureDecision = outcome.decision;
        appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.VALIDATOR_CHECKS, "Closure validator executed", {
          ...outcome.metrics,
          decision: outcome.decision.mode,
          accepted: outcome.decision.accepted,
          reasons: outcome.decision.reason_codes,
        });

        if (outcome.decision.accepted) {
          for (const flag of outcome.decision.granted_flags) {
            setFlag(this.state, flag);
            upsertGlobalFlag(this.state, flag);
          }
          this.state.pendingTransitionContext = this.resolveTransitionContext();
          if (this.state.pendingTransitionContext) {
          addNotice(this.state, this.state.currentTick, "transition_intent", this.state.pendingTransitionContext!.player_facing_intent);
        }
      } else {
        recordBehavior(this.state, "rush_to_closure_count");
        this.state.pendingTransitionContext = null;
      }
    }

    this.effectSystem.applyForensicsPressure(action, wasPressureEvidenceVerified);
    this.interrogationSystem.applyInterrogationPressure(action, emittedEvents);
    this.effectSystem.expireEffects();
    recomputeClosureBuckets(this.definition, this.state);



    const after = this.getSnapshot();
    return {
      accepted: true,
      tickConsumed: true,
      rejectionReason: null,
      emittedEvents,
      changedEvidence: diffEvidence(before, after),
      debugEntries: this.debugEntriesForTick(this.state.currentTick),
      snapshot: after,
    };
    } catch (error) {
      // Comprehensive error handling for engine
      const errorMessage = error instanceof Error ? error.message : 'Unknown engine error';
      engineLogger.error('CoreEngine', `Error processing action: ${errorMessage}`, { 
        action: action.type,
        tick: this.state.currentTick,
        error: errorMessage 
      });
      
      appendDebugTrace(this.state, this.state.currentTick, DEBUG_TRACE_KIND.ACTION_REJECTED, `Engine error: ${errorMessage}`, {
        action_type: action.type,
        error: errorMessage,
      });

      return {
        accepted: false,
        tickConsumed: false,
        rejectionReason: `Engine processing error: ${errorMessage}`,
        emittedEvents: [],
        changedEvidence: [],
        debugEntries: this.debugEntriesForTick(this.state.currentTick),
        snapshot: this.getSnapshot(),
      };
    }
  }

  private resolveTransitionContext(): TransitionContext | null {
    for (const hook of this.definition.transition_context_hooks) {
      const allRequired = hook.required_flags_all.every((flag) => this.state.flags.has(flag));
      const blocked = hook.blocked_flags.some((flag) => this.state.flags.has(flag));
      if (allRequired && !blocked) {
        return {
          hook_id: hook.hook_id,
          target_case_id: hook.target_case_id,
          effect_type: hook.effect_type,
          effect_payload: hook.effect_payload,
          player_facing_intent: hook.player_facing_intent,
        };
      }
    }

    return null;
  }

  private debugEntriesForTick(tick: number) {
    return this.state.debugTrace.filter((entry) => entry.tick === tick);
  }
}

export function createRuntime(
  adapter: RuntimeCaseAdapter,
  globalMemory?: GlobalGameState,
  initialFacts?: string[],
): CoreEngine {
  return new CoreEngine(adapter, globalMemory, initialFacts);
}

function diffEvidence(before: RuntimeSnapshot, after: RuntimeSnapshot): string[] {
  const changed = new Set<string>();
  for (const evidenceId of Object.keys(after.evidenceStates)) {
    if (
      before.evidenceStates[evidenceId] !== after.evidenceStates[evidenceId] ||
      before.evidenceInterpretations[evidenceId] !== after.evidenceInterpretations[evidenceId] ||
      before.evidenceQualities[evidenceId] !== after.evidenceQualities[evidenceId]
    ) {
      changed.add(evidenceId);
    }
  }
  return [...changed].sort();
}
