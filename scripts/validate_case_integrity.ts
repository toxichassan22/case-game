import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRuntimeCaseAdapter } from '../runtime/src/engine/adapterBuilder.js';
import { EVENT_NAME } from '../runtime/src/engine/constants.js';
import type {
  CompletionTrigger,
  DialogBlueprint,
  ReviewBlueprint,
  RuntimeCaseDefinition,
  TimelineBlueprint,
  TriggerCondition,
} from '../runtime/src/types.js';

type StaticBlueprintConfig = {
  closureCatalog: {
    suspect_ids: string[];
    method_ids: string[];
  };
  openableSources?: string[];
  blueprints?: {
    review?: ReviewBlueprint[];
    inspect?: ReviewBlueprint[];
    dialog?: DialogBlueprint[];
    timeline?: TimelineBlueprint[];
  };
  exactSourceTypes?: Record<string, string>;
  prefixSourceTypes?: Array<{
    prefix: string;
    source_type: string;
  }>;
  fallbackSourceType?: string;
};

type ProducibleEvent = {
  event_name: string;
  source_type: string;
  source_ref: string;
  interaction_id: string;
  result: string;
};

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(scriptDir, '..');
const casesDir = join(projectRoot, 'cases');

const caseDirectories = readdirSync(casesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^case\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const invalidEvidenceStates: string[] = [];
const impossibleTriggerConditions: string[] = [];
const impossibleScheduledEvents: string[] = [];
let validatedCaseCount = 0;

for (const caseDirectory of caseDirectories) {
  const caseFile = readdirSync(join(casesDir, caseDirectory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'blueprints.json')
    .map((entry) => entry.name)[0];

  if (!caseFile) {
    continue;
  }

  validatedCaseCount += 1;
  const caseFilePath = join(casesDir, caseDirectory, caseFile);
  const blueprintsPath = join(casesDir, caseDirectory, 'blueprints.json');
  const caseDefinition = JSON.parse(readFileSync(caseFilePath, 'utf8')) as RuntimeCaseDefinition;
  const blueprints = JSON.parse(readFileSync(blueprintsPath, 'utf8')) as StaticBlueprintConfig;
  const producibleEvents = buildProducibleEvents(caseDefinition, blueprints);

  for (const evidence of caseDefinition.evidence_list) {
    if (evidence.locked === true && evidence.state === 'verified') {
      invalidEvidenceStates.push(`${caseDirectory}:${evidence.evidence_id}`);
    }

    for (const trigger of evidence.completion_triggers) {
      for (const condition of trigger.conditions) {
        if (!conditionIsProducible(producibleEvents, condition)) {
          impossibleTriggerConditions.push(
            `${caseDirectory}:${evidence.evidence_id}:${trigger.trigger_id}:${condition.event_name}:${condition.source_ref}:${condition.interaction_id}`,
          );
        }
      }

      if (trigger.scheduled_on_event && !scheduledEventIsReachable(producibleEvents, evidence, trigger)) {
        impossibleScheduledEvents.push(
          `${caseDirectory}:${evidence.evidence_id}:${trigger.trigger_id}:${trigger.scheduled_on_event}`,
        );
      }
    }
  }
}

assert.equal(
  invalidEvidenceStates.length,
  0,
  `Locked evidence cannot start verified:\n${invalidEvidenceStates.join('\n')}`,
);
assert.equal(
  impossibleTriggerConditions.length,
  0,
  `Trigger conditions must match producible runtime events:\n${impossibleTriggerConditions.join('\n')}`,
);
assert.equal(
  impossibleScheduledEvents.length,
  0,
  `Scheduled trigger events must be reachable from the authored evidence flow:\n${impossibleScheduledEvents.join('\n')}`,
);

console.log(`[validate] case integrity passed for ${validatedCaseCount} implemented cases`);

function buildProducibleEvents(
  definition: RuntimeCaseDefinition,
  blueprints: StaticBlueprintConfig,
): ProducibleEvent[] {
  const adapter = buildRuntimeCaseAdapter(definition, blueprints);
  const events: ProducibleEvent[] = [];

  for (const sourceRef of adapter.openableSources) {
    events.push({
      event_name: EVENT_NAME.SOURCE_OPENED,
      source_type: adapter.inferSourceType(sourceRef),
      source_ref: sourceRef,
      interaction_id: 'OPEN',
      result: 'source_opened',
    });
  }

  for (const blueprint of adapter.reviewBlueprints.values()) {
    addReviewEvents(events, blueprint);
  }

  for (const blueprint of adapter.inspectBlueprints.values()) {
    addReviewEvents(events, blueprint);
  }

  for (const blueprint of adapter.dialogBlueprints.values()) {
    events.push({
      event_name: EVENT_NAME.INTERROGATION_NODE_UNLOCKED,
      source_type: 'interrogation',
      source_ref: blueprint.source_ref,
      interaction_id: blueprint.interaction_id,
      result: blueprint.required_result,
    });
  }

  for (const blueprint of adapter.timelineBlueprints.values()) {
    events.push({
      event_name: EVENT_NAME.TIMELINE_CONTRADICTION_CONFIRMED,
      source_type: 'timeline',
      source_ref: 'TIMELINE-BOARD',
      interaction_id: blueprint.interaction_id,
      result: blueprint.required_result,
    });
  }

  return events;
}

function addReviewEvents(events: ProducibleEvent[], blueprint: ReviewBlueprint): void {
  events.push({
    event_name: EVENT_NAME.DOCUMENT_REVIEWED,
    source_type: blueprint.source_type,
    source_ref: blueprint.source_ref,
    interaction_id: blueprint.interaction_id,
    result: 'opened',
  });

  if (!blueprint.verifies_evidence) {
    return;
  }

  events.push({
    event_name: EVENT_NAME.EVIDENCE_VERIFIED,
    source_type: blueprint.source_type,
    source_ref: blueprint.source_ref,
    interaction_id: blueprint.interaction_id,
    result: blueprint.required_result,
  });
}

function conditionIsProducible(events: ProducibleEvent[], condition: TriggerCondition): boolean {
  return events.some(
    (event) =>
      event.event_name === condition.event_name
      && event.source_type === condition.source_type
      && event.source_ref === condition.source_ref
      && event.interaction_id === condition.interaction_id
      && event.result === condition.required_result,
  );
}

function scheduledEventIsReachable(
  events: ProducibleEvent[],
  evidence: RuntimeCaseDefinition['evidence_list'][number],
  trigger: CompletionTrigger,
): boolean {
  const relevantSourceRefs = new Set<string>([
    evidence.evidence_id,
    evidence.content_ref,
    ...trigger.conditions.map((condition) => condition.source_ref),
  ]);

  return events.some(
    (event) => relevantSourceRefs.has(event.source_ref) && event.event_name === trigger.scheduled_on_event,
  );
}
