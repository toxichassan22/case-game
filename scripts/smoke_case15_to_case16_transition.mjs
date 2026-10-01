import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import {
  assert,
  cleanupProcesses,
  dispatchActionWithTickResult,
  dispatchScenarioSteps,
  launchSmokeBrowser,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
  waitForPathname,
} from './smoke_helpers.mjs';
import {
  advanceSoloToCase15Investigating,
  CASE15_TRUE_SUCCESS_ATTEMPT,
  closeSoloCase,
} from './smoke_case14_to_case15_transition.mjs';

const startedChildren = [];

const CASE16_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE16_TAX_DOCS' },
];

export const CASE16_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-16-01',
  submitted_motive: 'motive_syndicate_extortion',
  submitted_method_or_timeline: 'method_syndicate_extortion',
  submitted_evidence_ids: ['EVID-16-01', 'EVID-16-02', 'EVID-16-03', 'EVID-16-04'],
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
      case16State01: state.engineSnapshot?.evidenceStates?.['EVID-16-01'] ?? null,
      case16State02: state.engineSnapshot?.evidenceStates?.['EVID-16-02'] ?? null,
      case16State03: state.engineSnapshot?.evidenceStates?.['EVID-16-03'] ?? null,
      case16State04: state.engineSnapshot?.evidenceStates?.['EVID-16-04'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase16Progress(page) {
  await dispatchScenarioSteps(page, CASE16_PROGRESS_STEPS);

  const gpsTick = await dispatchActionWithTickResult(page, {
    type: 'lock_timeline_event',
    interaction_id: 'LINK-16-GPS',
  });
  assert(gpsTick.advanced, 'Expected GPS timeline link to advance the runtime in case16');

  const smsTick = await dispatchActionWithTickResult(page, {
    type: 'inspect_object',
    source_ref: 'CASE16_THREAT_SMS',
  });
  assert(smsTick.advanced, 'Expected threat SMS inspection to advance the runtime in case16');

  const waelTick = await dispatchActionWithTickResult(page, {
    type: 'choose_dialog_option',
    source_ref: 'INT-WAEL-01',
    interaction_id: 'Q_MOTIVE',
  });
  assert(waelTick.advanced, 'Expected Wael interrogation node to advance the runtime in case16');
}

export async function advanceSoloToCase16Investigating(page) {
  const roomSlug = await advanceSoloToCase15Investigating(page);
  await closeSoloCase(page, CASE15_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
  await page.getByText('أنت الآن في القضية 16 من 59').waitFor({ timeout: 30_000 });

  await runCase16Progress(page);
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
    await registerProfile(page, 'Case16 Transition Investigator');

    const roomSlug = await advanceSoloToCase16Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case16 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case16 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case16',
      `Expected runtime snapshot for case16, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 15,
      `Expected all previous cases to be archived before case16, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case16State01 === 'verified',
      `Expected case16 tax-doc evidence to verify, got ${storeSummary.case16State01}`,
    );
    assert(
      storeSummary.case16State02 === 'verified',
      `Expected case16 GPS evidence to verify, got ${storeSummary.case16State02}`,
    );
    assert(
      storeSummary.case16State03 === 'verified',
      `Expected case16 threat SMS evidence to verify, got ${storeSummary.case16State03}`,
    );
    assert(
      storeSummary.case16State04 === 'verified',
      `Expected case16 Wael interrogation evidence to verify, got ${storeSummary.case16State04}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case16 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('case15_pattern_set'),
      `Expected case15 pattern flag to persist into case16 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('trinity_coordinated_attack'),
      `Expected case15 coordinated-attack flag to persist into case16 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case16_resolved_true'),
      `Expected case16 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case16 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case16 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case15 to case16 transition flow passed');
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
