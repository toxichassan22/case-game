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
  advanceSoloToCase17Investigating,
  CASE17_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case16_to_case17_transition.mjs';

const startedChildren = [];

const CASE18_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'LAB-TOX-18' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-18-SCRIPT' },
  { type: 'choose_dialog_option', source_ref: 'INT-NABIL-01', interaction_id: 'Q_POISON' },
];

export const CASE18_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-18-01',
  submitted_motive: 'motive_syndicate_silencing',
  submitted_method_or_timeline: 'method_syndicate_silencing',
  submitted_evidence_ids: ['EVID-18-01', 'EVID-18-02', 'EVID-18-03'],
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
      case18State01: state.engineSnapshot?.evidenceStates?.['EVID-18-01'] ?? null,
      case18State02: state.engineSnapshot?.evidenceStates?.['EVID-18-02'] ?? null,
      case18State03: state.engineSnapshot?.evidenceStates?.['EVID-18-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase18Progress(page) {
  await dispatchScenarioSteps(page, CASE18_PROGRESS_STEPS);
}

export async function advanceSoloToCase18Investigating(page) {
  const roomSlug = await advanceSoloToCase17Investigating(page);
  await closeSoloCase(page, CASE17_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await page.getByText('أنت الآن في القضية 18 من 59').waitFor({ timeout: 30_000 });

  await runCase18Progress(page);
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
    await registerProfile(page, 'Case18 Transition Investigator');

    const roomSlug = await advanceSoloToCase18Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case18 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case18 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case18',
      `Expected runtime snapshot for case18, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 17,
      `Expected all previous cases to be archived before case18, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case18State01 === 'verified',
      `Expected case18 toxicology evidence to verify, got ${storeSummary.case18State01}`,
    );
    assert(
      storeSummary.case18State02 === 'verified',
      `Expected case18 play-script evidence to verify, got ${storeSummary.case18State02}`,
    );
    assert(
      storeSummary.case18State03 === 'verified',
      `Expected case18 Nabil evidence to verify, got ${storeSummary.case18State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case18 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('clockmaker_inside_system'),
      `Expected case17 system-infiltration flag to persist into case18 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('player_file_compromised'),
      `Expected case17 player-file flag to persist into case18 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case18_resolved_true'),
      `Expected case18 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case18 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case18 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case17 to case18 transition flow passed');
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
