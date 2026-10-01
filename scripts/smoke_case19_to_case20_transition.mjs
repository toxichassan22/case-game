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
  advanceSoloToCase19Investigating,
  CASE19_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case18_to_case19_transition.mjs';

const startedChildren = [];

const CASE20_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE20_LAB_SWABS' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-20-TAREK' },
  { type: 'inspect_object', source_ref: 'CASE20_ENCRYPTED_USB' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-20-TARGETS' },
];

export const CASE20_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-20-01',
  submitted_motive: 'motive_syndicate_taunt',
  submitted_method_or_timeline: 'method_syndicate_lair',
  submitted_evidence_ids: ['EVID-20-01', 'EVID-20-02', 'EVID-20-03', 'EVID-20-04'],
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
      case20State01: state.engineSnapshot?.evidenceStates?.['EVID-20-01'] ?? null,
      case20State02: state.engineSnapshot?.evidenceStates?.['EVID-20-02'] ?? null,
      case20State03: state.engineSnapshot?.evidenceStates?.['EVID-20-03'] ?? null,
      case20State04: state.engineSnapshot?.evidenceStates?.['EVID-20-04'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase20Progress(page) {
  await dispatchScenarioSteps(page, CASE20_PROGRESS_STEPS);
}

export async function advanceSoloToCase20Investigating(page) {
  const roomSlug = await advanceSoloToCase19Investigating(page);
  await closeSoloCase(page, CASE19_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await page.getByText('أنت الآن في القضية 20 من 59').waitFor({ timeout: 30_000 });

  await runCase20Progress(page);
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
    await registerProfile(page, 'Case20 Transition Investigator');

    const roomSlug = await advanceSoloToCase20Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case20 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case20 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case20',
      `Expected runtime snapshot for case20, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 19,
      `Expected all previous cases to be archived before case20, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case20State01 === 'verified',
      `Expected case20 lab-swab evidence to verify, got ${storeSummary.case20State01}`,
    );
    assert(
      storeSummary.case20State02 === 'verified',
      `Expected case20 Tarek-invoice evidence to verify, got ${storeSummary.case20State02}`,
    );
    assert(
      storeSummary.case20State03 === 'verified',
      `Expected case20 encrypted USB evidence to verify, got ${storeSummary.case20State03}`,
    );
    assert(
      storeSummary.case20State04 === 'verified',
      `Expected case20 target-list evidence to verify, got ${storeSummary.case20State04}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case20 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('trinity_economics_mapped'),
      `Expected case19 economics flag to persist into case20 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('forgery_covers_antiquities'),
      `Expected case19 antiquities flag to persist into case20 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case20_resolved_true'),
      `Expected case20 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case20 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case20 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case19 to case20 transition flow passed');
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
