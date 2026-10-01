import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import {
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  launchSmokeBrowser,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
} from './smoke_helpers.mjs';
import { closeSoloCase } from './smoke_case14_to_case15_transition.mjs';
import {
  advanceSoloToCase18Investigating,
  CASE18_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case17_to_case18_transition.mjs';

const startedChildren = [];

const CASE19_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE19_LAND_DEED' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-19-MAGHRABY' },
  { type: 'choose_dialog_option', source_ref: 'INT-SAFWAT-01', interaction_id: 'Q_PROTECTION' },
];

export const CASE19_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-19-01',
  submitted_motive: 'motive_syndicate_funding',
  submitted_method_or_timeline: 'method_syndicate_artifacts_smuggling',
  submitted_evidence_ids: ['EVID-19-01', 'EVID-19-02', 'EVID-19-03'],
};

async function readStoreSummary(page) {
  return page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const state = useGameStore.getState();
    return {
      roomId: state.currentRoom?.roomId ?? null,
      phase: state.currentRoom?.phase ?? null,
      caseId: state.engineSnapshot?.case_id ?? null,
      caseArchiveLength: state.caseArchive.length,
      nextCaseLoading: state.nextCaseLoading,
      lastDecision: state.closureResult ?? state.engineSnapshot?.lastClosureDecision ?? null,
      case19State01: state.engineSnapshot?.evidenceStates?.['EVID-19-01'] ?? null,
      case19State02: state.engineSnapshot?.evidenceStates?.['EVID-19-02'] ?? null,
      case19State03: state.engineSnapshot?.evidenceStates?.['EVID-19-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase19Progress(page) {
  await dispatchScenarioSteps(page, CASE19_PROGRESS_STEPS);
}

export async function advanceSoloToCase19Investigating(page) {
  const roomSlug = await advanceSoloToCase18Investigating(page);
  await closeSoloCase(page, CASE18_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await page.getByText('أنت الآن في القضية 19 من 59').waitFor({ timeout: 30_000 });

  await runCase19Progress(page);
  return roomSlug;
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);
    await registerProfile(page, 'Case19 Transition Investigator');

    const roomSlug = await advanceSoloToCase19Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case19 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case19 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case19',
      `Expected runtime snapshot for case19, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 18,
      `Expected all previous cases to be archived before case19, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case19State01 === 'verified',
      `Expected case19 land-deed evidence to verify, got ${storeSummary.case19State01}`,
    );
    assert(
      storeSummary.case19State02 === 'verified',
      `Expected case19 transfer evidence to verify, got ${storeSummary.case19State02}`,
    );
    assert(
      storeSummary.case19State03 === 'verified',
      `Expected case19 Safwat evidence to verify, got ${storeSummary.case19State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case19 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('trinity_silences_storytellers'),
      `Expected case18 storyteller-silencing flag to persist into case19 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('play_script_collected'),
      `Expected case18 play-script flag to persist into case19 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case19_resolved_true'),
      `Expected case19 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case19 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case19 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case18 to case19 transition flow passed');
  } finally {
    await browser.close();
  }
}
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  try {
    await run();
  } finally {
    await cleanupProcesses(startedChildren);
  }
}
