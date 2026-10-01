import { chromium } from 'playwright';
import {
  FRONTEND_URL,
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  invokeStoreMethod,
  launchSmokeBrowser,
  registerConsoleCapture,
  startLocalStack,
  waitForPathname,
} from './smoke_helpers.mjs';
import {
  CASE01_FALSE_SUCCESS_ATTEMPT,
  CASE01_FALSE_SUCCESS_STEPS,
} from './smoke_case01_scenarios.mjs';

const startedChildren = [];

const CASE02_MINIMAL_STEPS = [
  { type: 'open_source', source_ref: 'BK-SRC-01' },
  { type: 'review_evidence', source_ref: 'BK-SRC-01' },
  { type: 'open_source', source_ref: 'BK-OBJ-01' },
  { type: 'inspect_object', source_ref: 'BK-OBJ-01' },
];

const CASE02_FALSE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'char_ibrahim_giar',
  submitted_motive: 'motive_insurance_fraud',
  submitted_method_or_timeline: 'magnetic_pulse',
  submitted_evidence_ids: ['BK-DOC-01', 'BK-SRC-01', 'BK-OBJ-01'],
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
    };
  });
}

async function closeSoloCase(page, attempt, expectedAcceptedMessage) {
  await page.evaluate(async () => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    useGameStore.setState({ closureResult: null });
  });
  await invokeStoreMethod(
    page,
    'requestClosure',
    [],
    "state => state.currentRoom?.phase === 'tribunal'",
    12_000,
    'Timed out while waiting for solo tribunal phase',
  );
  await invokeStoreMethod(
    page,
    'submitTribunalAccusation',
    [attempt],
    "state => state.currentRoom?.phase === 'results' && state.closureResult?.accepted === true",
    12_000,
    'Timed out while waiting for accepted closure result',
  );
  await waitForPathname(page, /^\/results\/[^/]+$/);
  await page.getByText(expectedAcceptedMessage).waitFor({ timeout: 20_000 });
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);

    await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });
    await page.getByLabel('اسم المحقق').fill('Case03 Transition Investigator');
    await page.getByRole('button', { name: /تأكيد الهوية/ }).click();
    await waitForPathname(page, /^\/lobby$/);

    await page.getByRole('button', { name: /ابدأ Solo/ }).click();
    await waitForPathname(page, /^\/game\/[^/]+$/);
    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(page.url()).pathname.split('/').pop();
    assert(roomSlug, 'Solo game URL did not include a room id');

    await dispatchScenarioSteps(page, CASE01_FALSE_SUCCESS_STEPS);
    await closeSoloCase(page, CASE01_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, CASE02_MINIMAL_STEPS);
    await closeSoloCase(page, CASE02_FALSE_SUCCESS_ATTEMPT, 'القضية أُغلقت جزئيًا');

    await waitForPathname(page, /^\/game\/[^/]+$/, 25_000);
    await page.getByText('أنت الآن في القضية 03 من 59').waitFor({ timeout: 30_000 });

    const storeSummary = await readStoreSummary(page);

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after case03 load, got ${page.url()}`,
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after case03 transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case03',
      `Expected runtime snapshot for case03, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 2,
      `Expected both previous cases to be archived, got ${storeSummary.caseArchiveLength}`,
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after case03 transition',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Case02 to case03 transition flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
