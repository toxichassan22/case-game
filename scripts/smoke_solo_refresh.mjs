import { chromium } from 'playwright';
import {
  FRONTEND_URL,
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  launchSmokeBrowser,
  registerConsoleCapture,
  startLocalStack,
  waitForStoreCondition,
  waitForPathname,
} from './smoke_helpers.mjs';

const startedChildren = [];

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];

    registerConsoleCapture(page, consoleErrors);

    await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });
    await page.getByLabel('اسم المحقق').fill('Smoke Investigator');
    await page.getByRole('button', { name: /تأكيد الهوية/ }).click();
    await waitForPathname(page, /^\/lobby$/);

    await page.getByRole('button', { name: /ابدأ Solo/ }).click();
    await waitForPathname(page, /^\/game\/[^/]+$/);
    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(page, [
      { type: 'open_source', source_ref: 'SCN-03' },
      { type: 'review_evidence', source_ref: 'SCN-03' },
    ]);
    await waitForStoreCondition(
      page,
      "(state) => state.engineSnapshot?.evidenceStates?.['SCN-03'] === 'verified'",
      10_000,
      'SCN-03 was not verified before refresh',
    );

    const roomUrlBeforeRefresh = page.url();
    const caseBannerBeforeRefresh = await page.locator('body').textContent();

    assert(
      roomUrlBeforeRefresh.includes('/game/'),
      `Expected to land on a game route, got: ${roomUrlBeforeRefresh}`,
    );
    assert(
      caseBannerBeforeRefresh?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Solo start did not reach the investigation desktop',
    );

    await page.reload({ waitUntil: 'networkidle' });
    const roomUrlAfterRefresh = page.url();
    await page.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await waitForStoreCondition(
      page,
      "(state) => state.engineSnapshot?.evidenceStates?.['SCN-03'] === 'verified'",
      10_000,
      'Refresh did not preserve verified SCN-03 state',
    );
    const bodyAfterRefresh = await page.locator('body').textContent();

    assert(
      roomUrlAfterRefresh === roomUrlBeforeRefresh,
      `Refresh changed route from ${roomUrlBeforeRefresh} to ${roomUrlAfterRefresh}`,
    );
    assert(
      bodyAfterRefresh?.includes('أنت الآن في القضية 01 من 59 مخططة'),
      'Refresh did not restore the investigation desktop',
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Solo refresh flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
