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
    };
  });
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
    await page.getByLabel('اسم المحقق').fill('Transition Investigator');
    await page.getByRole('button', { name: /تأكيد الهوية/ }).click();
    await waitForPathname(page, /^\/lobby$/);

    await page.getByRole('button', { name: /ابدأ Solo/ }).click();
    await waitForPathname(page, /^\/game\/[^/]+$/);
    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(page.url()).pathname.split('/').pop();
    assert(roomSlug, 'Solo game URL did not include a room id');

    await dispatchScenarioSteps(page, CASE01_FALSE_SUCCESS_STEPS);
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
      [CASE01_FALSE_SUCCESS_ATTEMPT],
      'state => state.closureResult?.accepted === true',
      12_000,
      'Timed out while waiting for accepted closure result',
    );

    await waitForPathname(page, /^\/results\/[^/]+$/);
    await page.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 30_000 });

    await waitForPathname(page, /^\/game\/[^/]+$/, 20_000);
    await page.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });

    const body = await page.locator('body').textContent();
    const storeSummary = await readStoreSummary(page);

    assert(
      page.url().endsWith(`/game/${roomSlug}`),
      `Expected to stay in the same room after next case load, got ${page.url()}`,
    );
    assert(
      body?.includes('أنت الآن في القضية 02 من 59'),
      'Did not reach case02 after accepted closure',
    );
    assert(
      storeSummary.phase === 'investigating',
      `Expected investigating phase after transition, got ${storeSummary.phase}`,
    );
    assert(
      storeSummary.caseId === 'case02',
      `Expected runtime snapshot for case02, got ${storeSummary.caseId}`,
    );
    assert(
      storeSummary.caseArchiveLength >= 1,
      'Expected previous case to be archived after next case transition',
    );
    assert(
      storeSummary.nextCaseLoading === false,
      'nextCaseLoading should be reset after NEXT_CASE_LOADED',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Next case transition flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
