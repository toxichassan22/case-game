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

    await registerProfile(hostPage, 'Resume Phase Host');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Resume Phase Guest');
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

    await hostPage.goto('http://127.0.0.1:5173/lobby', { waitUntil: 'networkidle' });
    await waitForPathname(hostPage, /^\/lobby$/);

    const tribunalActiveCard = hostPage.locator('.active-room-card').filter({ hasText: roomCode });
    await tribunalActiveCard.waitFor({ state: 'visible', timeout: 30_000 });
    await tribunalActiveCard.getByRole('button', { name: /متابعة الفتح/ }).click();

    await waitForPathname(hostPage, /^\/tribunal\/[^/]+$/);
    await hostPage.getByText('غرفة المحاكمة').waitFor({ timeout: 10_000 });

    await invokeStoreMethod(
      hostPage,
      'submitTribunalAccusation',
      [CASE01_FALSE_SUCCESS_ATTEMPT],
      'state => state.closureResult?.accepted === true',
      12_000,
      'Timed out while waiting for accepted closure result after tribunal resume',
    );

    await Promise.all([
      waitForPathname(hostPage, /^\/results\/[^/]+$/),
      waitForPathname(guestPage, /^\/results\/[^/]+$/),
    ]);
    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });
    await guestPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    await hostPage.getByRole('button', { name: /خروج للـ Lobby/ }).click();
    await waitForPathname(hostPage, /^\/lobby$/);

    const resultsActiveCard = hostPage.locator('.active-room-card').filter({ hasText: roomCode });
    await resultsActiveCard.waitFor({ state: 'visible', timeout: 30_000 });
    await resultsActiveCard.getByRole('button', { name: /متابعة الفتح/ }).click();

    await waitForPathname(hostPage, /^\/results\/[^/]+$/);
    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    assert(
      hostPage.url().endsWith(`/results/${roomSlug}`),
      `Expected host to resume the results route, got ${hostPage.url()}`,
    );
    assert(
      guestPage.url().endsWith(`/results/${roomSlug}`),
      `Guest should remain on results while host resumes from lobby, got ${guestPage.url()}`,
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Resume active tribunal/results flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
