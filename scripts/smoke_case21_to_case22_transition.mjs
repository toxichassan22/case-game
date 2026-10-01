import { chromium } from 'playwright';
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
  advanceSoloToCase21Investigating,
  CASE21_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case20_to_case21_transition.mjs';

const startedChildren = [];

const CASE22_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE22_STOLEN_MEDS' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-22-CHAIN' },
  { type: 'inspect_object', source_ref: 'FIN-MISSING-MESSAGE' },
];

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
      case22State01: state.engineSnapshot?.evidenceStates?.['EVID-22-01'] ?? null,
      case22State02: state.engineSnapshot?.evidenceStates?.['EVID-22-02'] ?? null,
      case22State03: state.engineSnapshot?.evidenceStates?.['EVID-22-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

async function runCase22Progress(page) {
  await dispatchScenarioSteps(page, CASE22_PROGRESS_STEPS);
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);
    await registerProfile(page, 'Case22 Transition Investigator');

    const roomSlug = await advanceSoloToCase21Investigating(page);
    await closeSoloCase(page, CASE21_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

    await page.getByText('أنت الآن في القضية 22 من 59').waitFor({ timeout: 30_000 });

    await runCase22Progress(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case22 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case22 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case22',
      `Expected runtime snapshot for case22, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 21,
      `Expected all previous cases to be archived before case22, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case22State01 === 'verified',
      `Expected case22 logistics-timeline evidence to verify, got ${storeSummary.case22State01}`,
    );
    assert(
      storeSummary.case22State02 === 'verified',
      `Expected case22 inventory evidence to verify, got ${storeSummary.case22State02}`,
    );
    assert(
      storeSummary.case22State03 === 'verified',
      `Expected case22 missing-message evidence to verify, got ${storeSummary.case22State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case22 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('alchemist_was_student'),
      `Expected case21 alchemist-student flag to persist into case22 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('torn_name_clue'),
      `Expected case21 torn-name flag to persist into case22 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case22_resolved_true'),
      `Expected case22 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case22 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case22 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case21 to case22 transition flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
