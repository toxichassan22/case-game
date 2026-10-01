import type {
  ClosureCatalog,
  DialogBlueprint,
  ReviewBlueprint,
  RuntimeCaseAdapter,
  RuntimeCaseDefinition,
  TimelineBlueprint,
} from "../types.js";
import { PLAYER_ACTION_TYPE, SOURCE_TYPE, type SourceType } from "./constants.js";
import { blueprintConfigSchema } from "./blueprintSchema.js";
import { engineLogger } from "./logger.js";

export interface SourceTypeResolverConfig {
  prefixSourceTypes?: Array<{
    prefix: string;
    source_type: SourceType;
  }>;
  exactSourceTypes?: Record<string, SourceType>;
  fallbackSourceType?: SourceType;
}

export interface StaticCaseBlueprintConfig extends SourceTypeResolverConfig {
  closureCatalog: ClosureCatalog;
  openableSources?: string[];
  reviewBlueprints?: ReviewBlueprint[];
  inspectBlueprints?: ReviewBlueprint[];
  dialogBlueprints?: DialogBlueprint[];
  timelineBlueprints?: TimelineBlueprint[];
  blueprints?: {
    review?: ReviewBlueprint[];
    inspect?: ReviewBlueprint[];
    dialog?: DialogBlueprint[];
    timeline?: TimelineBlueprint[];
  };
}

// File loading functions have been extracted to prevent Vite compilation errors in the frontend.

export function buildRuntimeCaseAdapter(
  definition: RuntimeCaseDefinition,
  config: StaticCaseBlueprintConfig,
): RuntimeCaseAdapter {
  // Validate blueprint config if it's not empty
  if (config && Object.keys(config).length > 0) {
    try {
      blueprintConfigSchema.partial().parse(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown validation error';
      engineLogger.error('AdapterBuilder', `Blueprint validation failed: ${errorMessage}`);
    }
  }

  const reviewBlueprints = buildUniqueMap(
    [...(config.blueprints?.review ?? []), ...(config.reviewBlueprints ?? [])],
    (blueprint: ReviewBlueprint) => blueprint.source_ref,
    "review blueprint",
  );
  const inspectBlueprints = buildUniqueMap(
    [...(config.blueprints?.inspect ?? []), ...(config.inspectBlueprints ?? [])],
    (blueprint: ReviewBlueprint) => blueprint.source_ref,
    "inspect blueprint",
  );
  const dialogBlueprints = buildUniqueMap(
    [...(config.blueprints?.dialog ?? []), ...(config.dialogBlueprints ?? [])],
    (blueprint: DialogBlueprint) => `${blueprint.source_ref}:${blueprint.interaction_id}`,
    "dialog blueprint",
  );
  const timelineBlueprints = buildUniqueMap(
    [...(config.blueprints?.timeline ?? []), ...(config.timelineBlueprints ?? [])],
    (blueprint: TimelineBlueprint) => blueprint.interaction_id,
    "timeline blueprint",
  );
  const openableSources = new Set<string>([
    ...definition.evidence_list.map((evidence) => evidence.evidence_id),
    ...(config.openableSources ?? []),
  ]);
  const relatedEvidenceIdsBySourceRef = buildRelatedEvidenceIdsBySourceRef(definition);

  // Expose which dialog options actually produce a response so the client can
  // render every authored interrogation option, not only trigger-linked ones.
  const supportedDialogOptions: Record<string, Set<string>> = {};
  for (const key of dialogBlueprints.keys()) {
    const sep = key.lastIndexOf(":");
    if (sep <= 0) continue;
    const sourceRef = key.slice(0, sep);
    const interactionId = key.slice(sep + 1);
    (supportedDialogOptions[sourceRef] ??= new Set<string>()).add(interactionId);
  }
  definition.supported_dialog_options = Object.fromEntries(
    Object.entries(supportedDialogOptions).map(([sourceRef, ids]) => [sourceRef, [...ids].sort()]),
  );

  for (const evidence of definition.evidence_list) {
    if (inspectBlueprints.has(evidence.evidence_id)) {
      evidence.ui_action = PLAYER_ACTION_TYPE.INSPECT_OBJECT;
      continue;
    }

    if (reviewBlueprints.has(evidence.evidence_id)) {
      evidence.ui_action = PLAYER_ACTION_TYPE.REVIEW_EVIDENCE;
      continue;
    }

    delete evidence.ui_action;
  }

  return {
    definition,
    closureCatalog: config.closureCatalog,
    openableSources,
    reviewBlueprints,
    inspectBlueprints,
    dialogBlueprints,
    timelineBlueprints,
    getRelatedEvidenceIds: (sourceRef: string) => relatedEvidenceIdsBySourceRef.get(sourceRef) ?? [],
    inferSourceType: buildSourceTypeInferer(config),
  };
}

function buildSourceTypeInferer(config: SourceTypeResolverConfig) {
  const exactSourceTypes = config.exactSourceTypes ?? {};
  const prefixSourceTypes = [...(config.prefixSourceTypes ?? [])].sort(
    (left, right) => right.prefix.length - left.prefix.length,
  );
  const fallbackSourceType = config.fallbackSourceType ?? SOURCE_TYPE.SOURCE;

  return (sourceRef: string): SourceType => {
    const exact = exactSourceTypes[sourceRef];
    if (exact) {
      return exact;
    }

    for (const resolver of prefixSourceTypes) {
      if (sourceRef.startsWith(resolver.prefix)) {
        return resolver.source_type;
      }
    }

    return fallbackSourceType;
  };
}

function buildUniqueMap<T>(
  entries: T[],
  keySelector: (entry: T) => string,
  label: string,
): Map<string, T> {
  const target = new Map<string, T>();

  for (const entry of entries) {
    const key = keySelector(entry);
    if (target.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`);
    }
    target.set(key, entry);
  }

  return target;
}

function buildRelatedEvidenceIdsBySourceRef(definition: RuntimeCaseDefinition): Map<string, string[]> {
  const target = new Map<string, Set<string>>();

  const add = (sourceRef: string | undefined, evidenceId: string) => {
    if (!sourceRef) {
      return;
    }
    if (!target.has(sourceRef)) {
      target.set(sourceRef, new Set<string>());
    }
    target.get(sourceRef)!.add(evidenceId);
  };

  for (const evidence of definition.evidence_list) {
    add(evidence.evidence_id, evidence.evidence_id);
    add(evidence.content_ref, evidence.evidence_id);

    for (const trigger of evidence.completion_triggers) {
      for (const condition of trigger.conditions) {
        add(condition.source_ref, evidence.evidence_id);
        add(condition.interaction_id, evidence.evidence_id);
      }
    }
  }

  return new Map(
    [...target.entries()].map(([sourceRef, evidenceIds]) => [sourceRef, [...evidenceIds].sort()]),
  );
}
