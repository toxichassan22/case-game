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
  advanceSoloToCase20Investigating,
  CASE20_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case19_to_case20_transition.mjs';

const startedChildren = [];

const CASE21_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE21_TORN_LIST' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-21-THESIS' },
  { type: 'inspect_object', source_ref: 'LAB-TOX-21' },
];

export const CASE21_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-21-01',
  submitted_motive: 'motive_ego',
  submitted_method_or_timeline: 'method_syndicate_silencing',
  submitted_evidence_ids: ['EVID-21-01', 'EVID-21-02', 'EVID-21-03'],
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
      case21State01: state.engineSnapshot?.evidenceStates?.['EVID-21-01'] ?? null,
      case21State02: state.engineSnapshot?.evidenceStates?.['EVID-21-02'] ?? null,
      case21State03: state.engineSnapshot?.evidenceStates?.['EVID-21-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase21Progress(page) {
  await dispatchScenarioSteps(page, CASE21_PROGRESS_STEPS);
}

export async function advanceSoloToCase21Investigating(page) {
  const roomSlug = await advanceSoloToCase20Investigating(page);
  await closeSoloCase(page, CASE20_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await page.getByText('أنت الآن في القضية 21 من 59').waitFor({ timeout: 30_000 });

  await runCase21Progress(page);
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
    await registerProfile(page, 'Case21 Transition Investigator');

    const roomSlug = await advanceSoloToCase21Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case21 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case21 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case21',
      `Expected runtime snapshot for case21, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 20,
      `Expected all previous cases to be archived before case21, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case21State01 === 'verified',
      `Expected case21 torn-list evidence to verify, got ${storeSummary.case21State01}`,
    );
    assert(
      storeSummary.case21State02 === 'verified',
      `Expected case21 thesis evidence to verify, got ${storeSummary.case21State02}`,
    );
    assert(
      storeSummary.case21State03 === 'verified',
      `Expected case21 toxicology evidence to verify, got ${storeSummary.case21State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case21 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('arc2_complete'),
      `Expected case20 arc2 flag to persist into case21 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('five_future_targets'),
      `Expected case20 future-targets flag to persist into case21 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case21_resolved_true'),
      `Expected case21 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case21 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case21 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case20 to case21 transition flow passed');
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
