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
  CASE01_MISSING_BEHAVIORAL_ATTEMPT,
  CASE01_MISSING_BEHAVIORAL_STEPS,
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

    await registerProfile(hostPage, 'Rejected Host');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Rejected Guest');
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

    await dispatchScenarioSteps(hostPage, CASE01_MISSING_BEHAVIORAL_STEPS);

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

    await invokeStoreMethod(
      hostPage,
      'submitTribunalAccusation',
      [CASE01_MISSING_BEHAVIORAL_ATTEMPT],
      'state => state.closureResult?.accepted === false',
      12_000,
      'Timed out while waiting for rejected closure result',
    );

    await Promise.all([
      waitForPathname(hostPage, /^\/results\/[^/]+$/),
      waitForPathname(guestPage, /^\/results\/[^/]+$/),
    ]);

    await hostPage.getByText('الاتهام مرفوض').waitFor({ timeout: 10_000 });
    await guestPage.getByText('الاتهام مرفوض').waitFor({ timeout: 10_000 });

    const hostReturnButton = hostPage.getByRole('button', { name: /العودة للتحقيق/ });
    const guestReturnButton = guestPage.getByRole('button', { name: /العودة للتحقيق/ });

    await hostReturnButton.waitFor({ timeout: 10_000 });
    await guestReturnButton.waitFor({ timeout: 10_000 });

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/),
      hostReturnButton.click(),
    ]);

    await guestPage.waitForTimeout(1_000);

    assert(
      hostPage.url().endsWith(`/game/${roomSlug}`),
      `Host did not return to investigation after clicking back: ${hostPage.url()}`,
    );
    assert(
      guestPage.url().endsWith(`/results/${roomSlug}`),
      `Guest should remain on results until acting locally, got ${guestPage.url()}`,
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Rejected accusation flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
