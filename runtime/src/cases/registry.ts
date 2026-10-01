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
  registerCase("case01", "رماد الرف الأخير"),
  registerCase("case02", "صدى صانع الساعات"),
  registerCase("case03", "حبة رصاص"),
  registerCase("case04", "الموظف المثالي"),
  registerCase("case05", "الأرشيف"),
  registerCase("case06", "كسر التماثل"),
  registerCase("case07", "الحبر السري"),
  registerCase("case08", "الوجه المقلوب"),
  registerCase("case09", "الساعة الحادية عشرة"),
  registerCase("case10", "الشريك الصامت"),
  registerCase("case11", "الصدى"),
  registerCase("case12", "الصوت في الدار"),
  registerCase("case13", "الغريق"),
  registerCase("case14", "الميزانية"),
  registerCase("case15", "الزنزانة الخامسة"),
  registerCase("case16", "الخيط الأحمر"),
  registerCase("case17", "الباب الدوار"),
  registerCase("case18", "القناع"),
  registerCase("case19", "الحفرة"),
  registerCase("case20", "أول خيط"),
  registerCase("case21", "الاسم الأول"),
  registerCase("case22", "السلسلة"),
  registerCase("case23", "القضية 23"),
  registerCase("case24", "القضية 24"),
  registerCase("case25", "القضية 25"),
  registerCase("case26", "القضية 26"),
  registerCase("case27", "القضية 27"),
  registerCase("case28", "القضية 28"),
  registerCase("case29", "القضية 29"),
  registerCase("case30", "القضية 30"),
  registerCase("case31", "القضية 31"),
  registerCase("case32", "القضية 32"),
  registerCase("case33", "القضية 33"),
  registerCase("case34", "القضية 34"),
  registerCase("case35", "القضية 35"),
  registerCase("case36", "القضية 36"),
  registerCase("case37", "القضية 37"),
  registerCase("case38", "القضية 38"),
  registerCase("case39", "القضية 39"),
  registerCase("case40", "القضية 40"),
  registerCase("case41", "القضية 41"),
  registerCase("case42", "القضية 42"),
  registerCase("case43", "القضية 43"),
  registerCase("case44", "القضية 44"),
  registerCase("case45", "القضية 45"),
  registerCase("case46", "القضية 46"),
  registerCase("case47", "القضية 47"),
  registerCase("case48", "القضية 48"),
  registerCase("case49", "القضية 49"),
  registerCase("case50", "القضية 50"),
  registerCase("case51", "القضية 51"),
  registerCase("case52", "القضية 52"),
  registerCase("case53", "القضية 53"),
  registerCase("case54", "القضية 54"),
  registerCase("case55", "القضية 55"),
  registerCase("case56", "القضية 56"),
  registerCase("case57", "القضية 57"),
  registerCase("case58", "القضية 58"),
  registerCase("case59", "القضية 59"),
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

