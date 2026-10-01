import type { RuntimeCaseAdapter, RuntimeCaseDefinition } from "../types.js";
import { createRuntime } from "../engine/runtime.js";
import { buildRuntimeCaseAdapter, type StaticCaseBlueprintConfig } from "../engine/adapterBuilder.js";

interface RegisteredCase {
  case_id: string;
  title: string;
  loadResources: () => Promise<{
    caseDefinition: RuntimeCaseDefinition;
    blueprintConfig: StaticCaseBlueprintConfig;
  }>;
}

function registerCase(id: string, title: string): [string, RegisteredCase] {
  return [
    id,
    {
      case_id: id,
      title,
      loadResources: async () => ({
        caseDefinition: (await import(`../../../cases/${id}/${id}.json`)).default as any as RuntimeCaseDefinition,
        blueprintConfig: (await import(`../../../cases/${id}/blueprints.json`)).default as any as StaticCaseBlueprintConfig
      })
    }
  ];
}

const registeredCases = new Map<string, RegisteredCase>([
  // No cases registered — story content wiped for full rewrite.
  // Register new cases here as they are built, e.g.:
  // registerCase("case01", "عنوان القضية"),
]);


export function listRegisteredCases(): Array<Pick<RegisteredCase, "case_id" | "title">> {
  return [...registeredCases.values()].map(({ case_id, title }) => ({ case_id, title }));
}

export async function loadRegisteredCaseResources(caseId: string) {
  const registration = registeredCases.get(caseId);
  if (!registration) {
    throw new Error(`Unknown registered case: ${caseId}`);
  }
  return await registration.loadResources();
}

export async function loadRegisteredCaseAdapter(caseId: string): Promise<RuntimeCaseAdapter> {
  const { caseDefinition, blueprintConfig } = await loadRegisteredCaseResources(caseId);
  return buildRuntimeCaseAdapter(caseDefinition, blueprintConfig);
}

export async function createRegisteredRuntime(caseId: string) {
  return createRuntime(await loadRegisteredCaseAdapter(caseId));
}

