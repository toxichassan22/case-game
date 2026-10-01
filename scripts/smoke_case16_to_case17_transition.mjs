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
  advanceSoloToCase16Investigating,
  CASE16_TRUE_SUCCESS_ATTEMPT,
} from './smoke_case15_to_case16_transition.mjs';

const startedChildren = [];

const CASE17_PROGRESS_STEPS = [
  { type: 'open_source', source_ref: 'TIMELINE-BOARD' },
  { type: 'inspect_object', source_ref: 'CASE17_USB_MALWARE' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-17-TG' },
  { type: 'lock_timeline_event', interaction_id: 'LINK-17-TARGETS' },
];

export const CASE17_TRUE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'SUSP-17-01',
  submitted_motive: 'motive_syndicate_infiltration',
  submitted_method_or_timeline: 'method_syndicate_infiltration',
  submitted_evidence_ids: ['EVID-17-01', 'EVID-17-02', 'EVID-17-03'],
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
      case17State01: state.engineSnapshot?.evidenceStates?.['EVID-17-01'] ?? null,
      case17State02: state.engineSnapshot?.evidenceStates?.['EVID-17-02'] ?? null,
      case17State03: state.engineSnapshot?.evidenceStates?.['EVID-17-03'] ?? null,
      notices: (state.engineSnapshot?.notices ?? []).map((notice) => notice.message),
      flags: state.engineSnapshot?.flags ?? [],
      globalFlags: state.engineSnapshot?.globalState?.globalFlags ?? [],
    };
  });
}

export async function runCase17Progress(page) {
  await dispatchScenarioSteps(page, CASE17_PROGRESS_STEPS);
}

export async function advanceSoloToCase17Investigating(page) {
  const roomSlug = await advanceSoloToCase16Investigating(page);
  await closeSoloCase(page, CASE16_TRUE_SUCCESS_ATTEMPT, 'القضية أُغلقت بنجاح');

  await page.getByText('أنت الآن في القضية 17 من 59').waitFor({ timeout: 30_000 });

  await runCase17Progress(page);
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
    await registerProfile(page, 'Case17 Transition Investigator');

    const roomSlug = await advanceSoloToCase17Investigating(page);
    const storeSummary = await readStoreSummary(page);
    const hasQueuePressureNotice = storeSummary.notices.some(
      (message) => message.includes('النتيجة الحالية أولية') || message.includes('تأخر تقرير الصياغة'),
    );

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case17 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case17 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case17',
      `Expected runtime snapshot for case17, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 16,
      `Expected all previous cases to be archived before case17, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.case17State01 === 'verified',
      `Expected case17 malware evidence to verify, got ${storeSummary.case17State01}`,
    );
    assert(
      storeSummary.case17State02 === 'verified',
      `Expected case17 telegram metadata evidence to verify, got ${storeSummary.case17State02}`,
    );
    assert(
      storeSummary.case17State03 === 'verified',
      `Expected case17 target-evidence report to verify, got ${storeSummary.case17State03}`,
    );
    assert(
      hasQueuePressureNotice,
      `Expected case17 queue-pressure notice to appear, got ${storeSummary.notices.join(' | ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('trinity_operates_nationally'),
      `Expected case16 national-operations flag to persist into case17 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      storeSummary.globalFlags.includes('trinity_uses_past_crimes_as_threats'),
      `Expected case16 threat-pattern flag to persist into case17 global state, got ${storeSummary.globalFlags.join(', ')}`,
    );
    assert(
      !storeSummary.flags.includes('case17_resolved_true'),
      `Expected case17 success flag to remain unset before closure, got ${storeSummary.flags.join(', ')}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case17 transition',
    );
    assert(
      storeSummary.lastDecision === null,
      'Expected closure result to be cleared after case17 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case16 to case17 transition flow passed');
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
