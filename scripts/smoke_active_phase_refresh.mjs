import { chromium } from 'playwright';
import {
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  invokeStoreMethod,
  launchSmokeBrowser,
  registerConsoleCapture,
  registerProfile,
  startLocalStack,
  waitForPathname,
  waitForStoreCondition,
} from './smoke_helpers.mjs';
import {
  CASE01_FALSE_SUCCESS_ATTEMPT,
  CASE01_FALSE_SUCCESS_STEPS,
} from './smoke_case01_scenarios.mjs';

const startedChildren = [];

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();
    const consoleErrors = [];

    registerConsoleCapture(hostPage, consoleErrors);
    registerConsoleCapture(guestPage, consoleErrors);

    await registerProfile(hostPage, 'Phase Refresh Host');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Phase Refresh Guest');
    const roomCard = guestPage.locator('.room-card').filter({ hasText: roomCode });
    await roomCard.waitFor({ state: 'visible', timeout: 30_000 });
    await roomCard.click();

    await waitForPathname(guestPage, /^\/room\/[^/]+$/);
    await hostPage.locator('.specialty-card').filter({ hasText: 'المحقق الزمني' }).click();
    await hostPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });
    await guestPage.locator('.specialty-card').filter({ hasText: 'المحقق الجنائي' }).click();
    await guestPage.getByText('✓ مقعدك').waitFor({ timeout: 30_000 });

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/),
      waitForPathname(guestPage, /^\/game\/[^/]+$/),
      hostPage.locator('.waiting-footer button').click(),
    ]);

    await hostPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });

    await dispatchScenarioSteps(hostPage, CASE01_FALSE_SUCCESS_STEPS);

    await invokeStoreMethod(hostPage, 'requestClosure');
    await hostPage.waitForTimeout(800);

    await invokeStoreMethod(
      hostPage,
      'submitTribunalVote',
      [true],
      'state => state.tribunalVotes[state.playerId] === true',
      12_000,
      'Host vote was not registered',
    );
    await invokeStoreMethod(
      guestPage,
      'submitTribunalVote',
      [true],
      "state => state.currentRoom?.phase === 'tribunal'",
      12_000,
      'Timed out while waiting for tribunal phase after approval',
    );

    await Promise.all([
      waitForPathname(hostPage, /^\/tribunal\/[^/]+$/),
      waitForPathname(guestPage, /^\/tribunal\/[^/]+$/),
    ]);
    await hostPage.getByText('غرفة المحاكمة').waitFor({ timeout: 10_000 });

    await hostPage.reload({ waitUntil: 'networkidle' });
    await waitForPathname(hostPage, /^\/tribunal\/[^/]+$/);
    await waitForStoreCondition(
      hostPage,
      "state => state.currentRoom?.phase === 'tribunal' && Boolean(state.caseDefinition) && Boolean(state.engineSnapshot)",
      20_000,
      'Host did not restore tribunal state after refresh',
    );
    await hostPage.getByText('غرفة المحاكمة').waitFor({ timeout: 10_000 });

    await invokeStoreMethod(
      hostPage,
      'submitTribunalAccusation',
      [CASE01_FALSE_SUCCESS_ATTEMPT],
      'state => state.closureResult?.accepted === true',
      12_000,
      'Timed out while waiting for accepted closure result after tribunal refresh',
    );

    await Promise.all([
      waitForPathname(hostPage, /^\/results\/[^/]+$/),
      waitForPathname(guestPage, /^\/results\/[^/]+$/),
    ]);
    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    await hostPage.reload({ waitUntil: 'networkidle' });
    await waitForPathname(hostPage, /^\/results\/[^/]+$/);
    await waitForStoreCondition(
      hostPage,
      "state => state.currentRoom?.phase === 'results' && Boolean(state.engineSnapshot) && ((state.closureResult?.accepted === true) || (state.engineSnapshot?.lastClosureDecision?.accepted === true))",
      20_000,
      'Host did not restore results state after refresh',
    );
    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    assert(
      hostPage.url().endsWith(`/results/${roomSlug}`),
      `Host left the results route after refresh: ${hostPage.url()}`,
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Active phase refresh flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
