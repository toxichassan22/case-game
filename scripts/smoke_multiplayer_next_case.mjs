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
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();
    const consoleErrors = [];

    registerConsoleCapture(hostPage, consoleErrors);
    registerConsoleCapture(guestPage, consoleErrors);

    await registerProfile(hostPage, 'Next Case Host');
    await hostPage.getByRole('button', { name: /إنشاء غرفة جديدة/ }).click();
    await waitForPathname(hostPage, /^\/room\/[^/]+$/);
    await hostPage.getByText('غرفة الانتظار').waitFor({ timeout: 30_000 });

    const roomSlug = new URL(hostPage.url()).pathname.split('/').pop();
    const roomCode = `#${roomSlug}`;
    assert(roomSlug, 'Host room URL did not include a room id');

    await registerProfile(guestPage, 'Next Case Guest');
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

    await invokeStoreMethod(
      hostPage,
      'submitTribunalAccusation',
      [CASE01_FALSE_SUCCESS_ATTEMPT],
      'state => state.closureResult?.accepted === true',
      12_000,
      'Timed out while waiting for accepted closure result',
    );

    await Promise.all([
      waitForPathname(hostPage, /^\/results\/[^/]+$/),
      waitForPathname(guestPage, /^\/results\/[^/]+$/),
    ]);

    await hostPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });
    await guestPage.getByText('القضية أُغلقت جزئيًا').waitFor({ timeout: 10_000 });

    const hostNextCaseButton = hostPage.getByRole('button', { name: /القضية التالية/ });
    await hostNextCaseButton.waitFor({ timeout: 10_000 });
    await assertGuestCannotAdvance(guestPage);

    await Promise.all([
      waitForPathname(hostPage, /^\/game\/[^/]+$/, 25_000),
      waitForPathname(guestPage, /^\/game\/[^/]+$/, 25_000),
      hostNextCaseButton.click(),
    ]);

    await hostPage.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });
    await guestPage.getByText('أنت الآن في القضية 02 من 59').waitFor({ timeout: 30_000 });

    const hostSummary = await readStoreSummary(hostPage);
    const guestSummary = await readStoreSummary(guestPage);

    assert(
      hostPage.url().endsWith(`/game/${roomSlug}`),
      `Host landed on unexpected route after next case: ${hostPage.url()}`,
    );
    assert(
      guestPage.url().endsWith(`/game/${roomSlug}`),
      `Guest landed on unexpected route after next case: ${guestPage.url()}`,
    );
    assert(
      hostSummary.phase === 'investigating' && guestSummary.phase === 'investigating',
      `Expected both players to return to investigating, got host=${hostSummary.phase}, guest=${guestSummary.phase}`,
    );
    assert(
      hostSummary.caseId === 'case02' && guestSummary.caseId === 'case02',
      `Expected both players to load case02, got host=${hostSummary.caseId}, guest=${guestSummary.caseId}`,
    );
    assert(
      hostSummary.caseArchiveLength >= 1 && guestSummary.caseArchiveLength >= 1,
      `Expected both players to archive case01, got host=${hostSummary.caseArchiveLength}, guest=${guestSummary.caseArchiveLength}`,
    );
    assert(
      hostSummary.nextCaseLoading === false && guestSummary.nextCaseLoading === false,
      `nextCaseLoading should reset for both players, got host=${hostSummary.nextCaseLoading}, guest=${guestSummary.nextCaseLoading}`,
    );
    assert(
      !consoleErrors.length,
      `Console errors detected:\n${consoleErrors.join('\n')}`,
    );

    console.log('[smoke] Multiplayer next case flow passed');
  } finally {
    await browser.close();
  }
}

async function assertGuestCannotAdvance(guestPage) {
  const nextCaseButtons = guestPage.getByRole('button', { name: /القضية التالية/ });
  const count = await nextCaseButtons.count();
  assert(count === 0, 'Guest should not see the next case action');
}

try {
  await run();
} finally {
  await cleanupProcesses(startedChildren);
}
