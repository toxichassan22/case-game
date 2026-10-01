import { chromium } from 'playwright';
import {
  assert,
  cleanupProcesses,
  dispatchScenarioSteps,
  launchSmokeBrowser,
  installWsSendSpy,
  invokeStoreMethod,
  readWsSendCounts,
  registerConsoleCapture,
  registerProfile,
  resetWsSendCounts,
  startLocalStack,
  waitForPathname,
  waitForStoreCondition,
} from './smoke_helpers.mjs';
import {
  CASE01_FALSE_SUCCESS_ATTEMPT,
  CASE01_FALSE_SUCCESS_STEPS,
} from './smoke_case01_scenarios.mjs';

const startedChildren = [];

async function clickTwice(locator) {
  await locator.evaluate((element) => {
    element.click();
    element.click();
  });
}

async function assertSingleSend(page, type, label) {
  const counts = await readWsSendCounts(page);
  assert(
    (counts[type] ?? 0) === 1,
    `${label} should send ${type} exactly once, got ${counts[type] ?? 0}`,
  );
}

async function invokeStoreMethodTwice(page, methodName, args = []) {
  await page.evaluate(async ({ methodName: targetMethod, args: methodArgs }) => {
    const { useGameStore } = await import('/src/stores/gameStore.ts');
    const method = useGameStore.getState()[targetMethod];

    if (typeof method !== 'function') {
      throw new Error(`Store method ${targetMethod} is not available`);
    }

    method(...methodArgs);
    method(...methodArgs);
  }, { methodName, args });
}

async function run() {
  await startLocalStack(startedChildren);

  const browser = await launchSmokeBrowser(chromium);

  try {
    const soloContext = await browser.newContext();
    const soloPage = await soloContext.newPage();
    const consoleErrors = [];

    registerConsoleCapture(soloPage, consoleErrors);

    await registerProfile(soloPage, 'Duplicate Solo Investigator');
    await installWsSendSpy(soloPage);
    await resetWsSendCounts(soloPage);

    const soloStartButton = soloPage.getByRole('button', { name: /ابدأ Solo/ });
    await Promise.all([
      waitForPathname(soloPage, /^\/game\/[^/]+$/),
      clickTwice(soloStartButton),
    ]);
    await soloPage.getByText('أنت الآن في القضية 01 من 59 مخططة').waitFor({ timeout: 30_000 });
    await assertSingleSend(soloPage, 'START_SOLO', 'Rapid solo start');

    await soloContext.close();

    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    registerConsoleCapture(hostPage, consoleErrors);
    registerConsoleCapture(guestPage, consoleErrors);

    await registerProfile(hostPage, 'Duplicate Guard Host');
    await installWsSendSpy(hostPage);
    await resetWsSendCounts(hostPage);

    const createRoomButton = hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ });
    await Promise.all([
      waitForPathname(hostPage, /^\/room\/[^/]+$/),
      clickTwice(createRoomButton),
    ]);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });
    await assertSingleSend(hostPage, 'CREATE_ROOM', 'Rapid room creation');

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Duplicate Guard Guest');
    await installWsSendSpy(guestPage);
    const roomCard = guestPage.locator('.room-card').filter({ hasText: roomCode });
    await roomCard.waitFor({ state: 'visible', timeout: 30_000 });
    await resetWsSendCounts(guestPage);

    await Promise.all([
      waitForPathname(guestPage, /^\/room\/[^/]+$/),
      clickTwice(roomCard),
    ]);
    await guestPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });
    await assertSingleSend(guestPage, 'JOIN_ROOM', 'Rapid room join');

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

    await resetWsSendCounts(hostPage);
    await invokeStoreMethodTwice(hostPage, 'submitTribunalAccusation', [CASE01_FALSE_SUCCESS_ATTEMPT]);
    await waitForStoreCondition(
      hostPage,
      'state => state.currentRoom?.phase === "results" && state.closureResult?.accepted === true',
      12_000,
      'Timed out while waiting for accepted closure after duplicate submit attempt',
    );
    await assertSingleSend(hostPage, 'TRIBUNAL_SUBMIT', 'Duplicate tribunal submission');

    await Promise.all([
      waitForPathname(hostPage, /^\/results\/[^/]+$/),
      waitForPathname(guestPage, /^\/results\/[^/]+$/),
    ]);
    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });
    await guestPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    await resetWsSendCounts(hostPage);
    await invokeStoreMethodTwice(hostPage, 'requestNextCase');
    await waitForStoreCondition(
      hostPage,
      'state => state.currentRoom?.phase === "investigating" && state.engineSnapshot?.case_id === "case02"',
      25_000,
      'Timed out while waiting for case02 after duplicate next-case attempt',
    );
    await assertSingleSend(hostPage, 'NEXT_CASE', 'Duplicate next-case request');

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/, 25_000),
      waitForPathname(guestPage, /^\/game\/[^/]+$/, 25_000),
    ]);
    await hostPage.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });

    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Duplicate request guard flow passed');
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
